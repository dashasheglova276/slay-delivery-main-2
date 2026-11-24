"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, LogIn, X, ShoppingBag } from "lucide-react";

export default function AuthGateModal({
  open,
  onContinueBrowsing,
  redirectTo = "/checkout"
}: {
  open: boolean;
  onContinueBrowsing: () => void;
  redirectTo?: string;
}) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
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
                <ShoppingBag size={20} />
              </div>
              <button
                onClick={onContinueBrowsing}
                aria-label="Закрыть"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-smoke-100 text-smoke-500"
              >
                <X size={15} />
              </button>
            </div>

            <h2 className="font-display text-lg font-bold text-ink">Чтобы оформить заказ, создайте аккаунт или войдите</h2>
            <p className="mt-1.5 text-sm text-smoke-500">
              Это займёт меньше минуты — вы сможете отслеживать статус заказа и повторять его в один клик.
            </p>

            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => router.push(`/register?from=${encodeURIComponent(redirectTo)}`)}
                className="flex items-center justify-center gap-2 rounded-full bg-lime-500 py-3 text-sm font-bold text-ink shadow-glowLime"
              >
                <UserPlus size={16} />
                Создать аккаунт
              </button>
              <button
                onClick={() => router.push(`/account/login?from=${encodeURIComponent(redirectTo)}`)}
                className="flex items-center justify-center gap-2 rounded-full bg-ink py-3 text-sm font-bold text-white"
              >
                <LogIn size={16} />
                Войти
              </button>
              <button
                onClick={onContinueBrowsing}
                className="mt-1 rounded-full py-2.5 text-sm font-semibold text-smoke-500"
              >
                Продолжить просмотр
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
