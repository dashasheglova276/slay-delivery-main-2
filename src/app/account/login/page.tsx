"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Phone } from "lucide-react";

function CustomerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/profile";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось войти");
        return;
      }
      router.push(from);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="mb-6 text-center">
        <span className="font-display text-2xl font-extrabold text-ink">StarFood</span>
        <p className="mt-1 text-sm text-smoke-500">Вход в личный кабинет</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Телефон</span>
          <div className="relative">
            <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+79991234567"
              className="w-full rounded-xl2 border border-smoke-200 py-3 pl-10 pr-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
              required
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Пароль</span>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl2 border border-smoke-200 py-3 pl-10 pr-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
              required
            />
          </div>
        </label>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-lime-500 py-3 text-sm font-bold text-ink shadow-glowLime disabled:opacity-50"
        >
          {loading ? "Входим…" : "Войти"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-smoke-400">
        Нет аккаунта?{" "}
        <Link href={`/register?from=${encodeURIComponent(from)}`} className="font-semibold text-ink">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={null}>
      <CustomerLoginForm />
    </Suspense>
  );
}
