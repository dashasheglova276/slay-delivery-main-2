import { useState } from "react";
import ProductTile from "../components/ProductTile";
import { products } from "../data";
const groups=[
 {title:"Овощи и фрукты",tone:"blue",items:[{name:"Овощи и зелень",label:"Овощи и зелень",art:"🥬🍅",wide:true},{name:"Фрукты и ягоды",label:"Фрукты и ягоды",art:"🍓🍎"}]},
 {title:"Молочный отдел",tone:"blue",items:[{name:"Молочные продукты",label:"Молоко, сыр и яйца",art:"🥛🧀",wide:true},{name:"Молочные продукты",label:"Йогурты и десерты",art:"🍦🍰"},{name:"Молочные продукты",label:"Молочное для детей",art:"🍼"}]},
 {title:"Булочная и кондитерская",tone:"peach",items:[{name:"Выпечка",label:"Из пекарни",art:"🥖🥐",wide:true},{name:"Сладости",label:"Выпечка и десерты",art:"🫐🥮"},{name:"Выпечка",label:"Хлебцы",art:"🍘"},{name:"Выпечка",label:"Хлеб и лепёшки",art:"🍞",wide:true}]},
 {title:"Готовая еда и напитки",tone:"peach",items:[{name:"Готовая еда",label:"Готовые блюда",art:"🍣🥗",wide:true},{name:"Напитки",label:"Напитки",art:"🧃🥤"},{name:"Сладости",label:"Сладости и снеки",art:"🍩🍫"},{name:"Для питомцев",label:"Для питомцев",art:"🐶🐾"}]}
];
export default function Catalog(){
 const [active,setActive]=useState<string|null>(null);
 const list=products.filter(p=>!active||p.category===active);
 if(active)return <><button className="catalog-back" onClick={()=>setActive(null)}>‹ Каталог</button><h1 className="title-lg">{active}</h1><div className="product-grid catalog-products">{list.map(p=><ProductTile key={p.id} product={p}/>)}</div></>;
 return <><h1 className="title-lg">Каталог</h1>{groups.map(g=><section className="category-group" key={g.title}><h2>{g.title}</h2><div className="category-mosaic">{g.items.map((item,i)=><button className={`subcategory-tile color-${(i+groups.indexOf(g))%5} ${item.wide?"wide":""}`} key={`${item.label}-${i}`} onClick={()=>setActive(item.name)}><b>{item.label}</b><span aria-hidden="true">{item.art}</span></button>)}</div></section>)}</>
}
