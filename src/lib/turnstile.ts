/**
 * Проверка токена Cloudflare Turnstile на сервере.
 * Без переменной окружения TURNSTILE_SECRET_KEY проверка в dev-режиме
 * пропускается (чтобы можно было тестировать локально без реальных ключей),
 * но в production при отсутствии секрета регистрация будет отклонена —
 * так безопаснее, чем случайно оставить CAPTCHA выключенной в проде.
 */
export async function verifyTurnstile(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    console.warn("[turnstile] TURNSTILE_SECRET_KEY не задан — проверка CAPTCHA пропущена (только не-production).");
    return true;
  }

  if (!token) return false;

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token })
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
