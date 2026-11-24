import Link from "next/link";
import { Package, ClipboardList, Wallet, TrendingUp, Plus, FileSpreadsheet, ArrowUpRight, Users, BarChart3 } from "lucide-react";
import { getAllProducts, getAllOrders, getAnalytics } from "@/lib/data-service";
import StatCard from "@/components/admin/stat-card";
import StatusBadge from "@/components/status-badge";
import { formatPrice } from "@/lib/utils";

export const revalidate = 0;

export default async function AdminDashboardPage() {
  const [products, orders, analytics] = await Promise.all([getAllProducts(), getAllOrders(), getAnalytics()]);

  const totalSales = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const activeOrders = orders.filter((o) => o.status !== "delivered" && o.status !== "cancelled").length;
  const outOfStock = products.filter((p) => p.inStock === false).length;

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Дэшборд</h1>
        <p className="text-sm text-smoke-500">Обзор магазина StarFood доставка</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Товаров в каталоге" value={String(products.length)} icon={Package} accent="ink" />
        <StatCard label="Всего заказов" value={String(orders.length)} icon={ClipboardList} accent="lime" />
        <StatCard
          label="Продажи"
          value={formatPrice(totalSales)}
          icon={Wallet}
          accent="flash"
          trend={`${activeOrders} в работе`}
        />
        <StatCard label="Нет в наличии" value={String(outOfStock)} icon={TrendingUp} accent="ink" />
      </div>

      <div>
        <h2 className="mb-3 font-display text-sm font-bold text-smoke-600">Быстрые действия</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction href="/admin/products/create" icon={Plus} label="Добавить товар" />
          <QuickAction href="/admin/import" icon={FileSpreadsheet} label="Импортировать Excel" />
          <QuickAction href="/admin/orders" icon={ClipboardList} label="Все заказы" />
          <QuickAction href="/admin/couriers" icon={Users} label="Курьеры" />
          <QuickAction href="/admin/analytics" icon={BarChart3} label="Статистика продаж" />
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-display text-sm font-bold text-smoke-600">Сегодня</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard label="Заказов сегодня" value={String(analytics.ordersToday)} icon={ClipboardList} accent="lime" />
          <StatCard label="Выручка сегодня" value={formatPrice(analytics.revenueToday)} icon={Wallet} accent="flash" />
          <StatCard label="Средний чек" value={formatPrice(analytics.avgOrderValue)} icon={TrendingUp} accent="ink" />
        </div>
      </div>

      <div className="rounded-xl2 border border-smoke-100 bg-white">
        <div className="flex items-center justify-between border-b border-smoke-100 p-4">
          <h2 className="font-display text-sm font-bold">Последние заказы</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs font-semibold text-smoke-500">
            Все заказы <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="divide-y divide-smoke-100">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href="/admin/orders"
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-smoke-50"
            >
              <div className="min-w-0">
                <p className="font-semibold text-ink">{order.id}</p>
                <p className="truncate text-xs text-smoke-400">{order.customerName} · {order.address}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-semibold">{formatPrice(order.total)}</span>
                <StatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: typeof Plus; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl2 border border-smoke-100 bg-white p-4 text-sm font-semibold text-ink transition-colors hover:border-lime-500 hover:bg-lime-50"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
        <Icon size={16} />
      </div>
      {label}
    </Link>
  );
}
