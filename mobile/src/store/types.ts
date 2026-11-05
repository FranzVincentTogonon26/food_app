import type {
  Banner,
  Brand,
  CartLine,
  Category,
  Customer,
  Deal,
  FulfilMode,
  HomeSection,
  HomeSectionKey,
  Order as ServerOrder,
  OrderLine,
  OrderStep,
  Post,
  Promo,
  Review,
  Voucher,
  Booking as ServerBooking,
} from "@food_app/shared";

export type {
  Banner,
  Brand,
  CartLine,
  Category,
  Customer,
  Deal,
  FulfilMode,
  HomeSection,
  HomeSectionKey,
  OrderLine,
  OrderStep,
  Post,
  Promo,
  Review,
  Voucher,
};

/** A dish on the menu. */
export type MenuItem = import("@food_app/shared").Product;

/** An order, as the server returns it. */
export type Order = ServerOrder;

/** A reservation; `mine` marks the signed-in guest's own bookings. */
export type Booking = ServerBooking & { mine?: boolean };

export type Address = {
  tag: string;
  icon: string;
  l1: string;
  l2: string;
  note?: string;
  door?: boolean;
  phone?: string;
};

export type PayCard = {
  id: string;
  brand: string;
  num: string;
  exp: string;
  bg: [string, string];
  nick?: string;
  name?: string;
};

export type InboxItem = {
  id: string;
  icon: string;
  title: string;
  sub: string;
  at: number;
  unread: boolean;
};

export type User = {
  vid?: string;
  name: string;
  email: string;
  phone?: string;
  /** how they signed in; email/password when absent */
  provider?: "apple" | "google";
  /** profile photo URL from the provider */
  photo?: string;
  /** account role from the server */
  role?: import("@food_app/shared").Role;
};

export type Prefs = {
  lang: string;
  orderNotif: boolean;
  offers: boolean;
  journalNotif: boolean;
  sms: boolean;
  location: boolean;
  personal: boolean;
};

export type MenuFilters = {
  sort: number;
  veg: boolean;
  hot: boolean;
  under: boolean;
};