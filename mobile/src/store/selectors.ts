import {
  computeTotals,
  lineUnitPrice,
  optionsLabel,
  tierOf,
  type Totals,
} from "@food_app/shared";

import { cnt, dayKey, pmSlotMinutes } from "@/lib/format";

import { CSTEPS, WALLET } from "./constants";
import type { AppData } from "./store";
import type { Booking, CartLine, MenuItem, Order } from "./types";

export { tierOf, type Totals };

type MenuState = Pick<AppData, "menu">;

/**
 * A dish by id. Falls back to the first dish so a cart line for a dish the kitchen
 * just removed still renders; callers that can run before the catalog loads check
 * `menu.length` first.
 */
export const byId = (s: MenuState, id: string): MenuItem =>
  s.menu.find((p) => p.id === id) ?? s.menu[0];

/** Dishes visible to customers: category and kitchen both switched on. */
export function liveMenu(
  s: Pick<AppData, "menu" | "cats" | "brands">,
): MenuItem[] {
  return s.menu.filter((p) => {
    const c = s.cats.find((k) => k.name === p.cat);
    const b = s.brands.find((k) => k.id === p.brand);
    return !!(c && c.on) && (!b || b.on);
  });
}

/**
 * A booking whose day, or tonight whose slot plus the 15-minute table hold, has
 * already gone by.
 */
export function bookingPast(
  b: Pick<Booking, "date" | "time">,
  now: Date = new Date(),
): boolean {
  const today = dayKey(now);
  if (b.date !== today) return b.date < today;
  return pmSlotMinutes(b.time) + 15 < now.getHours() * 60 + now.getMinutes();
}

/** The guest's own bookings still ahead of them. */
export const upcomingBookings = (
  s: Pick<AppData, "bookings">,
  now?: Date,
) =>
  s.bookings.filter(
    (b) => b.mine && b.status === 0 && !bookingPast(b, now),
  );

/** Unit price of a cart line - same rules the server charges by (deal of the day, reward vouchers). */
export const lineUnit = (
  s: Pick<AppData, "menu" | "deal">,
  c: CartLine,
) => {
  const p = s.menu.find((m) => m.id === c.id);
  return p ? lineUnitPrice(p, c, s.deal) : 0;
};

/** '12" • Extra cheese • Calabrian chili oil' */
export function lineMeta(s: MenuState, c: CartLine): string {
  const p = s.menu.find((m) => m.id === c.id);
  return p ? optionsLabel(p, c) : "";
}

export function totals(
  s: Pick<
    AppData,
    "menu" | "deal" | "cart" | "mode" | "speed" | "promo" | "fee" | "freeAt"
  >,
): Totals {
  return computeTotals({
    units: s.cart.map((c) => ({ unit: lineUnit(s, c), q: c.q })),
    mode: s.mode,
    speed: s.speed,
    store: { fee: s.fee, freeAt: s.freeAt },
    promoPct: s.promo?.pct ?? null,
  });
}

export const cartCount = (s: Pick<AppData, "cart">) =>
  s.cart.reduce((a, c) => a + c.q, 0);

/**
 * An order the kitchen has: cash, or a card payment that went through (not an
 * abandoned or failed one).
 */
export const inKitchen = (o: Order) =>
  o.payment.status === "due" ||
  o.payment.status === "paid" ||
  o.payment.status === "processing" ||
  o.payment.status === "refunded";

export const myOrders = (
  s: Pick<AppData, "orders" | "lastNo">,
  vid: string | undefined,
) =>
  vid
    ? s.orders.filter(
        (o) =>
          o.payment.status !== "awaiting_payment" &&
          o.vid === vid &&
          (inKitchen(o) || o.no === s.lastNo),
      )
    : [];

export const activeOrder = (
  s: Pick<AppData, "orders" | "lastNo">,
  vid: string | undefined,
) => myOrders(s, vid).find((o) => o.step < 3);

export const itemCount = (o: Order) =>
  o.lines.reduce((a, b) => a + b.q, 0);

export const stepLabel = (
  o: Pick<Order, "mode"> | undefined,
  i: number,
) =>
  o && o.mode === "pickup" && i === 2 ? "Ready for pickup" : CSTEPS[i][0];

export const etaOf = (o: Order, prep: number) =>
  o.step === 4
    ? "Cancelled"
    : o.step >= 3
      ? "Delivered"
      : [prep + 12, prep, 9][o.step] + " min";

/**
 * "Smoked Brisket Burger + 1 more" / "2 items" from the names frozen on the order.
 */
export const orderSummary = (_s: unknown, o: Order) => {
  const first = o.lines[0]?.name ?? "Ember order";
  return o.lines.length > 1
    ? `${first} + ${o.lines.length - 1} more`
    : cnt(itemCount(o), "item");
};

export const unreadCount = (s: Pick<AppData, "inbox">) =>
  s.inbox.filter((n) => n.unread).length;

export const defaultPayLabel = (
  s: Pick<AppData, "payM" | "cards" | "defCard">,
) => {
  if (s.payM === 0) return WALLET.name;
  if (s.payM === 2) return "Cash on delivery";
  return "Credit or debit card";
};

/** A dish's photo, or '' when it's gone from the menu (or the menu hasn't loaded yet). */
export const dishImg = (s: MenuState, id: string | undefined) =>
  (id && s.menu.find((p) => p.id === id)?.img) || "";

const PAY_NOTE: Partial<Record<Order["payment"]["status"], string>> = {
  due: "pay on delivery",
  awaiting_payment: "awaiting payment",
  processing: "processing",
  failed: "payment failed",
  canceled: "not paid",
  refunded: "refunded",
};

/** "Apple Pay", "Card • Stripe • refunded", "Cash on delivery" */
export function payLabel(o: Pick<Order, "payment">): string {
  const note = o.payment.method === "cash" ? "" : PAY_NOTE[o.payment.status];
  return note ? `${o.payment.label} • ${note}` : o.payment.label;
}