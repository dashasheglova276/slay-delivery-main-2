import { prisma } from "@/lib/db";
import {
  Role,
  OrderStatus as DbOrderStatus,
  PaymentMethod as DbPaymentMethod,
  PaymentStatus as DbPaymentStatus,
  SaleType as DbSaleType,
  type Product as DbProduct,
  type Category as DbCategory,
  type Recipe as DbRecipe,
  type RecipeIngredient as DbRecipeIngredient
} from "@prisma/client";

import type { Product } from "@/data/products";
import type { Category } from "@/data/categories";
import type { Collection } from "@/data/collections";
import type { Recipe, RecipeIngredient, RecipeDifficulty } from "@/data/recipes";
import type {
  AdminOrder,
  Courier,
  OrderStatus,
  OrderItem as AppOrderItem
} from "@/types";
import type { CartLine } from "@/context/cart-store";
import { getLineTotal } from "@/lib/utils";


const STATUS_TO_DB: Record<OrderStatus, DbOrderStatus> = {
  new: "NEW",
  accepted: "ACCEPTED",
  picked_up: "PICKED_UP",
  in_transit: "IN_TRANSIT",
  delivered: "DELIVERED",
  cancelled: "CANCELLED"
};

const STATUS_FROM_DB: Record<DbOrderStatus, OrderStatus> = {
  NEW: "new",
  ACCEPTED: "accepted",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
};


const PAYMENT_TO_DB: Record<
  "cash" | "card" | "online",
  DbPaymentMethod
> = {
  cash: "CASH",
  card: "CARD",
  online: "ONLINE"
};


const PAYMENT_FROM_DB: Record<
  DbPaymentMethod,
  "cash" | "card" | "online"
> = {
  CASH: "cash",
  CARD: "card",
  ONLINE: "online"
};

const PAYMENT_STATUS_FROM_DB: Record<DbPaymentStatus, AdminOrder["paymentStatus"]> = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded"
};


const SALE_TYPE_TO_DB: Record<
  "piece" | "weight",
  DbSaleType
> = {
  piece: "PIECE",
  weight: "WEIGHT"
};


const SALE_TYPE_FROM_DB: Record<
  DbSaleType,
  "piece" | "weight"
> = {
  PIECE: "piece",
  WEIGHT: "weight"
};


/* ------------------------------------------------------------------ */
/*  Товары                                                             */
/* ------------------------------------------------------------------ */

export function toProduct(p: DbProduct): Product {
  const soldByKilogram = p.unit === "кг";
  // Bakery products carry a package weight (e.g. 400 g), but their price is
  // for one whole loaf. Only loose kilogram goods use gram quantities.
  const soldByPiece = p.categorySlug === "bakery";
  const saleType = soldByPiece ? "piece" : soldByKilogram ? "weight" : SALE_TYPE_FROM_DB[p.saleType];
  return {
    id: p.id,
    name: p.name,
    categorySlug: p.categorySlug,
    categoryName: p.categoryName,
    price: p.price,
    oldPrice: p.oldPrice,
    unit: p.unit,
    weight: p.weight,
    description: p.description,
    composition: p.composition,
    manufacturer: p.manufacturer,
    shelfLife: p.shelfLife,
    storage: p.storage,
    image: p.image,
    images: p.images,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    isNew: p.isNew,
    discountPercent: p.discountPercent,
    inStock: p.inStock,
    featured: p.featured,
    relatedIds: p.relatedIds,
    saleType,
    step: soldByPiece ? 1 : soldByKilogram || (saleType === "weight" && p.step <= 1) ? 500 : p.step,
    active: p.active
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const row = await prisma.product.findUnique({ where: { id } });
  return row ? toProduct(row) : undefined;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { categorySlug: slug } });
  return rows.map(toProduct);
}

export async function getPopularProducts(limit = 10): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { reviewsCount: "desc" }, take: limit });
  return rows.map(toProduct);
}

export async function getNewProducts(limit = 10): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { isNew: true }, take: limit });
  return rows.map(toProduct);
}

export async function getDiscountedProducts(limit = 10): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { discountPercent: { gt: 0 } }, take: limit });
  return rows.map(toProduct);
}

