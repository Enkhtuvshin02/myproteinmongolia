import type { CartLine } from "@/components/cart-context";

export const BANK_ACCOUNTS = [
  { bank: "Хаан банк", account: "5000 1234 5678", name: "GainHub ХХК" },
  { bank: "Голомт банк", account: "1234 5678 9012", name: "GainHub ХХК" },
];

export const DELIVERY_FEE = 6600; // Дотоодын хүргэлт
export const ECO_BAG_FEE = 380; // Баглаа боодлын хураамж

export type OrderStatus = "NEW" | "PAID" | "ON_THE_WAY" | "COMPLETED" | "CANCELED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Шинэ",
  PAID: "Төлөгдсөн",
  ON_THE_WAY: "Хүргэлтэнд гарсан",
  COMPLETED: "Амжилттай",
  CANCELED: "Цуцлагдсан",
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ["NEW", "PAID", "ON_THE_WAY", "COMPLETED", "CANCELED"];

export type OrderDraft = {
  custFirstName: string;
  custLastName: string;
  phonePrimary: string;
  phoneSecondary: string;
  district: string; // UlaanbaatarDistrict enum value
  khoroo: string;
  detailedAddress: string;
};

export type Order = OrderDraft & {
  id: string; // R + 9 digits
  createdAt: number;
  items: CartLine[];
  receiptImageUrl?: string;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  delivery: number;
  ecoBag: number;
  total: number;
  status: OrderStatus;
};

export function computeTotals(subtotal: number, discount = 0) {
  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
  const ecoBag = subtotal > 0 ? ECO_BAG_FEE : 0;
  const total = Math.max(0, subtotal - discount) + delivery + ecoBag;
  return { delivery, ecoBag, total };
}

export function generateOrderId() {
  return "R" + Math.floor(100000000 + Math.random() * 900000000).toString();
}
