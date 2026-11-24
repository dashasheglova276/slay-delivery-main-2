export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecipeBySlug, updateRecipe, deleteRecipe } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET(_request: NextRequest, { params }: { params: { slug: string } }) {
  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) return NextResponse.json({ error: "Рецепт не найден" }, { status: 404 });
  return NextResponse.json({ recipe });
}

export async function PATCH(request: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  try {
    const recipe = await updateRecipe(params.slug, {
      title: body.title,
      image: body.image,
      cookTimeMinutes: body.cookTimeMinutes !== undefined ? Number(body.cookTimeMinutes) : undefined,
      difficulty: body.difficulty,
      description: body.description,
      steps: Array.isArray(body.steps) ? body.steps.filter(Boolean) : undefined,
      ingredients: Array.isArray(body.ingredients) ? body.ingredients : undefined
    });
    return NextResponse.json({ recipe });
  } catch (error) {
    await logError("api/admin/recipes/[slug] PATCH", error);
    return NextResponse.json({ error: "Рецепт не найден" }, { status: 404 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { slug: string } }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  try {
    await deleteRecipe(params.slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    await logError("api/admin/recipes/[slug] DELETE", error);
    return NextResponse.json({ error: "Не удалось удалить рецепт" }, { status: 400 });
  }
}
