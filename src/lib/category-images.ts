/**
 * Ключевые слова для подбора реальных тематических фотографий (loremflickr)
 * по каждой категории каталога. Используется в карточках каталога, hero и
 * подборках, чтобы не показывать случайные, не связанные с продуктами кадры.
 */
export const categoryPhotoTag: Record<string, string> = {
  vegetables: "vegetables,fresh",
  fruits: "fruits,fresh",
  meat: "meat,butcher",
  fish: "fish,seafood",
  dairy: "milk,dairy",
  bakery: "bread,bakery",
  cheese: "cheese",
  eggs: "eggs,carton",
  grocery: "pasta,grocery",
  drinks: "beverage,juice",
  sweets: "candy,sweets",
  frozen: "frozenfood",
  sauces: "sauce,spices",
  baby: "babyfood",
  diapers: "diapers,babycare",
  "household-chem": "cleaning,detergent",
  home: "household,homegoods",
  pharmacy: "pharmacy,medicine",
  beauty: "cosmetics,skincare",
  pets: "petfood,pets",
  vegan: "vegan,plantbased",
  "lactose-free": "milk,almondmilk"
};

export function categoryImageUrl(slug: string, w = 480, h = 240, lock = 1) {
  const tag = categoryPhotoTag[slug] ?? "grocery";
  return `https://loremflickr.com/${w}/${h}/${tag}/all?lock=${lock}`;
}
