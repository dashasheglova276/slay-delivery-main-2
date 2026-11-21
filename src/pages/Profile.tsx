import { useStore } from "../store";

export default function Profile() {
  const { favorites, cartCount } = useStore();
  return (
    <div className="placeholder">
      <div className="placeholder-emoji">🧑‍🍳</div>
      <h1 className="title-md">Профиль</h1>
      <p className="subtitle">Скоро здесь появятся ваши заказы и адреса доставки.</p>
      <div className="stats">
        <div>
          <strong>{favorites.length}</strong>
          <span>в избранном</span>
        </div>
        <div>
          <strong>{cartCount}</strong>
          <span>в корзине</span>
        </div>
      </div>
    </div>
  );
}
