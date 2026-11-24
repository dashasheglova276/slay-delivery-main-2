import { stickerDataUrl } from "@/lib/sticker";

export interface Category {
  slug: string;
  name: string;
  emoji: string;
  productCount: number;
  /** Картинка категории — используется в админке и на карточках каталога. */
  image?: string;
  /** Порядок отображения на сайте (меньше — выше). */
  order: number;
  /** Скрыть категорию с публичной витрины, не удаляя. Необязательно для обратной совместимости — если не указано, считается true. */
  active?: boolean;
}

export const categories: Category[] = [
  {
    "slug": "vegetables",
    "name": "Овощи",
    "emoji": "🥬",
    "productCount": 7,
    "image": stickerDataUrl("🥬", "vegetables"),
    "order": 0
  },
  {
    "slug": "fruits",
    "name": "Фрукты",
    "emoji": "🍎",
    "productCount": 7,
    "image": stickerDataUrl("🍎", "fruits"),
    "order": 10
  },
  {
    "slug": "vegan",
    "name": "Веганские продукты",
    "emoji": "🥬",
    "productCount": 4,
    "image": stickerDataUrl("🥬", "vegan"),
    "order": 20
  },
  {
    "slug": "lactose-free",
    "name": "Без лактозы",
    "emoji": "🥛",
    "productCount": 4,
    "image": stickerDataUrl("🥛", "lactose-free"),
    "order": 30
  },
  {
    "slug": "meat",
    "name": "Мясо",
    "emoji": "🥩",
    "productCount": 6,
    "image": stickerDataUrl("🥩", "meat"),
    "order": 40
  },
  {
    "slug": "fish",
    "name": "Рыба",
    "emoji": "🐟",
    "productCount": 5,
    "image": stickerDataUrl("🐟", "fish"),
    "order": 50
  },
  {
    "slug": "dairy",
    "name": "Молочная продукция",
    "emoji": "🥛",
    "productCount": 6,
    "image": stickerDataUrl("🥛", "dairy"),
    "order": 60
  },
  {
    "slug": "bakery",
    "name": "Хлеб",
    "emoji": "🍞",
    "productCount": 5,
    "image": stickerDataUrl("🍞", "bakery"),
    "order": 70
  },
  {
    "slug": "cheese",
    "name": "Сыры",
    "emoji": "🧀",
    "productCount": 5,
    "image": stickerDataUrl("🧀", "cheese"),
    "order": 80
  },
  {
    "slug": "eggs",
    "name": "Яйца",
    "emoji": "🥚",
    "productCount": 4,
    "image": stickerDataUrl("🥚", "eggs"),
    "order": 90
  },
  {
    "slug": "grocery",
    "name": "Бакалея",
    "emoji": "🍝",
    "productCount": 6,
    "image": stickerDataUrl("🍝", "grocery"),
    "order": 100
  },
  {
    "slug": "drinks",
    "name": "Напитки",
    "emoji": "🥤",
    "productCount": 5,
    "image": stickerDataUrl("🥤", "drinks"),
    "order": 110
  },
  {
    "slug": "sweets",
    "name": "Сладости",
    "emoji": "🍬",
    "productCount": 4,
    "image": stickerDataUrl("🍬", "sweets"),
    "order": 120
  },
  {
    "slug": "frozen",
    "name": "Замороженные продукты",
    "emoji": "🍕",
    "productCount": 4,
    "image": stickerDataUrl("🍕", "frozen"),
    "order": 130
  },
  {
    "slug": "sauces",
    "name": "Соусы и специи",
    "emoji": "🧂",
    "productCount": 4,
    "image": stickerDataUrl("🧂", "sauces"),
    "order": 140
  },
  {
    "slug": "baby",
    "name": "Детские товары",
    "emoji": "🍼",
    "productCount": 4,
    "image": stickerDataUrl("🍼", "baby"),
    "order": 150
  },
  {
    "slug": "diapers",
    "name": "Памперсы",
    "emoji": "👶",
    "productCount": 4,
    "image": stickerDataUrl("👶", "diapers"),
    "order": 160
  },
  {
    "slug": "household-chem",
    "name": "Бытовая химия",
    "emoji": "🧴",
    "productCount": 4,
    "image": stickerDataUrl("🧴", "household-chem"),
    "order": 170
  },
  {
    "slug": "home",
    "name": "Товары для дома",
    "emoji": "🧻",
    "productCount": 4,
    "image": stickerDataUrl("🧻", "home"),
    "order": 180
  },
  {
    "slug": "pharmacy",
    "name": "Безрецептурные лекарства",
    "emoji": "💊",
    "productCount": 4,
    "image": stickerDataUrl("💊", "pharmacy"),
    "order": 190
  },
  {
    "slug": "beauty",
    "name": "Красота и уход",
    "emoji": "💄",
    "productCount": 4,
    "image": stickerDataUrl("💄", "beauty"),
    "order": 200
  },
  {
    "slug": "pets",
    "name": "Товары для животных",
    "emoji": "🐶",
    "productCount": 4,
    "image": stickerDataUrl("🐶", "pets"),
    "order": 210
  },
];
