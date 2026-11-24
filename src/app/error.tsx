"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <span className="text-4xl">⚠️</span>
      <h1 className="font-display text-lg font-bold">Что-то пошло не так</h1>
      <p className="text-sm text-smoke-500">{error.message || "Попробуйте обновить страницу"}</p>
      <button onClick={reset} className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-white">
        Попробовать снова
      </button>
    </div>
  );
}
