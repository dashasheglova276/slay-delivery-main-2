"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/context/cart-store";

const tabs = [
  { href: "/", label: "Главная", icon: "home", match: ["/"] },
  { href: "/catalog", label: "Каталог", icon: "grid", match: ["/catalog", "/category"] },
  { href: "/recipes", label: "Рецепты", icon: "chef", match: ["/recipes"] },
  { href: "/cart", label: "Корзина", icon: "cart", match: ["/cart", "/checkout"] },
  { href: "/profile", label: "Профиль", icon: "user", match: ["/profile", "/favorites"] },
] as const;

const iconPaths = {
  home: "M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  grid: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z",
  chef: "M7 15a4 4 0 1 1 1.5-7.7A4 4 0 0 1 15.5 7.3 4 4 0 1 1 17 15v5H7z M7 18h10",
  cart: "M3 4h2l2.5 11H18L20 7H6.5 M9 20.5h.01 M17 20.5h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 21c0-4 3.5-6 8-6s8 2 8 6",
} as const;

type NavIconName = keyof typeof iconPaths;

function NavIcon({ name, filled }: { name: NavIconName; filled: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();
  const count = useCartStore((state) => state.lines.length);

  return (
    <nav className="tabbar" aria-label="Навигация">
      {tabs.map(({ href, label, icon, match }) => {
        const active = pathname === href || match.some((path) => path !== "/" && pathname.startsWith(path));

        return (
          <Link key={href} href={href} className={`tab${active ? " active" : ""}`}>
            <span className="tab-icon">
              <NavIcon name={icon} filled={active && href !== "/cart"} />
              {href === "/cart" && count > 0 && <span className="badge">{count}</span>}
            </span>
            <span className="tab-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
