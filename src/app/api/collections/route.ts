export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getCollections } from "@/lib/data-service";

/** Публичный список подборок — только активные, с товарами внутри. */
export async function GET() {
  const collections = await getCollections({ onlyActive: true });
  return NextResponse.json({ collections });
}
