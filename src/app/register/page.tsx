"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { User, Phone, Lock, ShieldCheck } from "lucide-react";
import TurnstileWidget from "@/components/turnstile-widget";
import { isValidPhone } from "@/lib/utils";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("from") || "/";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const allAccepted = acceptedTerms && acceptedPrivacy && acceptedOffer;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidPhone(phone)) {
      setError("Проверьте номер телефона — похоже, в нём ошибка");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Пароли не совпадают");
      return;
    }
    if (!allAccepted) {
      setError("Нужно подтвердить все три согласия ниже, чтобы продолжить");
      return;
    }

    setLoading(true);
    try {
      // isValidPhone() выше только проверяет формат, но допускает пробелы/скобки —
      // а серверная регулярка (PHONE_RE) их не принимает. Нормализуем перед отправкой,
      // чтобы прошедший клиентскую проверку номер не отваливался на сервере.
      const digits = phone.replace(/\D/g, "");
      const normalizedPhone = digits.length === 10 ? `+7${digits}` : `+${digits.replace(/^8/, "7")}`;
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Бэкенд хранит согласие одним флагом acceptedTerms — на форме проверяем
        // все три чекбокса отдельно, но раз все три обязательны для отправки,
        // объединённого флага для существующего API достаточно.
        body: JSON.stringify({ name, phone: normalizedPhone, password, acceptedTerms: allAccepted, turnstileToken })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Не удалось зарегистрироваться");
        return;
      }
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <div id="register-form" className="mb-6 text-center">
        <span className="font-display text-2xl font-extrabold text-ink">StarFood</span>
        <p className="mt-1 text-sm text-smoke-500">Создать аккаунт</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Имя</span>
          <div className="relative">
            <User size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className="w-full rounded-xl2 border border-smoke-200 py-3 pl-10 pr-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
              required
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Телефон</span>
          <div className="relative">
            <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+79991234567"
              className="w-full rounded-xl2 border border-smoke-200 py-3 pl-10 pr-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
              required
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Пароль</span>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              className="w-full rounded-xl2 border border-smoke-200 py-3 pl-10 pr-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
              required
              minLength={6}
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-smoke-500">Повторите пароль</span>
          <div className="relative">
            <Lock size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-smoke-400" />
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-xl2 border border-smoke-200 py-3 pl-10 pr-3 text-sm outline-none ring-lime-500/60 focus:ring-2"
              required
            />
          </div>
        </label>

        <TurnstileWidget onVerify={setTurnstileToken} />

        <div className="flex flex-col gap-2 rounded-xl2 bg-smoke-50 p-3">
          <div className="mb-0.5 flex items-center gap-1.5 text-xs font-semibold text-smoke-500">
            <ShieldCheck size={14} />
            Обязательные согласия
          </div>
          <Consent
            checked={acceptedTerms}
            onChange={setAcceptedTerms}
            label={
              <>
                Я принимаю{" "}
                <Link href="/terms" target="_blank" className="font-medium text-ink underline">
                  Пользовательское соглашение
                </Link>
              </>
            }
          />
          <Consent
            checked={acceptedPrivacy}
            onChange={setAcceptedPrivacy}
            label={
              <>
                Я согласен с{" "}
                <Link href="/privacy" target="_blank" className="font-medium text-ink underline">
                  Политикой обработки персональных данных
                </Link>
              </>
            }
          />
          <Consent
            checked={acceptedOffer}
            onChange={setAcceptedOffer}
            label={
              <>
                Я принимаю условия{" "}
                <Link href="/offer" target="_blank" className="font-medium text-ink underline">
                  Публичной оферты
                </Link>{" "}
                на заключение договора купли-продажи товаров
              </>
            }
          />
        </div>

        {error && <p className="text-sm text-flash-600">{error}</p>}

        <button
          type="submit"
          disabled={loading || !allAccepted}
          className="mt-2 rounded-full bg-lime-500 py-3 text-sm font-bold text-ink shadow-glowLime disabled:opacity-50"
        >
          {loading ? "Регистрируем…" : "Зарегистрироваться"}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-smoke-400">
        Уже есть аккаунт?{" "}
        <Link href={`/account/login?from=${encodeURIComponent(redirectTo)}`} className="font-semibold text-ink">
          Войти
        </Link>
      </p>
    </div>
  );
}

function Consent({
  checked,
  onChange,
  label
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-2 text-xs text-smoke-600">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-lime-500"
      />
      <span>{label}</span>
    </label>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
