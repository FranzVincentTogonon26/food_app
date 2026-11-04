import {
  COVER_IMAGES,
  ONBOARDING_IMAGES,
  AUTH_IMAGES,
  RESERVE_IMAGE,
  SEAT_IMAGES,
  ALLX,
  EXTRAS,
  REWARDS,
  SIZES,
  SPEEDS,
  TIERS,
  defaultSize,
  extrasOf,
  sizesOf,
  unitOf,
} from "@food_app/shared";
import type { Address, InboxItem, PayCard } from "./types";

/** Story covers offered in the restaurant console (Imagekit). */
export const COVERS = COVER_IMAGES;

export const OB = [
  {
    img: ONBOARDING_IMAGES[0],
    eb: "Wood-fired kitchen",
    t: "Fired hot.",
    sub: "Pizzas, smash burgers and fresh pasta from the Ember oven to your door.",
  },
  {
    img: ONBOARDING_IMAGES[1],
    eb: "Made to order",
    t: "Your way.",
    sub: "Every time. Pick your size and extras. Every dish is fired the moment you order.",
  },
  {
    img: ONBOARDING_IMAGES[2],
    eb: "Live tracking",
    t: "Oven to",
    t2: "your door",
    sub: "Follow your order from the kitchen to your doorstep, minute by minute",
  },
];

export const AUTH_IMG = AUTH_IMAGES;
export const RESERVE_IMG = RESERVE_IMAGE;

export const SEATS = [
  {
    l: "Dining room",
    note: "Warm and lively, steps from the oven",
    cap: "Up to 10 guests",
    icon: "table_restaurant",
    img: SEAT_IMAGES["Dining room"],
  },
  {
    l: "Patio",
    note: "Heated, covered, dog friendly",
    cap: "Up to 6 guests",
    icon: "deck",
    img: SEAT_IMAGES["Patio"],
  },
  {
    l: "Chef's counter",
    note: "Front-row seats at the pass",
    cap: "Up to 4 guests",
    icon: "countertops",
    img: SEAT_IMAGES["Chef's counter"],
  },
];

export const PCATS = ["Behind the pass", "Recipes", "Guides", "News"];

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

export const STATUS = ["New", "Preparing", "On the way", "Delivered"] as const;

/** [label, sub, icon] for the customer's tracking timeline */
export const CSTEPS: [string, string, string][] = [
  ["Order placed", "The kitchen has your order", "receipt_long"],
  ["Preparing", "Your food is in the oven", "skillet"],
  ["On the way", "Your rider is heading to you", "two_wheeler"],
  ["Delivered", "Enjoy your meal", "home"],
];

export const ADDRS: Address[] = [
  {
    tag: "Home",
    icon: "home",
    l1: "221 Mercer St, Apt 4B",
    l2: "New York, NY 10012",
    note: "Buzzer 4B, leave with doorman",
    door: true,
  },
  {
    tag: "Work",
    icon: "work",
    l1: "85 Broad St, Floor 12",
    l2: "New York, NY 10004",
    note: "Reception desk, ask for Alex",
    door: false,
  },
];

/** The device wallet: Apple Pay on iPhone, Google Pay on Android. */
export const WALLET =
  process.env.EXPO_OS === "android"
    ? { name: "Google Pay", icon: "contactless", auth: "Fingerprint" }
    : { name: "Apple Pay", icon: "phone_iphone", auth: "Face ID" };

export const PAYS = [
  { t: WALLET.name, s: `Default • ${WALLET.auth}`, icon: WALLET.icon },
  { t: "Visa •••• 4242", s: "Expires 08/28", icon: "credit_card" },
  { t: "Cash on delivery", s: "Pay the courier", icon: "payments" },
];

export const HOURS: [string, number][] = [
  ["5p", 420],
  ["6p", 980],
  ["7p", 1460],
  ["8p", 1240],
  ["9p", 760],
  ["10p", 310],
];

export const TAGS = ["None", "Bestseller", "New", "Spicy"];

export const VEG = ["marq", "funghi", "fries", "cheesecake", "gateau"];
export const HOT = ["pep", "wings", "biryani", "chick"];
export const SORTS = ["Most popular", "Price: low to high", "Fastest"];

export const SLOTS: [string, string[]][] = [
  ["Early evening", ["5:00", "5:30", "6:00", "6:30"]],
  ["Prime time", ["7:00", "7:30", "8:00", "8:30"]],
  ["Late", ["19:00", "19:30", "20:00", "20:30", "21:00", "21:30"]],
];

export const OCC: [string, string][] = [
  ["Birthday", "cake"],
  ["Anniversary", "favorite"],
  ["Date night", "wine_bar"],
  ["Business", "work"],
  ["Celebration", "celebration"],
];

export const TOPICS: [string, string][] = [
  ["Orders", "receipt_long"],
  ["Delivery", "two_wheeler"],
  ["Payments", "credit_card"],
  ["Account", "person"],
  ["Dining in", "event_seat"],
  ["Allergens", "eco"],
];

