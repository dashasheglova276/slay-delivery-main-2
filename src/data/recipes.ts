import { recipeSticker } from "@/lib/sticker";

export type RecipeDifficulty = "Легко" | "Средне" | "Сложно";

export interface RecipeIngredient {
  productId: string;
  name: string;
}

export interface Recipe {
  slug: string;
  title: string;
  image: string;
  cookTimeMinutes: number;
  difficulty: RecipeDifficulty;
  description: string;
  ingredients: RecipeIngredient[];
  steps: string[];
}

export const recipes: Recipe[] = [
  {
    slug: "omelette-tomato-cheese",
    title: "Омлет с помидорами и сыром",
    image: recipeSticker("Омлет с помидорами и сыром", "omelette-tomato-cheese"),
    cookTimeMinutes: 15,
    difficulty: "Легко",
    description: "Быстрый и сытный завтрак на каждый день — 15 минут, и всё готово.",
    ingredients: [
      { productId: "eggs-1", name: "Яйца куриные С1, 10 шт" },
      { productId: "dairy-1", name: "Молоко 3.2%" },
      { productId: "vegetables-2", name: "Помидоры розовые" },
      { productId: "cheese-1", name: "Сыр Российский" },
      { productId: "dairy-6", name: "Масло сливочное 82.5%" }
    ],
    steps: [
      "Взбейте яйца с молоком и щепоткой соли.",
      "Нарежьте помидоры и сыр небольшими кубиками.",
      "Разогрейте масло на сковороде, влейте яичную смесь.",
      "Через минуту добавьте помидоры и сыр, готовьте под крышкой 5–7 минут."
    ]
  },
  {
    slug: "shashlik-pork-neck",
    title: "Шашлык из свиной шеи",
    image: recipeSticker("Шашлык из свиной шеи", "shashlik-pork-neck"),
    cookTimeMinutes: 90,
    difficulty: "Средне",
    description: "Классика для дачи и пикника — маринуем и жарим на углях.",
    ingredients: [
      { productId: "meat-3", name: "Свиная шея" },
      { productId: "vegetables-5", name: "Лук репчатый" },
      { productId: "vegetables-6", name: "Перец болгарский микс" },
      { productId: "sauces-4", name: "Смесь специй для мяса" }
    ],
    steps: [
      "Нарежьте мясо крупными кусками, лук — кольцами.",
      "Смешайте мясо, лук и специи, оставьте мариноваться минимум час.",
      "Наденьте на шампуры, чередуя с перцем.",
      "Жарьте на углях 20–25 минут, периодически поворачивая."
    ]
  },
  {
    slug: "shrimp-pasta",
    title: "Паста с креветками",
    image: recipeSticker("Паста с креветками", "shrimp-pasta"),
    cookTimeMinutes: 25,
    difficulty: "Средне",
    description: "Ресторанное блюдо дома — нежные креветки и сливочный пармезан.",
    ingredients: [
      { productId: "grocery-1", name: "Макароны спагетти" },
      { productId: "fish-2", name: "Креветки тигровые" },
      { productId: "cheese-3", name: "Сыр Пармезан" },
      { productId: "dairy-6", name: "Масло сливочное 82.5%" },
      { productId: "vegetables-6", name: "Перец болгарский микс" }
    ],
    steps: [
      "Отварите спагетти до состояния аль-денте.",
      "Обжарьте креветки на масле по 2 минуты с каждой стороны.",
      "Добавьте перец, затем пасту и немного воды от варки.",
      "Снимите с огня, посыпьте тёртым пармезаном и перемешайте."
    ]
  },
  {
    slug: "greek-salad",
    title: "Греческий салат",
    image: recipeSticker("Греческий салат", "greek-salad"),
    cookTimeMinutes: 15,
    difficulty: "Легко",
    description: "Свежий летний салат с фетой — часть здорового рациона.",
    ingredients: [
      { productId: "vegetables-2", name: "Помидоры розовые" },
      { productId: "vegetables-1", name: "Огурцы" },
      { productId: "vegetables-6", name: "Перец болгарский микс" },
      { productId: "vegetables-5", name: "Лук репчатый" },
      { productId: "cheese-5", name: "Сыр Фета" }
    ],
    steps: [
      "Нарежьте овощи крупными кубиками, лук — тонкими полукольцами.",
      "Добавьте кубики феты.",
      "Заправьте оливковым маслом и щепоткой соли перед подачей."
    ]
  },
  {
    slug: "baked-chicken-thighs",
    title: "Куриные бёдра в духовке",
    image: recipeSticker("Куриные бёдра в духовке", "baked-chicken-thighs"),
    cookTimeMinutes: 50,
    difficulty: "Легко",
    description: "Простой ужин на всю семью — минимум действий, максимум вкуса.",
    ingredients: [
      { productId: "meat-4", name: "Куриные бёдра" },
      { productId: "vegetables-3", name: "Картофель молодой" },
      { productId: "vegetables-4", name: "Морковь мытая" },
      { productId: "sauces-4", name: "Смесь специй для мяса" }
    ],
    steps: [
      "Разогрейте духовку до 200°C.",
      "Натрите бёдра специями, разложите на противне с овощами.",
      "Готовьте 40–45 минут до золотистой корочки."
    ]
  },
  {
    slug: "cottage-cheese-casserole",
    title: "Творожная запеканка",
    image: recipeSticker("Творожная запеканка", "cottage-cheese-casserole"),
    cookTimeMinutes: 45,
    difficulty: "Легко",
    description: "Нежный десерт к чаю — почти как в детском саду, но лучше.",
    ingredients: [
      { productId: "dairy-3", name: "Творог 5%" },
      { productId: "eggs-1", name: "Яйца куриные С1, 10 шт" },
      { productId: "grocery-6", name: "Сахар белый" },
      { productId: "dairy-4", name: "Сметана 20%" }
    ],
    steps: [
      "Смешайте творог, яйца и сахар до однородности.",
      "Переложите в форму, смазанную маслом.",
      "Смажьте сметаной сверху и выпекайте 35–40 минут при 180°C."
    ]
  }
];

export function getRecipeBySlug(slug: string) {
  return recipes.find((r) => r.slug === slug);
}
