import assert from "node:assert";
import dotenv from "dotenv";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Match Next.js's own precedence: .env.local overrides .env (dotenv.config never
// clobbers a var that's already set, so load the higher-priority file first).
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const db = new PrismaClient({ adapter });

const MAX_CHUNK = 1800; // stay well under the free endpoint's practical request-size limit
const HAS_CYRILLIC = /[Ѐ-ӿ]/;

// --- Hand-curated glossary -----------------------------------------------------
// Google's free en->mn model has real vocabulary gaps (e.g. "vegan" and
// "vegetarian" both collapse to "цагаан хоолтон") and no domain consistency for
// nutrition-label terms. These strings are exact, high-frequency boilerplate
// found by scanning all 482 products (see chat history) — translating them once
// by hand and substituting them beats sending them through MT every time.

const ACCORDION_KEY_GLOSSARY: Record<string, string> = {
  "Description": "Тайлбар",
  "Key Benefits": "Гол ашиг тус",
  "Ingredients": "Найрлага",
  "Suggested Use": "Хэрэглэх заавар",
  "Why Choose": "Яагаад сонгох вэ",
  "Product Details": "Бүтээгдэхүүний дэлгэрэнгүй",
  "Directions": "Хэрэглэх заавар",
};

// Dropped entirely per product decision — generic Myprotein UK FAQ content
// (packaging/redesign copy) doesn't apply to this store, in any language.
const DROPPED_ACCORDION_KEYS = new Set(["Frequently Asked Questions", "Түгээмэл асуултууд"]);

const NUTRITION_GLOSSARY: Record<string, string> = {
  "Energy": "Илчлэг",
  "Energy (kJ)": "Илчлэг (кЖ)",
  "Energy (kcal)": "Илчлэг (ккал)",
  "Fat": "Өөх тос",
  "Trans Fat": "Транс өөх тос",
  "of which saturates": "үүнээс ханасан тос",
  "Carbohydrate": "Нүүрс ус",
  "Carbohydrates": "Нүүрс ус",
  "of which sugars": "үүнээс элсэн чихэр",
  "Fibre": "Эслэг",
  "Fiber": "Эслэг",
  "Fibres": "Эслэг",
  "Protein": "Уураг",
  "Salt": "Давс",
  "Typical Values": "Ердийн агууламж",
  "Sodium": "Натри",
  "Vitamin A": "А аминдэм",
  "Vitamin B1": "В1 аминдэм",
  "Vitamin B2": "В2 аминдэм",
  "Vitamin B3": "В3 аминдэм",
  "Vitamin B6": "В6 аминдэм",
  "Vitamin B12": "В12 аминдэм",
  "Vitamin C": "С аминдэм",
  "Vitamin D": "D аминдэм",
  "Vitamin D2": "D2 аминдэм",
  "Vitamin D3": "D3 аминдэм",
  "Vitamin E": "Е аминдэм",
  "Vitamin K": "К аминдэм",
  "Vitamin K1": "К1 аминдэм",
  "Vitamin K2": "К2 аминдэм",
  "Folic Acid": "Фолийн хүчил",
  "Niacin": "Ниацин",
  "Biotin": "Биотин",
  "Pantothenic Acid": "Пантотены хүчил",
  "Pantothenic acid": "Пантотены хүчил",
  "Calcium": "Кальци",
  "Iron": "Төмөр",
  "Magnesium": "Магни",
  "Zinc": "Цайр",
  "Copper": "Зэс",
  "Manganese": "Марганец",
  "Chromium": "Хром",
  "Selenium": "Селен",
  "Iodine": "Иод",
  "Potassium": "Кали",
  "Phosphorus": "Фосфор",
  "Chloride": "Хлорид",
  "Chloride from Sodium Chloride": "Натрийн хлоридоос гарах хлорид",
  "Chloride from Potassium Chloride": "Калийн хлоридоос гарах хлорид",
  "Chloride (Total)": "Хлорид (нийт)",
  "Total Chloride": "Нийт хлорид",
  "Caffeine": "Кофеин",
  "Creatine Monohydrate": "Креатин моногидрат",
  "Collagen": "Коллаген",
  "Taurine": "Таурин",
  "Choline": "Холин",
  "Beta Alanine": "Бета-Аланин",
  "Thiamin": "Тиамин",
  "Thiamine": "Тиамин",
  "Riboflavin": "Рибофлавин",
  "Per Daily Serving": "Өдрийн тунд",
  "Per 100g": "100 граммд",
  "Nutrient": "Тэжээллэг бодис",
  "Ingredient": "Найрлага",
  "Nutritional Information": "Тэжээллэг чанарын мэдээлэл",
  "Molybdenum": "Молибден",
  "Fluoride": "Фторид",
};

