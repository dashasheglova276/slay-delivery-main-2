"use client";
import { useEffect, useMemo, useState } from "react";
import { Check, Minus, Plus, ShoppingBasket, X } from "lucide-react";
import type { Recipe } from "@/data/recipes";
import type { Product } from "@/data/products";
import { useCartStore } from "@/context/cart-store";
import { formatCartAmount, formatPrice, getLineTotal, getStepAmount } from "@/lib/utils";
import Image from "next/image";

export default function RecipeAddToCart({recipe}:{recipe:Recipe}) {
 const [open,setOpen]=useState(false),[products,setProducts]=useState<Product[]>([]),[selected,setSelected]=useState<Record<string,number>>({}),[loading,setLoading]=useState(false);
 const addItem=useCartStore(s=>s.addItem);
 useEffect(()=>{if(!open||products.length)return;setLoading(true);const ids=recipe.ingredients.map(i=>i.productId).join(",");fetch(`/api/products?ids=${encodeURIComponent(ids)}`).then(r=>r.json()).then(d=>setProducts(d.products??[])).finally(()=>setLoading(false));},[open,recipe.ingredients,products.length]);
 const total=useMemo(()=>products.reduce((sum,p)=>sum+(selected[p.id]?getLineTotal(p.price,selected[p.id],p):0),0),[products,selected]);
 function addSelected(){products.forEach(p=>{const q=selected[p.id];if(q)addItem(p,q)});setOpen(false);setSelected({});}
 return <>
  <button onClick={()=>setOpen(true)} className="recipe-products-cta"><ShoppingBasket size={18}/> Продукты из рецепта <span>{recipe.ingredients.length}</span></button>
  {open&&<div className="recipe-picker-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}><section className="recipe-picker" role="dialog" aria-modal="true" aria-label="Выбор продуктов из рецепта">
   <header><div><small>РЕЦЕПТ</small><h2>Что добавить?</h2><p>Выберите только те продукты, которые вам нужны.</p></div><button className="picker-close" onClick={()=>setOpen(false)} aria-label="Закрыть"><X/></button></header>
   {loading?<p className="picker-loading">Загружаем товары…</p>:<div className="recipe-picker-grid">{recipe.ingredients.map(ing=>{const p=products.find(x=>x.id===ing.productId);if(!p)return <article className="recipe-missing" key={ing.productId}><b>{ing.name}</b><span>Сейчас нет в каталоге</span></article>;const count=selected[p.id]||0;return <article className={`recipe-product${count?" chosen":""}`} key={p.id}><div className="recipe-product-card"><div className="recipe-product-photo">{p.image&&<Image src={p.image} alt={p.name} fill sizes="220px" className="object-contain"/>}</div><button className={`recipe-select${count?" on":""}`} onClick={()=>setSelected(s=>({...s,[p.id]:count?0:getStepAmount(p)}))} aria-label={count?"Исключить товар":"Выбрать товар"}>{count?<Check/>:<Plus/>}</button>{count>0&&<div className="recipe-quantity"><button onClick={()=>setSelected(s=>({...s,[p.id]:Math.max(0,count-getStepAmount(p))}))}><Minus size={15}/></button><b>{p.saleType === "weight" ? formatCartAmount(count, p) : count}</b><button onClick={()=>setSelected(s=>({...s,[p.id]:count+getStepAmount(p)}))}><Plus size={15}/></button></div>}</div><p className="recipe-product-name">{ing.name}</p><strong>{p.saleType === "weight" ? `${formatPrice(getLineTotal(p.price, getStepAmount(p), p))} / ${formatCartAmount(getStepAmount(p), p)}` : formatPrice(p.price)}</strong></article>})}</div>}
   <footer><div><small>Выбрано товаров</small><b>{formatPrice(total)}</b></div><button disabled={!total} onClick={addSelected}>Добавить выбранное</button></footer>
  </section></div>}
 </>;
}
