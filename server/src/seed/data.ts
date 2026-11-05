import type {
  Brand,
  Deal,
  HomeSection,
  Post,
  Promo,
  Review,
  StoreConfig,
} from "@food_app/shared";

export const U = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

/**
 * [id, name, category, price, rating, reviews, prep mins, kcal, Unsplash id, tag,
 * description]
 */
export const MENU_ROWS: [
  string,
  string,
  string,
  number,
  number,
  number,
  number,
  number,
  string,
  string,
  string,
][] = [
  [
    "marg",
    "Margherita Classica",
    "Pizza",
    12.5,
    4.8,
    412,
    18,
    780,
    "1574071318508-1cdbab80d002",
    "Bestseller",
    "San Marzano tomato, fior di latte, torn basil and olive oil on our 48-hour fermented, wood-fired crust.",
  ],
  [
    "pep",
    "Hot Honey Pepperoni",
    "Pizza",
    14.5,
    4.9,
    538,
    20,
    920,
    "1628840042765-356cda07504e",
    "Spicy",
    "Cup-and-char pepperoni, mozzarella and a finishing drizzle of chili-infused wildflower honey.",
  ],
  [
    "funghi",
    "Truffle Funghi",
    "Pizza",
    15.5,
    4.7,
    286,
    22,
    860,
    "1565299624946-b28f40a0ae38",
    "New",
    "Roasted wild mushrooms, taleggio, thyme and black truffle oil on a white garlic base.",
  ],
  [
    "brisket",
    "Smoked Brisket Burger",
    "Burgers",
    15.5,
    4.9,
    367,
    20,
    1040,
    "1553979459-d2229ba7433b",
    "Bestseller",
    "Twelve-hour smoked brisket, aged cheddar, pickled onion and smoky mayo in a toasted brioche bun.",
  ],
  [
    "smash",
    "Double Smash",
    "Burgers",
    13.5,
    4.8,
    451,
    14,
    980,
    "1586190848861-99aa4a171e90",
    "",
    "Two crispy-edged beef patties, American cheese, house pickles and Ember sauce.",
  ],
  [
    "chick",
    "Ember Classic Burger",
    "Burgers",
    12,
    4.6,
    198,
    15,
    890,
    "1571091718767-18b5b1457add",
    "",
    "Dry-aged beef, cheddar, butter lettuce, tomato and house sauce on a sesame bun.",
  ],
  [
    "carb",
    "Spaghetti Carbonara",
    "Pasta",
    13,
    4.7,
    240,
    14,
    720,
    "1612874742237-6526221588e3",
    "",
    "Bronze-cut spaghetti, crisp guanciale, egg yolk, pecorino and plenty of black pepper.",
  ],
  [
    "lasagne",
    "Wood-Oven Lasagne",
    "Pasta",
    14,
    4.8,
    322,
    18,
    910,
    "1574894709920-11b28e7367e3",
    "",
    "Slow-cooked beef ragù, béchamel and parmigiano, baked until the edges crackle.",
  ],
  [
    "risotto",
    "Prawn & Salmon Risotto",
    "Pasta",
    16.5,
    4.6,
    141,
    20,
    690,
    "1476124369491-e7addf5db371",
    "New",
    "Creamy carnaroli with seared salmon, tiger prawns, lemon and dill.",
  ],
  [
    "handi",
    "Chicken Handi Bowl",
    "Bowls",
    13.5,
    4.8,
    276,
    17,
    840,
    "1603894584373-5ac82b2ae398",
    "",
    "Charred chicken in a rich, creamy tomato-spice sauce over saffron rice.",
  ],
  [
    "biryani",
    "Lamb Biryani",
    "Bowls",
    14.5,
    4.7,
    189,
    22,
    790,
    "1563379091339-03b21ab4a4f8",
    "",
    "Fragrant basmati layered with slow-spiced lamb, fried onion and fresh mint.",
  ],
  [
    "ramen",
    "Ember Ramen",
    "Bowls",
    13,
    4.8,
    233,
    15,
    650,
    "1569718212165-3a8278d5f624",
    "New",
    "Rich chicken broth, springy noodles, jammy egg and charred spring onion.",
  ],
  [
    "wings",
    "Crispy Chicken Wings",
    "Sides",
    9.5,
    4.7,
    402,
    12,
    620,
    "1567620832903-9fc6debc209f",
    "",
    "Double-fried wings tossed in hot honey or garlic-parmesan.",
  ],
  [
    "fries",
    "Truffle Parmesan Fries",
    "Sides",
    6.5,
    4.7,
    288,
    10,
    480,
    "1573080496219-bb080dd4f877",
    "",
    "Hand-cut fries tossed in truffle oil, parmesan and parsley. Served with aioli.",
  ],
  [
    "cheesecake",
    "Blueberry Cheesecake",
    "Desserts",
    7.5,
    4.9,
    301,
    5,
    520,
    "1567171466295-4afa63d45416",
    "",
    "Dense, creamy New York cheesecake with a wild blueberry topping. Baked every morning.",
  ],
  [
    "gateau",
    "Chocolate Gateau",
    "Desserts",
    8,
    4.8,
    233,
    5,
    610,
    "1578985545062-69928b1d9587",
    "",
    "Layers of dark-chocolate sponge and ganache with vanilla cream.",
  ],
];

