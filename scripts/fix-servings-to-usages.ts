import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const db = new PrismaClient({ adapter });

async function main() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      nutritionNotice: true,
      nutritionTable: true,
    },
  });

  let updatedCount = 0;

  for (const p of products) {
    let needsUpdate = false;
    let notice = p.nutritionNotice || "";
    let table = p.nutritionTable as Array<{ parameter: string; per_100g?: string; per_serving?: string }> | null;

    if (notice) {
      // "Нийт порц: X" -> "Нийт хэрэглээ: X удаа"
      let newNotice = notice.replace(/Нийт порц:\s*(\d+)/gi, "Нийт хэрэглээ: $1 удаа");
      // "X порц агуулсан" / "X порцтой" -> "Нийт хэрэглээ: X удаа"
      newNotice = newNotice.replace(/(\d+)\s*(?:порцтой|порц агуулсан)/gi, "Нийт хэрэглээ: $1 удаа");
      
      if (newNotice !== notice) {
        notice = newNotice;
        needsUpdate = true;
      }
    }

    if (table && Array.isArray(table)) {
      const newTable = table.map((row) => {
        let parameter = row.parameter;
        if (parameter === "Өдрийн порцид") {
          parameter = "Өдрийн тунд";
          needsUpdate = true;
        }
        return { ...row, parameter };
      });
      if (needsUpdate) {
        table = newTable;
      }
    }

    if (needsUpdate) {
      await db.product.update({
        where: { id: p.id },
        data: {
          nutritionNotice: notice || null,
          nutritionTable: (table ?? Prisma.DbNull) as Prisma.InputJsonValue,
        },
      });
      updatedCount++;
    }
  }

  console.log(`Successfully updated ${updatedCount} products from "порц" to natural "хэрэглээ/тунд" terminology.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