// Ordered longest-source-first at use time; matched as literal substrings (apostrophe-flexible).
const BOILERPLATE_GLOSSARY: Array<[string, string]> = [
  ["This presentation of the nutrition declaration is not a formatting instruction, but is intended only to display the compliant data.", ""],
  ["This presentation of the nutrition declaration is not a formatting instruction, but is intended only to provide the compliant data.", ""],
  ["Note: This presentation of the nutrition declaration is not a formatting instruction, but is intended only to display the compliant data.", ""],
  ["anti-caking agent", "бөөгнөрөхөөс хамгаалах бодис"],
  ["anti-caking agents", "бөөгнөрөхөөс хамгаалах бодис"],
  ["glazing agent", "бүрхүүл бодис"],
  ["glazing agents", "бүрхүүл бодис"],
  ["bulking agent", "бөөгнөрөхөөс хамгаалах бодис"],
  ["This product should not be used as a substitute for a varied, balanced diet and a healthy lifestyle.", "Энэ бүтээгдэхүүнийг олон төрлийн, тэнцвэртэй хооллолт, эрүүл амьдралын хэв маягийг орлуулах зорилгоор ашиглаж болохгүй."],
  ["This product is intended to be used alongside a varied and balanced diet and a healthy lifestyle.", "Энэ бүтээгдэхүүнийг олон төрлийн, тэнцвэртэй хооллолт болон эрүүл амьдралын хэв маягтай хамт хэрэглэхэд зориулав."],
  ["Keep out of the reach of young children.", "Бага насны хүүхдийн гар хүрэхээс хол хадгална уу."],
  ["Bringing together world-class scientists, doctors, and athletes to shape innovation at Myprotein — combining cutting-edge research with real-world testing to create solutions that actually deliver, for everybody.", "Дэлхийн түвшний эрдэмтэд, эмч нар, тамирчдыг нэгтгэн Myprotein-ий инновацийг бүрдүүлж байна — хамгийн дэвшилтэт судалгааг бодит нөхцөлийн туршилттай хослуулан, бүгдэд ажиллах шийдлүүдийг бүтээж байна."],
  ["Find out more about our Performance Advisory Board.", "Манай Гүйцэтгэлийн Зөвлөх Зөвлөлийн талаар нэмэлт мэдээлэл авах."],
  ["Performance Advisory Board", "Гүйцэтгэлийн Зөвлөх Зөвлөл"],
  ["Protein contributes to the growth and maintenance of muscle mass.", "Уураг нь булчингийн массын өсөлт, хадгалалтад тустай."],
  ["IMPORTANT INFORMATION: Store in a cool, dry place away from direct sunlight.", "ЧУХАЛ МЭДЭЭЛЭЛ: Нарны шууд тусгалаас хол, сэрүүн, хуурай газарт хадгална уу."],
  ["Store in a cool, dry place away from direct sunlight.", "Нарны шууд тусгалаас хол, сэрүүн, хуурай газарт хадгална уу."],
  ["Nutritional information may vary depending on flavour.", "Тэжээллэг чанарын мэдээлэл амтаас хамаарч өөр өөр байж болно."],
  ["Do not exceed the stated recommended daily dose.", "Заасан өдрийн зөвлөмжит тунг хэтрүүлж болохгүй."],
  ["Why has the packaging changed?", "Яагаад савлагаа өөрчлөгдсөн бэ?"],
  ["We're excited to introduce new packaging as part of our redesign, but you might still see our previous packaging in your orders as we prioritise reducing waste.", "Бид шинэчлэлийнхээ хүрээнд шинэ савлагааг танилцуулж байгаадаа таатай байна, гэхдээ хог хаягдлыг багасгахад чиглэсэн бодлогынхоо дагуу таны захиалгад хуучин савлагаа ирсээр байж магадгүй."],
  ["Rest assured, it's still the same consistently high-quality product, just as you'd expect.", "Санаа зоволтгүй, энэ нь таны хүлээж байгаа шиг тогтмол өндөр чанартай бүтээгдэхүүн хэвээрээ байна."],
  ["Rest assured, it's the same high-quality product.", "Санаа зоволтгүй, энэ бол яг л ижил өндөр чанартай бүтээгдэхүүн."],
  ["Suitable for: vegetarians and vegans.", "Тохиромжтой: цагаан хоолтон, веган."],
  ["Suitable for vegetarians and vegans.", "Цагаан хоолтон болон веганд тохиромжтой."],
  ["Suitable for: vegetarians, vegans.", "Тохиромжтой: цагаан хоолтон, веган."],
  ["Suitable for: vegetariansand vegans.", "Тохиромжтой: цагаан хоолтон, веган."],
  ["Not suitable for vegetarians.", "Цагаан хоолтонд тохиромжгүй."],
  ["Not suitable for vegans.", "Веганд тохиромжгүй."],
  ["Suitable for: vegetarians.", "Тохиромжтой: цагаан хоолтон."],
  ["Suitable for vegetarians.", "Цагаан хоолтонд тохиромжтой."],
  ["Suitable for: vegans.", "Тохиромжтой: веган."],
  ["Suitable for vegans.", "Веганд тохиромжтой."],
  ["suitable for vegetarians and vegans!", "цагаан хоолтон, веганд ч бас тохиромжтой!"],
  ["suitable for vegetarians, vegans!", "цагаан хоолтон, веганд ч бас тохиромжтой!"],
  ["suitable for vegetarians!", "цагаан хоолтонд ч бас тохиромжтой!"],
  ["suitable for vegans!", "веганд ч бас тохиромжтой!"],
  ["Powder settles over time, we recommend weighing for the most accurate measure.", "Нунтаг цаг хугацааны явцад нягтардаг тул хамгийн нарийвчлалтай хэмжилтийн тулд жинлэхийг зөвлөж байна."],
  ["Consult with your doctor if taking medication or have a medical condition.", "Хэрэв та эм хэрэглэж байгаа эсвэл эрүүл мэндийн асуудалтай бол эмчтэйгээ зөвлөлдөнө үү."],
  ["If you're still unsure about which protein is right for you, don't worry.", "Танд аль уураг тохирохоо мэдэхгүй байгаа бол санаа зоволтгүй."],
  ["It's packed with everything you need to know about protein, its benefits, and how to choose the best one for you.", "Энэ нь уураг, түүний ашиг тус, өөрт тохирсныг хэрхэн сонгох талаар мэдэх ёстой бүх зүйлийг агуулсан."],
  ["Our Protein Guide is just a click away.", "Манай Уургийн Гарын Авлага нэг товшилтын зайд байна."],
  ["The Protein Guide", "Уургийн Гарын Авлага"],
  ["**Source: Euromonitor International Limited; Consumer Health 2025 edition, retail value sales (RSP), all retail channels, 2024 data.", "**Эх сурвалж: Euromonitor International Limited; Consumer Health 2025 хэвлэл, жижиглэнгийн үнийн дүнгээр борлуулалт (RSP), бүх жижиглэнгийн сувгаар, 2024 оны өгөгдөл."],
  ["From the UK and Europe's Number 1 Sports Nutrition Brand**", "Их Британи болон Европын спортын нэмэлт тэжээлийн №1 брэндээс**"],
  ["We've gone through an exciting redesign, and as we step into a new era, you'll see fresh packaging in your orders.", "Бид сонирхолтой шинэчлэлийг хийж, шинэ эрин рүү орж байгаа тул таны захиалгад шинэ савлагааг харах болно."],
  ["Change is a good thing.", "Өөрчлөлт бол сайн зүйл."],
  ["But change takes time.", "Гэхдээ өөрчлөлт цаг хугацаа шаарддаг."],
  ["Especially when you make change responsibly.", "Ялангуяа өөрчлөлтийг хариуцлагатай хийх үед."],
  ["If you happen to receive classic packaging, know that your order is helping to reduce waste.", "Хэрэв танд хуучин загварын савлагаа ирвэл, таны захиалга хог хаягдлыг багасгахад тусалж байгааг мэдэж аваарай."],
  ["And if you receive anything with a fresh look, you're one of the first, and we'd love to hear what you think.", "Хэрэв танд шинэ загвартай зүйл ирвэл, та анхны хэрэглэгчдийн нэг бөгөөд бид таны санал бодлыг сонсохыг хүсч байна."],
  ["Thank you for joining us on our journey to reduce our impact on the planet, while maximising our impact for our community.", "Дэлхийд үзүүлэх нөлөөллөө багасгаж, нийгэмдээ үзүүлэх нөлөөллөө нэмэгдүүлэх аяллд бидэнтэй нэгдсэн танд баярлалаа."],
  ["WARNING: Not recommended for children, pregnant or breastfeeding women.", "АНХААРУУЛГА: Хүүхэд, жирэмсэн болон хөхүүл эмэгтэйчүүдэд зөвлөдөггүй."],
  ["For best before end: see base or lid.", "Хэрэглэх хугацаа: таг эсвэл ёроолоос харна уу."],
  ["Because we don't believe in wasting perfectly good packaging — that would go against our sustainability pledge — you might get a mix of old and new designs inside your orders.", "Бид бүрэн ашиглагдах боломжтой савлагааг үрэхийг дэмждэггүй тул — энэ нь тогтвортой байдлын амлалттай зөрчилдөх тул — таны захиалгад хуучин болон шинэ загварын хольц орж болзошгүй."],
  ["The beneficial effect is obtained with a daily intake of 3g of creatine.", "Өдөрт 3г креатин хэрэглэснээр эерэг үр дүнд хүрнэ."],
  // Brand/range names must not be machine-translated (e.g. "Myprotein" -> "Миний уураг" == "my protein").
  ["Range: BFS - Myprotein", "Цуврал: BFS - Myprotein"],
  ["Range: BFS - Myvegan", "Цуврал: BFS - Myvegan"],
  ["Range: Myprotein", "Цуврал: Myprotein"],
  ["Range: Myvegan", "Цуврал: Myvegan"],
  ["Range: Myvitamins", "Цуврал: Myvitamins"],
  ["Range: BFS", "Цуврал: BFS"],
  ["Range: PRO", "Цуврал: PRO"],
  ["Range: Pro", "Цуврал: Pro"],
  ["Range:", "Цуврал:"],
];

