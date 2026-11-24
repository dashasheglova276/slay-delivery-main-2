import Link from "next/link";
import { ShieldCheck, MapPin, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-smoke-100 bg-cream-100 px-4 py-8 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <TrustItem icon={MapPin} title="Доставка для вас" text="Укажите удобный адрес получения" />
          <TrustItem icon={Truck} title="Свежие продукты" text="Из ближайшего дарксторка у вас" />
          <TrustItem icon={ShieldCheck} title="Безопасная оплата" text="Картой онлайн или курьеру" />
        </div>

        <div className="flex flex-col gap-3 border-t border-smoke-200 pt-5 text-xs text-smoke-400 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} StarFood Доставка. Все права защищены.</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-ink">
              Пользовательское соглашение
            </Link>
            <Link href="/privacy" className="hover:text-ink">
              Политика конфиденциальности
            </Link>
            <Link href="/offer" className="hover:text-ink">
              Публичная оферта
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function TrustItem({
  icon: Icon,
  title,
  text
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl2 bg-white p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-100 text-lime-700">
        <Icon size={17} />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="text-xs text-smoke-500">{text}</p>
      </div>
    </div>
  );
}
