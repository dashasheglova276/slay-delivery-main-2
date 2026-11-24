
/**
 * Стикер-плейсхолдер вместо случайного стокового фото. Пока админ не загрузил
 * реальные фотографии товара/рецепта/подборки, показываем аккуратную цветную
 * карточку с крупным эмодзи — в фирменной палитре, без сети и без "мусорных"
 * случайных изображений с лишних сервисов.
 */

const PALETTES: [string, string, string][] = [
  ["#F2FBE8", "#E3F7CD", "#578F2B"], // lime
  ["#FFEFF6", "#FFD9EA", "#E1418C"], // flash
  ["#EEF3EC", "#DCE9D8", "#3F5B34"], // cream/moss
  ["#FAFAFA", "#ECECEC", "#54545C"], // smoke
  ["#F2FBE8", "#FFEFF6", "#232327"] // lime→flash duo
];

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Ищет эмодзи категории по slug — используется как основной символ стикера товара. */
const CATEGORY_EMOJIS: Record<string, string> = {
  vegetables: "🥬",
  fruits: "🍎",
  vegan: "🥬",
  "lactose-free": "🥛",
  meat: "🥩",
  fish: "🐟",
  dairy: "🥛",
  bakery: "🍞",
  cheese: "🧀",
  eggs: "🥚",
  grocery: "🍝",
  drinks: "🥤",
  sweets: "🍬",
  frozen: "🍕",
  sauces: "🧂",
  baby: "🍼",
  diapers: "👶",
  "household-chem": "🧴",
  home: "🧻",
  pharmacy: "💊",
  beauty: "💄",
  pets: "🐶",
};

export function emojiForCategory(categorySlug: string): string {
  return CATEGORY_EMOJIS[categorySlug] ?? "🛒";
}

/**
 * Генерирует data-URI SVG-стикер: скругленная карточка фирменного цвета +
 * крупный эмодзи по центру + мягкое пятно-подсветка для глубины. Один и тот
 * же seed всегда даёт одну и ту же палитру (стабильно между рендерами).
 */
export function stickerDataUrl(emoji: string, seed: string, size = 480): string {
  const palette = PALETTES[hashSeed(seed) % PALETTES.length];
  const [bg1, bg2, accent] = palette;
  const r = Math.round(size * 0.12);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${bg1}"/>
<stop offset="1" stop-color="${bg2}"/>
</linearGradient>
</defs>
<rect width="${size}" height="${size}" rx="${r}" fill="url(#g)"/>
<circle cx="${size * 0.72}" cy="${size * 0.28}" r="${size * 0.32}" fill="${accent}" opacity="0.08"/>
<circle cx="${size * 0.22}" cy="${size * 0.78}" r="${size * 0.24}" fill="${accent}" opacity="0.07"/>
<text x="50%" y="54%" font-size="${size * 0.34}" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function productSticker(categorySlug: string, seed: string, size = 480): string {
  return stickerDataUrl(emojiForCategory(categorySlug), seed, size);
}

const RECIPE_EMOJI_BY_KEYWORD: [RegExp, string][] = [
  [/омлет|яичниц/i, "🍳"],
  [/салат/i, "🥗"],
  [/суп|борщ|щи/i, "🍲"],
  [/паста|макарон|спагетти/i, "🍝"],
  [/пицц/i, "🍕"],
  [/пирог|выпечк|торт|десерт|блин/i, "🥧"],
  [/рыб|лосос|сёмг/i, "🐟"],
  [/куриц|курин/i, "🍗"],
  [/мяс|стейк|шашлык/i, "🥩"],
  [/смузи|напиток/i, "🥤"],
  [/бутерброд|сэндвич|тост/i, "🥪"]
];

export function recipeSticker(title: string, seed: string, size = 480): string {
  const match = RECIPE_EMOJI_BY_KEYWORD.find(([re]) => re.test(title));
  return stickerDataUrl(match ? match[1] : "🍽️", seed, size);
}

/** Reads the centered emoji from a generated placeholder, so product tiles
 * can keep the original Main 2 photo treatment instead of nesting a sticker
 * card inside the product card. Uploaded photos pass through unchanged. */
export function emojiFromSticker(src: string): string | undefined {
  if (!src.startsWith("data:image/svg+xml,")) return undefined;
  try {
    const svg = decodeURIComponent(src.slice(src.indexOf(",") + 1));
    return svg.match(/<text\b[^>]*>(.*?)<\/text>/s)?.[1];
  } catch {
    return undefined;
  }
}