const glossaryEntries = [...BOILERPLATE_GLOSSARY].sort((a, b) => b[0].length - a[0].length);

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function flexApostrophe(s: string): string {
  return escapeRegex(s).replace(/'/g, "['’]");
}

type Segment = { type: "text" | "mn"; value: string };

// Splits `text` into segments, replacing every glossary match with its hand-written
// Mongolian translation directly — those segments never get sent to Google.
function applyGlossary(text: string): Segment[] {
  let segments: Segment[] = [{ type: "text", value: text }];
  for (const [src, dst] of glossaryEntries) {
    const pattern = new RegExp(flexApostrophe(src), "g");
    const next: Segment[] = [];
    for (const seg of segments) {
      if (seg.type === "mn") {
        next.push(seg);
        continue;
      }
      let lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(seg.value))) {
        if (m.index > lastIndex) next.push({ type: "text", value: seg.value.slice(lastIndex, m.index) });
        next.push({ type: "mn", value: dst });
        lastIndex = m.index + m[0].length;
        if (m[0].length === 0) pattern.lastIndex++;
      }
      if (lastIndex < seg.value.length) next.push({ type: "text", value: seg.value.slice(lastIndex) });
    }
    segments = next;
  }
  return segments;
}

// --- Chunking (for whatever's left after glossary substitution) ----------------

