"use client";

import { useMemo, useState } from "react";
import type { AdminOrder } from "@/types";
import { formatPrice } from "@/lib/utils";

type ProductMetric = { productId: string; name: string; quantity: number; revenue: number; unit: "кг" | "шт" };
type CategoryMetric = { category: string; revenue: number };

export default function AnalyticsCharts({
  orders,
  salesByCategory,
  topProducts,
  slowProducts
}: {
  orders: AdminOrder[];
  salesByCategory: CategoryMetric[];
  topProducts: ProductMetric[];
  slowProducts: ProductMetric[];
}) {
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const data = useMemo(() => {
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    from.setDate(from.getDate() - days + 1);
    const buckets = Array.from({ length: days }, (_, i) => {
      const date = new Date(from);
      date.setDate(from.getDate() + i);
      return { date, revenue: 0, orders: 0 };
    });
    const byDay = new Map(buckets.map((bucket) => [bucket.date.toDateString(), bucket]));
    const districts = new Map<string, { count: number; revenue: number }>();

    orders.filter((order) => order.status !== "cancelled").forEach((order) => {
      const day = byDay.get(new Date(order.createdAt).toDateString());
      if (day) {
        day.revenue += order.total;
        day.orders += 1;
      }
      if (order.fulfillmentType === "pickup") return;

      const addressParts = order.address.split(",").map((part) => part.trim()).filter(Boolean);
      const region = addressParts.find((part) => /район|округ|микрорайон|мкр\.?/i.test(part))
        || addressParts.find((part) => /улиц|ул\.?|проспект|пр-т|шоссе|бульвар|переулок|наб\.?/i.test(part))
        || addressParts[0]
        || "Адрес не указан";
      const current = districts.get(region) ?? { count: 0, revenue: 0 };
      current.count += 1;
      current.revenue += order.total;
      districts.set(region, current);
    });

    return {
      buckets,
      districts: [...districts].sort((a, b) => b[1].count - a[1].count).slice(0, 6)
    };
  }, [orders, days]);

    const maxRevenue = Math.max(1, ...data.buckets.map((bucket) => bucket.revenue));
  const maxDistrict = Math.max(1, ...data.districts.map(([, value]) => value.count));
  const maxCategory = Math.max(1, ...salesByCategory.map((category) => category.revenue));
  const maxProduct = Math.max(1, ...topProducts.map((product) => product.quantity));

  function quantityLabel(product: ProductMetric) {
    return `${product.quantity.toLocaleString("ru-RU", { maximumFractionDigits: 2 })} ${product.unit}`;
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-4 xl:grid-cols-[1.6fr,1fr]">
        <div className="analytics-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="font-display text-lg font-extrabold">Продажи</h2><p className="text-sm text-smoke-500">Выручка и число заказов по дням</p></div>
            <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-xl border border-smoke-200 bg-white/80 px-3 py-2 text-sm font-semibold">
              <option value={7}>7 дней</option><option value={30}>30 дней</option><option value={90}>90 дней</option>
            </select>
          </div>
          <div className="mb-4 flex gap-2">{([ ["revenue", "Выручка"], ["orders", "Заказы"] ] as const).map(([key,label])=><button key={key} type="button" onClick={()=>setMetric(key)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${metric===key?"bg-ink text-white":"bg-smoke-100 text-smoke-500"}`}>{label}</button>)}</div>
          {orders.length === 0 ? <p className="py-12 text-center text-sm text-smoke-500">Данные появятся после первых заказов</p> : <>
            <svg viewBox="0 0 900 220" className="h-48 w-full overflow-visible" role="img" aria-label={metric === "revenue" ? "Линейный график выручки" : "Линейный график заказов"} preserveAspectRatio="none">
              <path d="M0 210 H900 M0 110 H900 M0 10 H900" stroke="#e5e7eb" strokeWidth="1" />
              <polyline fill="none" stroke={metric === "revenue" ? "#f97316" : "#16a34a"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={data.buckets.map((bucket,index)=>{const value=metric === "revenue"?bucket.revenue:bucket.orders;const max=metric === "revenue"?maxRevenue:Math.max(1,...data.buckets.map(item=>item.orders));const x=data.buckets.length===1?450:index/(data.buckets.length-1)*900;const y=210-(value/max)*190;return `${x},${y}`}).join(" ")} />
            </svg>
            <div className="mt-2 flex justify-between text-[11px] text-smoke-400"><span>{data.buckets[0]?.date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span><span>Пик: {formatPrice(maxRevenue)}</span><span>{data.buckets.at(-1)?.date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span></div>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-smoke-600"><span className="inline-flex items-center gap-2"><i className={`h-2.5 w-2.5 rounded-full ${metric === "revenue" ? "bg-orange-500" : "bg-emerald-600"}`} />{metric === "revenue" ? "Выручка" : "Количество заказов"}</span></div>
          </>}
        </div>

        <div className="analytics-card">
          <h2 className="font-display text-lg font-extrabold">Спрос по районам</h2><p className="mb-5 text-sm text-smoke-500">По району доставки, либо по улице из адреса</p>
          {data.districts.length === 0 ? <p className="py-10 text-center text-sm text-smoke-500">Данные появятся после первых заказов с доставкой</p> : <div className="flex flex-col gap-4">{data.districts.map(([name, value]) => <div key={name}>
            <div className="mb-1 flex justify-between gap-2 text-sm"><span className="truncate font-semibold">{name}</span><span className="shrink-0 text-smoke-500">{value.count} · {formatPrice(value.revenue)}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-smoke-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(value.count / maxDistrict) * 100}%` }} /></div>
          </div>)}</div>}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="analytics-card">
          <h2 className="font-display text-lg font-extrabold">Выручка по категориям</h2><p className="mb-5 text-sm text-smoke-500">Какие разделы приносят больше продаж</p>
          {salesByCategory.length === 0 ? <p className="py-8 text-center text-sm text-smoke-500">Пока нет данных</p> : <div className="flex flex-col gap-4">{salesByCategory.slice(0, 8).map((category, index) => <div key={category.category}>
            <div className="mb-1 flex justify-between gap-2 text-sm"><span className="truncate font-semibold">{category.category}</span><span className="shrink-0 text-smoke-500">{formatPrice(category.revenue)}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-smoke-100"><div className={`h-full rounded-full ${index === 0 ? "bg-emerald-500" : "bg-emerald-300"}`} style={{ width: `${(category.revenue / maxCategory) * 100}%` }} /></div>
          </div>)}</div>}
        </div>

        <ProductRankCard title="Лучше всего продаются" subtitle="Лидеры по проданному объёму" products={topProducts} max={maxProduct} quantityLabel={quantityLabel} />
        <ProductRankCard title="Стоит продвигать" subtitle="Товары с наименьшим объёмом продаж" products={slowProducts} max={maxProduct} quantityLabel={quantityLabel} />
      </section>
    </div>
  );
}

