import type { CartLine, Deal, FulfilMode, Product, StoreConfig } from "./schemas";

/** [label, price delta] per size, by category. */
export const SIZES: Record<string, [string, number][]> = {
  Pizza: [["10\"", -2], ["12\"", 0], ["14\"", 3]],
  Desserts: [["Slice", 0], ["Double", 6.5]],
  Default: [["Regular", 0], ["Large", 3]],
};

export const sizesOf = (cat: string) => SIZES[cat] || SIZES.Default;

/** [key, label, price] */
export const EXTRAS: Record<"sweet" | "savory", [string, string, number][]> = {
  sweet: [
    ["cream", "Vanilla cream", 1.5],
    ["berry", "Berry compote", 1.5],
  ],
  savory: [
    ["cheese", "Extra cheese", 1.5],
    ["chili", "Calabrian chili oil", 0.8],
    ["dip", "Garlic dip", 1],
    ["side", "Side of fries", 3.5],
  ],
};

export const extrasOf = (cat: string) =>
  cat === "Desserts" ? EXTRAS.sweet : EXTRAS.savory;

export const ALLX = [...EXTRAS.sweet, ...EXTRAS.savory];

/** Default size: 12" for pizza, the first size otherwise */
export const defaultSize = (cat: string) => (cat === "Pizza" ? 1 : 0);

export const SPEEDS = [
  { t: "Standard", s: "25-35 min", fee: 0 },
  { t: "Priority", s: "15-20 min", fee: 1.99 },
];

/** Price of one unit before deals: base + size delta + extras. */
export const unitOf = (
  p: Pick<Product, "price" | "cat">,
  s: number,
  ex: string[]
) =>
  p.price +
  (sizesOf(p.cat)[s] || sizesOf(p.cat)[0])[1] +
  ex.reduce((a, k) => a + (ALLX.find((x) => x[0] === k)?.[2] ?? 0), 0);

/**
 * Builds a display string like:
 * '12" • Extra cheese • Calabrian chili oil'
 */
export function optionsLabel(
  p: Pick<Product, "cat">,
  line: Pick<CartLine, "s" | "ex">
): string {
  const sz = sizesOf(p.cat)[line.s];
  return [sz ? sz[0] : null, ...line.ex.map((k) => ALLX.find((x) => x[0] === k)?.[1])]
    .filter(Boolean)
    .join(" • ");
}

/** Whether today's deal applies to a line. */
export const dealApplies = (
  line: Pick<CartLine, "id" | "deal">,
  deal: Deal | null | undefined
) => !!line.deal && !!deal && deal.on && deal.id === line.id;

/** Price of one unit of a cart Line: free for a reward voucher, discounted for today's deal. */
export function lineUnitPrice(
  p: Pick<Product, "price" | "cat">,
  line: CartLine,
  deal: Deal | null | undefined
): number {
  if (line.voucher) return 0;
  const base = unitOf(p, line.s, line.ex);
  return dealApplies(line, deal) && deal ? base * (1 - deal.pct / 100) : base;
}

export type Totals = {
  sub: number;
  count: number;
  fee: number;
  speedFee: number;
  disc: number;
  /** cart screen total (no delivery-speed upgrade yet) */
  cartTotal: number;
  /** checkout total - what is charged */
  total: number;
};

export type TotalsInput = {
  /** unit price and quantity of each line */
  units: { unit: number; q: number }[];
  mode: FulfilMode;
  speed: number;
  store: Pick<StoreConfig, "fee" | "freeAt">;
  /** promo percentage, if a code is applied */
  promoPct: number | null;
};

export function computeTotals({
  units,
  mode,
  speed,
  store,
  promoPct,
}: TotalsInput): Totals {
  const sub = units.reduce((a, l) => a + l.unit * l.q, 0);
  const count = units.reduce((a, l) => a + l.q, 0);
  const pickup = mode === "pickup";

  const fee = pickup || sub === 0 || sub >= store.freeAt ? 0 : store.fee;
  const speedFee = pickup ? 0 : SPEEDS[speed]?.fee ?? 0;

  // rounded to the cent so subtotal - discount on the receipt always equals the total
  const disc = promoPct ? Math.round(sub * promoPct) / 100 : 0;

  return {
    sub,
    count,
    fee,
    speedFee,
    disc,
    cartTotal: sub + fee - disc,
    total: sub + fee + speedFee - disc,
  };
}

export const toCents = (n: number) => Math.round(n * 100);

// rewards
export const REWARDS: {
  id: string;
  l: string;
  pts: number;
  dish?: string;
  s?: number;
  credit?: number;
}[] = [
  { id: "r1", l: "Truffle Parmesan Fries", pts: 500, dish: "fries", s: 3 },
  { id: "r2", l: "$5 off your next order", pts: 800, credit: 5 },
  { id: "r3", l: "Blueberry Cheesecake", pts: 1000, dish: "cheesecake" },
  { id: "r4", l: "Any 12\" pizza", pts: 2000, dish: "marg", s: 1 },
];

export const TIERS: [string, number][] = [
  ["Bronze", 0],
  ["Silver", 1000],
  ["Gold", 2500],
  ["Platinum", 5000],
];

/** The highest tier whose threshold the balance has reached (the same table the rewards screen shows). */
export const tierOf = (points: number) =>
  TIERS.filter(([, min]) => points >= min).at(-1)?.[0] ?? "Bronze";

/** Points awarded by the server. */
export const POINTS = {
  welcome: 500,
  perDollar: 10,
  rating: 50,
  booking: 100,
} as const;