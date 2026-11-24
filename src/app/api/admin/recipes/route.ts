export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getRecipes, createRecipe } from "@/lib/data-service";
import { logError } from "@/lib/logger";

export async function GET() {
  const recipes = await getRecipes();
  return NextResponse.json({ recipes });
}

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
  return base || "recipe";
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Требуются права администратора" }, { status: 403 });
  }

  const body = await request.json();
  const required = ["title", "image", "cookTimeMinutes", "difficulty", "description"];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json({ error: `Поле "${field}" обязательно` }, { status: 400 });
    }
  }
  const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
  if (ingredients.length === 0) {
    return NextResponse.json({ error: "Добавьте хотя бы один ингредиент" }, { status: 400 });
  }
  const steps = Array.isArray(body.steps) ? body.steps.filter(Boolean) : [];
  if (steps.length === 0) {
    return NextResponse.json({ error: "Добавьте хотя бы один шаг приготовления" }, { status: 400 });
  }

  const slug = body.slug ? String(body.slug).trim().toLowerCase() : slugify(body.title);

  try {
    const recipe = await createRecipe({
      slug,
      title: body.title,
      image: body.image,
      cookTimeMinutes: Number(body.cookTimeMinutes),
      difficulty: body.difficulty,
      description: body.description,
      steps,
      ingredients
    });
    return NextResponse.json({ recipe }, { status: 201 });
  } catch (error) {
    await logError("api/admin/recipes POST", error);
    return NextResponse.json({ error: "Рецепт с таким slug уже существует" }, { status: 409 });
  }
}