export const BRAND_OF: Record<string, string> = {
  marg: "fire",
  pep: "fire",
  funghi: "fire",
  brisket: "smash",
  smash: "smash",
  chick: "smash",
  wings: "smash",
  fries: "smash",
  carb: "nonna",
  lasagne: "nonna",
  risotto: "nonna",
  handi: "spice",
  biryani: "spice",
  ramen: "spice",
  cheesecake: "sugar",
  gateau: "sugar",
};

export const CATS = [
  "Pizza",
  "Burgers",
  "Pasta",
  "Bowls",
  "Sides",
  "Desserts",
];

export const BRANDS: Omit<Brand, "order">[] = [
  {
    id: "fire",
    name: "Ember Pizza Co.",
    tag: "Wood-fired Neapolitan",
    icon: "local_pizza",
    img: U("1579751626657-72bc17010498", 700),
    on: true,
  },
  {
    id: "smash",
    name: "Smash Lab",
    tag: "Burgers, wings & fries",
    icon: "lunch_dining",
    img: U("1568901346375-23c9450c58cd", 700),
    on: true,
  },
  {
    id: "nonna",
    name: "Nonna's Table",
    tag: "Fresh pasta, slow sauces",
    icon: "dinner_dining",
    img: U("1621996346565-e3dbc646d9a9", 700),
    on: true,
  },
  {
    id: "spice",
    name: "Spice Route",
    tag: "Curries, biryani & ramen",
    icon: "ramen_dining",
    img: U("1565557623262-b51c2513a641", 700),
    on: true,
  },
  {
    id: "sugar",
    name: "Sugar & Smoke",
    tag: "Cakes baked every morning",
    icon: "cake",
    img: U("1606313564200-e75d5e30476c", 700),
    on: true,
  },
];

export const SECS: HomeSection[] = (
  [
    ["hero", "Promo banners", "view_carousel"],
    ["cats", "Categories", "category"],
    ["deal", "Deal of the day", "bolt"],
    ["brands", "Our kitchens", "storefront"],
    ["popular", "Popular tonight", "local_fire_department"],
    ["again", "Order again", "replay"],
    ["reserve", "Book a table", "event_seat"],
    ["rated", "Top rated", "star"],
    ["journal", "From the journal", "auto_stories"],
  ] as const
).map(([k, l, icon]) => ({ k, l, icon, on: true }));

/** Story covers - also the cover choices in the restaurant console. */
export const COVERS = [
  "1579751626657-72bc17010498",
  "1621996346565-e3dbc646d9a9",
  "1563379091339-03b21ab4a4f8",
  "1504674900247-0877df9cc836",
  "1553979459-d2229ba7433b",
  "1414235077428-338989a2e8c0",
  "1567171466295-4afa63d45416",
  "1590947132387-155cc02f3212",
].map((id) => U(id, 1000));

