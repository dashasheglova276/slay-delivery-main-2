export type Level = "Легко" | "Средне";
export type RecipeTag = "Быстрые" | "ПП" | "Веганские" | "Десерты";

export interface Category {
  id: string;
  name: string;
  emoji: string;
  bg: string;
}

export interface Recipe {
  id: string;
  title: string;
  minutes: number;
  level: Level;
  ingredients: number;
  emoji: string;
  bg: string;
  tags: RecipeTag[];
  /** Сюда можно положить URL или путь к фото блюда, например "/img/carbonara.jpg" */
  image?: string;
}

export const categories: Category[] = [
  { id: "veg", name: "Овощи", emoji: "🥬", bg: "linear-gradient(135deg,#ffe3e3,#ffd0c2)" },
  { id: "fruit", name: "Фрукты", emoji: "🍎", bg: "linear-gradient(135deg,#e5f5d3,#fff0c9)" },
  { id: "dairy", name: "Молочные продукты", emoji: "🥛", bg: "linear-gradient(135deg,#eef2ff,#fdf0e6)" },
  { id: "bakery", name: "Выпечка", emoji: "🥐", bg: "linear-gradient(135deg,#ffeedd,#ffe0c2)" },
  { id: "meat", name: "Мясо и рыба", emoji: "🐟", bg: "linear-gradient(135deg,#ffe1dc,#ffd3cc)" },
  { id: "drinks", name: "Напитки", emoji: "🧃", bg: "linear-gradient(135deg,#fff1cc,#ffe3d6)" },
];

export const recipes: Recipe[] = [
  { id: "carbonara", title: "Паста Карбонара", minutes: 20, level: "Легко", ingredients: 5, emoji: "🍝", bg: "linear-gradient(135deg,#fde7d3,#f9cfa8)", tags: ["Быстрые"] },
  { id: "cottage", title: "Творожная запеканка", minutes: 45, level: "Легко", ingredients: 4, emoji: "🍰", bg: "linear-gradient(135deg,#fff0d0,#ffd9a3)", tags: ["ПП", "Десерты"] },
  { id: "chicken-soup", title: "Куриный крем-суп", minutes: 50, level: "Легко", ingredients: 4, emoji: "🍲", bg: "linear-gradient(135deg,#ffe8cf,#ffc999)", tags: ["ПП"] },
  { id: "greek", title: "Греческий салат", minutes: 15, level: "Легко", ingredients: 5, emoji: "🥗", bg: "linear-gradient(135deg,#e6f6d6,#cfeeb5)", tags: ["Быстрые", "ПП", "Веганские"] },
  { id: "shrimp-pasta", title: "Паста с креветками", minutes: 25, level: "Средне", ingredients: 5, emoji: "🍤", bg: "linear-gradient(135deg,#ffe4d1,#ffc4a1)", tags: ["Быстрые"] },
  { id: "pancakes", title: "Панкейки на завтрак", minutes: 15, level: "Легко", ingredients: 5, emoji: "🥞", bg: "linear-gradient(135deg,#ffeacc,#ffd199)", tags: ["Быстрые", "Десерты"] },
  { id: "pumpkin-soup", title: "Тыквенный суп", minutes: 30, level: "Легко", ingredients: 4, emoji: "🎃", bg: "linear-gradient(135deg,#ffdfbf,#ffb877)", tags: ["ПП", "Веганские"] },
];

export const heroRecipeId = "carbonara";

export const promoSlides = [
  { id: "p1", badge: "STARFOOD", title: "Свежие продукты", accent: "на каждый день", text: "Овощи, фрукты и всё нужное\nдля вашего стола", cta: "В каталог", emoji: "🥬", to: "/catalog" },
  { id: "p2", badge: "КОЛЛЕКЦИЯ", title: "Время завтрака", accent: "что-то вкусное", text: "Выпечка, молоко и любимые\nпродукты к утру", cta: "Выбрать", emoji: "🥐", to: "/catalog" },
  { id: "p3", badge: "СЕЗОННОЕ", title: "Яркие фрукты", accent: "и ягоды", text: "Сочные вкусы для хорошего\nнастроения", cta: "Смотреть", emoji: "🍓", to: "/catalog" },
  { id: "p4", badge: "ГОТОВОЕ МЕНЮ", title: "Ужин без хлопот", accent: "уже готов", text: "Любимые блюда — просто\nдобавьте в корзину", cta: "Выбрать еду", emoji: "🍣", to: "/catalog" },
  { id: "p5", badge: "STARFOOD ДЛЯ ПИТОМЦЕВ", title: "Забота о любимцах", accent: "каждый день", text: "Всё для пушистых друзей\nв одном месте", cta: "Посмотреть", emoji: "🐶", to: "/catalog" },
];

