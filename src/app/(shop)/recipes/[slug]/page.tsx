import Image from "next/image";
import { notFound } from "next/navigation";
import { Clock, ListChecks, Gauge } from "lucide-react";
import { getRecipeBySlug } from "@/lib/catalog";
import RecipeAddToCart from "@/components/recipe-add-to-cart";

// Рецепты теперь управляются в админке (создание/редактирование/удаление),
// поэтому список slug'ов не известен на этапе сборки — страница рендерится
// динамически, как и остальные страницы каталога.
export const revalidate = 0;

export default async function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = await getRecipeBySlug(params.slug);
  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-5 md:px-6">
      <div className="relative h-52 w-full overflow-hidden rounded-xl3 shadow-soft sm:h-72">
        <Image src={recipe.image} alt={recipe.title} fill sizes="720px" className="object-cover" />
      </div>

      <h1 className="mt-5 font-display text-2xl font-extrabold text-ink sm:text-3xl">{recipe.title}</h1>
      <p className="mt-1.5 text-sm text-smoke-500">{recipe.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-smoke-600">
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-lime-700" />
          {recipe.cookTimeMinutes} минут
        </span>
        <span className="flex items-center gap-1.5">
          <ListChecks size={14} className="text-lime-700" />
          {recipe.ingredients.length} ингредиентов
        </span>
        <span className="flex items-center gap-1.5">
          <Gauge size={14} className="text-lime-700" />
          {recipe.difficulty}
        </span>
      </div>

      <div className="mt-5">
        <RecipeAddToCart recipe={recipe} />
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Ингредиенты</h2>
          <ul className="flex flex-col gap-2">
            {recipe.ingredients.map((ing) => (
              <li
                key={ing.productId}
                className="flex items-center gap-2 rounded-xl2 bg-white/70 px-3.5 py-2.5 text-sm text-ink shadow-soft backdrop-blur-md"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-lime-500" />
                {ing.name}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-bold text-ink">Приготовление</h2>
          <ol className="flex flex-col gap-3">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-smoke-600">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime-100 text-xs font-bold text-lime-700">
                  {i + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
