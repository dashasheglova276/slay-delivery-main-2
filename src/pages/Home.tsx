import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import PromoCarousel from "../components/PromoCarousel";
import ProductTile from "../components/ProductTile";
import { promoSlides, products, collections } from "../data";
export default function Home(){
 const [query,setQuery]=useState("");const nav=useNavigate();const q=query.trim().toLowerCase();const filtered=products.filter(p=>p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q));
 return <><label className="search"><Icon name="search" size={20}/><input placeholder="Найти продукты" value={query} onChange={e=>setQuery(e.target.value)}/></label>{!q&&<PromoCarousel slides={promoSlides}/>} {!q&&<><button className="home-catalog-link" onClick={()=>nav('/catalog')}>Открыть каталог <Icon name="arrow-right" size={17}/></button>{collections.map(c=><section className="collection-section" key={c.title}><div className="section-head"><h2>{c.title}</h2><button className="link" onClick={()=>nav(c.to||'/catalog')}>Все <Icon name="arrow-right" size={15}/></button></div><div className="collection-products">{products.filter(p=>p.category===c.category).map(p=><ProductTile key={p.id} product={p}/>)}</div></section>)}<div className="ad-banner"><div><small>STARFOOD РЕКОМЕНДУЕТ</small><b>Соберите вечер по вкусу</b><span>Всё для уютного вечера дома</span></div><strong>✨</strong></div></>}<div className="section-head"><h2>{q?"Результаты поиска":"Популярное"}</h2><span className="scroll-hint">{filtered.length} товаров</span></div><div className="product-grid">{filtered.map((p,i)=><div className="product-grid-item" key={p.id}>{i===4&&!q&&<div className="inline-ad"><small>РЕКЛАМА</small><b>Добавьте яркости в каждый день</b><span>Откройте новую коллекцию StarFood</span><strong>🍊</strong></div>}<ProductTile product={p}/></div>)}</div></>
}
