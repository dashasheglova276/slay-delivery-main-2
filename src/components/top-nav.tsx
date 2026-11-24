"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/context/favorites-store";

export default function TopNav() {
  const favoritesCount = useFavoritesStore((s) => s.ids.length);

  return (
    <header className="header">
        <Link href="/" className="logo-btn" aria-label="StarFood — главная">
          <span className="logo" aria-hidden="true">
            <span className="logo-star">star</span><span className="logo-food">food</span>
            <svg className="logo-swoosh" viewBox="0 0 90 14" fill="none">
              <path d="M2 3c22 10 52 10 76 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="m82 1 2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="currentColor" />
            </svg>
          </span>
        </Link>

        <div className="header-actions">
        <Link
          href="/favorites"
          aria-label="Избранное"
          className="round-btn shrink-0 transition-colors"
        >
          <Heart size={20} />
          {favoritesCount > 0 && <span className="dot" />}
        </Link>
        </div>
    </header>
  );
}
