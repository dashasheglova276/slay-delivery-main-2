import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <span className="text-4xl">🥬</span>
      <h1 className="font-display text-lg font-bold">Страница не найдена</h1>
      <p className="text-sm text-smoke-500">Возможно, товар закончился или ссылка устарела</p>
      <Link href="/" className="mt-2 rounded-full bg-lime-500 px-6 py-3 text-sm font-bold text-ink">
        На главную
      </Link>
    </div>
  );
}
