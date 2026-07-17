// Thin announcement strip above the header — static, centered, tracked caps.
export function TopBar() {
  return (
    <div className="border-b border-shop-line bg-shop-paper">
      <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-2 px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/80">
        <span>Улаанбаатарт 24–48 цагт хүргэнэ</span>
        <span className="text-brand">·</span>
        <span>100% Original — лабораторийн баталгаатай</span>
        <span className="hidden text-brand sm:inline">·</span>
        <a href="tel:77100100" className="hidden hover:text-brand sm:inline">77100100</a>
      </div>
    </div>
  );
}
