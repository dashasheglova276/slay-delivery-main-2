"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

const slides = [
  { id: "p1", badge: "STARFOOD", title: "Свежие продукты", accent: "на каждый день", text: "Овощи, фрукты и всё нужное\nдля вашего стола", cta: "В каталог", emoji: "🥬", to: "/catalog" },
  { id: "p2", badge: "КОЛЛЕКЦИЯ", title: "Время завтрака", accent: "что-то вкусное", text: "Выпечка, молоко и любимые\nпродукты к утру", cta: "Выбрать", emoji: "🥐", to: "/catalog" },
  { id: "p3", badge: "СЕЗОННОЕ", title: "Яркие фрукты", accent: "и ягоды", text: "Сочные вкусы для хорошего\nнастроения", cta: "Смотреть", emoji: "🍓", to: "/catalog" },
  { id: "p4", badge: "ГОТОВОЕ МЕНЮ", title: "Ужин без хлопот", accent: "уже готов", text: "Любимые блюда — просто\nдобавьте в корзину", cta: "Выбрать еду", emoji: "🍣", to: "/catalog" },
  { id: "p5", badge: "STARFOOD ДЛЯ ПИТОМЦЕВ", title: "Забота о любимцах", accent: "каждый день", text: "Всё для пушистых друзей\nв одном месте", cta: "Посмотреть", emoji: "🐶", to: "/catalog" }
];

export default function StorefrontHero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % slides.length), 4500);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="promo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)}>
      <div className="promo-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((slide) => (
          <div key={slide.id} className="promo-slide" role="link" tabIndex={0} onClick={() => router.push(slide.to)} onKeyDown={(event) => event.key === "Enter" && router.push(slide.to)} aria-label={`${slide.badge}: ${slide.title} ${slide.accent}`}>
            <div className="promo-text">
              <span className="chip chip-white"><Zap size={13} fill="currentColor" /> {slide.badge}</span>
              <h2>{slide.title}<br /><em>{slide.accent}</em></h2>
              <p>{slide.text}</p>
            </div>
            <div className="promo-art" aria-hidden="true">{slide.emoji}</div>
          </div>
        ))}
      </div>
      <div className="dots">
        {slides.map((slide, i) => <button key={slide.id} className={`dot-i${i === index ? " on" : ""}`} onClick={() => setIndex(i)} aria-label={`Слайд ${i + 1}`} />)}
      </div>
    </section>
  );
}
