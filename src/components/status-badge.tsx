import type { OrderStatus } from "@/types";
import { ORDER_STATUS_LABELS } from "@/types";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "bg-flash-50 text-flash-600",
  accepted: "bg-sky-50 text-sky-600",
  picked_up: "bg-violet-50 text-violet-600",
  in_transit: "bg-lime-100 text-lime-700",
  delivered: "bg-smoke-100 text-smoke-600",
  cancelled: "bg-smoke-100 text-smoke-400"
};

export default function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
        STATUS_STYLES[status],
        className
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
