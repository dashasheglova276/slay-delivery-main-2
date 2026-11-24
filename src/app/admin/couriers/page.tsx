"use client";

import { useEffect, useState } from "react";
import { Plus, UserX, UserCheck, KeyRound } from "lucide-react";
import type { Courier } from "@/types";
import { cn } from "@/lib/utils";

export default function AdminCouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    const res = await fetch("/api/couriers?all=1", {
  credentials: "include"
});
    const data = await res.json();
    setCouriers(data.couriers ?? []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/couriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось добавить курьера");
        return;
      }
      setForm({ name: "", phone: "", password: "" });
      setShowCreate(false);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(courier: Courier) {
    setCouriers((prev) => prev.map((c) => (c.id === courier.id ? { ...c, isActive: !c.isActive } : c)));
    await fetch(`/api/couriers/${courier.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !courier.isActive })
    });
  }

  async function handleResetPassword(id: string) {
    if (resetPassword.length < 6) {
      setError("Пароль должен быть не короче 6 символов");
      return;
    }
    await fetch(`/api/couriers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: resetPassword })
    });
    setResetId(null);
    setResetPassword("");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">Курьеры</h1>
          <p className="text-sm text-smoke-500">{couriers.filter((c) => c.isActive).length} активных из {couriers.length}</p>
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2.5 text-sm font-bold text-ink shadow-glowLime"
        >
          <Plus size={16} />
          Добавить курьера
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-xl2 border border-smoke-100 bg-white p-4 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-smoke-500">Имя</span>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl2 border border-smoke-200 px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-smoke-500">Телефон</span>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+79991234567"
              className="rounded-xl2 border border-smoke-200 px-3 py-2.5 text-sm"
              required
            />
          </label>
          <label className="flex flex-1 flex-col gap-1.5">
            <span className="text-xs font-medium text-smoke-500">Пароль</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              minLength={6}
              className="rounded-xl2 border border-smoke-200 px-3 py-2.5 text-sm"
              required
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? "Сохраняем…" : "Создать"}
          </button>
        </form>
      )}
      {error && <p className="text-sm text-flash-600">{error}</p>}

      <div className="flex flex-col gap-3">
        {couriers.map((courier) => (
          <div key={courier.id} className="flex flex-wrap items-center gap-3 rounded-xl2 border border-smoke-100 bg-white p-4">
            <div className="min-w-[160px] flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                {courier.name}
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    courier.isActive ? "bg-lime-100 text-lime-700" : "bg-smoke-100 text-smoke-500"
                  )}
                >
                  {courier.isActive ? "Активен" : "Уволен"}
                </span>
              </p>
              <p className="text-xs text-smoke-400">{courier.phone}</p>
            </div>
            <div className="text-xs text-smoke-500">{courier.activeOrdersCount} заказов в работе</div>

            {resetId === courier.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Новый пароль"
                  className="w-36 rounded-xl2 border border-smoke-200 px-3 py-2 text-sm"
                />
                <button
                  onClick={() => handleResetPassword(courier.id)}
                  className="rounded-full bg-ink px-3 py-2 text-xs font-bold text-white"
                >
                  Сохранить
                </button>
                <button onClick={() => setResetId(null)} className="text-xs text-smoke-400">
                  Отмена
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setResetId(courier.id);
                  setResetPassword("");
                }}
                className="flex items-center gap-1.5 rounded-full bg-smoke-100 px-3 py-2 text-xs font-semibold text-smoke-600"
              >
                <KeyRound size={13} />
                Сменить пароль
              </button>
            )}

            <button
              onClick={() => toggleActive(courier)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold",
                courier.isActive ? "bg-flash-50 text-flash-600" : "bg-lime-100 text-lime-700"
              )}
            >
              {courier.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
              {courier.isActive ? "Уволить" : "Восстановить"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
