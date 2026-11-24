"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Слайд 1 — Голубая плашка (glassmorphism, кубики, градиент #dff8f8)  */
/* ------------------------------------------------------------------ */
function BlueSlide() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl3" style={{ background: "#dff8f8" }}>
      {/* Анимированные кубики */}
      {[
        { w: 110, h: 110, left: "8%", top: "15%", delay: "0s", dur: "5s", tx: -45, ty: 10, r: 120 },
        { w: 150, h: 150, right: "8%", top: "10%", delay: "-2s", dur: "6s", tx: -55, ty: 45, r: 160 },
        { w: 120, h: 120, left: "38%", bottom: "8%", delay: "-3s", dur: "5.5s", tx: 140, ty: -135, r: 140 },
        { w: 80, h: 80, right: "20%", bottom: "12%", delay: "-1s", dur: "4.5s", tx: -135, ty: -45, r: 180 }
      ].map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: c.w,
            height: c.h,
            left: (c as any).left,
            right: (c as any).right,
            top: (c as any).top,
            bottom: (c as any).bottom,
            background: "linear-gradient(135deg,rgba(66,232,255,.55),rgba(95,255,215,.22))",
            border: "1px solid rgba(0,180,255,.45)",
            boxShadow: "0 0 45px rgba(0,210,255,.45)",
            backdropFilter: "blur(1px)",
            animation: `slayFloat${i + 1} ${c.dur} ${c.delay} infinite ease-in-out`
          }}
        />
      ))}

      {/* Glass overlay */}
      <div
        className="absolute inset-0 rounded-xl3"
        style={{
          background: "rgba(255,255,255,.16)",
          border: "1px solid rgba(255,255,255,.65)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 30px 80px rgba(0,0,0,.08),inset 0 1px 0 rgba(255,255,255,.8)"
        }}
      >
        {/* Shine */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "linear-gradient(115deg,rgba(255,255,255,.45),transparent 55%)" }}
        />

        {/* Content */}
        <div className="relative flex h-full flex-col justify-center pl-8 sm:pl-14">
          <span
            className="mb-3 w-max rounded-full px-3 py-2 text-[11px] font-bold sm:text-xs"
            style={{ background: "rgba(255,255,255,.45)", border: "1px solid rgba(255,255,255,.55)", color: "#067d86" }}
          >
            ⚡ 15 МИНУТ
          </span>
          <h2
            className="font-display text-xl font-extrabold leading-tight sm:text-3xl md:text-4xl"
            style={{ color: "#17353d", letterSpacing: "-1px" }}
          >
            Первый заказ —{" "}
            <span
              style={{
                background: "linear-gradient(90deg,#0dc6ff,#08c7bf)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              минус 15%
            </span>
          </h2>
          <p className="mt-1 text-sm sm:text-base" style={{ color: "#56727b" }}>
            Промокод FIRST15 на всё меню
          </p>
          <Link
            href="/cart"
            className="mt-3 w-max rounded-full px-5 py-2.5 text-xs font-bold text-white transition-transform active:scale-95 sm:text-sm"
            style={{ background: "linear-gradient(135deg,#0ec3d4,#15d9c8)" }}
          >
            Забрать промокод →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Слайд 2 — Зелёная плашка (dark bg, lime glow, particles)            */
/* ------------------------------------------------------------------ */
function GreenSlide() {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl3"
      style={{
        background: "rgba(255,255,255,.05)",
        border: "1px solid rgba(255,255,255,.2)",
        backdropFilter: "blur(20px)",
        backgroundColor: "#0d130d",
        boxShadow: "0 20px 60px rgba(0,0,0,.45),inset 0 0 30px rgba(255,255,255,.05)"
      }}
    >
      {/* Top-right glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 320,
          height: 320,
          right: -80,
          top: -80,
          background: "radial-gradient(circle,#8BFF39,transparent 70%)",
          filter: "blur(60px)",
          opacity: 0.6
        }}
      />
      {/* Bottom-left glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: 260,
          height: 260,
          left: -80,
          bottom: -80,
          background: "radial-gradient(circle,#8BFF39,transparent 70%)",
          filter: "blur(70px)",
          opacity: 0.25
        }}
      />
      {/* Floating particles */}
      {[
        { left: "70%", top: "20%", dur: "18s" },
        { left: "55%", top: "60%", dur: "20s" },
        { left: "80%", top: "70%", dur: "19s" },
        { left: "45%", top: "80%", dur: "32s" }
      ].map((p, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 18,
            height: 18,
            left: p.left,
            top: p.top,
            background: "#8BFF39",
            filter: "blur(8px)",
            opacity: 0.35,
            boxShadow: "0 0 20px #8BFF39,0 0 50px #8BFF39",
            animation: `chaosMove ${p.dur} infinite ease-in-out`
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 sm:px-14">
        <span
          className="mb-3 w-max rounded-full px-3 py-2 text-[11px] font-bold text-white sm:text-xs"
          style={{ background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)" }}
        >
          ⚡ Быстрая доставка
        </span>
        <h2 className="font-display text-xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl">
          Скидки до <span style={{ color: "#8BFF39" }}>30%</span>
        </h2>
        <p className="mt-1 text-sm text-white/80 sm:text-base">На свежие овощи и фрукты</p>
        <Link
          href="/catalog?filter=discount"
          className="mt-3 w-max rounded-full px-5 py-2.5 text-xs font-bold transition-transform active:scale-95 sm:text-sm"
          style={{ background: "#8BFF39", color: "#0d130d" }}
        >
          Смотреть акции →
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Слайд 3 — Розовая плашка (pink gradient, glass orbs)               */
/* ------------------------------------------------------------------ */
function PinkSlide() {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-xl3"
      style={{
        background: "linear-gradient(135deg,#ff5ca8 0%,#ff4f9f 45%,#ff63c3 100%)",
        boxShadow: "0 30px 80px rgba(255,80,170,.25)"
      }}
    >
      {/* Small glass spheres */}
      {[
        { w: 90, h: 90, right: 220, top: 30, delay: "0s" },
        { w: 50, h: 50, right: 270, bottom: 30, delay: "2s" },
        { w: 100, h: 100, left: -30, bottom: -25, delay: "4s", opacity: 0.5 },
        { w: 35, h: 35, right: 25, bottom: 25, delay: "1s" }
      ].map((s, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: s.w,
            height: s.h,
            right: (s as any).right,
            left: (s as any).left,
            top: (s as any).top,
            bottom: (s as any).bottom,
            opacity: (s as any).opacity ?? 1,
            background: "radial-gradient(circle at 30% 25%,rgba(255,255,255,.9),rgba(255,255,255,.2) 30%,rgba(255,255,255,.05))",
            border: "1px solid rgba(255,255,255,.35)",
            backdropFilter: "blur(15px)",
            boxShadow: "inset 10px 10px 30px rgba(255,255,255,.35),0 20px 50px rgba(255,0,120,.2)",
            animation: `orbFloat 8s ${s.delay} ease-in-out infinite`
          }}
        />
      ))}

      {/* Main orb */}
      <div
        className="pointer-events-none absolute hidden sm:block"
        style={{
          width: 200,
          height: 200,
          right: 40,
          top: "50%",
          transform: "translateY(-50%)",
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 25%,rgba(255,255,255,.9),rgba(255,255,255,.35) 12%,rgba(255,255,255,.12) 35%,rgba(255,255,255,.05) 65%)",
          border: "1px solid rgba(255,255,255,.45)",
          backdropFilter: "blur(20px)",
          boxShadow: "inset -20px -30px 50px rgba(255,0,120,.18),inset 15px 15px 30px rgba(255,255,255,.5),0 30px 80px rgba(255,0,120,.25)",
          animation: "orbFloat 7s ease-in-out infinite"
        }}
      >
        <div
          className="absolute rounded-full"
          style={{ width: 60, height: 60, top: 25, left: 35, background: "rgba(255,255,255,.5)", filter: "blur(14px)" }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 sm:px-14">
        <span
          className="mb-3 w-max rounded-full px-3 py-2 text-[11px] font-bold text-white sm:text-xs"
          style={{ background: "rgba(255,255,255,.18)", border: "1px solid rgba(255,255,255,.35)", backdropFilter: "blur(12px)" }}
        >
          ⚡ Быстрая доставка
        </span>
        <h2 className="font-display text-xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl" style={{ letterSpacing: "-.04em" }}>
          Доставка
          <br />
          <span>Быстрая доставка</span>
        </h2>
        <p className="mt-1 text-sm text-white/90 sm:text-base">Из ближайшего даркстора у вас</p>
        <Link
          href="/catalog"
          className="mt-3 w-max rounded-full px-5 py-2.5 text-xs font-bold transition-all active:scale-95 hover:-translate-y-0.5 sm:text-sm"
          style={{ background: "rgba(255,255,255,.95)", color: "#111", boxShadow: "0 15px 35px rgba(0,0,0,.15)" }}
        >
          Собрать заказ →
        </Link>
      </div>
    </div>
  );
}

const SLIDES = [BlueSlide, GreenSlide, PinkSlide];
const SLIDE_NAMES = ["blue", "green", "pink"];

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const MIN_SWIPE = 40;

  useEffect(() => {
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  function go(next: number) {
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.targetTouches[0].clientX;
    touchEnd.current = null;
  }

  function onTouchMove(e: React.TouchEvent) {
    touchEnd.current = e.targetTouches[0].clientX;
  }

  function onTouchEnd() {
    if (touchStart.current === null || touchEnd.current === null) return;
    const delta = touchStart.current - touchEnd.current;
    if (Math.abs(delta) < MIN_SWIPE) return;
    if (delta > 0) {
      go((index + 1) % SLIDES.length);
    } else {
      go((index - 1 + SLIDES.length) % SLIDES.length);
    }
  }

  const Slide = SLIDES[index];

  return (
    <>
      {/* keyframe styles injected once */}
      <style>{`
        @keyframes slayFloat1 {
          0%,100% { transform: translate(0,0) rotate(0deg); }
          50%      { transform: translate(-45px,10px) rotate(120deg); }
        }
        @keyframes slayFloat2 {
          0%,100% { transform: translate(0,0) rotate(0deg); }
          50%      { transform: translate(-55px,45px) rotate(160deg); }
        }
        @keyframes slayFloat3 {
          0%,100% { transform: translate(0,0) rotate(0deg); }
          50%      { transform: translate(140px,-135px) rotate(140deg); }
        }
        @keyframes slayFloat4 {
          0%,100% { transform: translate(0,0) rotate(0deg); }
          50%      { transform: translate(-135px,-45px) rotate(180deg); }
        }
        @keyframes orbFloat {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-16px); }
        }
        @keyframes chaosMove {
          0%   { transform: translate(0,0) scale(1); }
          25%  { transform: translate(30px,-20px) scale(1.3); }
          50%  { transform: translate(-35px,-50px) scale(.8); }
          75%  { transform: translate(45px,15px) scale(1.1); }
          100% { transform: translate(0,0) scale(1); }
        }
      `}</style>

      <div
        className="relative h-44 overflow-hidden rounded-xl3 shadow-lift sm:h-56"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={SLIDE_NAMES[index]}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 })
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Slide />
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators */}
        <div className={cn("absolute bottom-3 right-4 z-20 flex gap-1.5 sm:bottom-4 sm:right-5")}>
          {SLIDES.map((_, i) => (
            <button
              key={i}
              aria-label={`Слайд ${i + 1}`}
              onClick={() => go(i)}
              className={cn("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-white/90" : "w-1.5 bg-white/40")}
            />
          ))}
        </div>
      </div>
    </>
  );
}
