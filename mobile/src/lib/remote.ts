import { POINTS, REWARDS, type Booking, type Me } from "@food_app/shared";

import { useSession } from "@/store/sessions";
import { registerRemote, useApp, type Remote } from "@/store/store";

/**
 * The remote, in its local-first form: a stand-in for the server that answers
 * every call the store makes, on this phone. When we build the API, the real
 * remote takes its place behind the same seam.
 */

const id = (p: string) =>
  p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const find = <T extends { id: string }>(list: T[], key: string) => {
  const x = list.find((i) => i.id === key);
  if (!x) throw new Error("That item is no longer here.");
  return x;
};

const today = () =>
  new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });

function me(patch: Partial<Me> = {}): Me {
  const { user, role } = useSession.getState();
  const uid = user?.vid;
  if (!user || !uid) throw new Error("Sign in first.");
  const s = useApp.getState();
  return {
    uid,
    name: user.name,
    email: user.email,
    phone: user.phone ?? null,
    photo: user.photo ?? null,
    provider: user.provider ?? "password",
    role,
    admin: role === "admin",
    points: s.points,
    credit: s.credit,
    redeemed: s.redeemed,
    vouchers: s.vouchers,
    ...patch,
  };
}

export const remote: Remote = {
  validatePromo: async (code) => {
    const c = code.trim().toUpperCase();
    const p = useApp
      .getState()
      .promos.find((x) => x.on && x.code.toUpperCase() === c);
    if (!p) throw new Error(`${c} isn't an active code.`);
    return { code: p.code, pct: p.pct };
  },
  redeem: async (rewardId) => {
    const r = REWARDS.find((x) => x.id === rewardId);
    if (!r) throw new Error("That reward is no longer offered.");
    const s = useApp.getState();
    if (s.redeemed.includes(r.id))
      throw new Error("You've already redeemed that.");
    if (s.points < r.pts) throw new Error("Not enough points yet.");
    return me({
      points: s.points - r.pts,
      credit: r.credit ? s.credit + r.credit : s.credit,
      redeemed: [...s.redeemed, r.id],
      vouchers: r.dish
        ? [
            ...s.vouchers,
            {
              id: id("v"),
              reward: r.id,
              dish: r.dish,
              s: r.s ?? 0,
            },
          ]
        : s.vouchers,
    });
  },
  reportIssue: async (orderId, _type, text) => {
    const o = find(useApp.getState().orders, orderId);
    useApp.getState().pushInbox(
      "support_agent",
      "We're on it",
      text || `Your report for ${o.no} reached the kitchen.`,
    );
  },
  rate: async (orderId, input) => {
    const s = useApp.getState();
    const o = find(s.orders, orderId);
    useApp.setState({ points: s.points + POINTS.rating });
    return { ...o, rated: input.stars };
  },
  book: async (b) => {
    const { user } = useSession.getState();
    if (!user?.vid) throw new Error("Sign in first.");
    const booking: Booking = {
      id: id("b"),
      code: "EK-" + Math.floor(1000 + Math.random() * 9000),
      vid: user.vid,
      name: user.name,
      party: b.party,
      time: b.time,
      seat: b.seat,
      status: 0,
      date: b.date,
      occ: b.occ,
      req: b.req,
    };
    useApp.setState((s) => ({ points: s.points + POINTS.booking }));
    return booking;
  },
  cancelBooking: async (key) => {
    const b = find(useApp.getState().bookings, key);
    return { ...b, status: 2 };
  },
  createProduct: async (p) => {
    const s = useApp.getState();
    return {
      ...p,
      id: id("p"),
      rating: 5,
      reviews: 0,
      order: s.menu.length,
    };
  },
  patchProduct: async (id, p) => ({
    ...find(useApp.getState().menu, id),
    ...p,
  }),
  deleteProduct: async () => {},
  createCategory: async (name) => {
    const s = useApp.getState();
    return {
      id: id("cat"),
      name,
      on: true,
      order: s.cats.length,
    };
  },
  patchCategory: async (id, p) => ({
    ...find(useApp.getState().cats, id),
    ...p,
  }),
  patchBrand: async (id, p) => ({
    ...find(useApp.getState().brands, id),
    ...p,
  }),
  patchBanner: async (id, p) => ({
    ...find(useApp.getState().banners, id),
    ...p,
  }),
  reorder: async () => {},
  patchHome: async (p) => {
    const s = useApp.getState();
    return {
      sections: p.sections ?? s.secs,
      deal: p.deal ?? s.deal,
    };
  },
  patchStore: async (p) => {
    const s = useApp.getState();
    return {
      open: p.open ?? s.storeOpen,
      prep: p.prep ?? s.prep,
      fee: p.fee ?? s.fee,
      freeAt: p.freeAt ?? s.freeAt,
    };
  },
  createPromo: async (code, pct) => ({
    code: code.toUpperCase(),
    pct,
    used: 0,
    on: true,
  }),
  patchPromo: async (code, on) => {
    const p = useApp
      .getState()
      .promos.find((x) => x.code.toUpperCase() === code.toUpperCase());
    if (!p) throw new Error("That code is no longer here.");
    return { ...p, on };
  },
  createPost: async (p) => ({
    ...p,
    id: id("p"),
    likes: 0,
    date: today(),
    mins: 1,
  }),
  patchPost: async (id, p) => ({
    ...find(useApp.getState().posts, id),
    ...p,
  }),
  deletePost: async () => {},
  setBookingStatus: async (id, status) => ({
    ...find(useApp.getState().bookings, id),
    status,
  }),
  replyReview: async (id) => ({
    ...find(useApp.getState().reviews, id),
    replied: true,
  }),
  catalogChanged: () => {},
  refreshMe: async () => {
    if (!useSession.getState().user) return;
    useApp.getState().applyMe(me());
  },
  errorMessage: (e) => (e instanceof Error ? e.message : String(e)),
};

registerRemote(remote);