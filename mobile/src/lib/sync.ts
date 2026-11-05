import {
  Banner,
  Booking,
  Brand,
  Category,
  Customer,
  Order,
  Post,
  Product,
  Promo,
  computeTotals,
  lineUnitPrice,
  optionsLabel,
  stageOfStep,
  stepOfStage,
  type CartLine,
  type Catalog,
  type Me,
  type OrderStage,
} from "@food_app/shared";
import { useEffect } from "react";
import { create } from "zustand";

import * as S from "../../../server/src/seed/data";
import { dayKey } from "@/lib/format";
import { useApp, type AppData } from "@/store/store";

export type LoadState = "idle" | "loading" | "ready" | "error";

type SyncState = {
  catalog: LoadState;
  catalogError: string | null;
  lastSync: number;
  admin: LoadState;
  adminError: string | null;
  reachable: boolean;
};

export const useSync = create<SyncState>(() => ({
  catalog: "idle",
  catalogError: null,
  lastSync: 0,
  admin: "ready",
  adminError: null,
  reachable: true,
}));

export function catalogPatch(
  c: Catalog & { promos?: Promo[] },
  s: Pick<AppData, "cart">,
): Partial<AppData> {
  const ids = new Set(c.products.map((p) => p.id));
  return {
    catalogVersion: c.version,
    menu: c.products,
    cats: c.categories,
    brands: c.brands,
    banners: c.banners,
    secs: c.home.sections,
    deal: c.home.deal,
    posts: c.posts,
    storeOpen: c.store.open,
    prep: c.store.prep,
    fee: c.store.fee,
    freeAt: c.store.freeAt,
    cart: s.cart.filter((l) => ids.has(l.id)),
    ...(c.promos ? { promos: c.promos } : {}),
  };
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** The catalog, built from the seed exactly the way the server will serve it. */
function localCatalog(): Catalog & { promos: Promo[] } {
  const products = S.MENU_ROWS.map((a, order) =>
    Product.parse({
      id: a[0],
      name: a[1],
      cat: a[2],
      price: a[3],
      rating: a[4],
      reviews: a[5],
      time: a[6],
      kcal: a[7],
      img: S.U(a[8]),
      tag: a[9],
      desc: a[10],
      avail: true,
      brand: S.BRAND_OF[a[0]],
      order,
    }),
  );

  return {
    version: 1,
    products,
    categories: S.CATS.map((name, order) =>
      Category.parse({
        id: slug(name),
        name,
        on: true,
        order,
        img: products.find((p) => p.cat === name)?.img,
      }),
    ),
    brands: S.BRANDS.map((b, order) => Brand.parse({ ...b, order })),
    banners: S.HERO.map((h, order) =>
      Banner.parse({
        ...h,
        id: `h${order}`,
        on: order < 3,
        order,
      }),
    ),
    home: { sections: S.SECS, deal: S.DEAL },
    store: S.STORE,
    posts: S.POSTS.map((p) => Post.parse(p)),
    promos: S.PROMOS.map((p) => Promo.parse(p)),
  };
}

/**
 * The console's demo activity: the seed's customers, orders, reviews and
 * tonight's bookings.
 */
function localActivity(
  products: Product[],
): Pick<AppData, "orders" | "customers" | "reviews" | "bookings"> {
  const now = Date.now();

  const orders = S.seedOrderRows(now).map(
    ([no, cid, placedAt, step, items, label]) => {
      const cust = S.CUST.find((c) => c.id === cid)!;
      const lines = items.map(([id, s, q]) => {
        const p = products.find((x) => x.id === id)!;
        const line: CartLine = { id, s, ex: [], q };
        return {
          ...line,
          name: p.name,
          options: optionsLabel(p, line),
          unit: lineUnitPrice(p, line, null),
        };
      });
      const t = computeTotals({
        units: lines.map((l) => ({ unit: l.unit, q: l.q })),
        mode: "delivery",
        speed: 0,
        store: S.STORE,
        promoPct: null,
      });
      const method: "cash" | "wallet" | "card" =
        label === "Cash" ? "cash" : label.includes("Pay") ? "wallet" : "card";
      const stage = stageOfStep(step);
      const order: OrderStage[] = [
        "placed",
        "confirmed",
        "packed",
        "assigned",
        "out_for_delivery",
        "delivered",
      ];
      const reached =
        stage === "cancelled"
          ? (["placed", "cancelled"] as OrderStage[])
          : order.slice(0, order.indexOf(stage) + 1);

      return Order.parse({
        id: `demo-${no.toLowerCase()}`,
        no,
        vid: cid,
        customer: { name: cust.name, email: cust.email, phone: cust.phone },
        placedAt,
        step: stepOfStage(stage, "delivery"),
        stage,
        rider: null,
        lines,
        timeline: reached.map((st, i) => ({
          stage: st,
          at: placedAt + i * 3 * S.MIN,
          by:
            st === "placed"
              ? { vid: cid, name: cust.name, role: "user" }
              : null,
        })),
        subtotal: Math.round(t.sub * 100) / 100,
        fee: t.fee,
        speedFee: 0,
        discount: 0,
        total: Math.round(t.total * 100) / 100,
        mode: "delivery",
        speed: 0,
        address: {
          tag: "Home",
          l1: cust.addr,
          l2: "New York, NY",
          note: "",
        },
        note: "",
        promo: null,
        payment: {
          method,
          status:
            stage === "cancelled"
              ? "refunded"
              : method === "cash"
                ? stage === "delivered"
                  ? "paid"
                  : "due"
                : "paid",
          label,
        },
        live: false,
      });
    },
  );

  const customers = S.CUST.map((c) => {
    const mine = orders.filter((o) => o.vid === c.id && o.step < 4);
    return Customer.parse({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      addr: c.addr,
      tier: c.tier,
      orders: mine.length,
      spent: mine.reduce((a, o) => a + o.total, 0),
    });
  });

  const today = dayKey(new Date());
  const bookings = S.seedBookings(today).map((b, i) => ({
    ...Booking.parse({
      ...b,
      code: `R-${2801 + i}`,
      vid: null,
      occ: null,
      req: "",
    }),
    mine: false,
  }));

  return { orders, customers, reviews: S.seedReviews(now), bookings };
}

/** Loads the catalog - for now, from the seed. */
export async function syncCatalog(
  _opts: { force?: boolean } = {},
): Promise<void> {
  const c = localCatalog();
  const s = useApp.getState();
  useApp.setState({
    ...catalogPatch(c, s),
    ...(s.customers.length ? {} : localActivity(c.products)),
  });
  useSync.setState({
    catalog: "ready",
    catalogError: null,
    lastSync: Date.now(),
  });
}

/* every server call: nothing to ask yet */
export const syncMe = async (): Promise<Me | null> => null;
export const syncOrders = async (): Promise<Order[]> => [];
export const syncOrder = async (_id: string): Promise<Order | null> => null;
export const syncBookings = async (): Promise<void> => {};
export const syncAccount = async (): Promise<void> => {};
export const syncAdminLive = async (): Promise<Order[]> => [];
export const syncAdmin = async (): Promise<void> => {};
export const catalogChanged = () => {};

export const recheckAdmin = async (): Promise<
  "admin" | "not_admin" | "offline"
> => "admin";

/** Loads the local catalog once the app starts. */
export function useServerSync() {
  useEffect(() => {
    void syncCatalog();
  }, []);
}

export function useAdminSync(
  _on: boolean,
  _onNewOrders: (orders: Order[]) => void,
) {}
