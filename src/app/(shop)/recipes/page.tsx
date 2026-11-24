import type { Metadata } from "next";
import { getRecipes } from "@/lib/catalog";
import RecipeCard from "@/components/recipe-card";

export const metadata: Metadata = {
  title: "Рецепты — что приготовить"
};

export const revalidate = 0;

export default async function RecipesPage() {
  const recipes = await getRecipes();
  return (
    <>
      <h1 className="title-md">Рецепты</h1>
      <p className="subtitle">
        Выберите рецепт — добавим все ингредиенты в корзину одним нажатием.
      </p>
      <div className="rcard-grid">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </div>
    </>
  );
}
