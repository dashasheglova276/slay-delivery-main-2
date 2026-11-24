import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  accent = "lime"
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  accent?: "lime" | "flash" | "ink";
}) {
  const accentStyles = {
    lime: "bg-lime-50 text-lime-600",
    flash: "bg-flash-50 text-flash-600",
    ink: "bg-smoke-100 text-ink"
  }[accent];

  return (
    <div className="rounded-xl2 border border-smoke-100 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-smoke-500">{label}</span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", accentStyles)}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-3 font-display text-2xl font-extrabold text-ink">{value}</p>
      {trend && <p className="mt-1 text-xs text-lime-600">{trend}</p>}
    </div>
  );
}
