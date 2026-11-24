import { ClipboardList, Wallet, TrendingUp } from "lucide-react";
import AnalyticsCharts from "@/components/admin/analytics-charts";
import StatCard from "@/components/admin/stat-card";
import { getAllOrders, getAnalytics } from "@/lib/data-service";
import { formatPrice } from "@/lib/utils";
import OrderProfitability from "@/components/admin/order-profitability";
import DeliveryPricingSettings from "@/components/admin/delivery-pricing-settings";

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const [orders, analytics] = await Promise.all([getAllOrders(), getAnalytics()]);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="mb-1 text-sm font-bold uppercase tracking-wide text-lime-700">Отчёты магазина</p>
        <h1 className="font-display text-2xl font-bold">Статистика продаж</h1>
        <p className="mt-1 text-sm text-smoke-500">Выручка, спрос по районам и товары, которые стоит продвигать.</p>
      </header>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Показатели за сегодня">
        <StatCard label="Заказов сегодня" value={String(analytics.ordersToday)} icon={ClipboardList} accent="lime" />
        <StatCard label="Выручка сегодня" value={formatPrice(analytics.revenueToday)} icon={Wallet} accent="flash" />
        <StatCard label="Средний чек сегодня" value={formatPrice(analytics.avgOrderValue)} icon={TrendingUp} accent="ink" />
      </section>

      <AnalyticsCharts
        orders={orders}
        salesByCategory={analytics.salesByCategory}
        topProducts={analytics.topProducts}
        slowProducts={analytics.slowProducts}
      />
      <OrderProfitability orders={orders} />
      <DeliveryPricingSettings />
    </div>
  );
}
