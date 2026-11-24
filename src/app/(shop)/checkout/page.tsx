"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CreditCard, Wallet, QrCode, Clock, Zap, Check } from "lucide-react";
import { useCartStore, cartTotals } from "@/context/cart-store";
import OrderSummary from "@/components/order-summary";
import AuthGateModal from "@/components/auth-gate-modal";
import { cn, isValidPhone, formatPrice, formatWeight, formatCartAmount, getLineTotal } from "@/lib/utils";

// СБП физически хранится как тот же PaymentMethod.CARD в БД (раньше означал
// "картой курьеру") — переиспользуем существующее значение enum, меняем
// только подпись в интерфейсе. Менять Prisma schema ради отдельного "SBP"
// не потребовалось.
type PaymentMethod = "online" | "cash" | "card";
type DeliveryTime = "asap" | "scheduled";

export default function CheckoutPage() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscountPercent = useCartStore((s) => s.promoDiscountPercent);
  const clearCart = useCartStore((s) => s.clear);
  const totals = cartTotals(lines, promoDiscountPercent);
  const [fulfillment,setFulfillment]=useState<"delivery"|"pickup">("delivery");
  const [pickupLocation,setPickupLocation]=useState<{id:string;name:string;address:string}|null>(null);
  const checkoutTotals = fulfillment === "pickup" ? { ...totals, deliveryFee: 0, total: Math.max(totals.subtotal - totals.promoDiscount, 0) } : totals;

  // Задача 3: гость должен войти или зарегистрироваться перед оформлением заказа.
  // Бэкенд по-прежнему поддерживает гостевой POST /api/orders — это чисто
  // фронтенд-гейт на UX-уровне, backend не меняется.
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<
    { id: string; label: string; address: string; entrance: string | null; floor: string | null; apartment: string | null }[]
  >([]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    entrance: "",
    floor: "",
    apartment: "",
    comment: "",
    lat: null as number | null,
    lng: null as number | null
  });

  useEffect(() => {
    const mode=localStorage.getItem("starfood-delivery-mode")==="pickup"&&localStorage.getItem("starfood-pickup-location")?"pickup":"delivery";
    setFulfillment(mode);
    try{const raw=localStorage.getItem("starfood-pickup-location");if(raw)setPickupLocation(JSON.parse(raw));}catch{}
    if(mode==="delivery") localStorage.setItem("starfood-delivery-mode","delivery");
    const savedAddress = localStorage.getItem("starfood-delivery-address") || "";
    if (savedAddress) setForm((f) => ({ ...f, address: savedAddress }));
    const onAddress = (event: Event) => {
      const address = (event as CustomEvent<{ address: string }>).detail.address;
      setForm((f) => ({ ...f, address }));
    };
    const onPickup=(event:Event)=>{const location=(event as CustomEvent<{location:{id:string;name:string;address:string}}>).detail.location;setPickupLocation(location);setFulfillment("pickup");};
    window.addEventListener("starfood:address-selected", onAddress);
    window.addEventListener("starfood:pickup-selected",onPickup);
    return () => {window.removeEventListener("starfood:address-selected", onAddress);window.removeEventListener("starfood:pickup-selected",onPickup);};
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data.user || data.user.role !== "CUSTOMER") {
          setShowAuthGate(true);
        } else {
          setForm((f) => ({ ...f, name: f.name || data.user.name, phone: f.phone || data.user.phone }));
          fetch("/api/me/addresses")
            .then((r) => r.json())
            .then((d) => setSavedAddresses(d.addresses ?? []))
            .catch(() => {});
        }
        setAuthChecked(true);
      })
      .catch(() => setAuthChecked(true));
  }, []);

  const [payment, setPayment] = useState<PaymentMethod>("online");
  const [deliveryTime, setDeliveryTime] = useState<DeliveryTime>("asap");
  const [scheduledAt, setScheduledAt] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Ошибки конкретных полей — показываем прямо под соответствующим инпутом,
  // а не только общим текстом внизу формы.
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  function update<K extends Exclude<keyof typeof form, "lat" | "lng">>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (fieldErrors[key as keyof typeof fieldErrors]) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (!form.name.trim()) next.name = "Укажите имя";
    if (!form.phone.trim()) next.phone = "Укажите телефон";
    else if (!isValidPhone(form.phone)) next.phone = "Проверьте номер телефона — похоже, в нём ошибка";
    if (fulfillment === "delivery" && !form.address.trim()) next.address = "Укажите адрес доставки";
    if (fulfillment === "pickup" && !pickupLocation) next.address = "Выберите точку самовывоза";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (lines.length === 0) return;
    if (!validate()) {
      setError("Проверьте поля, отмеченные красным");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const fullAddress = fulfillment === "pickup" ? pickupLocation!.address : [form.address, form.entrance && `подъезд ${form.entrance}`, form.floor && `этаж ${form.floor}`, form.apartment && `кв. ${form.apartment}`]
        .filter(Boolean)
        .join(", ");

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          total: totals.total,
          subtotal: totals.subtotal,
          deliveryFee: fulfillment === "pickup" ? 0 : totals.deliveryFee,
          discount: totals.productDiscount,
          promoCode: promoCode || undefined,
          address: fullAddress,
          fulfillmentType: fulfillment,
          pickupLocationId: fulfillment === "pickup" ? pickupLocation?.id : null,
          customerName: form.name,
          customerPhone: form.phone,
          comment: form.comment || undefined,
          paymentMethod: payment
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось оформить заказ. Попробуйте ещё раз.");
        return;
      }
      setOrderId(data.order.id);
      clearCart();
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-lime-500"
        >
          <Check className="h-8 w-8 text-ink" />
        </motion.div>
        <h1 className="font-display text-lg font-bold">Заказ принят</h1>
        <p className="text-sm text-smoke-500">
          Менеджер перезвонит вам для подтверждения заказа.
        </p>
        <span className="inline-flex items-center rounded-full bg-flash-50 px-3 py-1 text-xs font-bold text-flash-600">
          Ожидает подтверждения
        </span>
        <p className="text-sm text-smoke-500">
          Номер заказа <span className="font-semibold text-ink">{orderId}</span>.
        </p>
        <div className="mt-2 flex w-full flex-col gap-2">
          <button
            onClick={() => router.push(`/orders/${orderId}`)}
            className="rounded-full bg-ink py-3 text-sm font-bold text-white"
          >
            Посмотреть заказ
          </button>
          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-smoke-200 py-3 text-sm font-bold text-ink"
          >
            Вернуться в магазин
          </button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-smoke-500">
        Ваша корзина пуста. Добавьте товары, чтобы оформить заказ.
      </div>
    );
  }

  return (
    <>
      <AuthGateModal
        open={authChecked && showAuthGate}
        onContinueBrowsing={() => setShowAuthGate(false)}
        redirectTo="/checkout"
      />
      <form onSubmit={submit} className="checkout-shell mx-auto max-w-4xl px-4 py-4 md:px-6">
      <h1 className="mb-4 font-display text-xl font-bold">{fulfillment === "pickup" ? "Самовывоз" : "Оформление заказа"}</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-1 font-display text-sm font-bold">Контакты и адрес</legend>
            <Input label="Имя" value={form.name} onChange={(v) => update("name", v)} required error={fieldErrors.name} />
            <Input
              label="Телефон"
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              placeholder="+7 (___) ___-__-__"
              required
              error={fieldErrors.phone}
            />
            {fulfillment === "delivery" && savedAddresses.length > 0 && (
              <div className="-mb-1 flex flex-wrap gap-1.5">
                {savedAddresses.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        address: a.address,
                        entrance: a.entrance ?? "",
                        floor: a.floor ?? "",
                        apartment: a.apartment ?? ""
                      }))
                    }
                    className="rounded-full border border-smoke-200 px-3 py-1.5 text-xs font-semibold text-smoke-600 hover:border-lime-500 hover:text-lime-700"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
            {fulfillment === "delivery" ? <div className="checkout-address-display">
              <label className="mb-1 block text-xs font-bold text-smoke-500">Адрес доставки</label>
              <button type="button" className="checkout-address-current" onClick={() => window.dispatchEvent(new CustomEvent("starfood:open-address"))}>{form.address || "Выберите адрес доставки"}<span>⌄</span></button>
              <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("starfood:open-address"))} className="checkout-address-edit">Изменить адрес на карте</button>
            </div> : <div className="rounded-2xl border border-white bg-white/65 p-4 shadow-sm backdrop-blur-xl"><b>{pickupLocation?.name || "Точка самовывоза не выбрана"}</b><p className="mt-1 text-sm text-smoke-600">{pickupLocation?.address || "Выберите магазин на главной странице"}</p><button type="button" onClick={()=>window.dispatchEvent(new CustomEvent("starfood:open-pickup"))} className="mt-2 text-sm font-bold text-orange-600">Изменить магазин</button></div>}
            {fieldErrors.address && <p className="-mt-2 text-xs font-medium text-flash-600">{fieldErrors.address}</p>}
            {fulfillment === "delivery" && <div className="grid grid-cols-3 gap-2">
              <Input label="Подъезд" value={form.entrance} onChange={(v) => update("entrance", v)} />
              <Input label="Этаж" value={form.floor} onChange={(v) => update("floor", v)} />
              <Input label="Квартира" value={form.apartment} onChange={(v) => update("apartment", v)} />
            </div>}
            {fulfillment === "delivery" && <Input
              label="Комментарий курьеру"
              value={form.comment}
              onChange={(v) => update("comment", v)}
              placeholder="Например: домофон не работает, позвоните"
            />}
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-display text-sm font-bold">Способ оплаты</legend>
            <div className="grid grid-cols-3 gap-2">
              <PaymentOption
                icon={Wallet}
                label="Наличными при получении"
                active={payment === "cash"}
                onClick={() => setPayment("cash")}
              />
              <PaymentOption
                icon={QrCode}
                label="СБП при получении"
                active={payment === "card"}
                onClick={() => setPayment("card")}
              />
              <PaymentOption
                icon={CreditCard}
                label="Оплатить сразу"
                active={payment === "online"}
                onClick={() => setPayment("online")}
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 font-display text-sm font-bold">Время доставки</legend>
            <div className="grid grid-cols-2 gap-2">
              <PaymentOption
                icon={Zap}
                label="Как можно быстрее"
                active={deliveryTime === "asap"}
                onClick={() => setDeliveryTime("asap")}
              />
              <PaymentOption
                icon={Clock}
                label="К определённому времени"
                active={deliveryTime === "scheduled"}
                onClick={() => setDeliveryTime("scheduled")}
              />
            </div>
            {deliveryTime === "scheduled" && (
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-2 w-full rounded-xl2 bg-smoke-100 px-4 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
              />
            )}
          </fieldset>
        </div>

        <div className="flex flex-col gap-4">
          <section className="checkout-receipt">
            <div className="checkout-receipt-heading">
              <div><h2>Состав заказа</h2><p>Количество, цена и сумма по каждой позиции</p></div>
              <span aria-hidden="true">Чек</span>
            </div>
            <div className="checkout-receipt-lines">
              {lines.map(({ product, quantity }) => {
                const lineTotal = getLineTotal(product.price, quantity, product);
                const amount = product.saleType === "weight"
                  ? `${formatCartAmount(quantity, product)} × ${formatPrice(product.price)}/кг`
                  : `${quantity} шт × ${formatPrice(product.price)}/шт${product.weight > 0 ? ` · ${formatWeight(product.weight, product.unit)}` : ""}`;
                return (
                  <div className="checkout-receipt-line" key={product.id}>
                    <div className="checkout-receipt-product"><strong>{product.name}</strong><span>{amount}</span></div>
                    <b>{formatPrice(lineTotal)}</b>
                  </div>
                );
              })}
            </div>
          </section>
          <OrderSummary {...checkoutTotals} />

          <p className="text-center text-[11px] leading-relaxed text-smoke-400">
            Оформляя заказ, вы соглашаетесь с{" "}
            <Link href="/terms" target="_blank" className="underline">
              условиями сервиса
            </Link>
            ,{" "}
            <Link href="/privacy" target="_blank" className="underline">
              политикой обработки данных
            </Link>{" "}
            и{" "}
            <Link href="/offer" target="_blank" className="underline">
              публичной офертой
            </Link>
          </p>
        </div>
      </div>

      {/* На мобильном кнопка оформления закреплена снизу над BottomNav —
          тот же приём, что и для кнопки "В корзину" на странице товара,
          чтобы не нужно было скроллить форму до конца. На десктопе (md+)
          остаётся обычным блоком в потоке страницы. */}
      <div className="checkout-submit-dock">
        {error && <p className="text-center text-sm font-medium text-flash-600">{error}</p>}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting || totals.subtotal < totals.minimumOrderAmount}
          className="flex w-full items-center justify-center rounded-full bg-lime-500 py-4 text-sm font-bold text-ink shadow-glowLime disabled:opacity-60"
        >
          {submitting ? "Оформляем…" : totals.subtotal < totals.minimumOrderAmount ? `Минимальный заказ ${totals.minimumOrderAmount} ₽` : `Оформить заказ · ${checkoutTotals.total.toLocaleString("ru-RU")} ₽`}
        </motion.button>
      </div>
      </form>
    </>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  error
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-smoke-500">{label}</span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(
          "rounded-xl2 bg-smoke-100 px-4 py-3 text-sm outline-none ring-lime-500/60 focus:ring-2",
          error && "bg-flash-50 ring-2 ring-flash-400"
        )}
      />
      {error && <span className="text-xs font-medium text-flash-600">{error}</span>}
    </label>
  );
}

function PaymentOption({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-xl2 border p-2.5 text-center text-[10.5px] font-medium leading-tight transition-colors",
        active ? "border-lime-500 bg-lime-50 text-lime-700" : "border-smoke-200 text-smoke-600"
      )}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}
