import { z } from "zod";

import { OrderStage, Role } from "./roles";

const id = z.string().min(1).max(64);
const url = z.string().url().max(2048);
const money = z.number().min(0).max(10_000);

// catalog
export const ProductTag = z.enum(["", "Bestseller", "New", "Spicy"]);

export const Product = z.object({
  id,
  name: z.string().min(1).max(80),
  /** category name */
  cat: z.string().min(1).max(40),
  price: money,
  rating: z.number().min(0).max(5),
  reviews: z.number().int().min(0),
  /** prep time in minutes */
  time: z.number().int().min(1).max(240),
  kcal: z.number().int().min(0).max(10_000),
  img: url,
  tag: ProductTag,
  desc: z.string().max(600),
  avail: z.boolean(),
  /** kitchen (brand) id */
  brand: id,
  order: z.number().int(),
});
export type Product = z.infer<typeof Product>;

export const Category = z.object({
  id,
  name: z.string().min(1).max(40),
  on: z.boolean(),
  img: url.optional(),
  order: z.number().int(),
});
export type Category = z.infer<typeof Category>;

export const Brand = z.object({
  id,
  name: z.string().min(1).max(60),
  tag: z.string().max(80),
  icon: z.string().min(1).max(40),
  img: url,
  on: z.boolean(),
  order: z.number().int(),
});
export type Brand = z.infer<typeof Brand>;

export const Banner = z.object({
  id,
  /** eyebrow */
  eb: z.string().max(40),
  title: z.string().min(1).max(80),
  cta: z.string().max(30),
  img: url,
  /** opens the menu on this category ('All' for everything) */
  cat: z.string().max(40).optional(),
  /** or opens this dish */
  dish: id.optional(),
  on: z.boolean(),
  order: z.number().int(),
});
export type Banner = z.infer<typeof Banner>;

export const HomeSectionKey = z.enum([
  "hero",
  "cats",
  "deal",
  "brands",
  "popular",
  "again",
  "reserve",
  "rated",
  "journal",
]);
export type HomeSectionKey = z.infer<typeof HomeSectionKey>;

export const HomeSection = z.object({
  k: HomeSectionKey,
  l: z.string().max(40),
  icon: z.string().max(40),
  on: z.boolean(),
});
export type HomeSection = z.infer<typeof HomeSection>;

export const Deal = z.object({
  id,
  pct: z.number().int().min(5).max(90),
  on: z.boolean(),
});
export type Deal = z.infer<typeof Deal>;

export const HomeConfig = z.object({
  sections: z.array(HomeSection),
  deal: Deal,
});
export type HomeConfig = z.infer<typeof HomeConfig>;

export const StoreConfig = z.object({
  open: z.boolean(),
  /** typical prep time in minutes */
  prep: z.number().int().min(5).max(120),
  /** delivery fee */
  fee: money,
  /** free delivery from this subtotal */
  freeAt: money,
});
export type StoreConfig = z.infer<typeof StoreConfig>;

export const Post = z.object({
  id,
  title: z.string().min(1).max(140),
  cat: z.string().max(40),
  img: url,
  author: z.string().max(60),
  /** display date, e.g. "Oct 10" */
  date: z.string().max(20),
  mins: z.number().int().min(1).max(120),
  featured: z.boolean(),
  on: z.boolean(),
  dish: id.nullable(),
  likes: z.number().int().min(0),
  excerpt: z.string().max(400),
  body: z.string().max(20_000),
});
export type Post = z.infer<typeof Post>;

export const Promo = z.object({
  code: z.string().regex(/^[A-Z0-9]{3,20}$/),
  pct: z.number().int().min(5).max(50),
  used: z.number().int().min(0),
  on: z.boolean(),
});
export type Promo = z.infer<typeof Promo>;

/** Everything the customer app needs to render the menu and Home, in one cacheable response. */
export const Catalog = z.object({
  /** increases on every catalog change - also the response ETag */
  version: z.number().int(),
  products: z.array(Product),
  categories: z.array(Category),
  brands: z.array(Brand),
  banners: z.array(Banner),
  home: HomeConfig,
  store: StoreConfig,
  /** published stories only */
  posts: z.array(Post),
});
export type Catalog = z.infer<typeof Catalog>;

// cart & orders
export const CartLine = z.object({
  id,
  /** size index */
  s: z.number().int().min(0).max(5),
  /** extra keys */
  ex: z.array(z.string().max(20)).max(8),
  q: z.number().int().min(1).max(20),
  /** priced with today's deal */
  deal: z.boolean().optional(),
  /** a redeemed reward voucher - priced at zero */
  voucher: z.string().max(64).optional(),
});
export type CartLine = z.infer<typeof CartLine>;

export const FulfilMode = z.enum(["delivery", "pickup"]);
export type FulfilMode = z.infer<typeof FulfilMode>;

