// Free-text district/khoroo lists — used by the legacy SavedAddress feature (profile page).
const UB_DISTRICTS = [
  "Багануур дүүрэг",
  "Багахангай дүүрэг",
  "Баянгол дүүрэг",
  "Баянзүрх дүүрэг",
  "Налайх дүүрэг",
  "Сонгинохайрхан дүүрэг",
  "Сүхбаатар дүүрэг",
  "Хан-Уул дүүрэг",
  "Чингэлтэй дүүрэг",
];

const UB_KHOROOS: Record<string, string[]> = {
  "Багануур дүүрэг": k(4),
  "Багахангай дүүрэг": k(1),
  "Баянгол дүүрэг": k(20),
  "Баянзүрх дүүрэг": k(28),
  "Налайх дүүрэг": k(5),
  "Сонгинохайрхан дүүрэг": k(32),
  "Сүхбаатар дүүрэг": k(20),
  "Хан-Уул дүүрэг": k(16),
  "Чингэлтэй дүүрэг": k(19),
};

function k(n: number) {
  return Array.from({ length: n }, (_, i) => `${i + 1}-р хороо`);
}

export function getDistricts(): string[] {
  return UB_DISTRICTS;
}

export function getKhoroos(district: string): string[] {
  return UB_KHOROOS[district] ?? [];
}

// UlaanbaatarDistrict enum (Order.district) — the 8 districts checkout ships to.
export const DISTRICT_OPTIONS: { value: string; label: string }[] = [
  { value: "BAYANZURKH", label: "Баянзүрх дүүрэг" },
  { value: "KHAN_UUL", label: "Хан-Уул дүүрэг" },
  { value: "SONGINOKHAIRKHAN", label: "Сонгинохайрхан дүүрэг" },
  { value: "BAYANGOL", label: "Баянгол дүүрэг" },
  { value: "SUKHMBAATAR", label: "Сүхбаатар дүүрэг" },
  { value: "CHINGELTEI", label: "Чингэлтэй дүүрэг" },
  { value: "NALAIKH", label: "Налайх дүүрэг" },
  { value: "BAGANUUR", label: "Багануур дүүрэг" },
];

export function districtLabel(value: string): string {
  return DISTRICT_OPTIONS.find((d) => d.value === value)?.label ?? value;
}
