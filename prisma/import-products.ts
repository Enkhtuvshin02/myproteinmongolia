import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import readline from "readline";
import path from "path";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const db = new PrismaClient({ adapter });

const JSONL_PATH = "/Users/enkhtuvshin/web_scapper/myprotein_nutrition.jsonl";
const RATE = 4500; // 1 GBP = 4500 MNT

const defaultCategories = [
  { slug: "whey", name: "Уураг (Whey)" },
  { slug: "creatine", name: "Креатин" },
  { slug: "preworkout", name: "Дасгалын өмнөх" },
  { slug: "bcaa", name: "Амин хүчил, Витамин" },
  { slug: "bundle", name: "Иж бүрдэл" },
  { slug: "snacks", name: "Эрүүл зууш (Snacks)" },
  { slug: "vitamins", name: "Витамин, Эрдэс бодис" },
];

function cleanText(txt: string | undefined | null): string {
  if (!txt) return "";
  return txt
    .replace(/â€™/g, "'")
    .replace(/â€”/g, "—")
    .replace(/â€/g, '"')
    .replace(/â€“/g, "–")
    .replace(/â\x80\x99/g, "'")
    .replace(/â\x80\x94/g, "—")
    .replace(/â\x80\x9c/g, '"')
    .replace(/â\x80\x9d/g, '"')
    .replace(/â\x80\x93/g, "–")
    .replace(/â\x80\xa2/g, "•")
    .replace(/â€¢/g, "•")
    .replace(/Î¼/g, "µ")
    .replace(/Â¹/g, "¹")
    .replace(/Â²/g, "²")
    .replace(/Â³/g, "³")
    .replace(/â\x81µ/g, "⁵")
    .replace(/â\x81⁴/g, "⁴")
    .replace(/â\x81³/g, "³")
    .replace(/â\x81²/g, "²")
    .replace(/â\x81¹/g, "¹")
    .replace(/â\x81⁰/g, "⁰")
    .replace(/â\x81/g, "")
    .replace(/â/g, "")
    .replace(/Â/g, "")
    .trim();
}

function classifyProduct(name: string, url: string): string {
  const n = name.toLowerCase();
  const u = url.toLowerCase();
  if (n.includes("bundle") || u.includes("bundle")) return "bundle";
  if (n.includes("creatine") || u.includes("creatine")) return "creatine";
  if (
    n.includes("pre-workout") ||
    n.includes("preworkout") ||
    n.includes("pump booster") ||
    n.includes("nitric oxide") ||
    n.includes("c4") ||
    n.includes("alpha pre")
  ) {
    return "preworkout";
  }
  if (
    n.includes("whey") ||
    n.includes("protein powder") ||
    n.includes("isolate") ||
    n.includes("concentrate") ||
    n.includes("casein") ||
    n.includes("gainer")
  ) {
    if (
      n.includes("bar") ||
      n.includes("brownie") ||
      n.includes("cookie") ||
      n.includes("snack") ||
      n.includes("chocolate bar")
    ) {
      return "snacks";
    }
    return "whey";
  }
  if (
    n.includes("bar") ||
    n.includes("brownie") ||
    n.includes("cookie") ||
    n.includes("snack") ||
    n.includes("wafer") ||
    n.includes("chocolate bar") ||
    n.includes("choc") ||
    n.includes("flapjack") ||
    n.includes("peanut butter") ||
    n.includes("spread") ||
    n.includes("ombar")
  ) {
    return "snacks";
  }
  if (
    n.includes("vitamin") ||
    n.includes("multivitamin") ||
    n.includes("gummies") ||
    n.includes("zinc") ||
    n.includes("iron") ||
    n.includes("magnesium") ||
    n.includes("collagen") ||
    n.includes("omega") ||
    n.includes("capsules") ||
    n.includes("tablets") ||
    n.includes("pill") ||
    n.includes("immunity")
  ) {
    return "vitamins";
  }
  return "bcaa";
}

function convertPrice(gbp: number): number {
  return Math.round((gbp * RATE) / 1000) * 1000;
}

