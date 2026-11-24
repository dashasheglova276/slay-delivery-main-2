"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function CourierLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Выйти"
      className="flex h-9 w-9 items-center justify-center rounded-full bg-smoke-100 text-smoke-600"
    >
      <LogOut size={16} />
    </button>
  );
}
