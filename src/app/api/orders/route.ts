export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getAllOrders, getOrdersForCourier, createOrder, validatePromoCode, toProduct } from "@/lib/data-service";
import { logError } from "@/lib/logger";
import { getLineTotal, MIN_ORDER_AMOUNT } from "@/lib/utils";

const CUSTOMER_PHONE_COOKIE = "slay_customer_phone";

/**
 * GET /api/orders
 * - ADMIN сессия → все заказы (для /admin/orders)
 * - COURIER сессия → только назначенные ему заказы (для /courier)
 * Доступ клиента к своим заказам — через /api/me/orders (по телефону), не здесь.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Требуется авторизация" }, { status: 401 });

    if (user.role === "ADMIN") {
      const orders = await getAllOrders();
      return NextResponse.json({ orders });
    }

    if (user.role === "COURIER") {
      const orders = await getOrdersForCourier(user.id);
      return NextResponse.json({ orders });
    }

    return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
  } catch (error) {
    await logError("api/orders GET", error);
    return NextResponse.json({ error: "Не удалось загрузить заказы" }, { status: 500 });
  }
}

/**
 * POST /api/orders — публичный эндпоинт оформления заказа (checkout).
 * Промокод (если указан) валидируется и пересчитывается на сервере —
 * клиентский promoDiscount не принимается на веру, чтобы нельзя было
 * подделать скидку в запросе.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lines, address, customerName, customerPhone, comment, paymentMethod, promoCode, fulfillmentType, pickupLocationId } =
      body;
    const pickup = fulfillmentType === "pickup";

    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }
    if (lines.some((line) => !line?.product?.id || !Number.isFinite(Number(line.quantity)) || Number(line.quantity) <= 0)) {
      return NextResponse.json({ error: "Проверьте количество товаров в корзине" }, { status: 400 });
    }
    if ((!pickup && !address) || !customerName || !customerPhone || (pickup && !pickupLocationId)) {
      return NextResponse.json({ error: "Заполните имя, телефон и адрес" }, { status: 400 });
    }
    let finalAddress = address;
    if (pickup) {
      const location = await prisma.pickupLocation.findFirst({ where: { id: pickupLocationId, active: true } });
      if (!location) return NextResponse.json({ error: "Точка самовывоза недоступна. Выберите другую." }, { status: 400 });
      finalAddress = location.address;
    }

    const productRows = await prisma.product.findMany({
      where: { id: { in: [...new Set(lines.map((line: { product: { id: string } }) => line.product.id))] } }
    });
    const productById = new Map(productRows.map((row) => [row.id, toProduct(row)]));
    const normalizedLines = lines.map((line: { product: { id: string; saleType?: string }; quantity: number }) => {
      const product = productById.get(line.product.id);
      if (!product) return null;
      let quantity = Math.round(Number(line.quantity));
      // Old browser carts could keep a loaf's 400 g package amount as if it
      // were 400 separate pieces. Reconcile those lines to whole loaves.
      const packageWeightGrams = product.unit === "кг" ? product.weight * 1000 : product.weight;
      if (product.categorySlug === "bakery" && packageWeightGrams > 0 && quantity > Math.max(2, packageWeightGrams * 0.6)) {
        quantity = Math.max(1, Math.round(quantity / packageWeightGrams));
      }
      return { product, quantity };
    });
    if (normalizedLines.some((line) => line === null)) {
      return NextResponse.json({ error: "Один из товаров больше не доступен" }, { status: 400 });
    }
    const orderLines = normalizedLines.filter((line): line is NonNullable<typeof line> => line !== null);
    const subtotal = orderLines.reduce((sum, line) => sum + getLineTotal(line.product.price, line.quantity, line.product), 0);
    if (subtotal < MIN_ORDER_AMOUNT) {
      return NextResponse.json({ error: `Минимальная сумма заказа — ${MIN_ORDER_AMOUNT} ₽. Добавьте товаров ещё на ${MIN_ORDER_AMOUNT - subtotal} ₽.` }, { status: 400 });
    }
    const productDiscount = orderLines.reduce((sum, line) => {
      const discount = line.product.oldPrice ? line.product.oldPrice - line.product.price : 0;
      return sum + getLineTotal(discount, line.quantity, line.product);
    }, 0);

    let promoDiscount = 0;
    let appliedPromoCode: string | null = null;

    if (promoCode) {
      const existingCustomer = await prisma.user.findUnique({ where: { phone: customerPhone } });
      const result = await validatePromoCode(promoCode, existingCustomer?.id);
      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      promoDiscount = Math.round((subtotal * result.discountPercent) / 100);
      appliedPromoCode = promoCode.trim().toUpperCase();
    }

    const settings = await prisma.shopSettings.upsert({where:{id:"main"},create:{id:"main"},update:{}});
    let weatherBad = false;
    try { const w=await fetch("https://api.open-meteo.com/v1/forecast?latitude=44.95&longitude=34.10&current=precipitation,wind_speed_10m",{cache:"no-store",signal:AbortSignal.timeout(2500)}); if(w.ok){const d=await w.json();weatherBad=Number(d.current?.precipitation||0)>=0.5||Number(d.current?.wind_speed_10m||0)>=10;} } catch {}
    const recentDemand=await prisma.order.count({where:{createdAt:{gte:new Date(Date.now()-60*60*1000)},status:{not:"CANCELLED"},fulfillmentType:"DELIVERY"}});
    const demandBad=recentDemand>=5;
    const surge=(weatherBad?settings.weatherSurcharge:0)+(demandBad?settings.demandSurcharge:0);
    const finalDeliveryFee = pickup || subtotal === 0 || subtotal >= 1500 ? 0 : settings.baseDeliveryFee+surge;
    const recomputedTotal = Math.max(subtotal - promoDiscount, 0) + finalDeliveryFee;

    const order = await createOrder({
      lines: orderLines,
      total: recomputedTotal,
      subtotal,
      deliveryFee: finalDeliveryFee,
      discount: productDiscount,
      promoCode: appliedPromoCode,
      promoDiscount,
      address: finalAddress,
      fulfillmentType: pickup ? "pickup" : "delivery",
      pickupLocationId: pickup ? pickupLocationId : null,
      customerName,
      customerPhone,
      comment,
      paymentMethod: paymentMethod ?? "card"
    });

    const response = NextResponse.json({ order }, { status: 201 });
    response.cookies.set(CUSTOMER_PHONE_COOKIE, customerPhone, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365
    });
    return response;
  } catch (error) {
    await logError("api/orders POST", error);
    return NextResponse.json({ error: "Не удалось оформить заказ" }, { status: 500 });
  }
}
