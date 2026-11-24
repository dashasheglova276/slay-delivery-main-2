"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, Star } from "lucide-react";
import OrderChatDialog from "@/components/order-chat-dialog";

type Courier = { name: string; phone: string };

export default function OrderCourierContact({ orderId, status }: { orderId: string; status: string }) {
  const [courier, setCourier] = useState<Courier | null>(null);
  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const loadCourier = useCallback(async () => {
    const response = await fetch(`/api/me/orders/${orderId}/messages`, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      setCourier(data.courier ?? null);
    }
  }, [orderId]);

  useEffect(() => {
    void loadCourier();
    const timer = window.setInterval(() => void loadCourier(), 8000);
    return () => window.clearInterval(timer);
  }, [loadCourier]);

  async function review() {
    setError("");
    const response = await fetch(`/api/me/orders/${orderId}/feedback`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, tip })
    });
    if (response.ok) setDone(true);
    else { const data = await response.json(); setError(data.error || "Не удалось отправить отзыв"); }
  }

  return <section className="order-courier-glass">
    <h2>Курьер</h2>
    {courier ? <>
      <div className="order-courier-person"><span>{courier.name.trim().split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span><div><b>{courier.name}</b><a href={`tel:${courier.phone}`}><Phone size={16}/>{courier.phone}</a></div></div>
      <OrderChatDialog orderId={orderId} audience="customer"/>
    </> : <p className="order-courier-wait">Курьер появится здесь после назначения заказа.</p>}
    {status === "delivered" && !done && <div className="order-courier-review"><h3>Оцените доставку</h3><div className="order-rating-stars">{[1,2,3,4,5].map((value) => <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} из 5`}><Star size={29} fill={value <= rating ? "currentColor" : "none"}/></button>)}</div><label>Чаевые курьеру <span><input type="number" min="0" max="50000" step="50" value={tip} onChange={(event) => setTip(Math.max(0, Number(event.target.value)))}/> ₽</span></label><button type="button" className="order-review-submit" onClick={review}>Отправить отзыв</button></div>}
    {done && <p className="order-courier-thanks">Спасибо за отзыв!</p>}{error && <p className="order-courier-error">{error}</p>}
  </section>;
}
