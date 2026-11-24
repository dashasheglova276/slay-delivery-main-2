import type { AdminOrder } from "@/types";

export const mockOrders: Omit<AdminOrder, "discount" | "promoDiscount" | "promoCode">[] = [
  {
    "id": "SLAY-100000",
    "createdAt": "2026-07-01T10:00:00.000Z",
    "customerName": "Игорь Смирнов",
    "customerPhone": "+7 956 696-17-74",
    "address": "б-р Пушкина, 21",
    "comment": "Позвонить за 5 минут до приезда",
    "items": [
      {
        "productId": "meat-6",
        "name": "Индейка филе",
        "quantity": 1,
        "price": 519,
        "image": "https://picsum.photos/seed/meat5/640/640"
      },
      {
        "productId": "grocery-6",
        "name": "Сахар белый",
        "quantity": 1,
        "price": 75,
        "image": "https://picsum.photos/seed/grocery5/640/640"
      },
      {
        "productId": "home-4",
        "name": "Мешки для мусора 35л",
        "quantity": 3,
        "price": 129,
        "image": "https://picsum.photos/seed/home3/640/640"
      }
    ],
    "subtotal": 981,
    "deliveryFee": 199,
    "total": 1180,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "new",
    "courierId": null
  },
  {
    "id": "SLAY-100137",
    "createdAt": "2026-07-02T11:07:00.000Z",
    "customerName": "Дмитрий Волков",
    "customerPhone": "+7 990 742-84-17",
    "address": "ул. Тверская, 14",
    "comment": "Позвонить за 5 минут до приезда",
    "items": [
      {
        "productId": "fruits-2",
        "name": "Бананы",
        "quantity": 2,
        "price": 99,
        "image": "https://picsum.photos/seed/fruits1/640/640"
      },
      {
        "productId": "dairy-6",
        "name": "Масло сливочное 82.5%",
        "quantity": 1,
        "price": 219,
        "image": "https://picsum.photos/seed/dairy5/640/640"
      },
      {
        "productId": "fruits-5",
        "name": "Груши Конференц",
        "quantity": 3,
        "price": 179,
        "image": "https://picsum.photos/seed/fruits4/640/640"
      },
      {
        "productId": "baby-3",
        "name": "Каша безмолочная гречневая",
        "quantity": 1,
        "price": 219,
        "image": "https://picsum.photos/seed/baby2/640/640"
      }
    ],
    "subtotal": 1173,
    "deliveryFee": 199,
    "total": 1372,
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "status": "accepted",
    "courierId": "courier-2"
  },
  {
    "id": "SLAY-100274",
    "createdAt": "2026-07-03T12:14:00.000Z",
    "customerName": "Елена Соколова",
    "customerPhone": "+7 963 247-79-25",
    "address": "ул. Гагарина, 67, кв. 102",
    "comment": "",
    "items": [
      {
        "productId": "baby-4",
        "name": "Печенье детское",
        "quantity": 1,
        "price": 119,
        "image": "https://picsum.photos/seed/baby3/640/640"
      }
    ],
    "subtotal": 119,
    "deliveryFee": 199,
    "total": 318,
    "paymentMethod": "online",
    "paymentStatus": "pending",
    "status": "accepted",
    "courierId": "courier-3"
  },
  {
    "id": "SLAY-100411",
    "createdAt": "2026-07-04T13:21:00.000Z",
    "customerName": "Дмитрий Волков",
    "customerPhone": "+7 957 199-80-18",
    "address": "ул. Ленина, 12",
    "comment": "",
    "items": [
      {
        "productId": "fruits-7",
        "name": "Лимоны",
        "quantity": 3,
        "price": 159,
        "image": "https://picsum.photos/seed/fruits6/640/640"
      },
      {
        "productId": "diapers-3",
        "name": "Влажные салфетки, 72 шт",
        "quantity": 3,
        "price": 149,
        "image": "https://picsum.photos/seed/diapers2/640/640"
      }
    ],
    "subtotal": 924,
    "deliveryFee": 199,
    "total": 1123,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "in_transit",
    "courierId": "courier-4"
  },
  {
    "id": "SLAY-100548",
    "createdAt": "2026-07-05T14:28:00.000Z",
    "customerName": "Дмитрий Волков",
    "customerPhone": "+7 920 688-48-77",
    "address": "ул. Кирова, 5, кв. 34",
    "comment": "",
    "items": [
      {
        "productId": "drinks-4",
        "name": "Кофе в зёрнах",
        "quantity": 2,
        "price": 599,
        "image": "https://picsum.photos/seed/drinks3/640/640"
      },
      {
        "productId": "cheese-5",
        "name": "Сыр Фета",
        "quantity": 2,
        "price": 349,
        "image": "https://picsum.photos/seed/cheese4/640/640"
      },
      {
        "productId": "sweets-4",
        "name": "Зефир в шоколаде",
        "quantity": 1,
        "price": 179,
        "image": "https://picsum.photos/seed/sweets3/640/640"
      },
      {
        "productId": "diapers-3",
        "name": "Влажные салфетки, 72 шт",
        "quantity": 1,
        "price": 149,
        "image": "https://picsum.photos/seed/diapers2/640/640"
      },
      {
        "productId": "sweets-3",
        "name": "Мармелад фруктовый",
        "quantity": 3,
        "price": 149,
        "image": "https://picsum.photos/seed/sweets2/640/640"
      }
    ],
    "subtotal": 2671,
    "deliveryFee": 0,
    "total": 2671,
    "paymentMethod": "online",
    "paymentStatus": "pending",
    "status": "delivered",
    "courierId": "courier-1"
  },
  {
    "id": "SLAY-100685",
    "createdAt": "2026-07-06T15:35:00.000Z",
    "customerName": "Мария Кузнецова",
    "customerPhone": "+7 972 531-15-95",
    "address": "пр. Мира, 45, кв. 8",
    "comment": "",
    "items": [
      {
        "productId": "cheese-1",
        "name": "Сыр Российский",
        "quantity": 3,
        "price": 459,
        "image": "https://picsum.photos/seed/cheese0/640/640"
      },
      {
        "productId": "household-chem-2",
        "name": "Средство для мытья посуды",
        "quantity": 2,
        "price": 149,
        "image": "https://picsum.photos/seed/household-chem1/640/640"
      },
      {
        "productId": "fruits-3",
        "name": "Апельсины",
        "quantity": 1,
        "price": 139,
        "image": "https://picsum.photos/seed/fruits2/640/640"
      },
      {
        "productId": "meat-2",
        "name": "Фарш говяжий",
        "quantity": 2,
        "price": 459,
        "image": "https://picsum.photos/seed/meat1/640/640"
      }
    ],
    "subtotal": 2732,
    "deliveryFee": 0,
    "total": 2732,
    "paymentMethod": "online",
    "paymentStatus": "pending",
    "status": "delivered",
    "courierId": "courier-2"
  },
  {
    "id": "SLAY-100822",
    "createdAt": "2026-07-07T16:42:00.000Z",
    "customerName": "Павел Новиков",
    "customerPhone": "+7 918 960-21-44",
    "address": "ул. Кирова, 5, кв. 34",
    "comment": "",
    "items": [
      {
        "productId": "eggs-3",
        "name": "Яйца перепелиные, 20 шт",
        "quantity": 3,
        "price": 129,
        "image": "https://picsum.photos/seed/eggs2/640/640"
      },
      {
        "productId": "beauty-1",
        "name": "Шампунь увлажняющий",
        "quantity": 2,
        "price": 299,
        "image": "https://picsum.photos/seed/beauty0/640/640"
      },
      {
        "productId": "eggs-4",
        "name": "Яйца деревенские, 6 шт",
        "quantity": 3,
        "price": 99,
        "image": "https://picsum.photos/seed/eggs3/640/640"
      }
    ],
    "subtotal": 1282,
    "deliveryFee": 199,
    "total": 1481,
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "status": "cancelled",
    "courierId": "courier-3"
  },
  {
    "id": "SLAY-100959",
    "createdAt": "2026-07-08T17:49:00.000Z",
    "customerName": "Елена Соколова",
    "customerPhone": "+7 992 691-97-67",
    "address": "ул. Гагарина, 67, кв. 102",
    "comment": "",
    "items": [
      {
        "productId": "pets-2",
        "name": "Корм для кошек влажный",
        "quantity": 3,
        "price": 89,
        "image": "https://picsum.photos/seed/pets1/640/640"
      }
    ],
    "subtotal": 267,
    "deliveryFee": 199,
    "total": 466,
    "paymentMethod": "online",
    "paymentStatus": "pending",
    "status": "accepted",
    "courierId": "courier-4"
  },
  {
    "id": "SLAY-101096",
    "createdAt": "2026-07-09T18:56:00.000Z",
    "customerName": "Павел Новиков",
    "customerPhone": "+7 917 323-46-26",
    "address": "б-р Пушкина, 21",
    "comment": "",
    "items": [
      {
        "productId": "vegetables-3",
        "name": "Картофель молодой",
        "quantity": 1,
        "price": 69,
        "image": "https://picsum.photos/seed/vegetables2/640/640"
      },
      {
        "productId": "sweets-4",
        "name": "Зефир в шоколаде",
        "quantity": 3,
        "price": 179,
        "image": "https://picsum.photos/seed/sweets3/640/640"
      },
      {
        "productId": "grocery-1",
        "name": "Макароны спагетти",
        "quantity": 1,
        "price": 89,
        "image": "https://picsum.photos/seed/grocery0/640/640"
      }
    ],
    "subtotal": 695,
    "deliveryFee": 199,
    "total": 894,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "accepted",
    "courierId": "courier-1"
  },
  {
    "id": "SLAY-101233",
    "createdAt": "2026-07-10T19:03:00.000Z",
    "customerName": "Ольга Морозова",
    "customerPhone": "+7 980 384-27-65",
    "address": "ул. Гагарина, 67, кв. 102",
    "comment": "",
    "items": [
      {
        "productId": "fish-2",
        "name": "Креветки тигровые",
        "quantity": 2,
        "price": 799,
        "image": "https://picsum.photos/seed/fish1/640/640"
      }
    ],
    "subtotal": 1598,
    "deliveryFee": 0,
    "total": 1598,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "in_transit",
    "courierId": "courier-2"
  },
  {
    "id": "SLAY-101370",
    "createdAt": "2026-07-11T10:10:00.000Z",
    "customerName": "Анна Петрова",
    "customerPhone": "+7 972 951-85-33",
    "address": "ул. Гагарина, 67, кв. 102",
    "comment": "Позвонить за 5 минут до приезда",
    "items": [
      {
        "productId": "dairy-5",
        "name": "Кефир 1%",
        "quantity": 1,
        "price": 75,
        "image": "https://picsum.photos/seed/dairy4/640/640"
      },
      {
        "productId": "meat-6",
        "name": "Индейка филе",
        "quantity": 1,
        "price": 519,
        "image": "https://picsum.photos/seed/meat5/640/640"
      },
      {
        "productId": "fruits-4",
        "name": "Виноград Кишмиш",
        "quantity": 3,
        "price": 249,
        "image": "https://picsum.photos/seed/fruits3/640/640"
      },
      {
        "productId": "fish-3",
        "name": "Форель филе",
        "quantity": 1,
        "price": 649,
        "image": "https://picsum.photos/seed/fish2/640/640"
      }
    ],
    "subtotal": 1990,
    "deliveryFee": 0,
    "total": 1990,
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "status": "delivered",
    "courierId": "courier-3"
  },
  {
    "id": "SLAY-101507",
    "createdAt": "2026-07-12T11:17:00.000Z",
    "customerName": "Андрей Козлов",
    "customerPhone": "+7 993 792-16-68",
    "address": "ул. Тверская, 14",
    "comment": "",
    "items": [
      {
        "productId": "baby-1",
        "name": "Пюре яблочное детское",
        "quantity": 2,
        "price": 59,
        "image": "https://picsum.photos/seed/baby0/640/640"
      },
      {
        "productId": "grocery-3",
        "name": "Гречка ядрица",
        "quantity": 1,
        "price": 109,
        "image": "https://picsum.photos/seed/grocery2/640/640"
      },
      {
        "productId": "household-chem-3",
        "name": "Кондиционер для белья",
        "quantity": 3,
        "price": 259,
        "image": "https://picsum.photos/seed/household-chem2/640/640"
      },
      {
        "productId": "diapers-1",
        "name": "Подгузники размер 3, 44 шт",
        "quantity": 3,
        "price": 799,
        "image": "https://picsum.photos/seed/diapers0/640/640"
      }
    ],
    "subtotal": 3401,
    "deliveryFee": 0,
    "total": 3401,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "delivered",
    "courierId": "courier-4"
  },
  {
    "id": "SLAY-101644",
    "createdAt": "2026-07-13T12:24:00.000Z",
    "customerName": "Ольга Морозова",
    "customerPhone": "+7 917 295-18-36",
    "address": "ул. Кирова, 5, кв. 34",
    "comment": "Позвонить за 5 минут до приезда",
    "items": [
      {
        "productId": "frozen-2",
        "name": "Овощная смесь",
        "quantity": 3,
        "price": 129,
        "image": "https://picsum.photos/seed/frozen1/640/640"
      }
    ],
    "subtotal": 387,
    "deliveryFee": 199,
    "total": 586,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "new",
    "courierId": null
  },
  {
    "id": "SLAY-101781",
    "createdAt": "2026-07-14T13:31:00.000Z",
    "customerName": "Игорь Смирнов",
    "customerPhone": "+7 936 728-58-29",
    "address": "ул. Гагарина, 67, кв. 102",
    "comment": "",
    "items": [
      {
        "productId": "vegetables-7",
        "name": "Капуста белокочанная",
        "quantity": 3,
        "price": 45,
        "image": "https://picsum.photos/seed/vegetables6/640/640"
      },
      {
        "productId": "fruits-7",
        "name": "Лимоны",
        "quantity": 1,
        "price": 159,
        "image": "https://picsum.photos/seed/fruits6/640/640"
      },
      {
        "productId": "vegetables-1",
        "name": "Огурцы",
        "quantity": 2,
        "price": 90,
        "image": "https://picsum.photos/seed/vegetables0/640/640"
      },
      {
        "productId": "diapers-1",
        "name": "Подгузники размер 3, 44 шт",
        "quantity": 3,
        "price": 799,
        "image": "https://picsum.photos/seed/diapers0/640/640"
      },
      {
        "productId": "meat-6",
        "name": "Индейка филе",
        "quantity": 1,
        "price": 519,
        "image": "https://picsum.photos/seed/meat5/640/640"
      }
    ],
    "subtotal": 3390,
    "deliveryFee": 0,
    "total": 3390,
    "paymentMethod": "online",
    "paymentStatus": "pending",
    "status": "cancelled",
    "courierId": "courier-2"
  },
  {
    "id": "SLAY-101918",
    "createdAt": "2026-07-15T14:38:00.000Z",
    "customerName": "Павел Новиков",
    "customerPhone": "+7 949 187-28-23",
    "address": "пр. Победы, 9",
    "comment": "",
    "items": [
      {
        "productId": "frozen-1",
        "name": "Пицца Пепперони",
        "quantity": 2,
        "price": 349,
        "image": "https://picsum.photos/seed/frozen0/640/640"
      },
      {
        "productId": "meat-2",
        "name": "Фарш говяжий",
        "quantity": 2,
        "price": 459,
        "image": "https://picsum.photos/seed/meat1/640/640"
      },
      {
        "productId": "meat-1",
        "name": "Куриное филе",
        "quantity": 2,
        "price": 349,
        "image": "https://picsum.photos/seed/meat0/640/640"
      }
    ],
    "subtotal": 2314,
    "deliveryFee": 0,
    "total": 2314,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "accepted",
    "courierId": "courier-3"
  },
  {
    "id": "SLAY-102055",
    "createdAt": "2026-07-16T15:45:00.000Z",
    "customerName": "Сергей Иванов",
    "customerPhone": "+7 928 806-79-13",
    "address": "ул. Гагарина, 67, кв. 102",
    "comment": "",
    "items": [
      {
        "productId": "sauces-3",
        "name": "Соевый соус",
        "quantity": 1,
        "price": 129,
        "image": "https://picsum.photos/seed/sauces2/640/640"
      },
      {
        "productId": "vegetables-3",
        "name": "Картофель молодой",
        "quantity": 3,
        "price": 69,
        "image": "https://picsum.photos/seed/vegetables2/640/640"
      }
    ],
    "subtotal": 336,
    "deliveryFee": 199,
    "total": 535,
    "paymentMethod": "cash",
    "paymentStatus": "pending",
    "status": "in_transit",
    "courierId": "courier-4"
  },
  {
    "id": "SLAY-102192",
    "createdAt": "2026-07-17T16:52:00.000Z",
    "customerName": "Татьяна Лебедева",
    "customerPhone": "+7 974 437-91-38",
    "address": "б-р Пушкина, 21",
    "comment": "",
    "items": [
      {
        "productId": "sauces-3",
        "name": "Соевый соус",
        "quantity": 2,
        "price": 129,
        "image": "https://picsum.photos/seed/sauces2/640/640"
      },
      {
        "productId": "grocery-2",
        "name": "Рис басмати",
        "quantity": 1,
        "price": 199,
        "image": "https://picsum.photos/seed/grocery1/640/640"
      },
      {
        "productId": "fish-2",
        "name": "Креветки тигровые",
        "quantity": 3,
        "price": 799,
        "image": "https://picsum.photos/seed/fish1/640/640"
      }
    ],
    "subtotal": 2854,
    "deliveryFee": 0,
    "total": 2854,
    "paymentMethod": "card",
    "paymentStatus": "pending",
    "status": "delivered",
    "courierId": "courier-1"
  },
  {
    "id": "SLAY-102329",
    "createdAt": "2026-07-18T17:59:00.000Z",
    "customerName": "Максим Захаров",
    "customerPhone": "+7 913 128-45-70",
    "address": "ул. Гагарина, 67, кв. 102",
    "comment": "Позвонить за 5 минут до приезда",
    "items": [
      {
        "productId": "dairy-1",
        "name": "Молоко 3.2%",
        "quantity": 2,
        "price": 89,
        "image": "https://picsum.photos/seed/dairy0/640/640"
      },
      {
        "productId": "sauces-3",
        "name": "Соевый соус",
        "quantity": 2,
        "price": 129,
        "image": "https://picsum.photos/seed/sauces2/640/640"
      }
    ],
    "subtotal": 436,
    "deliveryFee": 199,
    "total": 635,
    "paymentMethod": "online",
    "paymentStatus": "pending",
    "status": "delivered",
    "courierId": "courier-2"
  }
];