function hardSlice(text: string, max: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += max) out.push(text.slice(i, i + max));
  return out;
}

function packUnits(units: string[], sep: string, max: number): string[] {
  const chunks: string[] = [];
  let current = "";
  for (const unit of units) {
    const piece = current ? sep + unit : unit;
    if ((current + piece).length <= max) {
      current += piece;
      continue;
    }
    if (current) chunks.push(current);
    current = unit.length <= max ? unit : "";
    if (unit.length > max) chunks.push(...hardSlice(unit, max));
  }
  if (current) chunks.push(current);
  return chunks;
}

function chunkText(text: string, max = MAX_CHUNK): string[] {
  if (text.length <= max) return [text];
  const paragraphs = text.split("\n").flatMap((para) => {
    if (para.length <= max) return [para];
    const sentences = para.split(/(?<=[.!?])\s+/).flatMap((s) => (s.length <= max ? [s] : s.split(/\s+/)));
    return packUnits(sentences, " ", max);
  });
  return packUnits(paragraphs, "\n", max);
}

function selfCheck() {
  assert.deepStrictEqual(chunkText("short"), ["short"]);

  const long = ("A".repeat(50) + ". ").repeat(100);
  const chunks = chunkText(long);
  assert.ok(chunks.length > 1, "long text must split into multiple chunks");
  assert.ok(chunks.every((c) => c.length <= MAX_CHUNK), "no chunk exceeds MAX_CHUNK");
  assert.strictEqual(chunks.join(" ").replace(/\s+/g, " "), long.replace(/\s+/g, " "), "rejoined chunks must preserve content");

  const noPunctuation = "A".repeat(4552);
  const hardChunks = chunkText(noPunctuation);
  assert.ok(hardChunks.every((c) => c.length <= MAX_CHUNK), "hard-slice fallback must respect MAX_CHUNK");
  assert.strictEqual(hardChunks.join(""), noPunctuation, "hard-slice must preserve every character");

  const glossaryTest = applyGlossary("Keep out of the reach of young children. Some unique sentence here. Suitable for: vegetarians and vegans.");
  assert.ok(glossaryTest.some((s) => s.type === "mn" && s.value === "Бага насны хүүхдийн гар хүрэхээс хол хадгална уу."));
  assert.ok(glossaryTest.some((s) => s.type === "text" && s.value.includes("Some unique sentence here")));
  assert.ok(glossaryTest.some((s) => s.type === "mn" && s.value === "Тохиромжтой: цагаан хоолтон, веган."));

  console.log("selfCheck ok");
}

