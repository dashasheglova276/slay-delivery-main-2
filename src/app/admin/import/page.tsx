"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice, cn } from "@/lib/utils";

interface ImportRow {
  name: string;
  price: number | null;
  category?: string;
  matchedProductId: string | null;
}

// Возможные варианты названий колонок в загруженном файле (RU/EN)
const NAME_KEYS = ["название", "name", "товар", "наименование"];
const PRICE_KEYS = ["цена", "price", "новая цена", "стоимость"];
const CATEGORY_KEYS = ["категория", "category"];

function pickValue(row: Record<string, unknown>, keys: string[]): string | undefined {
  const foundKey = Object.keys(row).find((k) => keys.includes(k.trim().toLowerCase()));
  return foundKey ? String(row[foundKey]).trim() : undefined;
}

export default function ImportPage() {
  const [products, setProducts] = useState<Product[]>([]);

  const [rows, setRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []));
  }, []);

  function handleFile(file: File) {
    setError("");
    setApplied(false);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });

        const parsed: ImportRow[] = json.map((row) => {
          const name = pickValue(row, NAME_KEYS) ?? "";
          const priceRaw = pickValue(row, PRICE_KEYS);
          const price = priceRaw ? Number(priceRaw.replace(/[^\d.]/g, "")) : null;
          const category = pickValue(row, CATEGORY_KEYS);
          const matched = products.find((p) => p.name.trim().toLowerCase() === name.trim().toLowerCase());
          return { name, price, category, matchedProductId: matched?.id ?? null };
        });

        setRows(parsed.filter((r) => r.name));
      } catch {
        setError("Не удалось прочитать файл. Проверьте формат (.xlsx, .xls, .csv).");
      }
    };
    reader.readAsBinaryString(file);
  }

  async function applyPriceUpdates() {
    setApplying(true);
    try {
      const updates = rows.filter((row) => row.matchedProductId && row.price);
      await Promise.all(
        updates.map((row) =>
          fetch(`/api/products/${row.matchedProductId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ price: row.price })
          })
        )
      );
      // Обновляем локальный список цен, чтобы колонка "Текущая цена" сразу отразила изменения
      setProducts((prev) =>
        prev.map((p) => {
          const match = updates.find((u) => u.matchedProductId === p.id);
          return match ? { ...p, price: match.price! } : p;
        })
      );
      setApplied(true);
    } finally {
      setApplying(false);
    }
  }

  const matchedCount = rows.filter((r) => r.matchedProductId).length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Импорт из Excel</h1>
        <p className="text-sm text-smoke-500">
          Загрузите прайс-лист поставщика (.xlsx, .xls, .csv) — сопоставим товары по названию и обновим цены
        </p>
      </div>

      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed border-smoke-200 bg-white py-12 text-center hover:border-lime-500">
        <UploadCloud className="h-9 w-9 text-smoke-400" />
        <span className="text-sm font-semibold text-ink">
          {fileName || "Нажмите, чтобы выбрать файл"}
        </span>
        <span className="text-xs text-smoke-400">Столбцы: Название, Цена, Категория (необязательно)</span>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </label>

      {error && (
        <p className="flex items-center gap-2 text-sm text-flash-600">
          <AlertCircle size={15} />
          {error}
        </p>
      )}

      {rows.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm text-smoke-600">
              <FileSpreadsheet size={16} />
              Загружено строк: <strong>{rows.length}</strong> · сопоставлено с каталогом:{" "}
              <strong className="text-lime-600">{matchedCount}</strong>
            </p>
            <button
              onClick={applyPriceUpdates}
              disabled={matchedCount === 0 || applying}
              className="flex items-center gap-2 rounded-full bg-lime-500 px-4 py-2.5 text-sm font-bold text-ink shadow-glowLime disabled:opacity-40"
            >
              <RefreshCw size={15} />
              {applying ? "Обновляем…" : `Обновить цены (${matchedCount})`}
            </button>
          </div>

          {applied && (
            <p className="flex items-center gap-2 rounded-xl2 bg-lime-50 px-4 py-3 text-sm font-semibold text-lime-700">
              <CheckCircle2 size={16} />
              Цены обновлены в каталоге
            </p>
          )}

          <div className="overflow-x-auto rounded-xl2 border border-smoke-100 bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-smoke-100 text-xs text-smoke-400">
                  <th className="p-3 font-medium">Название из файла</th>
                  <th className="p-3 font-medium">Категория</th>
                  <th className="p-3 font-medium">Новая цена</th>
                  <th className="p-3 font-medium">Текущая цена</th>
                  <th className="p-3 font-medium">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-smoke-100">
                {rows.map((row, i) => {
                  const current = products.find((p) => p.id === row.matchedProductId);
                  return (
                    <tr key={i}>
                      <td className="p-3">{row.name}</td>
                      <td className="p-3 text-smoke-500">{row.category || "—"}</td>
                      <td className="p-3 font-semibold">{row.price ? formatPrice(row.price) : "—"}</td>
                      <td className="p-3 text-smoke-500">{current ? formatPrice(current.price) : "—"}</td>
                      <td className="p-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-bold",
                            row.matchedProductId ? "bg-lime-100 text-lime-700" : "bg-smoke-100 text-smoke-500"
                          )}
                        >
                          {row.matchedProductId ? "Найден в каталоге" : "Не найден"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