export const POSTS: Post[] = [
  {
    id: "p1",
    title: "The 48-hour dough behind every Ember pizza",
    cat: "Behind the pass",
    img: COVERS[0],
    author: "Chef Lena Ortiz",
    date: "Oct 10",
    mins: 4,
    featured: true,
    on: true,
    dish: "marg",
    likes: 214,
    excerpt:
      "Why we let our dough rest for two days, and what it does to the crust.",
    body: "Every pizza that leaves our oven started two days earlier. We mix a wet dough with just flour, water, salt and a pinch of yeast, then let it rest cold for 48 hours.\n\nThat long, slow ferment is where the flavour comes from. The yeast has time to break down starches into sugars, which caramelise in the 480°C oven and give the crust its leopard-spotted char.\n\nIt also makes the dough easier to digest and lighter to eat. Most guests tell us they can finish a whole 12-inch pie and still order dessert. We think that's the best review there is.",
  },
  {
    id: "p2",
    title: "How we smash a burger (and why the edges matter)",
    cat: "Recipes",
    img: COVERS[1],
    author: "Theo Park",
    date: "Oct 7",
    mins: 3,
    featured: false,
    on: true,
    dish: "smash",
    likes: 168,
    excerpt:
      "A ripping-hot plancha, a heavy press and ten seconds of patience.",
    body: "A smash burger lives or dies by its crust. We start with an 80/20 blend, rolled into loose balls and kept cold until the last second.\n\nThe plancha runs at 260°C. Ball down, parchment on, press hard for ten seconds and don't touch it again until the edges go lacy and brown.\n\nFlip, cheese, stack. The whole thing takes under two minutes, which is why it's always one of the fastest dishes on the menu.",
  },
  {
    id: "p3",
    title: "Five pasta shapes and the sauces they were made for",
    cat: "Guides",
    img: COVERS[2],
    author: "Chef Lena Ortiz",
    date: "Oct 2",
    mins: 5,
    featured: false,
    on: true,
    dish: "carb",
    likes: 131,
    excerpt:
      "Ridges, tubes and ribbons each grip sauce differently. Here's our cheat sheet.",
    body: "Long, thin shapes like spaghetti want silky, emulsified sauces. Think carbonara or cacio e pepe, where the sauce coats rather than pools.\n\nTubes like rigatoni catch chunky ragù inside and on their ridges. Ribbons like pappardelle are built for slow-braised meat.\n\nNext time you order, try matching the shape to the sauce. You'll taste the difference.",
  },
  {
    id: "p4",
    title: "Patio season: our chef's counter is open",
    cat: "News",
    img: COVERS[3],
    author: "Ember Team",
    date: "Sep 28",
    mins: 2,
    featured: false,
    on: true,
    dish: null,
    likes: 97,
    excerpt:
      "Eight seats facing the oven, a rotating tasting menu and first look at new dishes.",
    body: "We've opened eight seats right at the pass. Guests at the chef's counter see every pizza go into the oven and get first taste of dishes we're still testing.\n\nBook it from the app under Book a table and choose Chef's counter. Seats open daily from 5:30 PM.",
  },
  {
    id: "p5",
    title: "A slow Sunday: braising lamb for biryani",
    cat: "Recipes",
    img: COVERS[4],
    author: "Arjun Mehta",
    date: "Sep 21",
    mins: 6,
    featured: false,
    on: false,
    dish: "biryani",
    likes: 0,
    excerpt:
      "Our Spice Route head cook walks through his family's Sunday ritual.",
    body: "Draft in progress.",
  },
];

export const HERO: {
  eb: string;
  title: string;
  cta: string;
  img: string;
  cat?: string;
  dish?: string;
}[] = [
  {
    eb: "Fresh from the oven",
    title: "Fired at 480°C, ready in 18",
    cta: "Order pizza",
    cat: "Pizza",
    img: U("1579751626657-72bc17010498", 1100),
  },
  {
    eb: "New on the menu",
    title: "Truffle Funghi is here",
    cta: "Try it",
    dish: "funghi",
    img: U("1565299624946-b28f40a0ae38", 1100),
  },
  {
    eb: "Sweet finish",
    title: "Desserts baked every morning",
    cta: "See desserts",
    cat: "Desserts",
    img: U("1565958011703-44f9829ba187", 1100),
  },
  {
    eb: "Weeknight deal",
    title: "15% off Mon-Thu with WEEKNIGHT15",
    cta: "Order now",
    cat: "All",
    img: U("1540189549336-e6e99c3679fe", 1100),
  },
];

