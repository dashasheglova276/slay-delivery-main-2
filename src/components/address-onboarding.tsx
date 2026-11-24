"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, X, Plus, Check } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import YandexMapPicker from "@/components/yandex-map-picker";

const KEY = "starfood-delivery-address";
const ADDRESS_LIST_KEY = "starfood-saved-addresses";
type SavedAddress = { id: string; label: string; address: string; lat?: number | null; lng?: number | null; isDefault?: boolean };
export default function AddressOnboarding() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [pickup, setPickup] = useState(false);
  const [locations,setLocations]=useState<any[]>([]);
  const [chosenLocation,setChosenLocation]=useState<any>(null);
  const [showLocations,setShowLocations]=useState(false);
  const [coords, setCoords] = useState<{lat:number;lng:number}|null>(null);
  const [manual, setManual] = useState("");
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem(KEY) || "";
    setAddress(saved); setManual(saved); setPickup(localStorage.getItem("starfood-delivery-mode")==="pickup");
    try { setSavedAddresses(JSON.parse(localStorage.getItem(ADDRESS_LIST_KEY) || "[]")); } catch { localStorage.removeItem(ADDRESS_LIST_KEY); }
    const savedPickup = localStorage.getItem("starfood-pickup-location");
    if (savedPickup) {
      try {
        setChosenLocation(JSON.parse(savedPickup));
      } catch {
        // Ignore stale or malformed pickup data instead of crashing the page.
        localStorage.removeItem("starfood-pickup-location");
      }
    }
    fetch("/api/pickup-locations").then(r=>r.json()).then(d=>setLocations(d.locations||[])).catch(()=>{});
    // After sign-in, ask for a delivery address once if the customer has none.
    fetch("/api/auth/me").then(r=>r.json()).then(d=>{
      if(d.user && !saved && !sessionStorage.getItem("starfood-address-prompted")){
        sessionStorage.setItem("starfood-address-prompted","1");
        void openAddressPicker();
      }
    }).catch(()=>{});
    const show = () => { void openAddressPicker(); };
    const promptAddress = () => { if (!localStorage.getItem(KEY)) void openAddressPicker(); };
    const showPickup = () => { setPickup(true); setShowLocations(true); };
    window.addEventListener("starfood:open-address", show);
    window.addEventListener("starfood:address-needed", promptAddress);
    window.addEventListener("starfood:open-pickup",showPickup);
    return () => {window.removeEventListener("starfood:open-address", show);window.removeEventListener("starfood:address-needed", promptAddress);window.removeEventListener("starfood:open-pickup",showPickup);};
  }, []);
  async function openAddressPicker() {
    setOpen(true);
    setPickup(false);
    try { localStorage.setItem("starfood-delivery-mode", "delivery"); } catch {}
    try {
      const response = await fetch("/api/me/addresses");
      if (!response.ok) return;
      const data = await response.json();
      const list = (data.addresses ?? []) as SavedAddress[];
      setSavedAddresses(list);
      localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(list));
    } catch {}
  }
  async function openAddressBook() {
    setAddressBookOpen(true);
    try {
      const response = await fetch("/api/me/addresses");
      if (!response.ok) return;
      const data = await response.json();
      const serverAddresses = (data.addresses ?? []) as SavedAddress[];
      const localAddresses = JSON.parse(localStorage.getItem(ADDRESS_LIST_KEY) || "[]") as SavedAddress[];
      const merged = [...serverAddresses, ...localAddresses.filter((item) => !serverAddresses.some((server) => server.address === item.address))];
      setSavedAddresses(merged);
      localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(merged));
    } catch {}
  }
  function selectSavedAddress(item: SavedAddress) {
    setAddress(item.address);
    setManual(item.address);
    setCoords(typeof item.lat === "number" && typeof item.lng === "number" ? { lat: item.lat, lng: item.lng } : null);
    localStorage.setItem(KEY, item.address);
    localStorage.setItem("starfood-delivery-mode", "delivery");
    setPickup(false);
    setAddressBookOpen(false);
    window.dispatchEvent(new CustomEvent("starfood:address-selected", { detail: { address: item.address, lat: item.lat, lng: item.lng } }));
  }
  function choose(value = address) {
    const next=value.trim(); if(!next)return;
    if(pickup){if(!chosenLocation)return;localStorage.setItem("starfood-pickup-location",JSON.stringify(chosenLocation));}
    else {
      localStorage.setItem(KEY,next);
      const existing = savedAddresses.find((item) => item.address === next);
      const localItem = existing || { id: `local-${Date.now()}`, label: savedAddresses.length ? "Адрес" : "Дом", address: next, ...coords, isDefault: savedAddresses.length === 0 };
      const nextAddresses = existing ? savedAddresses : [...savedAddresses, localItem];
      setSavedAddresses(nextAddresses);
      localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(nextAddresses));
      if (!existing) {
        fetch("/api/me/addresses",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({label:localItem.label,address:next,isDefault:!savedAddresses.length,...(coords||{})})})
          .then(async (response) => { if (!response.ok) return; const data = await response.json(); if (data.address) { const merged = [...nextAddresses.filter((a) => !a.id.startsWith("local-") && a.address !== next), data.address]; setSavedAddresses(merged); localStorage.setItem(ADDRESS_LIST_KEY, JSON.stringify(merged)); } }).catch(()=>{});
      }
    }
    localStorage.setItem("starfood-delivery-mode",pickup?"pickup":"delivery"); setAddress(next); setManual(next); setOpen(false);
    window.dispatchEvent(new CustomEvent("starfood:address-selected",{detail:{address:next,...(coords||{})}}));
  }
  return <>
    {pathname==="/"&&<div className="delivery-address-label"><button type="button" onClick={()=>{setPickup(false);try{localStorage.setItem("starfood-delivery-mode","delivery")}catch{};void openAddressBook()}}><MapPin size={18}/><span>{address||"Укажите адрес доставки"}</span><b>⌄</b></button></div>}
    {addressBookOpen&&<div className="address-book-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setAddressBookOpen(false)}}><section className="address-book-sheet" role="dialog" aria-modal="true" aria-labelledby="address-book-title"><header><div><span>StarFood</span><h2 id="address-book-title">Адрес доставки</h2><p>Выберите сохранённый или добавьте новый</p></div><button type="button" aria-label="Закрыть" onClick={()=>setAddressBookOpen(false)}><X/></button></header><div className="address-book-list">{savedAddresses.length? savedAddresses.map(item=><button type="button" key={item.id} onClick={()=>selectSavedAddress(item)} className={address===item.address?"selected":""}><span className="address-book-icon"><MapPin size={20}/></span><span><b>{item.label}{item.isDefault?" · основной":""}</b><small>{item.address}</small></span>{address===item.address&&<Check size={20}/>}</button>):<p className="address-book-empty">Сохранённых адресов пока нет.</p>}</div><button type="button" className="address-book-add" onClick={()=>{setAddressBookOpen(false);setPickup(false);void openAddressPicker()}}><Plus size={20}/>Выбрать адрес на карте</button></section></div>}
    {showLocations&&<div className="pickup-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setShowLocations(false)}}><section className="pickup-sheet"><header><div><h2>Выберите магазин</h2><p>Заберёте заказ в удобной точке</p></div><button onClick={()=>setShowLocations(false)}>Закрыть</button></header>{locations.length===0?<p className="pickup-empty">Пока нет доступных точек. Магазины появятся здесь после добавления в админ-панели.</p>:<div className="pickup-list">{locations.map(loc=><article key={loc.id} className="pickup-card"><div><h3>{loc.name}</h3><p>{loc.address}</p><small>{loc.hours}{loc.contact?` · ${loc.contact}`:""}</small>{loc.description&&<p>{loc.description}</p>}</div><button onClick={()=>{setChosenLocation(loc);localStorage.setItem("starfood-pickup-location",JSON.stringify(loc));window.dispatchEvent(new CustomEvent("starfood:pickup-selected",{detail:{location:loc}}));setShowLocations(false)}}>{chosenLocation?.id===loc.id?"Выбрано":"Выбрать"}</button></article>)}</div>}</section></div>}
    {open && <div className="map-fullscreen">
      <div className="map-topbar"><button onClick={()=>setOpen(false)} aria-label="Назад"><ArrowLeft/></button></div>
      <div className="map-canvas"><YandexMapPicker value={address} className="map-picker-full" onSelect={({address:a,lat,lng})=>{setAddress(a);setManual(a);setCoords({lat,lng});}} />
        <div className="map-center-pin"><Image src="/images/starfood-map-pin.png" alt="Метка StarFood" width={70} height={82} priority /></div>
      </div>
      <div className="map-bottom-sheet">
        <div className="map-address-result"><MapPin size={20}/><div><small>{address ? "Адрес доставки" : "Куда привезти заказ"}</small><strong>{address||"Передвиньте карту или введите улицу и дом"}</strong></div></div>
        <button type="button" className="map-locate-text" onClick={() => window.dispatchEvent(new Event("starfood:locate-me"))}>Определить моё местоположение</button>
        <button disabled={!address&&!manual.trim()} onClick={()=>choose(manual||address)}>Да, всё верно</button>
      </div>
    </div>}
  </>;
}
