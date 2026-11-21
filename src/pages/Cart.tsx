import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import ProductTile from "../components/ProductTile";
import { products } from "../data";
import { useStore } from "../store";
export default function Cart(){const {cart,clearCart}=useStore();const nav=useNavigate();const items=products.filter(p=>cart[p.id]);const total=items.reduce((s,p)=>s+p.price*(cart[p.id]||0),0);if(!items.length)return <div className="placeholder"><div className="placeholder-emoji">🛒</div><h1 className="title-md">Корзина пуста</h1><p className="subtitle">Добавьте товары из каталога</p><button className="btn-primary" onClick={()=>nav("/")}>К покупкам <Icon name="arrow-right" size={16}/></button></div>;return <><h1 className="title-lg">Корзина</h1><div className="product-grid">{items.map(p=><ProductTile key={p.id} product={p}/>)}</div><div className="summary"><div><span className="meta">Итого</span><strong>{total} ₽</strong></div><button className="btn-primary" onClick={()=>{clearCart();nav("/")}}>Оформить заказ <Icon name="arrow-right" size={16}/></button></div></>}