/**
 * App artwork (onboarding, sign-in, reservations) - copied to ImageKit; the app
 * uses those URLs.
 */
export type OnboardingSlide = {
  img: string;
  eb: string;
  t: string;
  t2?: string;
  sub: string;
};

export const OB: OnboardingSlide[] = [
  {
    img: U("1579751626657-72bc17010498", 1200),
    eb: "Wood-fired kitchen",
    t: "Fired hot.",
    t2: "Delivered fast.",
    sub: "Pizzas, smash burgers and fresh pasta from the Ember oven to your door.",
  },
  {
    img: U("1586190848861-99aa4a171e90", 1200),
    eb: "Made to order",
    t: "Your way.",
    t2: "Every time.",
    sub: "Pick your size and extras. Every dish is fired the moment you order.",
  },
  {
    img: U("1617347454431-f49d7ff5c3b0", 1200),
    eb: "Live tracking",
    t: "Oven to",
    t2: "your door",
    sub: "Follow your order from the kitchen to your doorstep, minute by minute.",
  },
];

export const AUTH_IMG = {
  login: U("1504674900247-0877df9cc836", 1100),
  register: U("1546069901-ba9599a7e63c", 1100),
  forgot: U("1567620905732-2d1ec7ab7445", 1100),
};

export const RESERVE_IMG = U("1414235077428-338989a2e8c0", 1100);

export const SEATS: {
  l: string;
  note: string;
  cap: string;
  icon: string;
  img: string;
}[] = [
  {
    l: "Dining room",
    note: "Warm and lively, steps from the oven",
    cap: "Up to 10 guests",
    icon: "table_restaurant",
    img: U("1517248135467-4c7edcad34c4", 500),
  },
  {
    l: "Patio",
    note: "Heated, covered, dog friendly",
    cap: "Up to 6 guests",
    icon: "deck",
    img: U("1555396273-367ea4eb4db5", 500),
  },
  {
    l: "Chef's counter",
    note: "Front-row seats at the pass",
    cap: "Up to 4 guests",
    icon: "countertops",
    img: U("1414235077428-338989a2e8c0", 500),
  },
];

export type SeedCustomer = {
  id: string;
  name: string;
  email: string;
  addr: string;
  phone: string;
  tier: "Regular" | "VIP" | "New";
};

/** Demo customers (no sign-in accounts) for the restaurant console. */
export const CUST: SeedCustomer[] = (
  [
    [
      "c1",
      "Alex Morgan",
      "alex.morgan@mail.com",
      "221 Mercer St, Apt 4B",
      "+1 (212) 555-0142",
      "Regular",
    ],
    [
      "c2",
      "Priya Nair",
      "priya.nair@mail.com",
      "14 Bleecker St",
      "+1 (212) 555-0118",
      "VIP",
    ],
    [
      "c3",
      "Diego Alvarez",
      "diego.a@mail.com",
      "300 Lafayette St",
      "+1 (917) 555-0190",
      "Regular",
    ],
    [
      "c4",
      "Hannah Wolfe",
      "hannah.w@mail.com",
      "52 Prince St",
      "+1 (646) 555-0127",
      "New",
    ],
    [
      "c5",
      "Marcus Bell",
      "marcus.bell@mail.com",
      "8 Spring St",
      "+1 (212) 555-0173",
      "VIP",
    ],
    [
      "c6",
      "Sofia Ramirez",
      "sofia.r@mail.com",
      "190 Mott St",
      "+1 (917) 555-0151",
      "Regular",
    ],
  ] as const
).map((c) => ({
  id: c[0],
  name: c[1],
  email: c[2],
  addr: c[3],
  phone: c[4],
  tier: c[5],
}));

export const MIN = 60_000;
export const DAY = 24 * 60 * MIN;

/**
 * Demo orders from the customers above:
 * [no, customer, placedAt, step, [dish, size, qty][]], payment].
 */
