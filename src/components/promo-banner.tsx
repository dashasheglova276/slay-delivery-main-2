import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Премиальный чёрно-градиентный промо-баннер — сигнатурный элемент дизайна
 * "редизайн версия" (чёрный градиентный фон, мягкие зелёные подсветки по
 * краям, крупный жирный заголовок, яркая CTA-кнопка). Используется как база
 * для акций, регистрации, промокодов, рекомендаций и важных уведомлений —
 * не только на главной странице.
 */
export default function PromoBanner({
  title = "Создайте аккаунт — получите скидку 15%",
  subtitle = "На первый заказ. Промокод придёт сразу после регистрации",
  cta = "Зарегистрироваться",
  href = "/register",
  badge = "Только для новых клиентов",
  tone = "ink",
  className
}: {
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  badge?: string;
  /** "ink" — чёрный градиент (по умолчанию), "lime" — фирменный зелёный градиент для акций. */
  tone?: "ink" | "lime";
  className?: string;
}) {
  const isLime = tone === "lime";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl3 px-6 py-7 shadow-lift sm:px-8 sm:py-9",
        isLime
          ? "bg-gradient-to-br from-lime-500 via-lime-500 to-lime-600 text-ink"
          : "bg-gradient-to-br from-ink via-smoke-900 to-ink text-white",
        className
      )}
    >
      {/* мягкие зелёные подсветки по краям — сигнатурная деталь стиля */}
      <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-lime-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-lime-500/15 blur-3xl" />

      {badge && (
        <span
          className={cn(
            "relative mb-2.5 inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md",
            isLime ? "bg-black/10 text-ink" : "bg-white/15 text-white"
          )}
        >
          <Zap size={11} />
          {badge}
        </span>
      )}

      <h2 className="relative max-w-md font-display text-2xl font-extrabold leading-tight sm:text-3xl">{title}</h2>
      <p className="relative mt-1.5 max-w-md text-sm opacity-90 sm:text-base">{subtitle}</p>

      <Link
        href={href}
        className={cn(
          "relative mt-4 inline-flex w-fit items-center rounded-full px-5 py-2.5 text-sm font-bold shadow-soft transition-transform active:scale-95",
          isLime ? "bg-ink text-white" : "bg-lime-500 text-ink"
        )}
      >
        {cta}
      </Link>
    </div>
  );
}
