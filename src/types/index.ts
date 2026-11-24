/** Shared application types aligned with prisma/schema.prisma. */
export type UserRole = "customer" | "admin" | "courier";

export interface AuthUser { id: string; name: string; phone: string; role: UserRole; }

export type OrderStatus = "new" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Ожидает подтверждения",
  accepted: "Заказ подтверждён",
  picked_up: "Забран",
  in_transit: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён"
};

export const ORDER_STATUS_FLOW: OrderStatus[] = ["new", "accepted", "picked_up", "in_transit", "delivered"];
export const CANCELLABLE_STATUSES: OrderStatus[] = ["new", "accepted"];

export type SaleType = "piece" | "weight";

export interface OrderItem {
  productId: string;
  name: string;
  /** For piece products this is item count; for weight products this is grams. */
  quantity: number;
  price: number;
  image: string;
  /** Optional for legacy/demo orders created before units were snapshotted. */
  saleType?: SaleType;
  unit?: string;
}

export type PaymentMethod = "cash" | "card" | "online";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface AdminOrder {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  address: string;
  fulfillmentType?: "delivery" | "pickup";
  pickupLocationId?: string | null;
  comment?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoCode?: string | null;
  promoDiscount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  courierId: string | null;
}

export interface OrderStatusHistoryEntry { status: OrderStatus; changedAt: string; }

export interface Courier {
  id: string; name: string; phone: string; avatarSeed: string;
  activeOrdersCount: number; isActive: boolean;
}
