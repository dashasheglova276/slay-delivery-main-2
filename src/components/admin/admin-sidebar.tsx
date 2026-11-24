"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileSpreadsheet,
  ClipboardList,
  Store,
  Users,
  Menu,
  X,
  Tags,
  ChefHat,
  LayoutGrid,
  BarChart3
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Дэшборд", icon: LayoutDashboard, exact: true },
  { href: "/admin/analytics", label: "Статистика", icon: BarChart3 },
  { href: "/admin/products", label: "Товары", icon: Package },
  { href: "/admin/categories", label: "Категории", icon: Tags },
  { href: "/admin/collections", label: "Подборки", icon: LayoutGrid },
  { href: "/admin/recipes", label: "Рецепты", icon: ChefHat },
  { href: "/admin/import", label: "Импорт", icon: FileSpreadsheet },
  { href: "/admin/orders", label: "Заказы", icon: ClipboardList },
  { href: "/admin/couriers", label: "Курьеры", icon: Users },
  { href: "/admin/pickup-locations", label: "Самовывоз", icon: Store }
];

export default function AdminSidebar({ adminName }: { adminName?: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const content = (
    <>
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="font-display text-lg font-extrabold text-white">StarFood</span>
        <span className="rounded-full bg-lime-500 px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
          Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium transition-colors",
              isActive(href, exact) ? "bg-lime-500 text-ink" : "text-smoke-300 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        {adminName && <p className="px-3 pb-2 text-xs text-smoke-400">{adminName}</p>}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium text-smoke-300 hover:bg-white/5 hover:text-white"
        >
          <Store size={18} />
          Открыть магазин
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile topbar toggle */}
      <div className="flex items-center justify-between border-b border-white/10 bg-ink px-4 py-3 md:hidden">
        <span className="font-display text-base font-extrabold text-white">StarFood Admin</span>
        <button onClick={() => setMobileOpen(true)} aria-label="Открыть меню" className="text-white">
          <Menu size={22} />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex w-72 flex-col bg-ink">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Закрыть меню"
              className="absolute right-3 top-4 text-white"
            >
              <X size={20} />
            </button>
            {content}
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <aside className="hidden w-64 shrink-0 flex-col bg-ink md:flex">{content}</aside>
    </>
  );
}
