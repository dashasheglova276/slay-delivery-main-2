"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

/**
 * Минималистичная кнопка "Назад" — используется на страницах товара, каталога,
 * категории, рецепта, профиля и в админке. По умолчанию идёт по истории
 * браузера (router.back()); если истории нет (например, страница открыта по
 * прямой ссылке), переходит на fallbackHref.
 */
export default function BackButton({
  fallbackHref = "/",
  label = "Назад",
  className
}: {
  fallbackHref?: string;
  label?: string;
  className?: string;
}) {
  const router = useRouter();

  function handleClick() {
    // history.length почти всегда > 1 (в него попадает вся история вкладки,
    // а не только переходы внутри сайта), поэтому раньше эта проверка почти
    // всегда уводила в router.back() — включая случаи, когда предыдущая
    // запись истории вела на страницу с серверным редиректом обратно на
    // текущую (кнопка "зависала", бесконечно возвращая на то же место).
    // document.referrer надёжнее: смотрим, что реально открывалось до этого.
    const referrer = typeof document !== "undefined" ? document.referrer : "";
    const sameOrigin = referrer && typeof window !== "undefined" && referrer.startsWith(window.location.origin);
    const referrerIsCurrentPage =
      sameOrigin && typeof window !== "undefined" && referrer === window.location.href;

    if (sameOrigin && !referrerIsCurrentPage && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      className={`back ${className ?? ""}`}
    >
      <ChevronLeft size={15} />
      {label}
    </button>
  );
}