function ProductRankCard({
  title,
  subtitle,
  products,
  max,
  quantityLabel
}: {
  title: string;
  subtitle: string;
  products: ProductMetric[];
  max: number;
  quantityLabel: (product: ProductMetric) => string;
}) {
  return (
    <div className="analytics-card">
      <h2 className="font-display text-lg font-extrabold">{title}</h2><p className="mb-5 text-sm text-smoke-500">{subtitle}</p>
      {products.length === 0 ? <p className="py-8 text-center text-sm text-smoke-500">Данные появятся после продаж</p> : <div className="flex flex-col gap-4">{products.slice(0, 6).map((product, index) => <div key={product.productId}>
        <div className="mb-1 flex justify-between gap-2 text-sm"><span className="truncate font-semibold">{index + 1}. {product.name}</span><span className="shrink-0 text-smoke-500">{quantityLabel(product)}</span></div>
        <div className="h-2 overflow-hidden rounded-full bg-smoke-100"><div className={`h-full rounded-full ${title === "Стоит продвигать" ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${Math.max(product.quantity ? 4 : 0, (product.quantity / max) * 100)}%` }} /></div>
        <p className="mt-1 text-right text-xs text-smoke-400">Выручка {formatPrice(product.revenue)}</p>
      </div>)}</div>}
    </div>
  );
}
