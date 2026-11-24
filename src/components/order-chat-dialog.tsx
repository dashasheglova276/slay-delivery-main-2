"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, Send, X } from "lucide-react";

type ChatMessage = { id: string; senderId: string; senderName?: string; senderRole?: string; body: string; createdAt: string };

function readKey(orderId: string, audience: string) {
  return `starfood-chat-read:${audience}:${orderId}`;
}

function readStored(orderId: string, audience: string) {
  if (typeof window === "undefined") return 0;
  return Number(localStorage.getItem(readKey(orderId, audience)) || 0);
}

function isIncoming(message: ChatMessage, audience: "customer" | "courier") {
  return audience === "courier" ? message.senderRole === "CUSTOMER" : message.senderRole === "COURIER";
}

export default function OrderChatDialog({ orderId, audience, className = "" }: { orderId: string; audience: "customer" | "courier"; className?: string }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [lastReadAt, setLastReadAt] = useState(() => readStored(orderId, audience));
  const lastReadAtRef = useRef(lastReadAt);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const stored = readStored(orderId, audience);
    lastReadAtRef.current = stored;
    setLastReadAt(stored);
  }, [orderId, audience]);

  const markRead = useCallback((list: ChatMessage[]) => {
    const latestIncoming = list.reduce((latest, message) => {
      if (!isIncoming(message, audience)) return latest;
      return Math.max(latest, new Date(message.createdAt).getTime());
    }, 0);
    const next = Math.max(Date.now(), latestIncoming, lastReadAtRef.current);
    if (next === lastReadAtRef.current) return;
    lastReadAtRef.current = next;
    localStorage.setItem(readKey(orderId, audience), String(next));
    setLastReadAt(next);
  }, [audience, orderId]);

  const load = useCallback(async () => {
    const response = await fetch(`/api/me/orders/${orderId}/messages`, { cache: "no-store" });
    if (!response.ok) {
      if (open) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || "Не удалось загрузить переписку");
      }
      return;
    }
    const data = await response.json();
    const nextMessages: ChatMessage[] = data.messages ?? [];
    setMessages(nextMessages);
    setError("");
    if (open) markRead(nextMessages);
  }, [orderId, open, markRead]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), open ? 2500 : 8000);
    return () => window.clearInterval(timer);
  }, [open, load]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/me/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Не удалось отправить сообщение");
      setText("");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  }

  function openChat() {
    setOpen(true);
    markRead(messages);
  }

  const triggerLabel = audience === "courier" ? "Сообщения клиента" : "Написать курьеру";
  const unreadCount = messages.filter((message) => isIncoming(message, audience) && new Date(message.createdAt).getTime() > lastReadAt).length;

  const windowUi = open && mounted ? createPortal(
    <div className="order-chat-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="order-chat-window" role="dialog" aria-modal="true" aria-labelledby={`chat-title-${orderId}`}>
        <header>
          <div>
            <span>ЗАКАЗ {orderId}</span>
            <h2 id={`chat-title-${orderId}`}>{audience === "courier" ? "Сообщения клиента" : "Чат с курьером"}</h2>
          </div>
          <button type="button" aria-label="Закрыть чат" onClick={() => setOpen(false)}><X size={22} /></button>
        </header>
        <div className="order-chat-messages" aria-live="polite">
          {messages.length ? messages.map((message) => {
            const own = audience === "courier" ? message.senderRole === "COURIER" : message.senderRole === "CUSTOMER";
            return (
              <article key={message.id} className={`order-chat-message ${own ? "is-own" : ""}`}>
                <small>{own ? "Вы" : message.senderRole === "COURIER" ? "Курьер" : "Клиент"} · {new Date(message.createdAt).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</small>
                <p>{message.body}</p>
              </article>
            );
          }) : <p className="order-chat-empty">Сообщений пока нет. Напишите первым.</p>}
        </div>
        {error && <p className="order-chat-error">{error}</p>}
        <form className="order-chat-compose" onSubmit={(event) => { event.preventDefault(); void send(); }}>
          <input value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} placeholder="Напишите сообщение…" aria-label="Сообщение" />
          <button type="submit" disabled={!text.trim() || sending} aria-label="Отправить сообщение"><Send size={19} /></button>
        </form>
      </section>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button type="button" onClick={openChat} className={className || "order-chat-trigger"}>
        <MessageCircle size={18} />
        <span>{triggerLabel}</span>
        {unreadCount > 0 && <b>{unreadCount}</b>}
      </button>
      {windowUi}
    </>
  );
}
