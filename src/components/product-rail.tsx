"use client";
import type { Product } from "@/data/products";
import { useEffect, useRef } from "react";
import ProductCard from "@/components/product-card";
export default function ProductRail({products}:{products:Product[]}){
  const rail=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const node=rail.current;if(!node||products.length<3)return;
    let timer:number;let paused=false;
    const stop=()=>{paused=true;window.clearInterval(timer);};
    const start=()=>{paused=false;window.clearInterval(timer);timer=window.setInterval(()=>{
      if(paused||!node) return;
      const card=node.querySelector<HTMLElement>(".product-tile");
      const step=(card?.getBoundingClientRect().width||180)+14;
      const end=node.scrollWidth-node.clientWidth;
      if(node.scrollLeft>=end-8)node.scrollTo({left:0,behavior:"smooth"});
      else node.scrollBy({left:step,behavior:"smooth"});
    },6500);};
    start();node.addEventListener("mouseenter",stop);node.addEventListener("touchstart",stop,{passive:true});
    node.addEventListener("mouseleave",start);node.addEventListener("touchend",start,{passive:true});
    return()=>{window.clearInterval(timer);node.removeEventListener("mouseenter",stop);node.removeEventListener("touchstart",stop);node.removeEventListener("mouseleave",start);node.removeEventListener("touchend",start);};
  },[products]);
  return <div ref={rail} className="collection-products">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>
}