export const PayMethod = z.enum(["cash", "card", "wallet"]);
export type PayMethod = z.infer<typeof PayMethod>;

export const PayStatus = z.enum([
  "due",
  "awaiting_payment",
  "processing",
  "paid",
  "failed",
  "canceled",
  "refunded",
]);
export type PayStatus = z.infer<typeof PayStatus>;

/** 0 New
 * 1 Preparing • 2 On the way
 * 3 Delivered • 4 Cancelled */
export const OrderStep = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
]);
export type OrderStep = z.infer<typeof OrderStep>;

export const AddressSnapshot = z.object({
  tag: z.string().max(30),
  l1: z.string().max(120),
  l2: z.string().max(120),
  note: z.string().max(200),
  /** who to call about this delivery */
  phone: z.string().max(30).optional(),
});
export type AddressSnapshot = z.infer<typeof AddressSnapshot>;

/** A priced order line, frozen at order time (so history survives menu edits). */
export const OrderLine = CartLine.extend({
  name: z.string(),
  /** size and extras, e.g. '12" • Extra cheese' */
  options: z.string(),
  /** unit price charged */
  unit: z.number(),
});
export type OrderLine = z.infer<typeof OrderLine>;

/** The delivery rider an order is assigned to. */
export const Rider = z.object({
  vid: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
});
export type Rider = z.infer<typeof Rider>;

/** One fulfilment step: who moved the order, and when. */
export const OrderEvent = z.object({
  stage: OrderStage,
  /** epoch ms */
  at: z.number(),
  by: z.object({ vid: z.string(), name: z.string(), role: Role }).nullable(),
  note: z.string().max(300).optional(),
});
export type OrderEvent = z.infer<typeof OrderEvent>;

export const Order = z.object({
  id,
  no: z.string(),
  vid: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string().nullable().default(null),
  }),
  /** epoch ms */
  placedAt: z.number(),
  /** the customer's view of stage (see stepOfStage) */
  step: OrderStep,
  /** where the order is in the restaurant: call center → packer → warehouse → rider */
  stage: OrderStage,
  rider: Rider.nullable().default(null),
  /** each stage reached, oldest first */
  timeline: z.array(OrderEvent).default([]),
  lines: z.array(OrderLine),
  subtotal: z.number(),
  fee: z.number(),
  speedFee: z.number(),
  discount: z.number(),
  total: z.number(),
  mode: FulfilMode,
  speed: z.number().int().min(0).max(1),
  address: AddressSnapshot.nullable(),
  note: z.string(),
  promo: z.string().nullable(),
  payment: z.object({
    method: PayMethod,
    status: PayStatus,
    label: z.string(),
  }),
  rated: z.number().int().min(1).max(5).optional(),
  /** progressed by the server's demo kitchen */
  live: z.boolean(),
});
export type Order = z.infer<typeof Order>;

export const CreateOrder = z.object({
  lines: z.array(CartLine).min(1).max(50),
  mode: FulfilMode,
  /** 0 Standard • 1 Priority (ignored for pickup) */
  speed: z.number().int().min(0).max(1),
  address: AddressSnapshot.nullable(),
  note: z.string().max(300),
  promo: z.string().max(20).nullable(),
  method: PayMethod,
  /** display label for the payment method, e.g. "Apple Pay" */
  payLabel: z.string().max(30).optional(),
  /** the total the customer saw - the server refuses the order if its own total differs */
  expectedTotal: money,
});
export type CreateOrder = z.infer<typeof CreateOrder>;

/** Stripe Paymentsheet parameters for a card / wallet order. */
export const PaymentSheet = z.object({
  paymentIntent: z.string(),
  customer: z.string(),
  customerSessionClientSecret: z.string(),
});
export type PaymentSheet = z.infer<typeof PaymentSheet>;

export const CreateOrderResult = z.object({
  order: Order,
  payment: PaymentSheet.nullable(),
});
export type CreateOrderResult = z.infer<typeof CreateOrderResult>;

export const RateOrder = z.object({
  stars: z.number().int().min(1).max(5),
  tags: z.array(z.string().max(40)).max(10),
  text: z.string().max(1000),
  tip: z.number().min(0).max(100),
});
export type RateOrder = z.infer<typeof RateOrder>;

export const ReportIssue = z.object({
  type: z.number().int().min(0).max(10),
  text: z.string().max(1000),
});
export type ReportIssue = z.infer<typeof ReportIssue>;

// people, bookings, reviews
export const Voucher = z.object({
  id,
  reward: id,
  dish: id,
  s: z.number().int().min(0),
});
export type Voucher = z.infer<typeof Voucher>;

