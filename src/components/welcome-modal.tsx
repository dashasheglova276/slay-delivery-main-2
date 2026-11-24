"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, LogIn, X, Sparkles } from "lucide-react";

const STORAGE_KEY = "slay_welcome_seen";

/**
 * Приветственный экран при первом открытии сайта: Зарегистрироваться / Войти /
 * Просто посмотреть. Показывается один раз (флаг в localStorage) и только
 * гостям — если пользователь уже авторизован, экран не нужен.
 */
export default function WelcomeModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && !data.user) setOpen(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  function go(path: string) {
    dismiss();
    router.push(path);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
        >
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-sm rounded-t-xl3 bg-white p-6 shadow-lift sm:rounded-xl3"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-lime-100 text-lime-700">
                <Sparkles size={20} />
              </div>
              <button
                onClick={dismiss}
                aria-label="Закрыть"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-100 text-smoke-500"
              >
                <X size={15} />
              </button>
            </div>

            <h2 className="font-display text-lg font-bold text-ink">Добро пожаловать в StarFood</h2>
            <p className="mt-1.5 text-sm text-smoke-500">
              Зарегистрируйтесь — получите скидку 15% на первый заказ, сохранённые адреса и историю покупок. Или
              просто посмотрите каталог без аккаунта.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => go("/register")}
                className="flex items-center justify-center gap-2 rounded-full bg-lime-500 py-3 text-sm font-bold text-ink shadow-glowLime"
              >
                <UserPlus size={16} />
                Зарегистрироваться
              </button>
              <button
                onClick={() => go("/account/login")}
                className="flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white"
              >
                <LogIn size={16} />
                Войти
              </button>
              <button onClick={dismiss} className="mt-1 rounded-full py-2.5 text-sm font-semibold text-smoke-500">
                Просто посмотреть
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
