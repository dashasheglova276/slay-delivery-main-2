/**
 * Однократный перенос существующих mock-данных проекта в PostgreSQL.
 * Использует те же массивы, что раньше читал фронтенд напрямую —
 * это гарантирует, что после миграции каталог и тестовые заказы
 * выглядят так же, как выглядели на статике.
 *
 * Запуск: npx prisma db seed   (или npx tsx prisma/seed.ts)
 */
import { PrismaClient, Role, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { products as seedProducts } from "../src/data/products";
import { categories as seedCategories } from "../src/data/categories";
import { recipes as seedRecipes } from "../src/data/recipes";
import { mockOrders } from "../src/data/orders";
import { mockCouriers } from "../src/data/couriers";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

const STATUS_MAP: Record<string, OrderStatus> = {
  new: "NEW",
  accepted: "ACCEPTED",
  picked_up: "PICKED_UP",
  in_transit: "IN_TRANSIT",
  delivered: "DELIVERED",
  cancelled: "CANCELLED",
};


const PAYMENT_MAP: Record<string, PaymentMethod> = {
  cash: "CASH",
  card: "CARD",
  online: "ONLINE"
};

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  pending: "PENDING",
  paid: "PAID",
  failed: "FAILED",
  refunded: "REFUNDED"
};

function seedSaleSettings(product: (typeof seedProducts)[number]) {
  if (product.categorySlug === "bakery") return { saleType: "PIECE" as const, step: 1 };
  return {
    saleType: product.unit === "кг" || product.saleType === "weight" ? "WEIGHT" as const : "PIECE" as const,
    step: product.unit === "кг" || (product.saleType === "weight" && product.step <= 1) ? 500 : product.step
  };
}

async function main() {
  console.log("→ Категории...");
  for (const c of seedCategories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, emoji: c.emoji, image: c.image, order: c.order },
      create: { slug: c.slug, name: c.name, emoji: c.emoji, image: c.image, order: c.order }
    });
  }

  console.log("→ Товары...");
  for (const p of seedProducts) {
    const saleSettings = seedSaleSettings(p);
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
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
        inStock: p.inStock ?? true,
        featured: p.featured ?? false,
        relatedIds: p.relatedIds ?? [],
        ...saleSettings
      },
      create: {
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
        inStock: p.inStock ?? true,
        featured: p.featured ?? false,
        relatedIds: p.relatedIds ?? [],
        ...saleSettings
      }
    });
  }

  console.log("→ Рецепты...");
  for (const r of seedRecipes) {
    await prisma.recipe.upsert({
      where: { slug: r.slug },
      update: {
        title: r.title,
        image: r.image,
        cookTimeMinutes: r.cookTimeMinutes,
        difficulty: r.difficulty,
        description: r.description,
        steps: r.steps
      },
      create: {
        slug: r.slug,
        title: r.title,
        image: r.image,
        cookTimeMinutes: r.cookTimeMinutes,
        difficulty: r.difficulty,
        description: r.description,
        steps: r.steps
      }
    });

    // Ингредиенты пересобираем с нуля при каждом запуске seed — проще, чем
    // сверять построчные различия, а порядок всегда совпадает с исходным массивом.
    await prisma.recipeIngredient.deleteMany({ where: { recipeSlug: r.slug } });
    for (let i = 0; i < r.ingredients.length; i++) {
      const ing = r.ingredients[i];
      const product = await prisma.product.findUnique({ where: { id: ing.productId } });
      if (!product) {
        console.warn(`  ⚠ Пропущен ингредиент "${ing.name}" — товар ${ing.productId} не найден`);
        continue;
      }
      await prisma.recipeIngredient.create({
        data: {
          recipeSlug: r.slug,
          productId: ing.productId,
          name: ing.name,
          order: i
        }
      });
    }
  }

  console.log("→ Администратор...");
  const adminPasswordHash = await hashPassword("admin123");
  const admin = await prisma.user.upsert({
    where: { phone: "+70000000001" },
    update: {  passwordHash: adminPasswordHash,
  role: Role.ADMIN,
  isActive: true},
    create: {
      phone: "+70000000001",
      name: "Администратор",
      role: Role.ADMIN,
      passwordHash: adminPasswordHash
    }
  });
  console.log(`  Логин: ${admin.phone} / пароль: admin123`);

  console.log("→ Курьеры...");
  const courierIdMap = new Map<string, string>(); // старый mock id -> реальный User.id
  const courierPasswordHash = await hashPassword("courier123");
  for (const c of mockCouriers) {
    const user = await prisma.user.upsert({
      where: { phone: c.phone },
      update: {  name: c.name,
  avatarSeed: c.avatarSeed,
  role: Role.COURIER,
  passwordHash: courierPasswordHash,
  isActive: true },
      create: {
        phone: c.phone,
        name: c.name,
        avatarSeed: c.avatarSeed,
        role: Role.COURIER,
        passwordHash: courierPasswordHash
      }
    });
    courierIdMap.set(c.id, user.id);
  }
  console.log(`  Пароль для всех курьеров: courier123`);

  console.log("→ Промокоды...");
  const seedPromoCodes = [
    { code: "SLAY10", discountPercent: 10 },
    { code: "FIRST15", discountPercent: 15 },
    { code: "LIME20", discountPercent: 20 }
  ];
  for (const promo of seedPromoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: { discountPercent: promo.discountPercent },
      create: { code: promo.code, discountPercent: promo.discountPercent }
    });
  }

  console.log("→ Клиенты и заказы...");
  const customerIdByPhone = new Map<string, string>();
  for (const o of mockOrders) {
    let customerId: string | undefined = customerIdByPhone.get(o.customerPhone);
    if (!customerId) {
      const customer = await prisma.user.upsert({
        where: { phone: o.customerPhone },
        update: { name: o.customerName },
        create: {
          phone: o.customerPhone,
          name: o.customerName,
          role: Role.CUSTOMER
        }
      });
      customerId = customer.id as string;
      customerIdByPhone.set(o.customerPhone, customerId);
    }

    const courierId = o.courierId ? courierIdMap.get(o.courierId) ?? null : null;

    await prisma.order.upsert({
      where: { id: o.id },
      update: {},
      create: {
        id: o.id,
        createdAt: new Date(o.createdAt),
        customerId,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        address: o.address,
        comment: o.comment,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        total: o.total,
        paymentMethod: PAYMENT_MAP[o.paymentMethod],
        paymentStatus: PAYMENT_STATUS_MAP[o.paymentStatus],
        status: STATUS_MAP[o.status],
        courierId,
        items: {
          create: o.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            image: item.image
          }))
        },
        statusHistory: {
          create: { status: STATUS_MAP[o.status], changedAt: new Date(o.createdAt) }
        }
      }
    });
  }

  console.log("✓ Seed завершён.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