export const ingredientWord = (n: number) =>
  n === 1 ? "ингредиент" : n < 5 ? "ингредиента" : "ингредиентов";

export interface Product { id: string; name: string; category: string; price: number; oldPrice?: number; unit: string; emoji: string; color: string; }
export const products: Product[] = [
 {id:"tomato",name:"Помидоры розовые",category:"Овощи и зелень",price:149,oldPrice:179,unit:"кг",emoji:"🍅",color:"#fff0e8"},
 {id:"cucumber",name:"Огурцы свежие",category:"Овощи и зелень",price:90,unit:"кг",emoji:"🥒",color:"#eff7e9"},
 {id:"milk",name:"Молоко отборное",category:"Молочные продукты",price:89,unit:"900 мл",emoji:"🥛",color:"#f1f6fa"},
 {id:"cheese",name:"Сыр сливочный",category:"Молочные продукты",price:189,oldPrice:229,unit:"200 г",emoji:"🧀",color:"#fff4d9"},
 {id:"strawberry",name:"Клубника",category:"Фрукты и ягоды",price:249,unit:"250 г",emoji:"🍓",color:"#fff0ed"},
 {id:"apple",name:"Яблоки красные",category:"Фрукты и ягоды",price:119,unit:"кг",emoji:"🍎",color:"#fff0e8"},
 {id:"bread",name:"Хлеб ремесленный",category:"Выпечка",price:99,unit:"шт",emoji:"🥖",color:"#fff1df"},
 {id:"croissant",name:"Круассан сливочный",category:"Выпечка",price:79,unit:"шт",emoji:"🥐",color:"#fff1df"},
 {id:"juice",name:"Сок апельсиновый",category:"Напитки",price:129,unit:"1 л",emoji:"🧃",color:"#fff2df"},
 {id:"water",name:"Вода негазированная",category:"Напитки",price:59,unit:"1.5 л",emoji:"💧",color:"#edf7fa"},
 {id:"salmon",name:"Ролл с лососем",category:"Готовая еда",price:329,oldPrice:379,unit:"240 г",emoji:"🍣",color:"#fff0e8"},
 {id:"salad",name:"Салат цезарь",category:"Готовая еда",price:259,unit:"180 г",emoji:"🥗",color:"#f1f7e9"},
 {id:"chocolate",name:"Шоколад молочный",category:"Сладости",price:109,unit:"90 г",emoji:"🍫",color:"#f8eee9"},
 {id:"donut",name:"Пончик с глазурью",category:"Сладости",price:89,oldPrice:109,unit:"шт",emoji:"🍩",color:"#fff0f2"},
 {id:"petfood",name:"Корм для питомцев",category:"Для питомцев",price:199,unit:"400 г",emoji:"🐾",color:"#fff3e9"},
 {id:"eggs",name:"Яйца С1",category:"Молочные продукты",price:109,unit:"10 шт",emoji:"🥚",color:"#fff7e8"},
];
export const productCategories = ["Овощи и зелень","Фрукты и ягоды","Молочные продукты","Выпечка","Готовая еда","Напитки","Сладости","Для питомцев"];
export const collections = [
 {title:"Завтрак без хлопот",category:"Выпечка",to:"/catalog"},
 {title:"Свежие продукты",category:"Овощи и зелень",to:"/catalog"},
 {title:"К чаю",category:"Сладости",to:"/catalog"},
 {title:"Любимая готовая еда",category:"Готовая еда",to:"/catalog"},
 {title:"Для любимцев",category:"Для питомцев",to:"/catalog"},
];