export const FAQ = [
  {
    id: "f1",
    topic: "Delivery",
    q: "How long does delivery take?",
    a: "Most orders arrive in 25-35 minutes. Priority delivery gets there in 15-20 minutes for $1.99. You can watch every step on the live tracking screen.",
  },
  {
    id: "f2",
    topic: "Orders",
    q: "Can I change my order after placing it?",
    a: "Message us within 2 minutes of ordering from the tracking screen. Once the kitchen fires your dish we can't swap it, but we can add items as a separate order.",
  },
  {
    id: "f3",
    topic: "Orders",
    q: "Something is missing from my order",
    a: 'Tap "Get help with this order" above and choose Missing item. We\'ll refund it to Ember credit instantly or send it out again, whichever you prefer.',
  },
  {
    id: "f4",
    topic: "Payments",
    q: "When is my card charged?",
    a: "We place a hold when you order and charge it once the kitchen accepts. If we cancel, the hold is released within 3-5 business days.",
  },
  {
    id: "f5",
    topic: "Payments",
    q: "How do I use Ember credit?",
    a: "Credit applies automatically at checkout before your card is charged. You can see your balance in Payment methods.",
  },
  {
    id: "f6",
    topic: "Account",
    q: "How do I change my email or phone?",
    a: "Go to Profile → Edit profile. Changes to your email need a quick verification code.",
  },
  {
    id: "f7",
    topic: "Account",
    q: "How do Ember Rewards points work?",
    a: "You earn 10 points for every $1 spent, plus bonus points for reviews and bookings. Redeem points for free dishes or money off.",
  },
  {
    id: "f8",
    topic: "Dining in",
    q: "How long do you hold a reservation?",
    a: "We hold tables for 15 minutes. Running late? Message us from your reservation and we'll do our best to keep it.",
  },
  {
    id: "f9",
    topic: "Dining in",
    q: "Can I bring a large group?",
    a: "Groups of up to 8 can book in the app. For 9 or more, chat with us and we'll set up the dining room for you.",
  },
  {
    id: "f10",
    topic: "Allergens",
    q: "Do you have gluten-free options?",
    a: "Our risotto, biryani and Chicken Handi bowl are made without gluten. Pizza dough contains wheat, and we can't guarantee zero cross-contact.",
  },
  {
    id: "f11",
    topic: "Allergens",
    q: "Which dishes are vegetarian?",
    a: "Margherita, Truffle Funghi, Truffle Parmesan Fries and all desserts are vegetarian. Use the Vegetarian filter in the menu to see them.",
  },
  {
    id: "f12",
    topic: "Delivery",
    q: "Do you deliver outside SoHo?",
    a: "We deliver within 3 miles of 112 Spring St, covering most of Lower Manhattan. Outside that, choose Pickup on the Home screen.",
  },
];

export const ISSUES: [string, string][] = [
  ["Missing item", "remove_shopping_cart"],
  ["Wrong item", "swap_horiz"],
  ["Arrived late", "schedule"],
  ["Food quality", "sentiment_dissatisfied"],
  ["Something else", "help"],
];

export const RTAGS = [
  "Hot & fresh",
  "Fast delivery",
  "Great packaging",
  "Generous portions",
  "Friendly courier",
];

export const TIPS = [0, 2, 3, 5];

export const EARN: [string, string, string][] = [
  ["shopping_bag", "Order food", "10 pts per $1"],
  ["rate_review", "Rate an order", "+50 pts"],
  ["event_seat", "Book a table", "+100 pts"],
  ["group_add", "Refer a friend", "+500 pts"],
];

/** Card network detection from the first digits. */
export function brandOf(d: string): { name: string; bg: [string, string] } {
  if (d.startsWith("4")) return { name: "VISA", bg: ["#1A1F71", "#3B3FA8"] };
  if (/^(5[1-5]|2[2-7])/.test(d))
    return { name: "MASTERCARD", bg: ["#2B2622", "#6A5A4C"] };
  if (/^3[47]/.test(d)) return { name: "AMEX", bg: ["#0E6E5C", "#E2531A"] };
  if (/^6/.test(d)) return { name: "DISCOVER", bg: ["#B8400F", "#FA383"] };
  return { name: "CARD", bg: ["#3A332B", "#5E574F"] };
}

export const BSTAT = ["Booked", "Seated", "Cancelled"] as const;

export function seedInbox(now = Date.now()): InboxItem[] {
  return [
    {
      id: "n1",
      icon: "sell",
      title: "Weeknight deal: 15% off",
      sub: "Use WEEKNIGHT15 at checkout before Thursday.",
      at: now - 2 * 60 * MIN,
      unread: true,
    },
    {
      id: "n2",
      icon: "local_fire_department",
      title: "Truffle Funghi is here",
      sub: "Roasted wild mushrooms and taleggio. Fired to order.",
      at: now - 5 * 60 * MIN,
      unread: true,
    },
    {
      id: "n3",
      icon: "check_circle",
      title: "EK-4799 delivered",
      sub: "How was your Smoked Brisket Burger? Leave a rating.",
      at: now - DAY,
      unread: false,
    },
    {
      id: "n4",
      icon: "event_seat",
      title: "Patio seating is open",
      sub: "Book a table for tonight from 5:30 PM.",
      at: now - 2 * DAY,
      unread: false,
    },
  ];
}

export const CARDS: PayCard[] = [
  {
    id: "k1",
    brand: "VISA",
    num: "•••• 4242",
    exp: "08/28",
    bg: ["#1A1F71", "#3B3FA8"],
    nick: "Everyday",
    name: "ALEX MORGAN",
  },
  {
    id: "k2",
    brand: "MASTERCARD",
    num: "•••• 8810",
    exp: "02/27",
    bg: ["#2B2622", "#6A5A4C"],
    nick: "Work card",
    name: "ALEX MORGAN",
  },
];

export const STORE_ADDRESS = "112 Spring St";
export const SUPPORT_PHONE = "+1 (212) 555-0100";

// Re-export shared pricing utilities for convenience
export {
  ALLX,
  EXTRAS,
  REWARDS,
  SIZES,
  SPEEDS,
  TIERS,
  defaultSize,
  extrasOf,
  sizesOf,
  unitOf,
};