async function main() {
  console.log("Seeding categories...");
  for (const cat of defaultCategories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { slug: cat.slug, name: cat.name },
    });
  }

  console.log("Cleaning up previously imported products...");
  // Myprotein IDs are numeric string IDs, whereas seed products start with 'gh-'
  await db.product.deleteMany({
    where: {
      NOT: {
        id: {
          startsWith: "gh-",
        },
      },
    },
  });

  if (!fs.existsSync(JSONL_PATH)) {
    console.error(`File not found: ${JSONL_PATH}`);
    process.exit(1);
  }

  const fileStream = fs.createReadStream(JSONL_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let importedCount = 0;
  let lineCount = 0;
  const globalSeenSkus = new Set<string>();

  for await (const line of rl) {
    lineCount++;
    if (!line.trim()) continue;

    try {
      const data = JSON.parse(line);
      if (data.error || !data.product_group_id) {
        // Skip errors / incomplete records
        continue;
      }

      const id = data.product_group_id;
      const groupName = cleanText(data.group_name);
      const brand = cleanText(data.brand || "Myprotein");
      const url = data.url;
      const categorySlug = classifyProduct(groupName, url);

      // Clean description accordions
      const accordions: Record<string, string> = {};
      if (data.description_accordions) {
        for (const [key, val] of Object.entries(data.description_accordions)) {
          accordions[cleanText(key)] = cleanText(val as string);
        }
      }

      // Clean nutrition table
      const nutritionTable = (data.nutrition_table || []).map((row: any) => ({
        parameter: cleanText(row.parameter),
        per_100g: cleanText(row.per_100g),
        per_serving: cleanText(row.per_serving),
      }));

      const nutritionNotice = cleanText(data.nutrition_notice);

      const variants = data.variants || [];
      if (variants.length === 0) {
        continue; // No variants, skip
      }

      // Process and deduplicate variants by SKU
      const processedVariants = [];
      for (const v of variants) {
        if (!v.sku) continue;
        if (globalSeenSkus.has(v.sku)) continue;
        globalSeenSkus.add(v.sku);

        const priceMNT = convertPrice(v.price || 0);
        // Prepend slash to local image path
        let localPath = v.local_image_path || "";
        if (localPath && !localPath.startsWith("/")) {
          localPath = "/" + localPath;
        }

        processedVariants.push({
          sku: v.sku,
          productId: id,
          name: cleanText(v.name),
          description: cleanText(v.description),
          gtin: v.gtin || null,
          flavour: cleanText(v.flavour) || null,
          weight: cleanText(v.weight) || null,
          price: priceMNT,
          currency: "MNT",
          availability: v.availability || "InStock",
          url: v.url || null,
          imageUrl: v.image_url || null,
          localImagePath: localPath || null,
          stock: v.availability === "InStock" ? 15 : 0,
        });
      }

      if (processedVariants.length === 0) {
        continue;
      }

      // Aggregate details for the parent Product
      const firstVariant = processedVariants[0];
      const sumStock = processedVariants.reduce((acc: number, v: any) => acc + v.stock, 0);
      const mainPrice = firstVariant.price;
      const mainImage = firstVariant.localImagePath || "/products/whey.svg";
      const unit = firstVariant.weight || null;

      const productUpsertData = {
        name: groupName,
        price: mainPrice,
        originalPrice: null, // Scraped data doesn't have original prices at root
        image: mainImage,
        categorySlug: categorySlug,
        rating: 4.5 + Math.random() * 0.5, // 4.5 - 5.0 rating
        stock: sumStock,
        isNew: false,
        isFeatured: Math.random() > 0.85, // Mark 15% as featured
        isBundle: categorySlug === "bundle",
        unit: unit,
        brand: brand,
        url: url,
        descriptionAccordions: accordions,
        nutritionTable: nutritionTable,
        nutritionNotice: nutritionNotice,
      };

      // Upsert Product
      await db.product.upsert({
        where: { id: id },
        update: productUpsertData,
        create: { id: id, ...productUpsertData },
      });

      // Replace variants wholesale
      await db.productVariant.deleteMany({ where: { productId: id } });
      await db.productVariant.createMany({ data: processedVariants });

      // Create fallback flavors rows for compatibility
      await db.productFlavor.deleteMany({ where: { productId: id } });
      const uniqueFlavors = Array.from(
        new Set(
          processedVariants
            .map((pv: any) => pv.flavour)
            .filter((fl: string | null) => fl !== null && fl.trim() !== "")
        )
      );

      if (uniqueFlavors.length > 0) {
        await db.productFlavor.createMany({
          data: uniqueFlavors.map((flavorName: any) => ({
            productId: id,
            flavorName: flavorName,
            stock: Math.floor(sumStock / uniqueFlavors.length),
          })),
        });
      } else {
        // Create an "Амтгүй" flavor as default fallback if there's stock
        if (sumStock > 0) {
          await db.productFlavor.create({
            data: {
              productId: id,
              flavorName: "Амтгүй",
              stock: sumStock,
            },
          });
        }
      }

      importedCount++;
      if (importedCount % 20 === 0) {
        console.log(`Processed ${importedCount} products...`);
      }
    } catch (err) {
      console.error(`Error parsing line ${lineCount}:`, err);
    }
  }

  console.log(`Successfully imported ${importedCount} products!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
