import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatPrice(value: number): string { return `${value.toLocaleString("ru-RU")} ₽`; }
export const MIN_ORDER_AMOUNT = 200;
export function formatWeight(weight: number, unit: string): string {
  if (unit === "кг" && weight < 1) return `${Math.round(weight * 1000)} г`;
  if (unit === "л" && weight < 1) return `${Math.round(weight * 1000)} мл`;
  return `${weight} ${unit}`;
}

export interface SaleUnitLike { saleType: "piece" | "weight"; step: number; unit: string; }
export function getStepAmount(product: SaleUnitLike): number {
  if (product.saleType !== "weight") return 1;
  return product.step > 1 ? product.step : 500;
}
export function getLineTotal(price: number, amount: number, product: SaleUnitLike): number {
  return product.saleType === "weight" ? Math.round((price * amount) / 1000) : price * amount;
}
export function normalizeLegacyOrderAmount(product: SaleUnitLike, amount: number): number {
  const itemWasPreviouslySoldByPiece = product.saleType === "weight" && product.unit === "кг";
  return itemWasPreviouslySoldByPiece && amount > 0 && amount < 100 ? amount * 500 : amount;
}
export function formatCartAmount(amount: number, product: SaleUnitLike): string {
  if (product.saleType !== "weight") return `${amount} шт`;
  if (product.unit === "г") return `${amount} г`;
  const kg = amount / 1000;
  return `${kg % 1 === 0 ? kg : kg.toFixed(kg * 10 % 1 === 0 ? 1 : 2)} кг`;
}

/** Проверка российского номера телефона: 10 цифр (без кода страны) либо
 * 11 цифр с кодом страны 7/8. Пробелы, скобки, дефисы и "+" игнорируются. */
export function phoneDigits(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("8")) return `7${digits.slice(1)}`;
  if (digits.length === 10) return `7${digits}`;
  return digits;
}

export function phonesMatch(a: string, b: string): boolean {
  const left = phoneDigits(a);
  const right = phoneDigits(b);
  return Boolean(left) && left === right;
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11) return digits.startsWith("7") || digits.startsWith("8");
  if (digits.length === 10) return digits.startsWith("9");
  return false;
}
