import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "./Icon";

export interface Slide {
  id: string;
  badge: string;
  title: string;
  accent: string;
  text: string;
  cta: string;
  emoji: string;
  to: string;
  image?: string;
}

export default function PromoCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => window.clearInterval(t);
  }, [paused, slides.length]);

  return (
    <section
      className="promo"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="promo-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s) => (
          <div className={"promo-slide" + (s.image ? " has-image" : "")} key={s.id} role="link" tabIndex={0} onClick={() => nav(s.to)} onKeyDown={(e) => e.key === "Enter" && nav(s.to)} aria-label={`${s.badge}: ${s.title} ${s.accent}`}>
            {s.image && <img className="promo-image" src={s.image} alt="" />}
            <div className="promo-text">
              <span className="chip chip-white">
                <Icon name="bolt" size={13} filled /> {s.badge}
              </span>
              <h2>
                {s.title}
                <br />
                <em>{s.accent}</em>
              </h2>
              <p>{s.text}</p>
              <button className="btn-primary" onClick={() => nav(s.to)}>
                {s.cta} <Icon name="arrow-right" size={16} />
              </button>
            </div>
            <div className="promo-art" aria-hidden="true">
              {s.emoji}
            </div>
          </div>
        ))}
      </div>
      <div className="dots">
        {slides.map((s, i) => (
          <button
            key={s.id}
            className={"dot-i" + (i === index ? " on" : "")}
            onClick={() => setIndex(i)}
            aria-label={`Слайд ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
