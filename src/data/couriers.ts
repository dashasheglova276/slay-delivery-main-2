import type { Courier } from "@/types";

export const mockCouriers: Omit<Courier, "isActive">[] = [
  { id: "courier-1", name: "Тимур Ахметов", phone: "+7 901 234-56-78", avatarSeed: "timur", activeOrdersCount: 0 },
  { id: "courier-2", name: "Дарья Соловьёва", phone: "+7 902 345-67-89", avatarSeed: "daria", activeOrdersCount: 0 },
  { id: "courier-3", name: "Роман Белов", phone: "+7 903 456-78-90", avatarSeed: "roman", activeOrdersCount: 0 },
  { id: "courier-4", name: "Ксения Фомина", phone: "+7 904 567-89-01", avatarSeed: "ksenia", activeOrdersCount: 0 }
];

/**
 * Курьер, за которого сейчас "залогинен" кабинет /courier.
 * Когда появится авторизация — заменить на id из сессии пользователя.
 */
export const CURRENT_COURIER_ID = "courier-1";
