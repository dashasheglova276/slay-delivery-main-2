"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  User,
  Package,
  Gift,
  Ticket,
  Settings,
  ChevronRight,
  RotateCcw,
  Bell,
  MapPin,
  UserPlus,
  LogIn,
  Plus,
  Trash2,
  Star,
  Pencil,
  Check,
  Heart,
  CreditCard,
  LogOut,
  Camera
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/context/cart-store";
import { useToastStore } from "@/context/toast-store";
import type { AdminOrder } from "@/types";
import { CANCELLABLE_STATUSES } from "@/types";
import StatusBadge from "@/components/status-badge";
import { formatPrice, normalizeLegacyOrderAmount, cn } from "@/lib/utils";

type Tab = "orders" | "bonuses" | "promocodes" | "addresses" | "settings";
type SettingsView = "menu" | "personal" | "notifications";

interface CurrentUser {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
  role: string;
}

interface AddressDto {
  id: string;
  label: string;
  address: string;
  entrance: string | null;
  floor: string | null;
  apartment: string | null;
  comment: string | null;
  isDefault: boolean;
}

const tabs: { id: Tab; label: string; icon: typeof Package }[] = [
  { id: "orders", label: "Заказы", icon: Package },
  { id: "bonuses", label: "Бонусы", icon: Gift },
  { id: "promocodes", label: "Промокоды", icon: Ticket },
  { id: "addresses", label: "Адреса", icon: MapPin },
  { id: "settings", label: "Настройки", icon: Settings }
];

