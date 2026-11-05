import type { HomeConfig, Me, StoreConfig } from "@food_app/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ADDRS, CARDS, brandOf, seedInbox } from "./constants";
import { toast } from "./feedback";
import { useSession } from "./sessions";
import type {
  Address,
  Banner,
  Booking,
  Brand,
  CartLine,
  Category,
  Customer,
  Deal,
  FulfilMode,
  HomeSection,
  InboxItem,
  MenuItem,
  Order,
  PayCard,
  Post,
  Prefs,
  Promo,
  Review,
  Voucher,
} from "./types";

export type ThemePref = "light" | "dark" | null;

export type AppData = {
  onboarded: boolean;
  theme: ThemePref;
  // customer (device)
  cart: CartLine[];
  saved: string[];
  mode: FulfilMode;
  addr: number;
  addrs: Address[];
  speed: number;
  /** 0 wallet • 1 card • 2 cash */
  payM: number;
  cards: PayCard[];
  defCard: string;
  promo: { code: string; pct: number } | null;
  note: string;
  prefs: Prefs;
  notif: boolean;
  inbox: InboxItem[];
  liked: string[];
  lastNo: string | null;
  // customer (server: /v1/me, /v1/orders, /v1/bookings)
  points: number;
  credit: number;
  redeemed: string[];
  vouchers: Voucher[];
  // catalog (server: /v1/catalog - cached on the device for instant starts)
  catalogVersion: number;
  menu: MenuItem[];
  cats: Category[];
  brands: Brand[];
  banners: Banner[];
  secs: HomeSection[];
  deal: Deal;
  posts: Post[];
  storeOpen: boolean;
  prep: number;
  fee: number;
  freeAt: number;
  // orders, bookings & reviews
  orders: Order[];
  /** the customer's own, plus everyone's while the console is open */
  bookings: Booking[];
  // restaurant console (server: /v1/admin/*)
  promos: Promo[];
  reviews: Review[];
  customers: Customer[];
  sound: boolean;
};

export type EditItem = {
  id: string | null;
  name: string;
  price: number;
  cat: string;
  brand?: string;
  tag: string;
  avail: boolean;
  img: string;
};

/**
 * Server calls behind the store's actions. Lib/remote.ts registers the real API
 * at startup; without it (unit tests) the actions only change local state.
 */
export type Remote = {
  validatePromo: (code: string) => Promise<{ code: string; pct: number }>;
  redeem: (rewardId: string) => Promise<Me>;
  reportIssue: (orderId: string, type: number, text: string) => Promise<void>;
  rate: (
    orderId: string,
    input: { stars: number; tags: string[]; text: string; tip: number },
  ) => Promise<Order>;
  book: (
    b: Pick<Booking, "party" | "time" | "seat" | "date" | "occ" | "req">,
  ) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<Booking>;
  // console
  createProduct: (
    p: Omit<MenuItem, "id" | "order" | "rating" | "reviews">,
  ) => Promise<MenuItem>;
  patchProduct: (id: string, p: Partial<MenuItem>) => Promise<MenuItem>;
  deleteProduct: (id: string) => Promise<void>;
  createCategory: (name: string) => Promise<Category>;
  patchCategory: (id: string, p: { on: boolean }) => Promise<Category>;
  patchBrand: (id: string, p: Partial<Brand>) => Promise<Brand>;
  patchBanner: (id: string, p: Partial<Banner>) => Promise<Banner>;
  reorder: (kind: "categories" | "banners", ids: string[]) => Promise<void>;
  patchHome: (p: Partial<HomeConfig>) => Promise<HomeConfig>;
  patchStore: (p: Partial<StoreConfig>) => Promise<StoreConfig>;
  createPromo: (code: string, pct: number) => Promise<Promo>;
  patchPromo: (code: string, on: boolean) => Promise<Promo>;
  createPost: (p: Omit<Post, "id" | "likes" | "date" | "mins">) => Promise<Post>;
  patchPost: (id: string, p: Partial<Post>) => Promise<Post>;
  deletePost: (id: string) => Promise<void>;
  setBookingStatus: (id: string, status: 0 | 1 | 2) => Promise<Booking>;
  replyReview: (id: string) => Promise<Review>;
  /** something in the catalog changed: revalidate soon */
  catalogChanged: () => void;
  /** points or credit changed on the server: fetch the account again */
  refreshMe: () => Promise<void>;
  errorMessage: (e: unknown) => string;
};

