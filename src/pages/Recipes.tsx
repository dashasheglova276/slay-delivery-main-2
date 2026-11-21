import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { RecipeCardBig } from "../components/RecipeCards";
import { recipes } from "../data";

export default function Recipes() {
  const nav = useNavigate();
  const list = recipes;
  return (
    <>
      <button className="back" onClick={() => nav(-1)}>
        <Icon name="arrow-left" size={16} /> Назад
      </button>
      <h1 className="title-md">Рецепты</h1>
      <p className="subtitle">Простые идеи на каждый день. Ингредиенты можно добавить сразу.</p>
      <div className="rcard-grid">
        {list.map((r) => (
          <RecipeCardBig key={r.id} recipe={r} />
        ))}
      </div>
    </>
  );
}
