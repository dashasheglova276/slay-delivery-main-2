import { Product } from "../data";
import { useStore } from "../store";
import Icon from "./Icon";
export default function ProductTile({product}:{product:Product}) {
 const {cart,addToCart,changeQty}=useStore(); const qty=cart[product.id]||0;
 return <article className="product-tile"><div className="product-photo" style={{background:product.color}}><span>{product.emoji}</span>{product.oldPrice&&<b className="sale-tag">−{Math.round((1-product.price/product.oldPrice)*100)}%</b>}{qty===0?<button className="product-add" onClick={()=>addToCart(product.id)} aria-label="Добавить"><Icon name="plus" size={20}/></button>:<div className="product-stepper"><button onClick={()=>changeQty(product.id,-1)} aria-label="Уменьшить"><Icon name="minus" size={15}/></button><b>{qty}</b><button onClick={()=>changeQty(product.id,1)} aria-label="Добавить ещё"><Icon name="plus" size={15}/></button></div>}</div><div className="product-price">{product.price} ₽ <small>{product.oldPrice&&<del>{product.oldPrice} ₽</del>}</small></div><div className="product-name">{product.name}</div><div className="product-unit">{product.unit}</div></article>
}
