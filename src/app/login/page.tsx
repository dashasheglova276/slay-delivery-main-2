"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Phone } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

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

      const role = data.user.role as "ADMIN" | "COURIER" | "CUSTOMER";
      if (role === "CUSTOMER") {
        router.push("/profile");
        router.refresh();
        return;
      }
      const target = from && from.startsWith(role === "ADMIN" ? "/admin" : "/courier") ? from : role === "ADMIN" ? "/admin" : "/courier";
      router.push(target);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <div className="mb-6 text-center">
        <span className="font-display text-2xl font-extrabold text-ink">StarFood</span>
        <p className="mt-1 text-sm text-smoke-500">Вход для сотрудников</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Телефон</span>
          <div className="relative">
            <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+70000000001"
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
              placeholder="••••••••"
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
        Тестовый доступ после сидирования БД: admin — <code>+70000000001</code> / <code>admin123</code>;
        курьеры — их телефон из списка / <code>courier123</code>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
