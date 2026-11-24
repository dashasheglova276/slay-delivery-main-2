import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-smoke-100">
        <WifiOff className="h-7 w-7 text-smoke-500" />
      </div>
      <h1 className="font-display text-xl font-bold">Нет соединения</h1>
      <p className="max-w-sm text-sm text-smoke-500">
        Похоже, вы офлайн. Проверьте подключение к интернету — как только связь восстановится,
        StarFood снова заработает.
      </p>
    </div>
  );
}