// --- Translation -----------------------------------------------------------------

async function translateChunk(text: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=mn&dt=t&q=${encodeURIComponent(text)}`;
  const attempts = 5;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return (data[0] as Array<[string]>).map((seg) => seg[0]).join("");
      }
      if (attempt === attempts) throw new Error(`translate failed: ${res.status}`);
    } catch (e) {
      if (attempt === attempts) throw e;
    }
    await new Promise((r) => setTimeout(r, 1500 * attempt)); // transient 5xx/429/network errors all get backed off the same way
  }
  throw new Error("translate failed after retries");
}

const cache = new Map<string, string>();

async function translate(text: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const cached = cache.get(text);
  if (cached) return cached;

  // Google's response trims whitespace off each chunk; preserve it ourselves so
  // segment joins (e.g. glossary text butting up against a translated chunk) keep
  // their original spacing/newlines instead of gluing words together.
  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  const core = text.trim();

  const parts = await Promise.all(chunkText(core).map(translateChunk));
  const result = leading + parts.join("") + trailing;
  cache.set(text, result);
  await new Promise((r) => setTimeout(r, 40)); // small courtesy delay; concurrency across products does the real pacing
  return result;
}

// Runs glossary substitution first, then Google-translates only what's left.
async function translateBody(text: string): Promise<string> {
  if (!text || !text.trim()) return text;
  const segments = applyGlossary(text);
  const parts = await Promise.all(segments.map((seg) => (seg.type === "mn" ? seg.value : translate(seg.value))));
  return parts.join("");
}

async function translateAccordionKey(text: string): Promise<string> {
  return ACCORDION_KEY_GLOSSARY[text] ?? translate(text);
}

async function translateNutritionParam(text: string): Promise<string> {
  return NUTRITION_GLOSSARY[text] ?? translate(text);
}

type ProductRow = {
  id: string;
  name: string;
  descriptionAccordions: unknown;
  nutritionTable: unknown;
  nutritionNotice: string | null;
};

async function processProduct(p: ProductRow, index: number, total: number): Promise<"skipped" | "done" | "failed"> {
  const accordions = p.descriptionAccordions as Record<string, string> | null;
  const alreadyDone = accordions && Object.values(accordions).some((v) => HAS_CYRILLIC.test(v));
  if (alreadyDone) return "skipped";

  console.log(`[${index + 1}/${total}] ${p.name}`);

  try {
    let newAccordions: Record<string, string> | undefined;
    if (accordions) {
      newAccordions = {};
      for (const [key, value] of Object.entries(accordions)) {
        if (DROPPED_ACCORDION_KEYS.has(key)) continue;
        const newKey = await translateAccordionKey(key);
        newAccordions[newKey] = await translateBody(value);
      }
    }

    const nutritionTable = p.nutritionTable as Array<{ parameter: string; per_100g?: string; per_serving?: string }> | null;
    let newNutritionTable: typeof nutritionTable | undefined;
    if (nutritionTable) {
      newNutritionTable = [];
      for (const row of nutritionTable) {
        newNutritionTable.push({ ...row, parameter: await translateNutritionParam(row.parameter) });
      }
    }

    const newNotice = p.nutritionNotice ? await translateBody(p.nutritionNotice) : p.nutritionNotice;

    await db.product.update({
      where: { id: p.id },
      data: {
        descriptionAccordions: (newAccordions ?? Prisma.DbNull) as Prisma.InputJsonValue,
        nutritionTable: (newNutritionTable ?? Prisma.DbNull) as Prisma.InputJsonValue,
        nutritionNotice: newNotice,
      },
    });
    return "done";
  } catch (e) {
    // One product's transient failure (after all retries) shouldn't abort the whole
    // batch — it stays untranslated (still English) and gets picked up on the next run.
    console.error(`FAILED: ${p.name} (${p.id}):`, e instanceof Error ? e.message : e);
    return "failed";
  }
}

const CONCURRENCY = 6; // parallel products in flight; the free endpoint's real limit is per-IP rate, not connection count

async function main() {
  selfCheck();

  const onlyId = process.env.TRANSLATE_ONLY_ID;
  const products = await db.product.findMany({
    where: onlyId ? { id: onlyId } : undefined,
    select: { id: true, name: true, descriptionAccordions: true, nutritionTable: true, nutritionNotice: true },
    orderBy: { id: "asc" },
  });

  let skipped = 0;
  let failed = 0;
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < products.length) {
      const i = nextIndex++;
      const result = await processProduct(products[i], i, products.length);
      if (result === "skipped") skipped++;
      if (result === "failed") failed++;
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  console.log(`Done. ${skipped} product(s) already translated and skipped. ${failed} failed.`);
  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