export const Me = z.object({
  uid: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  photo: z.string().nullable(),
  provider: z.string(),
  /** what this account can do - "user" for customers */
  role: Role,
  /** role 'admin' (kept for older app builds) */
  admin: z.boolean(),
  points: z.number().int(),
  credit: z.number(),
  redeemed: z.array(z.string()),
  vouchers: z.array(Voucher),
});
export type Me = z.infer<typeof Me>;

export const UpdateMe = z.object({
  name: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(30).nullable(),
}).partial();
export type UpdateMe = z.infer<typeof UpdateMe>;

/** 0 Booked • 1 Seated • 2 Cancelled */
export const BookingStatus = z.union([z.literal(0), z.literal(1), z.literal(2)]);

export const Booking = z.object({
  id,
  code: z.string(),
  vid: z.string().nullable(),
  name: z.string(),
  party: z.number().int().min(1).max(10),
  /** '7:30' (PM) */
  time: z.string().regex(/^\d{1,2}:\d{2}$/),
  seat: z.string().max(40),
  status: BookingStatus,
  /** YYYY-MM-DD */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  occ: z.string().max(40).nullable(),
  req: z.string().max(500),
});
export type Booking = z.infer<typeof Booking>;

export const CreateBooking = Booking.pick({
  party: true,
  time: true,
  seat: true,
  date: true,
  occ: true,
  req: true,
});
export type CreateBooking = z.infer<typeof CreateBooking>;

export const Review = z.object({
  id,
  name: z.string(),
  stars: z.number().int().min(1).max(5),
  text: z.string(),
  dish: z.string(),
  /** epoch ms */
  at: z.number(),
  replied: z.boolean(),
});
export type Review = z.infer<typeof Review>;

export const Customer = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  addr: z.string(),
  phone: z.string(),
  tier: z.enum(["Regular", "VIP", "New"]),
  orders: z.number().int(),
  spent: z.number(),
});
export type Customer = z.infer<typeof Customer>;

// admin writes
export const ProductInput = Product.omit({ id: true, order: true, rating: true, reviews: true }).extend({
  time: Product.shape.time.optional(),
  kcal: Product.shape.kcal.optional(),
  desc: Product.shape.desc.optional(),
});
export type ProductInput = z.infer<typeof ProductInput>;

export const ProductPatch = ProductInput.partial();
export type ProductPatch = z.infer<typeof ProductPatch>;

export const CategoryInput = z.object({ name: z.string().trim().min(1).max(40) });
export const CategoryPatch = z.object({ on: z.boolean() }).partial();

export const BrandPatch = Brand.omit({ id: true, order: true }).partial();
export const BannerPatch = Banner.omit({ id: true, order: true }).partial();

export const PromoInput = Promo.pick({ code: true, pct: true });
export const PromoPatch = z.object({ on: z.boolean() });

export const PostInput = Post.omit({ id: true, likes: true, date: true, mins: true });
export const PostPatch = PostInput.partial();

export const StorePatch = StoreConfig.partial();
export const HomePatch = HomeConfig.partial();

/** Move an order to the next stage (see movesFor in roles.ts for who may). */
export const AdvanceOrder = z.object({
  to: OrderStage,
  /** the rider, when assigning */
  riderUid: z.string().min(1).max(128).optional(),
  note: z.string().max(300).optional(),
});
export type AdvanceOrder = z.infer<typeof AdvanceOrder>;

/** The call center corrects the delivery address or contact before confirming. */
export const OrderContactPatch = z
  .object({
    address: AddressSnapshot,
    phone: z.string().trim().max(30).nullable(),
    note: z.string().max(300),
  })
  .partial();
export type OrderContactPatch = z.infer<typeof OrderContactPatch>;

export const UserRow = z.object({
  vid: z.string(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role: Role,
  disabled: z.boolean(),
  /** sign-in method: password, google.com, apple.com - 'demo' for seeded customers */
  provider: z.string(),
  /** epoch ms, when known */
  createdAt: z.number().nullable(),
  orders: z.number().int(),
  spent: z.number(),
});
export type UserRow = z.infer<typeof UserRow>;

export const CreateUser = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  /** first password; they can change it with "Forgot password" */
  password: z.string().min(8).max(128),
  role: Role,
  phone: z.string().trim().max(30).nullable().optional(),
});
export type CreateUser = z.infer<typeof CreateUser>;

export const UserPatch = z
  .object({
    role: Role,
    disabled: z.boolean(),
    name: z.string().trim().min(1).max(80),
    phone: z.string().trim().max(30).nullable(),
  })
  .partial();
export type UserPatch = z.infer<typeof UserPatch>;

export const BookingStatusPatch = z.object({ status: BookingStatus });

export const Reorder = z.object({ ids: z.array(id).min(1).max(200) });

// errors
/** Every error response */
export const ApiError = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
});
export type ApiError = z.infer<typeof ApiError>;