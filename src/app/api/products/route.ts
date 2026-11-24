export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { filterProducts, createProduct, toProduct, type SortOption } from "@/lib/data-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const ids = searchParams.get("ids");
  if (ids) {
    const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);
    const rows = await prisma.product.findMany({ where: { id: { in: idList } } });
    return NextResponse.json({
      products: rows.map(toProduct)
    });
  }

  // Админка должна видеть и скрытые (active=false) товары, публичная витрина — нет.
  const wantsAdminView = searchParams.get("admin") === "1";
  const user = wantsAdminView ? await getCurrentUser() : null;
  const includeInactive = wantsAdminView && user?.role === "ADMIN";

  const products = await filterProducts({
    query: searchParams.get("query") ?? undefined,
    categorySlug: searchParams.get("categorySlug") ?? undefined,
    brand: searchParams.get("brand") ?? undefined,
    onlyDiscount: searchParams.get("onlyDiscount") === "true",
    onlyNew: searchParams.get("onlyNew") === "true",
    minPrice: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
    maxPrice: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
    sort: (searchParams.get("sort") as SortOption) || undefined,
    includeInactive
  });

  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  const required = ["name", "categorySlug", "categoryName", "price", "unit", "weight", "image"];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json({ error: `Поле "${field}" обязательно` }, { status: 400 });
    }
  }
  const images: string[] = Array.isArray(body.images) ? body.images : [body.image];
  if (images.length < 3) {
    return NextResponse.json({ error: "Загрузите минимум 3 фотографии товара" }, { status: 400 });
  }
  if (body.saleType === "weight") {
    const stepNum = Number(body.step);
    if (!Number.isFinite(stepNum) || stepNum < 1 || !Number.isInteger(stepNum)) {
      return NextResponse.json({ error: "Шаг весового товара должен быть целым числом граммов (не меньше 1)" }, { status: 400 });
    }
  }

  const price = Number(body.price);
  const oldPrice = body.oldPrice ? Number(body.oldPrice) : null;
  const discountPercent = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : 0;

  const product = await createProduct({
    name: body.name,
    categorySlug: body.categorySlug,
    categoryName: body.categoryName,
    price,
    oldPrice,
    unit: body.unit,
    weight: Number(body.weight),
    description: body.description ?? "",
    composition: body.composition ?? "Подробный состав уточняйте на упаковке товара.",
    manufacturer: body.manufacturer ?? "StarFood Поставщик",
    shelfLife: body.shelfLife ?? "См. на упаковке",
    storage: body.storage ?? "Хранить в сухом прохладном месте.",
    image: body.image,
    images,
    isNew: body.isNew ?? true,
    discountPercent,
    inStock: body.inStock ?? true,
    featured: body.featured ?? false,
    relatedIds: Array.isArray(body.relatedIds) ? body.relatedIds : [],
    saleType: body.saleType === "weight" ? "weight" : "piece",
    step: body.saleType === "weight" ? Number(body.step) || 500 : 1,
    active: body.active ?? true
  });

  return NextResponse.json({ product }, { status: 201 });
}
