"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Clock, Plus } from "lucide-react";
import type { Recipe } from "@/data/recipes";
import type { Product } from "@/data/products";
import { emojiFromSticker } from "@/lib/sticker";
import { useCartStore } from "@/context/cart-store";
import { useToastStore } from "@/context/toast-store";

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  const addItem = useCartStore((store) => store.addItem);
  const showToast = useToastStore((store) => store.show);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const emoji = emojiFromSticker(recipe.image);

  async function addIngredients() {
    setAdding(true);
    try {
      const ids = recipe.ingredients.map((ingredient) => ingredient.productId).join(",");
      const response = await fetch(`/api/products?ids=${ids}`);
      const data = await response.json();
      (data.products as Product[] | undefined)?.forEach((product) => addItem(product));
      setAdded(true);
      showToast(`Ингредиенты для «${recipe.title}» в корзине`, "success");
      setTimeout(() => setAdded(false), 1400);
    } catch {
      showToast("Не удалось добавить ингредиенты", "error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="rcard">
      <Link href={`/recipes/${recipe.slug}`} className="rcard-media" aria-label={`Открыть рецепт ${recipe.title}`}>
        {emoji ? <span className="thumb-emoji">{emoji}</span> : <Image src={recipe.image} alt={recipe.title} fill unoptimized sizes="260px" className="recipe-image" />}
      </Link>
      <div className="rcard-body">
        <div>
          <Link href={`/recipes/${recipe.slug}`} className="recipe-title"><h3>{recipe.title}</h3></Link>
          <p><Clock size={13} /> {recipe.cookTimeMinutes} мин · {recipe.ingredients.length} ингредиентов</p>
        </div>
        <button className={`circle-btn${added ? " added" : ""}`} onClick={addIngredients} disabled={adding} aria-label={`Добавить ингредиенты для «${recipe.title}»`}>
          {added ? <Check size={17} /> : <Plus size={18} />}
        </button>
      </div>
    </article>
  );
}
