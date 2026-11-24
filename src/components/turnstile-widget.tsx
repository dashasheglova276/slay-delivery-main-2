"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

/**
 * Обёртка над Cloudflare Turnstile. Без NEXT_PUBLIC_TURNSTILE_SITE_KEY
 * в dev-режиме просто не рендерит виджет (сервер тогда тоже не требует
 * токен — см. src/lib/turnstile.ts), чтобы не блокировать локальную разработку.
 */
export default function TurnstileWidget({ onVerify }: { onVerify: (token: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !containerRef.current || !window.turnstile) return;
    const widgetId = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify
    });
    return () => window.turnstile?.reset(widgetId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  if (!siteKey) {
    return (
      <p className="rounded-xl2 bg-smoke-50 px-3 py-2 text-xs text-smoke-400">
        CAPTCHA отключена: не задан NEXT_PUBLIC_TURNSTILE_SITE_KEY (только для локальной разработки)
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onReady={() => {
          if (containerRef.current && window.turnstile) {
            window.turnstile.render(containerRef.current, { sitekey: siteKey, callback: onVerify });
          }
        }}
      />
      <div ref={containerRef} />
    </>
  );
}
