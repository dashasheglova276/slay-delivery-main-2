"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function QuantityStepper({
  quantity,
  label,
  onIncrement,
  onDecrement,
  size = "md",
  className
}: {
  quantity: number;
  /** Необязательное отображаемое значение вместо `quantity` — например "0.5 кг" для весовых товаров. */
  label?: string;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const isSmall = size === "sm";
  const display = label ?? String(quantity);

  return (
    <motion.div
      layout
      className={cn(
        "flex items-center justify-between rounded-full bg-ink text-white",
        isSmall ? "h-9 px-1" : "h-11 px-1.5",
        className
      )}
    >
      <button
        aria-label="Уменьшить количество"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        className={cn(
          "flex items-center justify-center rounded-full transition-colors hover:bg-white/15 active:bg-white/25",
          isSmall ? "h-7 w-7" : "h-8 w-8"
        )}
      >
        <Minus size={isSmall ? 13 : 15} />
      </button>
      <motion.span
        key={display}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          "select-none whitespace-nowrap text-center font-semibold",
          isSmall ? "min-w-[1.5rem] px-1 text-xs" : "min-w-[2rem] px-1 text-sm"
        )}
      >
        {display}
      </motion.span>
      <button
        aria-label="Увеличить количество"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        className={cn(
          "flex items-center justify-center rounded-full bg-lime-500 text-ink transition-colors hover:bg-lime-400 active:bg-lime-600",
          isSmall ? "h-7 w-7" : "h-8 w-8"
        )}
      >
        <Plus size={isSmall ? 13 : 15} />
      </button>
    </motion.div>
  );
}