let remote: Remote | null = null;
/** Connects the store to the server (`null` disconnects it - tests do that). */
export const registerRemote = (r: Remote | null) => {
  remote = r;
};

type Actions = {
  set: (partial: Partial<AppData>) => void;
  finishOnboarding: () => void;
  /** Clears the signed-out account's server data from the device (the catalog stays cached). */
  clearAccount: () => void;
  setTheme: (t: ThemePref) => void;
  /** The server's view of the signed-in account (points, vouchers - and its role, into the session). */
  applyMe: (me: Me) => void;
  toggleSave: (id: string) => boolean;
  addLine: (line: CartLine) => void;
  setQty: (index: number, delta: number) => void;
  /** Checks a code with the server and applies it. */
  applyPromo: (
    code: string,
  ) => Promise<
    { ok: true; promo: { code: string; pct: number } } | { ok: false; message: string }
  >;
  removePromo: () => void;
  /** Records an order the server just created and clears the cart. */
  orderPlaced: (order: Order) => void;
  /** Merges fresh orders from the server; returns the ones whose kitchen step changed. */
  mergeOrders: (orders: Order[]) => Order[];
  reorder: (no: string) => number;
  pushInbox: (icon: string, title: string, sub: string) => void;
  readNotif: (id: string) => void;
  readAll: () => void;
  deleteNotif: (id: string) => void;
  addAddress: (a: Address, makeDefault: boolean) => void;
  removeAddress: (index: number) => void;
  addCard: (
    c: { num: string; exp: string; name: string; nick: string },
    makeDefault: boolean,
  ) => PayCard;
  removeCard: (id: string) => boolean;
  setDefCard: (id: string) => void;
  redeem: (r: {
    id: string;
    pts: number;
    dish?: string;
    s?: number;
    credit?: number;
  }) => Promise<"ok" | "short" | "done" | "failed">;
  /** Reports a problem with an order; resolves true once the kitchen has it (and any credit is added). */
  submitIssue: (no: string | null, type: number, text?: string) => Promise<boolean>;
  submitRating: (
    no: string | null,
    stars: number,
    tags: string[],
    text: string,
    tip?: number,
  ) => void;
  book: (
    b: Pick<Booking, "party" | "time" | "seat" | "date" | "occ" | "req">,
  ) => Promise<Booking | null>;
  cancelBooking: (id: string) => void;
  toggleLike: (postId: string) => void;
  // console
  toggleAvail: (id: string) => void;
  saveItem: (e: EditItem) => void;
  deleteItem: (id: string) => void;
  addPromo: (code: string, pct: number) => void;
  togglePromo: (code: string) => void;
  moveIn: (key: "cats" | "secs" | "banners", i: number, d: number) => void;
  toggleCat: (name: string) => void;
  addCat: (name: string) => boolean;
  toggleBrand: (id: string) => void;
  saveBrand: (b: Brand) => void;
  toggleSec: (k: string) => void;
  toggleBanner: (id: string) => void;
  setDeal: (d: Partial<Deal>) => void;
  setStore: (p: Partial<Pick<AppData, "storeOpen" | "prep" | "fee" | "freeAt">>) => void;
  togglePost: (id: string) => void;
  savePost: (p: Post) => void;
  deletePost: (id: string) => void;
  setBookingStatus: (id: string, status: 0 | 1 | 2) => void;
  replyReview: (id: string) => void;
  /** Resets this device (cart, wallet, notifications...) - server data reloads on the next sync. */
  resetDemo: () => void;
};