export async function getRecommendedProducts(limit = 10): Promise<Product[]> {
  const rows = await prisma.product.findMany({ orderBy: { rating: "desc" }, take: limit });
  return rows.map(toProduct);
}

export async function getRelatedProducts(product: Product, limit = 6): Promise<Product[]> {
  if (product.relatedIds && product.relatedIds.length > 0) {
    const rows = await prisma.product.findMany({ where: { id: { in: product.relatedIds } } });
    // Сохраняем порядок, в котором админ расставил связанные товары.
    const byId = new Map(rows.map((r) => [r.id, r] as const));
    const ordered = product.relatedIds.map((id) => byId.get(id)).filter((r): r is DbProduct => Boolean(r));
    return ordered.slice(0, limit).map(toProduct);
  }
  const rows = await prisma.product.findMany({
    where: { categorySlug: product.categorySlug, id: { not: product.id } },
    take: limit
  });
  return rows.map(toProduct);
}

export async function getFeaturedProducts(limit = 10): Promise<Product[]> {
  const rows = await prisma.product.findMany({ where: { featured: true }, take: limit });
  return rows.map(toProduct);
}

export async function getBrandsForCategory(categorySlug?: string): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: categorySlug ? { categorySlug } : undefined,
    select: { manufacturer: true },
    distinct: ["manufacturer"]
  });
  return rows.map((r) => r.manufacturer).sort((a, b) => a.localeCompare(b, "ru"));
}

export type SortOption = "relevance" | "price-asc" | "price-desc" | "rating" | "discount";

export interface CatalogFilters {
  query?: string;
  categorySlug?: string;
  maxPrice?: number;
  minPrice?: number;
  brand?: string;
  onlyDiscount?: boolean;
  onlyNew?: boolean;
  sort?: SortOption;
  /** По умолчанию скрытые (active=false) товары не показываются — это публичная витрина.
   * Админка передаёт true, чтобы видеть и скрытые товары тоже. */
  includeInactive?: boolean;
}

export async function filterProducts(filters: CatalogFilters): Promise<Product[]> {
  const where: Record<string, unknown> = {};
  if (!filters.includeInactive) where.active = true;
  if (filters.categorySlug) where.categorySlug = filters.categorySlug;
  if (filters.brand) where.manufacturer = filters.brand;
  if (filters.onlyDiscount) where.discountPercent = { gt: 0 };
  if (filters.onlyNew) where.isNew = true;
  if (typeof filters.minPrice === "number" || typeof filters.maxPrice === "number") {
    where.price = {
      ...(typeof filters.minPrice === "number" ? { gte: filters.minPrice } : {}),
      ...(typeof filters.maxPrice === "number" ? { lte: filters.maxPrice } : {})
    };
  }
  if (filters.query) {
    const q = filters.query.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { categoryName: { contains: q, mode: "insensitive" } },
      { manufacturer: { contains: q, mode: "insensitive" } }
    ];
  }

  const orderBy =
    filters.sort === "price-asc"
      ? { price: "asc" as const }
      : filters.sort === "price-desc"
        ? { price: "desc" as const }
        : filters.sort === "rating"
          ? { rating: "desc" as const }
          : filters.sort === "discount"
            ? { discountPercent: "desc" as const }
            : undefined;

  const rows = await prisma.product.findMany({ where, orderBy });
  return rows.map(toProduct);
}

export interface CreateProductInput {
  name: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  oldPrice: number | null;
  unit: string;
  weight: number;
  description: string;
  composition: string;
  manufacturer: string;
  shelfLife: string;
  storage: string;
  image: string;
  images: string[];
  isNew: boolean;
  discountPercent: number;
  inStock?: boolean;
  featured?: boolean;
  relatedIds?: string[];
  saleType?: "piece" | "weight";
  step?: number;
  /** Скрыть товар с витрины, не удаляя. По умолчанию true (виден). */
  active?: boolean;
}

