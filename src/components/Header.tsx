import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import { useStore } from "../store";

export function Logo() {
  return (
    <div className="logo" aria-label="starfood">
      <span className="logo-star">star</span>
      <span className="logo-food">food</span>
      <svg className="logo-swoosh" viewBox="0 0 90 14" aria-hidden="true">
        <path d="M2 3c22 10 52 10 76 0" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <path d="M82 1l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function Header() {
  const nav = useNavigate();
  const { favorites } = useStore();
  return (
    <header className="header">
      <button className="logo-btn" onClick={() => nav("/")} aria-label="На главную">
        <Logo />
      </button>
      <span className="pill-fast">
        <Icon name="bolt" size={14} filled /> 15 мин
      </span>
      <div className="header-actions">
        <button className="round-btn" onClick={() => nav("/catalog")} aria-label="Поиск">
          <Icon name="search" size={20} />
        </button>
        <button className="round-btn" onClick={() => nav("/recipes")} aria-label="Избранное">
          <Icon name="heart" size={20} />
          {favorites.length > 0 && <span className="dot" />}
        </button>
      </div>
    </header>
  );
}
