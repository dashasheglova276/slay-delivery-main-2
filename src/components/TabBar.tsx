import { NavLink } from "react-router-dom";
import Icon, { IconName } from "./Icon";
import { useStore } from "../store";

const tabs: { to: string; label: string; icon: IconName }[] = [
  { to: "/", label: "Главная", icon: "home" },
  { to: "/catalog", label: "Каталог", icon: "grid" },
  { to: "/recipes", label: "Рецепты", icon: "chef" },
  { to: "/cart", label: "Корзина", icon: "cart" },
  { to: "/profile", label: "Профиль", icon: "user" },
];

export default function TabBar() {
  const { cartCount } = useStore();
  return (
    <nav className="tabbar" aria-label="Навигация">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          end={t.to === "/"}
          className={({ isActive }) => "tab" + (isActive ? " active" : "")}
        >
          {({ isActive }) => (
            <>
              <span className="tab-icon">
                <Icon name={t.icon} size={24} filled={isActive && t.icon !== "cart"} />
                {t.to === "/cart" && cartCount > 0 && <span className="badge">{cartCount}</span>}
              </span>
              <span className="tab-label">{t.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
