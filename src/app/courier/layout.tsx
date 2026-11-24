import Link from "next/link";
import { redirect } from "next/navigation";
import { Store } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import CourierLogoutButton from "@/components/courier/courier-logout-button";

export default async function CourierLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?from=/courier");
  if (user.role !== "COURIER") redirect("/login");

  return (
    <div className="min-h-screen bg-smoke-50">
      <header className="sticky top-0 z-30 border-b border-smoke-100 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-extrabold text-ink">StarFood</span>
            <span className="rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              Курьер
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-semibold text-ink">{user.name}</p>
              <p className="text-[11px] text-smoke-400">{user.phone}</p>
            </div>
            <CourierLogoutButton />
            <Link
              href="/"
              aria-label="Открыть магазин"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-smoke-100 text-smoke-600"
            >
              <Store size={16} />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-5">{children}</main>
    </div>
  );
}
