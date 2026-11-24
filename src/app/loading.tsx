export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-4 md:px-6">
      <div className="mb-4 h-40 animate-pulse rounded-xl3 bg-smoke-100 sm:h-48" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl2 bg-smoke-100" />
        ))}
      </div>
    </div>
  );
}
