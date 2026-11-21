import { useNavigate } from "react-router-dom";
import Icon from "./Icon";
import Thumb from "./Thumb";
import { ingredientWord, Recipe } from "../data";
import { useStore } from "../store";

/** Большая карточка (экран «Рецепты»): время + сложность, добавление в корзину */
export function RecipeCardBig({ recipe }: { recipe: Recipe }) {
  const { addToCart, cart } = useStore();
  const inCart = cart[recipe.id] ?? 0;
  return (
    <article className="rcard">
      <div className="rcard-media">
        <Thumb emoji={recipe.emoji} bg={recipe.bg} image={recipe.image} size={72} />
      </div>
      <div className="rcard-body">
        <div>
          <h3>{recipe.title}</h3>
          <p>{recipe.minutes} мин · {recipe.ingredients} {ingredientWord(recipe.ingredients)}</p>
        </div>
        <button
          className={"circle-btn" + (inCart ? " added" : "")}
          onClick={() => addToCart(recipe.id)}
          aria-label={`Добавить «${recipe.title}» в корзину`}
        >
          {inCart ? <span className="qty">{inCart}</span> : <Icon name="chevron" size={16} />}
        </button>
      </div>
    </article>
  );
}

/** Компактная карточка (экран «Каталог» → Популярные рецепты) */
export function RecipeCardSmall({ recipe }: { recipe: Recipe }) {
  const nav = useNavigate();
  const { toggleFavorite, isFavorite } = useStore();
  const fav = isFavorite(recipe.id);
  return (
    <article className="scard">
      <div className="scard-media">
        <Thumb emoji={recipe.emoji} bg={recipe.bg} image={recipe.image} size={56} />
        <button
          className={"heart-btn" + (fav ? " on" : "")}
          onClick={() => toggleFavorite(recipe.id)}
          aria-label="В избранное"
        >
          <Icon name="heart" size={18} filled={fav} />
        </button>
      </div>
      <div className="scard-body">
        <div>
          <h3>{recipe.title}</h3>
          <span className="meta">
            <Icon name="clock" size={13} /> {recipe.minutes} мин
          </span>
        </div>
        <button
          className="circle-btn dark"
          onClick={() => nav("/recipes")}
          aria-label="Открыть"
        >
          <Icon name="chevron" size={16} />
        </button>
      </div>
    </article>
  );
}