export type AppState = AppData & Actions;

const vid = (p: string) =>
  p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/** What a signed-out device starts with. Everything server-owned starts empty and loads from the API. */
export function seedData(): AppData {
  return {
    onboarded: false,
    theme: null,
    cart: [],
    saved: ["brisket", "carb", "cheesecake"],
    mode: "delivery",
    addr: 0,
    addrs: ADDRS.map((a) => ({ ...a })),
    speed: 0,
    payM: 0,
    cards: CARDS.map((c) => ({ ...c })),
    defCard: "k1",
    promo: null,
    note: "",
    prefs: {
      lang: "English",
      orderNotif: true,
      offers: true,
      journalNotif: false,
      sms: false,
      location: true,
      personal: true,
    },
    notif: true,
    inbox: seedInbox(Date.now()),
    liked: [],
    lastNo: null,
    points: 0,
    credit: 0,
    redeemed: [],
    vouchers: [],
    catalogVersion: 0,
    menu: [],
    cats: [],
    brands: [],
    banners: [],
    secs: [],
    deal: { id: "deal", pct: 25, on: false },
    posts: [],
    storeOpen: true,
    prep: 18,
    fee: 2.99,
    freeAt: 40,
    orders: [],
    bookings: [],
    promos: [],
    reviews: [],
    customers: [],
    sound: true,
  };
}

/** Server data that belongs to the signed-in account, cleared on sign-out. */
const ACCOUNT_RESET: Partial<AppData> = {
  points: 0,
  credit: 0,
  redeemed: [],
  vouchers: [],
  orders: [],
  bookings: [],
  promos: [],
  reviews: [],
  customers: [],
  lastNo: null,
};

const lineKey = (c: CartLine) =>
  `${c.id}-${c.s}-${[...c.ex].sort().join(".")}${c.deal ? "-d" : ""}${
    c.voucher ? "-v" + c.voucher : ""
  }`;