export function seedOrderRows(
  now = Date.now(),
): [
  string,
  string,
  number,
  0 | 1 | 2 | 3 | 4,
  [string, number, number][],
  string,
][] {
  return [
    [
      "EK-4821",
      "c2",
      now - 4 * MIN,
      0,
      [
        ["pep", 1, 1],
        ["wings", 0, 1],
      ],
      "Apple Pay",
    ],
    ["EK-4819", "c3", now - 7 * MIN, 0, [["smash", 0, 2]], "Visa •••• 4242"],
    [
      "EK-4816",
      "c4",
      now - 11 * MIN,
      1,
      [
        ["carb", 0, 1],
        ["cheesecake", 0, 1],
      ],
      "Apple Pay",
    ],
    [
      "EK-4812",
      "c5",
      now - 16 * MIN,
      1,
      [
        ["marg", 2, 1],
        ["fries", 0, 1],
      ],
      "Visa •••• 4242",
    ],
    ["EK-4807", "c6", now - 24 * MIN, 2, [["handi", 0, 1]], "Visa •••• 1007"],
    [
      "EK-4799",
      "c1",
      now - DAY - 90 * MIN,
      3,
      [
        ["brisket", 0, 1],
        ["gateau", 0, 1],
      ],
      "Cash",
    ],
    ["EK-4790", "c2", now - DAY - 200 * MIN, 3, [["ramen", 0, 2]], "Apple Pay"],
    [
      "EK-4781",
      "c3",
      now - 2 * DAY - 60 * MIN,
      4,
      [["lasagne", 0, 1]],
      "Visa •••• 4242",
    ],
  ];
}

export function seedReviews(now = Date.now()): Review[] {
  return [
    {
      id: "v1",
      name: "Priya Nair",
      stars: 5,
      text: "The hot honey pepperoni is unreal. Arrived piping hot.",
      dish: "Hot Honey Pepperoni",
      at: now - 2 * 60 * MIN,
      replied: false,
    },
    {
      id: "v2",
      name: "Marcus Bell",
      stars: 4,
      text: "Great brisket burger, fries could be crispier.",
      dish: "Smoked Brisket Burger",
      at: now - DAY,
      replied: true,
    },
    {
      id: "v3",
      name: "Hannah Wolfe",
      stars: 5,
      text: "Best carbonara in SoHo. Ordering again Friday.",
      dish: "Spaghetti Carbonara",
      at: now - 2 * DAY,
      replied: false,
    },
    {
      id: "v4",
      name: "Diego Alvarez",
      stars: 3,
      text: "Tasty but took 45 minutes on a rainy night.",
      dish: "Wood-Oven Lasagne",
      at: now - 3 * DAY,
      replied: false,
    },
  ];
}

export type SeedBooking = {
  id: string;
  name: string;
  party: number;
  time: string;
  seat: string;
  status: 0 | 1;
  date: string;
};

export function seedBookings(today: string): SeedBooking[] {
  return [
    {
      id: "b1",
      name: "Sofia Ramirez",
      party: 2,
      time: "6:00",
      seat: "Patio",
      status: 0,
      date: today,
    },
    {
      id: "b2",
      name: "The Chen family",
      party: 5,
      time: "6:30",
      seat: "Dining room",
      status: 0,
      date: today,
    },
    {
      id: "b3",
      name: "Jordan Lee",
      party: 2,
      time: "7:00",
      seat: "Chef's counter",
      status: 1,
      date: today,
    },
    {
      id: "b4",
      name: "Ava Patel",
      party: 4,
      time: "7:30",
      seat: "Dining room",
      status: 0,
      date: today,
    },
    {
      id: "b5",
      name: "Noah Kim",
      party: 3,
      time: "8:30",
      seat: "Patio",
      status: 0,
      date: today,
    },
  ];
}

export const PROMOS: Promo[] = [
  { code: "EMBER10", pct: 10, used: 342, on: true },
  { code: "WEEKNIGHT15", pct: 15, used: 128, on: true },
  { code: "LUNCH20", pct: 20, used: 500, on: false },
];

export const DEAL: Deal = { id: "smash", pct: 25, on: true };
export const STORE: StoreConfig = { open: true, prep: 18, fee: 2.99, freeAt: 40 };