function slugifyId(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "product"}-${Math.floor(Math.random() * 100000)}`;
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  const { saleType, step, ...rest } = data;
  const soldByKilogram = data.unit === "кг";
  const normalizedSaleType = data.categorySlug === "bakery" ? "piece" : soldByKilogram ? "weight" : saleType ?? "piece";
  const row = await prisma.product.create({
    data: {
      id: slugifyId(data.name),
      ...rest,
      inStock: data.inStock ?? true,
      rating: 5,
      reviewsCount: 0,
      saleType: SALE_TYPE_TO_DB[normalizedSaleType],
      step: data.categorySlug === "bakery" ? 1 : soldByKilogram ? 500 : normalizedSaleType === "weight" ? (typeof step === "number" && step > 1 ? step : 500) : 1
    }
  });
  return toProduct(row);
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>): Promise<Product> {
  const { saleType, step, ...rest } = data;
  const current = await prisma.product.findUniqueOrThrow({ where: { id }, select: { unit: true, categorySlug: true } });
  const nextUnit = data.unit ?? current.unit;
  const nextCategory = data.categorySlug ?? current.categorySlug;
  const soldByKilogram = nextUnit === "кг" && nextCategory !== "bakery";
  const soldByPiece = nextCategory === "bakery";
  const row = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      ...(soldByPiece ? { saleType: "PIECE" as const, step: 1 } : soldByKilogram ? { saleType: "WEIGHT" as const, step: 500 } : saleType ? { saleType: SALE_TYPE_TO_DB[saleType] } : {}),
      ...(soldByPiece || soldByKilogram ? {} : typeof step === "number" ? { step } : {})
    }
  });
  return toProduct(row);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}

/* ------------------------------------------------------------------ */
/*  Категории                                                           */
/* ------------------------------------------------------------------ */

function toCategory(c: DbCategory, productCount: number): Category {
  return {
    slug: c.slug,
    name: c.name,
    emoji: c.emoji,
    image: c.image ?? undefined,
    order: c.order,
    active: c.active,
    productCount
  };
}

async function productCountsBySlug(): Promise<Map<string, number>> {
  const rows = await prisma.product.groupBy({ by: ["categorySlug"], _count: { _all: true } });
  return new Map(rows.map((r) => [r.categorySlug, r._count._all] as [string, number]));
}

export async function getCategories(opts?: { onlyActive?: boolean }): Promise<Category[]> {
  const [rows, counts] = await Promise.all([
    prisma.category.findMany({
      where: opts?.onlyActive ? { active: true } : undefined,
      orderBy: { order: "asc" }
    }),
    productCountsBySlug()
  ]);
  return rows.map((c) => toCategory(c, counts.get(c.slug) ?? 0));
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  const [row, counts] = await Promise.all([prisma.category.findUnique({ where: { slug } }), productCountsBySlug()]);
  return row ? toCategory(row, counts.get(row.slug) ?? 0) : undefined;
}

export interface CategoryInput {
  slug: string;
  name: string;
  emoji: string;
  image?: string | null;
  active?: boolean;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const max = await prisma.category.aggregate({ _max: { order: true } });
  const order = (max._max.order ?? -10) + 10;
  const row = await prisma.category.create({
    data: {
      slug: input.slug,
      name: input.name,
      emoji: input.emoji,
      image: input.image ?? null,
      active: input.active ?? true,
      order
    }
  });
  return toCategory(row, 0);
}

export async function updateCategory(
  slug: string,
  input: Partial<Omit<CategoryInput, "slug">>
): Promise<Category> {
  const row = await prisma.category.update({ where: { slug }, data: input });
  const counts = await productCountsBySlug();
  return toCategory(row, counts.get(row.slug) ?? 0);
}

/** Удаляет категорию. Товары в ней не трогает — categorySlug у них останется, но категория пропадёт из каталога. */
export async function deleteCategory(slug: string): Promise<void> {
  await prisma.category.delete({ where: { slug } });
}

/** Переставляет категории в указанном порядке (используется в админке для кнопок "выше"/"ниже" и drag&drop). */
export async function reorderCategories(slugsInOrder: string[]): Promise<void> {
  await prisma.$transaction(
    slugsInOrder.map((slug, i) => prisma.category.update({ where: { slug }, data: { order: i * 10 } }))
  );
}

/* ------------------------------------------------------------------ */
/*  Подборки товаров                                                    */
/* ------------------------------------------------------------------ */

type DbCollectionWithItems = {
  slug: string;
  title: string;
  image: string | null;
  order: number;
  active: boolean;
  items: { productId: string; order: number; product: DbProduct }[];
};

function toCollection(c: DbCollectionWithItems): Collection {
  const products = [...c.items]
    .sort((a, b) => a.order - b.order)
    .map((i) => toProduct(i.product));
  return {
    slug: c.slug,
    title: c.title,
    image: c.image ?? undefined,
    order: c.order,
    active: c.active,
    products
  };
}

const COLLECTION_INCLUDE = { items: { include: { product: true } } } as const;

export async function getCollections(opts?: { onlyActive?: boolean }): Promise<Collection[]> {
  const rows = await prisma.collection.findMany({
    where: opts?.onlyActive ? { active: true } : undefined,
    orderBy: { order: "asc" },
    include: COLLECTION_INCLUDE
  });
  return rows.map(toCollection);
}

export async function getCollectionBySlug(slug: string): Promise<Collection | undefined> {
  const row = await prisma.collection.findUnique({ where: { slug }, include: COLLECTION_INCLUDE });
  return row ? toCollection(row) : undefined;
}

export interface CollectionInput {
  slug: string;
  title: string;
  image?: string | null;
  active?: boolean;
  /** id товаров в подборке, в желаемом порядке отображения. */
  productIds: string[];
}

async function replaceCollectionItems(collectionSlug: string, productIds: string[]) {
  await prisma.collectionItem.deleteMany({ where: { collectionSlug } });
  if (productIds.length === 0) return;
  await prisma.collectionItem.createMany({
    data: productIds.map((productId, i) => ({ collectionSlug, productId, order: i }))
  });
}

export async function createCollection(input: CollectionInput): Promise<Collection> {
  const max = await prisma.collection.aggregate({ _max: { order: true } });
  const order = (max._max.order ?? -10) + 10;
  await prisma.collection.create({
    data: {
      slug: input.slug,
      title: input.title,
      image: input.image ?? null,
      active: input.active ?? true,
      order
    }
  });
  await replaceCollectionItems(input.slug, input.productIds);
  return (await getCollectionBySlug(input.slug))!;
}

export async function updateCollection(slug: string, input: Partial<CollectionInput>): Promise<Collection> {
  const { productIds, ...rest } = input;
  if (Object.keys(rest).length > 0) {
    await prisma.collection.update({ where: { slug }, data: rest });
  }
  if (productIds) {
    await replaceCollectionItems(slug, productIds);
  }
  return (await getCollectionBySlug(slug))!;
}

export async function deleteCollection(slug: string): Promise<void> {
  await prisma.collection.delete({ where: { slug } });
}

/** Переставляет подборки в указанном порядке — тот же паттерн, что и reorderCategories. */
export async function reorderCollections(slugsInOrder: string[]): Promise<void> {
  await prisma.$transaction(
    slugsInOrder.map((slug, i) => prisma.collection.update({ where: { slug }, data: { order: i * 10 } }))
  );
}

/* ------------------------------------------------------------------ */
/*  Рецепты                                                             */
/* ------------------------------------------------------------------ */

type DbRecipeWithIngredients = DbRecipe & { ingredients: DbRecipeIngredient[] };

function toRecipe(r: DbRecipeWithIngredients): Recipe {
  return {
    slug: r.slug,
    title: r.title,
    image: r.image,
    cookTimeMinutes: r.cookTimeMinutes,
    difficulty: r.difficulty as RecipeDifficulty,
    description: r.description,
    steps: r.steps,
    ingredients: [...r.ingredients]
      .sort((a, b) => a.order - b.order)
      .map((i) => ({ productId: i.productId, name: i.name }))
  };
}

export async function getRecipes(): Promise<Recipe[]> {
  const rows = await prisma.recipe.findMany({
    include: { ingredients: true },
    orderBy: { createdAt: "desc" }
  });
  return rows.map(toRecipe);
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | undefined> {
  const row = await prisma.recipe.findUnique({ where: { slug }, include: { ingredients: true } });
  return row ? toRecipe(row) : undefined;
}

export interface RecipeInput {
  slug: string;
  title: string;
  image: string;
  cookTimeMinutes: number;
  difficulty: RecipeDifficulty;
  description: string;
  steps: string[];
  ingredients: RecipeIngredient[];
}

async function replaceIngredients(recipeSlug: string, ingredients: RecipeIngredient[]) {
  await prisma.recipeIngredient.deleteMany({ where: { recipeSlug } });
  if (ingredients.length === 0) return;
  await prisma.recipeIngredient.createMany({
    data: ingredients.map((ing, i) => ({
      recipeSlug,
      productId: ing.productId,
      name: ing.name,
      order: i
    }))
  });
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
  await prisma.recipe.create({
    data: {
      slug: input.slug,
      title: input.title,
      image: input.image,
      cookTimeMinutes: input.cookTimeMinutes,
      difficulty: input.difficulty,
      description: input.description,
      steps: input.steps
    }
  });
  await replaceIngredients(input.slug, input.ingredients);
  return (await getRecipeBySlug(input.slug))!;
}

export async function updateRecipe(slug: string, input: Partial<RecipeInput>): Promise<Recipe> {
  const { ingredients, ...rest } = input;
  if (Object.keys(rest).length > 0) {
    await prisma.recipe.update({ where: { slug }, data: rest });
  }
  if (ingredients) {
    await replaceIngredients(slug, ingredients);
  }
  return (await getRecipeBySlug(slug))!;
}

export async function deleteRecipe(slug: string): Promise<void> {
  await prisma.recipe.delete({ where: { slug } });
}

/* ------------------------------------------------------------------ */
/*  Заказы                                                              */
/* ------------------------------------------------------------------ */

function toAdminOrder(o: {
  id: string;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  address: string;
  fulfillmentType?: "DELIVERY" | "PICKUP";
  pickupLocationId?: string | null;
  comment: string | null;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  promoCode: string | null;
  promoDiscount: number;
  total: number;
  paymentMethod: DbPaymentMethod;
  paymentStatus: DbPaymentStatus;
  status: DbOrderStatus;
  courierId: string | null;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
    saleType: DbSaleType;
    unit: string;

  }[];
}): AdminOrder {
  const items: AppOrderItem[] = o.items.map((i) => ({
    productId: i.productId,
    name: i.name,
    quantity: i.quantity,
    price: i.price,
    image: i.image,
    saleType: SALE_TYPE_FROM_DB[i.saleType],
    unit: i.unit
  }));
  return {
    id: o.id,
    createdAt: o.createdAt.toISOString(),
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    address: o.address,
    fulfillmentType: o.fulfillmentType === "PICKUP" ? "pickup" : "delivery",
      pickupLocationId: o.pickupLocationId,
    comment: o.comment ?? undefined,
    items,
    subtotal: o.subtotal,
    deliveryFee: o.deliveryFee,
    discount: o.discount,
    promoCode: o.promoCode,
    promoDiscount: o.promoDiscount,
    total: o.total,
    paymentMethod: PAYMENT_FROM_DB[o.paymentMethod],
    paymentStatus: PAYMENT_STATUS_FROM_DB[o.paymentStatus],
    status: STATUS_FROM_DB[o.status],
    courierId: o.courierId
  };
}

const ORDER_INCLUDE = { items: true } as const;

export async function getAllOrders(): Promise<AdminOrder[]> {
  const rows = await prisma.order.findMany({ include: ORDER_INCLUDE, orderBy: { createdAt: "desc" } });
  return rows.map(toAdminOrder);
}

export async function getOrderById(id: string): Promise<AdminOrder | undefined> {
  const row = await prisma.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  return row ? toAdminOrder(row) : undefined;
}

export async function getOrdersForCustomerPhone(phone: string): Promise<AdminOrder[]> {
  const rows = await prisma.order.findMany({
    where: { customerPhone: phone },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" }
  });
  return rows.map(toAdminOrder);
}

export async function getOrdersForCourier(courierId: string): Promise<AdminOrder[]> {
  const rows = await prisma.order.findMany({
    where: { courierId },
    include: ORDER_INCLUDE,
    orderBy: { createdAt: "desc" }
  });
  return rows.map(toAdminOrder);
}

export interface CreateOrderInput {
  lines: CartLine[];
  total: number;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  promoCode?: string | null;
  promoDiscount?: number;
  address: string;
  fulfillmentType?: "delivery" | "pickup";
  pickupLocationId?: string | null;
  customerName: string;
  customerPhone: string;
  comment?: string;
  paymentMethod: "cash" | "card" | "online";
  /** Если заказ оформлен авторизованным клиентом — для проверки/фиксации использования промокода. */
  customerUserId?: string;
}

function generateOrderId() {
  return `SLAY-${Math.floor(100000 + Math.random() * 899999)}`;
}

/** Создаёт заказ и (если ещё не было) пользователя-клиента с ролью CUSTOMER по телефону. */
export async function createOrder(input: CreateOrderInput): Promise<AdminOrder> {
  const customer = await prisma.user.upsert({
    where: { phone: input.customerPhone },
    update: { name: input.customerName },
    create: { phone: input.customerPhone, name: input.customerName, role: Role.CUSTOMER }
  });

  const row = await prisma.order.create({
    data: {
      id: generateOrderId(),
      customerId: customer.id,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      address: input.address,
      fulfillmentType: input.fulfillmentType === "pickup" ? "PICKUP" : "DELIVERY",
      pickupLocationId: input.pickupLocationId ?? null,
      comment: input.comment,
      subtotal: input.subtotal,
      deliveryFee: input.deliveryFee,
      discount: input.discount ?? 0,
      promoCode: input.promoCode ?? null,
      promoDiscount: input.promoDiscount ?? 0,
      total: input.total,
      paymentMethod: PAYMENT_TO_DB[input.paymentMethod],
      status: "NEW",
      items: {
        create: input.lines.map((l) => ({
          productId: l.product.id,
          name: l.product.name,
          quantity: l.quantity,
          price: l.product.price,
          image: l.product.image,
          saleType: l.product.saleType === "weight" ? "WEIGHT" : "PIECE",
          unit: l.product.unit
        }))
      },
      statusHistory: {
        create: { status: "NEW" }
      }
    },
    include: ORDER_INCLUDE
  });

  if (input.promoCode) {
    await prisma.promoUsage
      .create({ data: { promoCode: input.promoCode, userId: customer.id, orderId: row.id } })
      .catch(() => {
        // Гонка/повторная отправка формы — использование уже записано, это не критично.
      });
  }

  return toAdminOrder(row);
}

export async function updateOrderStatus(id: string, status: OrderStatus, changedByUserId?: string): Promise<AdminOrder> {
  const row = await prisma.order.update({
    where: { id },
    data: {
      status: STATUS_TO_DB[status],
      statusHistory: { create: { status: STATUS_TO_DB[status], changedBy: changedByUserId } }
    },
    include: ORDER_INCLUDE
  });
  return toAdminOrder(row);
}

export async function getOrderStatusHistory(orderId: string) {
  const rows = await prisma.orderStatusHistory.findMany({
    where: { orderId },
    orderBy: { changedAt: "asc" },
    include: { changedByUser: { select: { name: true, role: true } } }
  });
  return rows.map((r) => ({
    status: STATUS_FROM_DB[r.status],
    changedAt: r.changedAt.toISOString(),
    changedBy: r.changedByUser?.name ?? null
  }));
}

export async function assignCourier(id: string, courierId: string | null): Promise<AdminOrder> {
  const row = await prisma.order.update({
    where: { id },
    data: { courierId },
    include: ORDER_INCLUDE
  });
  return toAdminOrder(row);
}

/**
 * Отмена заказа клиентом. Разрешена только до момента оплаты (см. CANCELLABLE_STATUSES
 * в src/types/index.ts) — как только заказ оплачен, самостоятельная отмена недоступна.
 */
export async function cancelOwnOrder(orderId: string, customerPhone: string): Promise<AdminOrder> {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    const err = new Error("Заказ не найден");
    (err as Error & { code?: string }).code = "NOT_FOUND";
    throw err;
  }
  if (existing.customerPhone !== customerPhone) {
    const err = new Error("Этот заказ принадлежит другому пользователю");
    (err as Error & { code?: string }).code = "FORBIDDEN";
    throw err;
  }
  const appStatus = STATUS_FROM_DB[existing.status];
  if (appStatus !== "new" && appStatus !== "accepted") {
    const err = new Error("Заказ уже оплачен или обрабатывается — отменить его самостоятельно нельзя");
    (err as Error & { code?: string }).code = "NOT_CANCELLABLE";
    throw err;
  }
  return updateOrderStatus(orderId, "cancelled");
}

/* ------------------------------------------------------------------ */
/*  Курьеры                                                             */
/* ------------------------------------------------------------------ */

export async function getCouriers(options?: { includeInactive?: boolean }): Promise<Courier[]> {
  const couriers = await prisma.user.findMany({
    where: { role: Role.COURIER, ...(options?.includeInactive ? {} : { isActive: true }) },
    orderBy: { name: "asc" }
  });
  const counts = await prisma.order.groupBy({
    by: ["courierId"],
    where: { courierId: { not: null }, status: { notIn: ["DELIVERED", "CANCELLED"] } },
    _count: { _all: true }
  });
  const countByCourier = new Map<string, number>(
    counts.map((c) => [c.courierId as string, c._count._all] as [string, number])
  );

  return couriers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    avatarSeed: c.avatarSeed ?? c.id,
    activeOrdersCount: countByCourier.get(c.id) ?? 0,
    isActive: c.isActive
  }));
}

export interface CreateCourierInput {
  name: string;
  phone: string;
  password: string;
}

export async function createCourier(input: CreateCourierInput) {
  const { hashPassword } = await import("@/lib/password");
  const passwordHash = await hashPassword(input.password);
  return prisma.user.create({
    data: { name: input.name, phone: input.phone, passwordHash, role: Role.COURIER, avatarSeed: input.name }
  });
}

export interface UpdateCourierInput {
  name?: string;
  phone?: string;
  password?: string;
  isActive?: boolean;
}

/** Увольнение курьера = isActive: false. Записи никогда не удаляются (сохраняется история заказов). */
export async function updateCourier(id: string, input: UpdateCourierInput) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.phone !== undefined) data.phone = input.phone;
  if (input.isActive !== undefined) data.isActive = input.isActive;
  if (input.password) {
    const { hashPassword } = await import("@/lib/password");
    data.passwordHash = await hashPassword(input.password);
  }
  return prisma.user.update({ where: { id }, data });
}

/* ------------------------------------------------------------------ */
/*  Промокоды                                                           */
/* ------------------------------------------------------------------ */

export async function validatePromoCode(
  code: string,
  userId?: string
): Promise<{ ok: true; discountPercent: number } | { ok: false; error: string }> {
  const normalized = code.trim().toUpperCase();
  const promo = await prisma.promoCode.findUnique({ where: { code: normalized } });
  if (!promo || !promo.isActive) return { ok: false, error: "Промокод не найден" };
  if (promo.expiresAt && promo.expiresAt < new Date()) return { ok: false, error: "Срок действия промокода истёк" };

  if (userId) {
    const usage = await prisma.promoUsage.findUnique({
      where: { promoCode_userId: { promoCode: normalized, userId } }
    });
    if (usage) return { ok: false, error: "Вы уже использовали этот промокод" };
  }

  if (promo.maxUses) {
    const usesCount = await prisma.promoUsage.count({ where: { promoCode: normalized } });
    if (usesCount >= promo.maxUses) return { ok: false, error: "Промокод исчерпан" };
  }

  return { ok: true, discountPercent: promo.discountPercent };
}

/* ------------------------------------------------------------------ */
/*  Аналитика (Dashboard)                                               */
/* ------------------------------------------------------------------ */

export async function getAnalytics() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const ordersToday = await prisma.order.findMany({
    where: { createdAt: { gte: startOfDay }, status: { not: "CANCELLED" } },
    include: { items: true }
  });

  const ordersTodayCount = ordersToday.length;
  const revenueToday = ordersToday.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = ordersTodayCount > 0 ? Math.round(revenueToday / ordersTodayCount) : 0;

  // Топ товаров и продажи по категориям считаем по всем заказам (не только за сегодня),
  // чтобы дашборд был содержательным сразу после сидирования тестовых данных.
  const allItems = await prisma.orderItem.findMany({
    where: { order: { status: { not: "CANCELLED" } } },
    select: { productId: true, name: true, quantity: true, price: true, saleType: true, unit: true }
  });
  const products = await prisma.product.findMany({
    where: { active: true },
    select: { id: true, name: true, categoryName: true, saleType: true }
  });

  const byProduct = new Map<string, { name: string; quantity: number; revenue: number; unit: "кг" | "шт" }>();
  for (const item of allItems) {
    const isWeighted = item.saleType === "WEIGHT";
    const entry = byProduct.get(item.productId) ?? { name: item.name, quantity: 0, revenue: 0, unit: isWeighted ? "кг" : "шт" };
    const saleUnit = { saleType: item.saleType === "WEIGHT" ? "weight" as const : "piece" as const, unit: item.unit, step: 500 };
    entry.quantity += isWeighted ? item.quantity / 1000 : item.quantity;
    entry.revenue += getLineTotal(item.price, item.quantity, saleUnit);
    byProduct.set(item.productId, entry);
  }
  for (const product of products) {
    if (!byProduct.has(product.id)) {
      byProduct.set(product.id, {
        name: product.name,
        quantity: 0,
        revenue: 0,
        unit: product.saleType === "WEIGHT" ? "кг" : "шт"
      });
    }
  }
  const productsByQuantity = [...byProduct.entries()]
    .map(([productId, v]) => ({ productId, ...v }))
    .sort((a, b) => b.quantity - a.quantity);
  const topProducts = productsByQuantity.slice(0, 8);
  const slowProducts = [...productsByQuantity].sort((a, b) => a.quantity - b.quantity).slice(0, 8);

  const categoryByProduct = new Map<string, string>(products.map((p) => [p.id, p.categoryName] as [string, string]));

  const byCategory = new Map<string, number>();
  for (const [productId, v] of byProduct.entries()) {
    const category = categoryByProduct.get(productId) ?? "Другое";
    byCategory.set(category, (byCategory.get(category) ?? 0) + v.revenue);
  }
  const salesByCategory = [...byCategory.entries()]
    .map(([category, revenue]) => ({ category, revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  return { ordersToday: ordersTodayCount, revenueToday, avgOrderValue, topProducts, slowProducts, salesByCategory };
}

/* ------------------------------------------------------------------ */
/*  Профиль пользователя: личные данные и адреса доставки              */
/* ------------------------------------------------------------------ */

export interface AddressDto {
  id: string;
  label: string;
  address: string;
  entrance: string | null;
  floor: string | null;
  apartment: string | null;
  comment: string | null;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
}

export interface AddressInput {
  label: string;
  address: string;
  entrance?: string | null;
  floor?: string | null;
  apartment?: string | null;
  comment?: string | null;
  lat?: number | null;
  lng?: number | null;
  isDefault?: boolean;
}

function toAddressDto(a: {
  id: string;
  label: string;
  address: string;
  entrance: string | null;
  floor: string | null;
  apartment: string | null;
  comment: string | null;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
}): AddressDto {
  return { ...a };
}

export async function getAddresses(userId: string): Promise<AddressDto[]> {
  const rows = await prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] });
  return rows.map(toAddressDto);
}

export async function createAddress(userId: string, input: AddressInput): Promise<AddressDto> {
  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const created = await prisma.address.create({
    data: {
      userId,
      label: input.label,
      address: input.address,
      entrance: input.entrance ?? null,
      floor: input.floor ?? null,
      apartment: input.apartment ?? null,
      comment: input.comment ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      isDefault: input.isDefault ?? false
    }
  });
  return toAddressDto(created);
}

export async function updateAddress(userId: string, id: string, input: Partial<AddressInput>): Promise<AddressDto> {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Адрес не найден");
  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId }, data: { isDefault: false } });
  }
  const updated = await prisma.address.update({ where: { id }, data: input });
  return toAddressDto(updated);
}

export async function deleteAddress(userId: string, id: string): Promise<void> {
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) throw new Error("Адрес не найден");
  await prisma.address.delete({ where: { id } });
}

export async function updateUserProfile(userId: string, data: { name?: string }): Promise<void> {
  await prisma.user.update({ where: { id: userId }, data: { name: data.name } });
}