export default function ProfilePage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      showToast("Фото должно быть не больше 3 МБ", "error");
      return;
    }
    const formData = new FormData();
    formData.set("avatar", file);
    try {
      const response = await fetch("/api/me/avatar", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Не удалось загрузить фото");
      setUser((current) => current ? { ...current, avatarUrl: data.avatarUrl } : current);
      showToast("Фото профиля обновлено", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Не удалось загрузить фото", "error");
    }
  }

  async function logout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("logout failed");
      setUser(null);
      router.replace("/");
    } catch {
      showToast("Не удалось выйти. Попробуйте ещё раз.", "error");
    }
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        setUser(data.user ?? null);
        setAuthChecked(true);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/me/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  async function repeat(order: AdminOrder) {
    const res = await fetch(`/api/products?ids=${order.items.map((i) => i.productId).join(",")}`);
    const data = await res.json();
    const products: Record<string, { id: string }> = Object.fromEntries(
      (data.products ?? []).map((p: { id: string }) => [p.id, p])
    );
    order.items.forEach((item) => {
      const product = products[item.productId];
      if (product) {
        const typedProduct = product as Parameters<typeof addItem>[0];
        addItem(typedProduct, normalizeLegacyOrderAmount(typedProduct, item.quantity));
      }
    });
  }

  async function cancelOrder(orderId: string) {
    if (!confirm("Отменить заказ? Действие нельзя будет вернуть.")) return;
    const res = await fetch(`/api/me/orders/${orderId}/cancel`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.error ?? "Не удалось отменить заказ", "error");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
    showToast("Заказ отменён", "success");
  }

  // Пока не знаем, авторизован ли пользователь — ничего не мигаем
  if (!authChecked) {
    return <div className="py-24 text-center text-sm text-smoke-400">Загрузка…</div>;
  }

  // Гость — вместо пустого профиля показываем экран с призывом войти/зарегистрироваться
  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col items-center justify-center px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-smoke-100">
          <User size={28} className="text-smoke-400" />
        </div>
        <h1 className="mt-4 font-display text-xl font-bold text-ink">Вы не авторизованы</h1>
        <p className="mt-1.5 text-sm text-smoke-500">
          Войдите или создайте аккаунт, чтобы увидеть заказы, бонусы и адреса доставки.
        </p>
        <div className="mt-6 flex w-full flex-col gap-2">
          <Link
            href="/register?from=/profile"
            className="flex items-center justify-center gap-2 rounded-full bg-lime-500 py-3 text-sm font-bold text-ink shadow-glowLime"
          >
            <UserPlus size={16} />
            Зарегистрироваться
          </Link>
          <Link
            href="/account/login?from=/profile"
            className="flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white"
          >
            <LogIn size={16} />
            Войти
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-shell">
      <div className="profile-hero">
        <div className="profile-avatar">
          {user.avatarUrl ? <Image src={user.avatarUrl} alt="Фото профиля" fill unoptimized sizes="76px" className="profile-avatar-image" /> : <User size={30} aria-hidden="true" />}
          <label className="profile-avatar-upload" htmlFor="profile-avatar-file" title="Изменить фото профиля">
            <Camera size={16} aria-hidden="true" />
            <input id="profile-avatar-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} aria-label="Загрузить фото профиля" />
          </label>
        </div>
        <div className="profile-identity">
          <span className="profile-eyebrow">Личный кабинет</span>
          <h1>{user.name || "Покупатель"}</h1>
          <p>{user.phone}</p>
        </div>
        <div className="profile-order-count"><span>Заказы</span><strong>{orders.length}</strong></div>
      </div>

      <div className="profile-tabs" role="tablist" aria-label="Разделы профиля">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={tab === id ? "active" : ""}
            role="tab"
            aria-selected={tab === id}
          >
            <Icon size={22} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="profile-panel flex flex-col gap-3">
          {ordersLoading ? (
            <p className="py-8 text-center text-sm text-smoke-400">Загрузка…</p>
          ) : orders.length === 0 ? (
            <EmptyBlock text="У вас пока нет заказов" />
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="profile-order-card block rounded-xl2 border border-smoke-100 p-4 transition-colors active:bg-smoke-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{order.id}</span>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-xs text-smoke-400">
                  {new Date(order.createdAt).toLocaleString("ru-RU", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
                <p className="mt-2 line-clamp-1 text-sm text-smoke-600">
                  {order.items.map((i) => i.name).join(", ")}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="font-display text-base font-bold">{formatPrice(order.total)}</span>
                  <div className="flex items-center gap-2">
                    {CANCELLABLE_STATUSES.includes(order.status) && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          cancelOrder(order.id);
                        }}
                        className="min-h-12 flex items-center gap-2 rounded-full border border-flash-200 px-4 py-2.5 text-sm font-semibold text-flash-600"
                      >
                        Отменить
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        repeat(order);
                      }}
                      className="min-h-12 flex items-center gap-2 rounded-full bg-smoke-100 px-4 py-2.5 text-sm font-semibold"
                    >
                      <RotateCcw size={13} />
                      Повторить
                    </button>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {tab === "bonuses" && (
        <div className="profile-panel flex flex-col gap-4">
          <div className="rounded-xl2 bg-ink p-5 text-white">
            <p className="text-xs text-white/60">Программа лояльности</p>
            <p className="mt-1 font-display text-2xl font-extrabold text-lime-500">Скоро</p>
            <p className="mt-2 text-xs text-white/60">Здесь будет ваш бонусный баланс и условия начисления.</p>
          </div>
          <div className="rounded-xl2 border border-smoke-100 p-4 text-sm text-smoke-600">
            Начисление и списание бонусов появятся здесь после подключения программы лояльности.
          </div>
        </div>
      )}

      {tab === "addresses" && <div className="profile-panel"><AddressesView /></div>}

      {tab === "promocodes" && (
        <div className="profile-panel flex flex-col gap-3">
          {[
            { code: "SLAY10", desc: "Скидка 10% на любой заказ" },
            { code: "FIRST15", desc: "Скидка 15% на первый заказ" },
            { code: "LIME20", desc: "Скидка 20% при заказе от 2000 ₽" }
          ].map((p) => (
            <div key={p.code} className="flex items-center justify-between rounded-xl2 border border-smoke-100 p-4">
              <div><p className="font-display text-sm font-bold">{p.code}</p><p className="text-xs text-smoke-400">{p.desc}</p></div>
              <Link href="/cart" className="profile-action-link rounded-full bg-lime-500 px-4 py-3 text-sm font-bold text-ink">Применить</Link>
            </div>
          ))}
        </div>
      )}

      {tab === "settings" && <div className="profile-panel"><SettingsPanel user={user} onUserUpdated={(name) => setUser({ ...user, name })} onLogout={logout} /></div>}
    </div>
  );
}

function SettingsPanel({
  user,
  onUserUpdated,
  onLogout
}: {
  user: CurrentUser;
  onUserUpdated: (name: string) => void;
  onLogout: () => void;
}) {
  const [view, setView] = useState<SettingsView>("menu");
  const [showCardInfo, setShowCardInfo] = useState(false);

  if (view === "personal") return <PersonalDataView user={user} onBack={() => setView("menu")} onSaved={onUserUpdated} />;
  if (view === "notifications") return <NotificationsView onBack={() => setView("menu")} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col divide-y divide-smoke-100 rounded-xl2 border border-smoke-100">
        <Link
          href="/favorites"
          className="profile-setting-row flex items-center justify-between p-4 text-left text-sm"
        >
          <span className="flex items-center gap-3">
            <Heart className="text-smoke-400" />
            Понравившиеся товары
          </span>
          <ChevronRight size={16} className="text-smoke-300" />
        </Link>
        <SettingsRow icon={Bell} label="Уведомления" onClick={() => setView("notifications")} />
        <SettingsRow icon={User} label="Личные данные" onClick={() => setView("personal")} />
      </div>

      <section className="profile-payment-card">
        <div className="profile-payment-icon"><CreditCard size={20} /></div>
        <div className="min-w-0 flex-1">
          <h2>Банковская карта</h2>
          <p>Сохранённые карты появятся после подключения безопасной оплаты</p>
        </div>
        <button type="button" onClick={() => setShowCardInfo((value) => !value)}>
          {showCardInfo ? "Понятно" : "Привязать"}
        </button>
        {showCardInfo && <p className="profile-payment-note">Пока выберите способ оплаты при оформлении заказа. Данные карты на этом сайте не запрашиваются.</p>}
      </section>

      <button type="button" onClick={onLogout} className="profile-logout">
        <LogOut size={18} /> Выйти из аккаунта
      </button>

    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  danger,
  onClick
}: {
  icon: typeof MapPin;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={cn("profile-setting-row flex items-center justify-between p-4 text-left text-sm", danger && "text-flash-600")}>
      <span className="flex items-center gap-3">
        <Icon className={danger ? "text-flash-500" : "text-smoke-400"} />
        {label}
      </span>
      {!danger && <ChevronRight size={16} className="text-smoke-300" />}
    </button>
  );
}

function SettingsSubHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="mb-4 flex items-center gap-2 text-sm">
      <button onClick={onBack} className="font-semibold text-smoke-500 hover:text-ink">Настройки</button>
      <span className="text-smoke-300">/</span>
      <h2 className="font-bold text-ink">{title}</h2>
    </div>
  );
}

function PersonalDataView({
  user,
  onBack,
  onSaved
}: {
  user: CurrentUser;
  onBack: () => void;
  onSaved: (name: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setError("");
    if (name.trim().length < 2) {
      setError("Имя должно быть не короче 2 символов");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() })
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось сохранить");
      return;
    }
    onSaved(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div>
      <SettingsSubHeader title="Личные данные" onBack={onBack} />
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Имя</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl2 border border-smoke-200 px-4 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Телефон</span>
          <input
            value={user.phone}
            disabled
            className="rounded-xl2 border border-smoke-100 bg-smoke-50 px-4 py-3 text-sm text-smoke-400 outline-none"
          />
          <span className="text-[11px] text-smoke-400">Смена телефона временно недоступна</span>
        </label>
        {error && <p className="text-sm text-flash-600">{error}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="mt-1 flex items-center justify-center gap-2 rounded-full bg-lime-500 py-3 text-sm font-bold text-ink shadow-glowLime disabled:opacity-60"
        >
          {saved ? <Check size={16} /> : null}
          {saving ? "Сохраняем…" : saved ? "Сохранено" : "Сохранить"}
        </button>
      </div>
    </div>
  );
}

function AddressesView() {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AddressDto | null>(null);

  function reload() {
    fetch("/api/me/addresses")
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses ?? []);
        setLoading(false);
      });
  }

  useEffect(reload, []);

  async function remove(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/me/addresses/${id}`, { method: "DELETE" });
  }

  async function makeDefault(id: string) {
    await fetch(`/api/me/addresses/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDefault: true })
    });
    reload();
  }

  if (showForm || editing) {
    return (
      <AddressForm
        initial={editing ?? undefined}
        onCancel={() => {
          setShowForm(false);
          setEditing(null);
        }}
        onSaved={() => {
          setShowForm(false);
          setEditing(null);
          reload();
        }}
      />
    );
  }

  return (
    <div>
      <h2 className="mb-4 font-display text-lg font-bold text-ink">Адреса доставки</h2>
      {loading ? (
        <p className="py-8 text-center text-sm text-smoke-400">Загрузка…</p>
      ) : (
        <div className="flex flex-col gap-2">
          {addresses.length === 0 && (
            <p className="rounded-xl2 border border-dashed border-smoke-200 p-4 text-center text-sm text-smoke-500">
              Пока нет сохранённых адресов
            </p>
          )}
          {addresses.map((a) => (
            <div key={a.id} className="address-saved-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    {a.label}
                    {a.isDefault && <Star size={12} className="fill-lime-500 text-lime-500" />}
                  </p>
                  <p className="mt-0.5 text-xs text-smoke-500">{a.address}</p>
                  {(a.entrance || a.floor || a.apartment) && (
                    <p className="mt-0.5 text-[11px] text-smoke-400">
                      {[a.entrance && `подъезд ${a.entrance}`, a.floor && `этаж ${a.floor}`, a.apartment && `кв. ${a.apartment}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => setEditing(a)}
                    aria-label="Изменить"
                    className="profile-icon-action flex items-center justify-center rounded-full bg-smoke-100 text-smoke-600"
                  >
                    <Pencil size={19} />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    aria-label="Удалить"
                    className="profile-icon-action flex items-center justify-center rounded-full bg-smoke-100 text-flash-600"
                  >
                    <Trash2 size={19} />
                  </button>
                </div>
              </div>
              {!a.isDefault && (
                <button onClick={() => makeDefault(a.id)} className="profile-make-default mt-2 font-semibold text-lime-700">
                  Сделать основным
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setShowForm(true)}
        className="profile-add-address mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-smoke-300 font-semibold text-smoke-600 hover:border-lime-500 hover:text-lime-700"
      >
        <Plus size={19} />
        Добавить адрес
      </button>
    </div>
  );
}

function AddressForm({
  initial,
  onCancel,
  onSaved
}: {
  initial?: AddressDto;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "Дом");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [entrance, setEntrance] = useState(initial?.entrance ?? "");
  const [floor, setFloor] = useState(initial?.floor ?? "");
  const [apartment, setApartment] = useState(initial?.apartment ?? "");
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setError("");
    if (!address.trim()) {
      setError("Укажите адрес");
      return;
    }
    setSaving(true);
    const payload = { label, address, entrance, floor, apartment, comment };
    const res = initial
      ? await fetch(`/api/me/addresses/${initial.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      : await fetch("/api/me/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Не удалось сохранить адрес");
      return;
    }
    onSaved();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">{initial ? "Изменить адрес" : "Новый адрес"}</h2>
        <button type="button" onClick={onCancel} className="profile-action-link rounded-full bg-smoke-100 px-4 py-3 text-sm font-semibold text-smoke-600">Отмена</button>
      </div>
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Название</span>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Дом, Работа..."
            className="rounded-xl2 border border-smoke-200 px-4 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Адрес</span>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Улица, дом"
            className="rounded-xl2 border border-smoke-200 px-4 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
          />
        </label>
        <div className="grid grid-cols-3 gap-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-smoke-500">Подъезд</span>
            <input
              value={entrance}
              onChange={(e) => setEntrance(e.target.value)}
              className="rounded-xl2 border border-smoke-200 px-2.5 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-smoke-500">Этаж</span>
            <input
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              className="rounded-xl2 border border-smoke-200 px-2.5 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-smoke-500">Кв.</span>
            <input
              value={apartment}
              onChange={(e) => setApartment(e.target.value)}
              className="rounded-xl2 border border-smoke-200 px-2.5 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Комментарий курьеру</span>
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Домофон не работает, звонить..."
            className="rounded-xl2 border border-smoke-200 px-4 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
          />
        </label>
        {error && <p className="text-sm text-flash-600">{error}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="profile-save-button mt-1 rounded-full bg-lime-500 py-3 font-bold text-ink shadow-glowLime disabled:opacity-60"
        >
          {saving ? "Сохраняем…" : "Сохранить адрес"}
        </button>
      </div>
    </div>
  );
}

function NotificationsView({ onBack }: { onBack: () => void }) {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promos, setPromos] = useState(true);
  const [news, setNews] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("slay_notif_prefs") : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOrderUpdates(parsed.orderUpdates ?? true);
        setPromos(parsed.promos ?? true);
        setNews(parsed.news ?? false);
      } catch {}
    }
  }, []);

  function toggle(key: "orderUpdates" | "promos" | "news", value: boolean) {
    const next = { orderUpdates, promos, news, [key]: value };
    setOrderUpdates(next.orderUpdates);
    setPromos(next.promos);
    setNews(next.news);
    localStorage.setItem("slay_notif_prefs", JSON.stringify(next));
  }

  return (
    <div>
      <SettingsSubHeader title="Уведомления" onBack={onBack} />
      <div className="flex flex-col divide-y divide-smoke-100 rounded-xl2 border border-smoke-100">
        <NotifRow label="Статус заказа" desc="Когда курьер в пути и заказ доставлен" checked={orderUpdates} onChange={(v) => toggle("orderUpdates", v)} />
        <NotifRow label="Акции и промокоды" desc="Персональные скидки" checked={promos} onChange={(v) => toggle("promos", v)} />
        <NotifRow label="Новости StarFood" desc="Новые товары и разделы" checked={news} onChange={(v) => toggle("news", v)} />
      </div>
    </div>
  );
}

function NotifRow({
  label,
  desc,
  checked,
  onChange
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="profile-notification-row flex cursor-pointer items-center justify-between gap-3 p-4">
      <span>
        <span className="block text-sm font-medium text-ink">{label}</span>
        <span className="block text-xs text-smoke-400">{desc}</span>
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        className={cn("profile-switch relative shrink-0 rounded-full transition-colors", checked ? "bg-lime-500" : "bg-smoke-200")}
      >
        <span className={cn("profile-switch-knob absolute top-1 h-6 w-6 rounded-full bg-white shadow-soft transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
      </button>
    </label>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl2 border border-dashed border-smoke-200 py-12 text-center">
      <p className="text-sm text-smoke-500">{text}</p>
      <Link href="/catalog" className="mt-1 text-xs font-semibold text-lime-600">
        Перейти в каталог
      </Link>
    </div>
  );
}