export const useApp = create<AppState>()(
  persist(
    (set, get) => {
      /**
       * Applies a "patch" right away, then runs the server call. On failure the
       * touched keys go back to what they were and the server's reason is shown;
       * on success `done` can fold in the response.
       */
      async function optimistic<R>(
        patch: Partial<AppData>,
        call: ((r: Remote) => Promise<R>) | null,
        opts: {
          fail: string;
          done?: (res: R) => Partial<AppData> | void;
          catalog?: boolean;
        },
      ): Promise<R | null> {
        const before = get();
        const prev = Object.fromEntries(
          Object.keys(patch).map((k) => [k, before[k as keyof AppData]]),
        ) as Partial<AppData>;
        set(patch);
        if (!remote || !call) return null;
        try {
          const res = await call(remote);
          const extra = opts.done?.(res);
          if (extra) set(extra);
          if (opts.catalog) remote.catalogChanged();
          return res;
        } catch (e) {
          set(prev);
          toast(opts.fail, remote.errorMessage(e), { icon: "error" });
          return null;
        }
      }

      const replace = <T extends { id: string }>(list: T[], item: T) =>
        list.map((x) => (x.id === item.id ? item : x));

      const pending: { store: Partial<StoreConfig>; home: Partial<HomeConfig> } = {
        store: {},
        home: {},
      };
      const timers: {
        store?: ReturnType<typeof setTimeout>;
        home?: ReturnType<typeof setTimeout>;
      } = {};

      function saveSoon(kind: "store" | "home", fail: string) {
        clearTimeout(timers[kind]);
        timers[kind] = setTimeout(async () => {
          const body = pending[kind];
          pending[kind] = {};
          if (!remote) return;
          try {
            if (kind === "store") await remote.patchStore(body as Partial<StoreConfig>);
            else await remote.patchHome(body as Partial<HomeConfig>);
          } catch (e) {
            toast(fail, remote.errorMessage(e), { icon: "error" });
          }
          remote.catalogChanged();
        }, 500);
      }

      return {
        ...seedData(),
        set: (partial) => set(partial),
        finishOnboarding: () => set({ onboarded: true }),
        clearAccount: () => set(ACCOUNT_RESET),
        setTheme: (theme) => set({ theme }),
        applyMe: (me) => {
          const session = useSession.getState();
          // a reply for an account that has since signed out
          if (!session.user || session.user.vid !== me.uid) return;
          set({
            points: me.points,
            credit: me.credit,
            redeemed: me.redeemed,
            vouchers: me.vouchers,
          });
          session.setRole(me.role);
          // the name comes from Firebase Auth (the server keeps both in step);
          // the phone only lives on the server
          if (me.phone && me.phone !== session.user.phone)
            session.updateUser({ phone: me.phone });
        },
        toggleSave: (id) => {
          const on = get().saved.includes(id);
          set((s) => ({
            saved: on ? s.saved.filter((x) => x !== id) : [...s.saved, id],
          }));
          return !on;
        },
        addLine: (line) =>
          set((s) => {
            const cart = [...s.cart];
            const key = lineKey(line);
            const i = cart.findIndex((c) => lineKey(c) === key);
            if (i >= 0 && !line.voucher) cart[i] = { ...cart[i], q: cart[i].q + line.q };
            else if (i < 0) cart.push({ ...line, ex: [...line.ex] });
            return { cart };
          }),
        setQty: (index, delta) =>
          set((s) => ({
            cart: s.cart
              // a reward voucher is always exactly one dish
              .map((c, k) =>
                k === index
                  ? { ...c, q: c.voucher ? (delta < 0 ? 0 : 1) : c.q + delta }
                  : c,
              )
              .filter((c) => c.q > 0),
          })),
        applyPromo: async (code) => {
          const c = code.trim().toUpperCase();
          if (!remote) {
            const local = get().promos.find((x) => x.on && x.code === c);
            if (!local)
              return { ok: false, message: "That code isn't active. Try EMBER10." };
            set({ promo: { code: local.code, pct: local.pct } });
            return { ok: true, promo: { code: local.code, pct: local.pct } };
          }
          try {
            const promo = await remote.validatePromo(c);
            set({ promo });
            return { ok: true, promo };
          } catch (e) {
            return { ok: false, message: remote.errorMessage(e) };
          }
        },
        removePromo: () => set({ promo: null }),
        orderPlaced: (order) =>
          set((s) => ({
            orders: [order, ...s.orders.filter((o) => o.id !== order.id)],
            lastNo: order.no,
            cart: [],
            promo: null,
            note: "",
          })),
        mergeOrders: (orders) => {
          const prev = new Map(get().orders.map((o) => [o.id, o]));
          const changed = orders.filter((o) => {
            const p = prev.get(o.id);
            return p && (p.step !== o.step || p.payment.status !== o.payment.status);
          });
          const ids = new Set(orders.map((o) => o.id));
          set((s) => ({
            orders: [...orders, ...s.orders.filter((o) => !ids.has(o.id))].sort(
              (a, b) => b.placedAt - a.placedAt,
            ),
          }));
          return changed;
        },
        reorder: (no) => {
          const o = get().orders.find((x) => x.no === no);
          if (!o) return 0;
          const lines = o.lines
            .filter((l) => !l.voucher)
            .map((l) => ({ id: l.id, s: l.s, ex: [...l.ex], q: l.q }));
          set((s) => ({ cart: [...s.cart, ...lines] }));
          return lines.reduce((a, b) => a + b.q, 0);
        },
        pushInbox: (icon, title, sub) =>
          set((s) => ({
            inbox: [
              { id: vid("n"), icon, title, sub, at: Date.now(), unread: true },
              ...s.inbox,
            ],
          })),
        readNotif: (id) =>
          set((s) => ({
            inbox: s.inbox.map((x) => (x.id === id ? { ...x, unread: false } : x)),
          })),
        readAll: () =>
          set((s) => ({ inbox: s.inbox.map((x) => ({ ...x, unread: false })) })),
        deleteNotif: (id) =>
          set((s) => ({ inbox: s.inbox.filter((x) => x.id !== id) })),
        addAddress: (a, makeDefault) =>
          set((s) => ({
            addrs: [...s.addrs, a],
            addr: makeDefault ? s.addrs.length : s.addr,
          })),
        removeAddress: (index) =>
          set((s) => ({ addrs: s.addrs.filter((_, k) => k !== index), addr: 0 })),
        addCard: (c, makeDefault) => {
          const d = c.num.replace(/\D/g, "");
          const b = brandOf(d);
          const card: PayCard = {
            id: vid("k"),
            brand: b.name,
            num: "•••• " + d.slice(-4),
            exp: c.exp,
            bg: b.bg,
            name: c.name.trim().toUpperCase(),
            nick: c.nick.trim(),
          };
          set((s) => ({
            cards: [...s.cards, card],
            defCard: makeDefault ? card.id : s.defCard,
            payM: makeDefault ? 1 : s.payM,
          }));
          return card;
        },
        removeCard: (id) => {
          const s = get();
          if (s.cards.length <= 1) return false;
          const rest = s.cards.filter((x) => x.id !== id);
          set({
            cards: rest,
            defCard: s.defCard === id ? rest[0].id : s.defCard,
          });
          return true;
        },
        setDefCard: (id) => set({ defCard: id, payM: 1 }),
        redeem: async (r) => {
          const s = get();
          if (s.redeemed.includes(r.id)) return "done";
          if (s.points < r.pts) return "short";
          if (!remote) {
            set((st) => ({
              points: st.points - r.pts,
              redeemed: [...st.redeemed, r.id],
              ...(r.credit ? { credit: st.credit + r.credit } : {}),
            }));
            return "ok";
          }
          try {
            const before = new Set(s.vouchers.map((v) => v.id));
            const me = await remote.redeem(r.id);
            get().applyMe(me);
            // a dish reward lands in the cart as a free line
            const v = me.vouchers.find(
              (x) => !before.has(x.id) && x.reward === r.id,
            );
            if (v) get().addLine({ id: v.dish, s: v.s, ex: [], q: 1, voucher: v.id });
            return "ok";
          } catch (e) {
            toast("Couldn't redeem", remote.errorMessage(e), { icon: "error" });
            return "failed";
          }
        },
        submitIssue: async (no, type, text = "") => {
          const o = get().orders.find((x) => x.no === no);
          if (!o) return false;
          if (!remote) return true;
          try {
            await remote.reportIssue(o.id, type, text);
            await remote.refreshMe();
            return true;
          } catch (e) {
            toast("Report not sent", remote.errorMessage(e), { icon: "error" });
            return false;
          }
        },
        submitRating: (no, stars, tags, text, tip = 0) => {
          const s = get();
          const o =
            s.orders.find((x) => x.no === no) ??
            s.orders.find((x) => x.step === 3);
          if (!o) return;
          void optimistic(
            {
              orders: s.orders.map((x) =>
                x.id === o.id ? { ...x, rated: stars } : x,
              ),
            },
            (r) => r.rate(o.id, { stars, tags, text, tip }),
            {
              fail: "Rating not saved",
              done: (order) => {
                void remote?.refreshMe();
                return { orders: replace(get().orders, order) };
              },
            },
          );
        },
        book: async (b) => {
          if (!remote) return null;
          try {
            const booking = await remote.book(b);
            set((s) => ({
              bookings: [...s.bookings, { ...booking, mine: true }],
            }));
            void remote.refreshMe();
            return booking;
          } catch (e) {
            toast("Couldn't book", remote.errorMessage(e), { icon: "error" });
            return null;
          }
        },
        cancelBooking: (id) => {
          const s = get();
          void optimistic(
            {
              bookings: s.bookings.map((x) =>
                x.id === id ? { ...x, status: 2 } : x,
              ),
            },
            (r) => r.cancelBooking(id),
            { fail: "Couldn't cancel" },
          );
        },
        toggleLike: (postId) =>
          set((s) => ({
            liked: s.liked.includes(postId)
              ? s.liked.filter((x) => x !== postId)
              : [...s.liked, postId],
          })),
        toggleAvail: (id) => {
          const p = get().menu.find((x) => x.id === id);
          if (!p) return;
          void optimistic(
            { menu: replace(get().menu, { ...p, avail: !p.avail }) },
            (r) => r.patchProduct(id, { avail: !p.avail }),
            { fail: "Dish not updated", catalog: true },
          );
        },
        saveItem: (e) => {
          const tag = (e.tag === "None" ? "" : e.tag) as MenuItem["tag"];
          const s = get();
          const existing = e.id
            ? s.menu.find((p) => p.id === e.id)
            : undefined;
          if (existing) {
            const next = {
              ...existing,
              name: e.name,
              price: e.price,
              cat: e.cat,
              brand: e.brand ?? existing.brand,
              tag,
              avail: e.avail,
              img: e.img,
            };
            void optimistic(
              { menu: replace(s.menu, next) },
              (r) =>
                r.patchProduct(existing.id, {
                  name: next.name,
                  price: next.price,
                  cat: next.cat,
                  brand: next.brand,
                  tag,
                  avail: next.avail,
                  img: next.img,
                }),
              {
                fail: "Dish not saved",
                catalog: true,
                done: (p) => ({ menu: replace(get().menu, p) }),
              },
            );
            return;
          }
          const temp: MenuItem = {
            id: vid("new-"),
            name: e.name,
            cat: e.cat,
            price: e.price,
            rating: 5,
            reviews: 0,
            time: s.prep,
            kcal: 600,
            img: e.img,
            tag,
            brand: e.brand || s.brands[0]?.id || "fire",
            desc: "Freshly added to the Ember menu.",
            avail: e.avail,
            order: s.menu.length,
          };
          void optimistic(
            { menu: [...s.menu, temp] },
            (r) =>
              r.createProduct({
                name: temp.name,
                cat: temp.cat,
                price: temp.price,
                img: temp.img,
                tag,
                brand: temp.brand,
                avail: temp.avail,
                time: temp.time,
                kcal: temp.kcal,
                desc: temp.desc,
              }),
            {
              fail: "Dish not added",
              catalog: true,
              done: (p) => ({
                menu: get().menu.map((x) => (x.id === temp.id ? p : x)),
              }),
            },
          );
        },
        deleteItem: (id) => {
          const s = get();
          void optimistic(
            {
              menu: s.menu.filter((p) => p.id !== id),
              cart: s.cart.filter((c) => c.id !== id),
              saved: s.saved.filter((x) => x !== id),
            },
            (r) => r.deleteProduct(id),
            { fail: "Dish not deleted", catalog: true },
          );
        },
        addPromo: (code, pct) =>
          void optimistic(
            { promos: [{ code, pct, used: 0, on: true }, ...get().promos] },
            (r) => r.createPromo(code, pct),
            { fail: "Code not created" },
          ),
        togglePromo: (code) => {
          const p = get().promos.find((y) => y.code === code);
          if (!p) return;
          void optimistic(
            {
              promos: get().promos.map((y) =>
                y.code === code ? { ...y, on: !y.on } : y,
              ),
            },
            (r) => r.patchPromo(code, !p.on),
            { fail: "Code not updated" },
          );
        },
        moveIn: (key, i, d) => {
          const a = [...(get()[key] as unknown[])];
          const j = i + d;
          if (j < 0 || j >= a.length) return;
          [a[i], a[j]] = [a[j], a[i]];
          if (key === "secs") {
            const secs = a as HomeSection[];
            void optimistic(
              { secs },
              (r) => r.patchHome({ sections: secs }),
              { fail: "Layout not saved", catalog: true },
            );
          } else {
            const kind = key === "cats" ? "categories" : "banners";
            const list = (a as (Category | Banner)[]).map((x, order) => ({
              ...x,
              order,
            }));
            void optimistic(
              { [key]: list } as Partial<AppData>,
              (r) => r.reorder(kind, list.map((x) => x.id)),
              { fail: "Order not saved", catalog: true },
            );
          }
        },
        toggleCat: (name) => {
          const c = get().cats.find((x) => x.name === name);
          if (!c) return;
          void optimistic(
            { cats: replace(get().cats, { ...c, on: !c.on }) },
            (r) => r.patchCategory(c.id, { on: !c.on }),
            { fail: "Category not updated", catalog: true },
          );
        },
        addCat: (name) => {
          const n = name.trim();
          const s = get();
          if (
            !n ||
            s.cats.some((c) => c.name.toLowerCase() === n.toLowerCase())
          )
            return false;
          const temp: Category = {
            id: vid("new-"),
            name: n,
            on: true,
            order: s.cats.length,
          };
          void optimistic(
            { cats: [...s.cats, temp] },
            (r) => r.createCategory(n),
            {
              fail: "Category not added",
              catalog: true,
              done: (c) => ({
                cats: get().cats.map((x) => (x.id === temp.id ? c : x)),
              }),
            },
          );
          return true;
        },
        toggleBrand: (id) => {
          const b = get().brands.find((x) => x.id === id);
          if (!b) return;
          void optimistic(
            { brands: replace(get().brands, { ...b, on: !b.on }) },
            (r) => r.patchBrand(id, { on: !b.on }),
            { fail: "Kitchen not updated", catalog: true },
          );
        },
        saveBrand: (b) => {
          const { id, order: _order, ...patch } = b;
          void optimistic(
            { brands: replace(get().brands, b) },
            (r) => r.patchBrand(id, patch),
            { fail: "Kitchen not saved", catalog: true },
          );
        },
        toggleSec: (k) => {
          const secs = get().secs.map((y) =>
            y.k === k ? { ...y, on: !y.on } : y,
          );
          void optimistic(
            { secs },
            (r) => r.patchHome({ sections: secs }),
            { fail: "Layout not saved", catalog: true },
          );
        },
        toggleBanner: (id) => {
          const b = get().banners.find((x) => x.id === id);
          if (!b) return;
          void optimistic(
            { banners: replace(get().banners, { ...b, on: !b.on }) },
            (r) => r.patchBanner(id, { on: !b.on }),
            { fail: "Banner not updated", catalog: true },
          );
        },
        setDeal: (d) => {
          const deal = { ...get().deal, ...d };
          set({ deal });
          pending.home.deal = deal;
          saveSoon("home", "Deal not saved");
        },
        setStore: (p) => {
          set(p);
          if (p.storeOpen !== undefined) pending.store.open = p.storeOpen;
          if (p.prep !== undefined) pending.store.prep = p.prep;
          if (p.fee !== undefined) pending.store.fee = p.fee;
          if (p.freeAt !== undefined) pending.store.freeAt = p.freeAt;
          saveSoon("store", "Setting not saved");
        },
        togglePost: (id) => {
          const p = get().posts.find((x) => x.id === id);
          if (!p) return;
          void optimistic(
            { posts: replace(get().posts, { ...p, on: !p.on }) },
            (r) => r.patchPost(id, { on: !p.on }),
            { fail: "Story not updated", catalog: true },
          );
        },
        savePost: (e) => {
          const s = get();
          const exists = !!e.id && s.posts.some((p) => p.id === e.id);
          const unfeature = (list: Post[], keep: string) =>
            e.featured
              ? list.map((p) => ({ ...p, featured: p.id === keep }))
              : list;
          const input = {
            title: e.title,
            cat: e.cat,
            img: e.img,
            author: e.author,
            featured: e.featured,
            on: e.on,
            dish: e.dish,
            excerpt: e.excerpt,
            body: e.body,
          };
          if (exists) {
            void optimistic(
              { posts: unfeature(replace(s.posts, e), e.id) },
              (r) => r.patchPost(e.id, input),
              {
                fail: "Story not saved",
                catalog: true,
                done: (p) => ({ posts: replace(get().posts, p) }),
              },
            );
            return;
          }
          const temp: Post = {
            ...e,
            id: vid("new-"),
            likes: 0,
            mins: 1,
            date: "Today",
          };
          void optimistic(
            { posts: unfeature([temp, ...s.posts], temp.id) },
            (r) => r.createPost(input),
            {
              fail: "Story not published",
              catalog: true,
              done: (p) => ({
                posts: get().posts.map((x) => (x.id === temp.id ? p : x)),
              }),
            },
          );
        },
        deletePost: (id) =>
          void optimistic(
            { posts: get().posts.filter((p) => p.id !== id) },
            (r) => r.deletePost(id),
            { fail: "Story not deleted", catalog: true },
          ),
        setBookingStatus: (id, status) =>
          void optimistic(
            {
              bookings: get().bookings.map((x) =>
                x.id === id ? { ...x, status } : x,
              ),
            },
            (r) => r.setBookingStatus(id, status),
            { fail: "Reservation not updated" },
          ),
        replyReview: (id) =>
          void optimistic(
            {
              reviews: get().reviews.map((x) =>
                x.id === id ? { ...x, replied: true } : x,
              ),
            },
            (r) => r.replyReview(id),
            { fail: "Reply not sent" },
          ),
        resetDemo: () => {
          const s = get();
          // keep who you are, the cached catalog and your server data; reset the
          // device-only parts
          const keep: (keyof AppData)[] = [
            "onboarded",
            "theme",
            "catalogVersion",
            "menu",
            "cats",
            "brands",
            "banners",
            "secs",
            "deal",
            "posts",
            "storeOpen",
            "prep",
            "fee",
            "freeAt",
            "orders",
            "bookings",
            "points",
            "credit",
            "redeemed",
            "vouchers",
          ];
          set({
            ...seedData(),
            ...Object.fromEntries(keep.map((k) => [k, s[k]])),
          });
        },
      };
    },
    {
      name: "ember-kitchen",
      version: 4,
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted, version) => {
        const old = (persisted ?? {}) as Partial<AppData>;
        if (version < 2) {
          const fresh = seedData();
          return {
            ...fresh,
            onboarded: old.onboarded ?? false,
            theme: old.theme ?? null,
            saved: old.saved ?? fresh.saved,
            addrs: old.addrs ?? fresh.addrs,
            addr: old.addr ?? 0,
            cards: old.cards ?? fresh.cards,
            defCard: old.defCard ?? fresh.defCard,
            prefs: old.prefs ?? fresh.prefs,
            liked: old.liked ?? [],
          } as AppData;
        }
        const state = {
          ...(persisted as AppData & {
            user?: unknown;
            role?: unknown;
            isAdmin?: unknown;
          }),
        };
        if (version < 3) Object.assign(state, { orders: [], bookings: [] });
        if (version < 4) {
          delete state.user;
          delete state.role;
          delete state.isAdmin;
        }
        return state as AppData;
      },
      partialize: (s) => {
        const out: Partial<AppState> = {};
        for (const [k, v] of Object.entries(s))
          if (typeof v !== "function")
            (out as Record<string, unknown>)[k] = v;
        return out;
      },
    },
  ),
);

/** Number shown for an order before the server confirms it (it assigns the real one). */
export const nextOrderNo = (s: Pick<AppData, "orders">) =>
  "EK-" + (4851 + s.orders.length);

/** "7:30" (PM) → minutes since 5pm-ish, for sorting. */
export function timeVal(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

const subscribeHydration = (cb: () => void) =>
  useApp.persist.onFinishHydration(cb);
const getHydrated = () => useApp.persist.hasHydrated();
export const useHydrated = () =>
  useSyncExternalStore(subscribeHydration, getHydrated, getHydrated);
export type { HomeConfig, StoreConfig };