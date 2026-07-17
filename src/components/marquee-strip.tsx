const ITEMS = [
  "ЛАБОРАТОРИЙН БАТАЛГААТАЙ",
  "УЛААНБААТАРТ 24–48 ЦАГТ ХҮРГЭНЭ",
  "100% ORIGINAL",
  "БАНКНЫ ШИЛЖҮҮЛГЭЭР ТӨЛӨХ",
];

export function MarqueeStrip() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden border-y border-shop-black bg-brand py-2.5">
      <div className="flex w-max animate-shop-marquee gap-8 whitespace-nowrap">
        {[...loop, ...loop].map((text, i) => (
          <span
            key={i}
            className="flex items-center gap-8 text-xs font-bold uppercase tracking-[0.14em] text-white"
          >
            {text}
            <span aria-hidden className="text-white/50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
