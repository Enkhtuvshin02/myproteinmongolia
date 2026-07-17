import assert from "node:assert";
import fs from "node:fs";

// The scraper output has classic double-UTF-8 mojibake: multi-byte UTF-8 sequences
// (e.g. the 3 bytes for ’ U+2019) got Latin-1-decoded into 3 separate codepoints,
// then re-encoded as UTF-8. This reassembles them: greedily look for a valid UTF-8
// lead byte followed by the right number of continuation bytes among the
// (mis-decoded) codepoints, and only reinterpret those — anything that doesn't
// match valid UTF-8 grammar (e.g. a standalone non-breaking space) is left alone,
// so genuinely-correct single Latin-1-range characters don't get clobbered.
function isContinuation(code: number): boolean {
  return code >= 0x80 && code <= 0xbf;
}

function fixMojibake(str: string): string {
  let result = "";
  let i = 0;
  const n = str.length;
  while (i < n) {
    const c0 = str.codePointAt(i)!;
    if (c0 > 0xff) {
      result += str[i];
      i++;
      continue;
    }

    let seqLen = 0;
    if (c0 >= 0xc2 && c0 <= 0xdf) seqLen = 2;
    else if (c0 >= 0xe0 && c0 <= 0xef) seqLen = 3;
    else if (c0 >= 0xf0 && c0 <= 0xf4) seqLen = 4;

    if (seqLen > 0 && i + seqLen <= n) {
      const bytes = [c0];
      let ok = true;
      for (let k = 1; k < seqLen; k++) {
        const ck = str.codePointAt(i + k)!;
        if (ck > 0xff || !isContinuation(ck)) {
          ok = false;
          break;
        }
        bytes.push(ck);
      }
      if (ok) {
        const decoded = Buffer.from(bytes).toString("utf8");
        if (!decoded.includes("�")) {
          result += decoded;
          i += seqLen;
          continue;
        }
      }
    }

    result += str[i];
    i++;
  }
  return result;
}

function selfCheck() {
  assert.strictEqual(fixMojibake("plain ascii"), "plain ascii");
  assert.strictEqual(fixMojibake("bodyâ\x80\x99s"), "body’s"); // corrupted ’ (3-byte UTF-8 mis-split)
  assert.strictEqual(fixMojibake("BioPerineÂ® Cap"), "BioPerine® Cap"); // corrupted ® (2-byte UTF-8 mis-split)
  assert.strictEqual(fixMojibake("wellbeing. next"), "wellbeing. next"); // standalone nbsp: untouched, not corrupted
  console.log("selfCheck ok");
}

type ScrapedProduct = {
  product_group_id: string;
  group_name: string;
  brand?: string;
  url?: string;
  description_accordions?: Record<string, string>;
  nutrition_table?: Array<{ parameter: string; per_100g?: string; per_serving?: string }>;
  nutrition_notice?: string;
  error?: string;
};

function fixDeep<T>(value: T): T {
  if (typeof value === "string") return fixMojibake(value) as unknown as T;
  if (Array.isArray(value)) return value.map(fixDeep) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[fixMojibake(k)] = fixDeep(v);
    return out as T;
  }
  return value;
}

function main() {
  selfCheck();

  const SOURCE = "/Users/enkhtuvshin/web_scapper/myprotein_nutrition.json";
  const OUT = new URL("../prisma/backups/product-content-en.json", import.meta.url).pathname;

  const raw: ScrapedProduct[] = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
  const valid = raw.filter((p) => !p.error);

  const backup = valid.map((p) =>
    fixDeep({
      id: p.product_group_id,
      name: p.group_name,
      brand: p.brand ?? null,
      url: p.url ?? null,
      descriptionAccordions: p.description_accordions ?? null,
      nutritionTable: p.nutrition_table ?? null,
      nutritionNotice: p.nutrition_notice ?? null,
    })
  );

  fs.mkdirSync(new URL("../prisma/backups", import.meta.url).pathname, { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(backup, null, 2));
  console.log(`Wrote ${backup.length} products to ${OUT}`);
}

main();
