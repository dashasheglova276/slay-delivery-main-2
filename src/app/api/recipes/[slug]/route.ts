export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getRecipeBySlug } from "@/lib/data-service";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) return NextResponse.json({ error: "Рецепт не найден" }, { status: 404 });
  return NextResponse.json({ recipe });
}
