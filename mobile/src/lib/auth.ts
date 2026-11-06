import { isStaff } from "@food_app/shared";
import {
  router,
  useLocalSearchParams,
  useNavigation,
  type Href,
} from "expo-router";
import { create } from "zustand";

import { haptic } from "@/components/ui/Press";
import { startSession } from "@/store/accountSession";
import { toast } from "@/store/feedback";
import { useSession } from "@/store/sessions";
import type { User } from "@/store/types";

/** The fields shared by the Login, Register and Forgot screens. */
type AuthFields = {
  name: string;
  email: string;
  pw: string;
  showPw: boolean;
  terms: boolean;
};

type AuthFormState = AuthFields & {
  set: (p: Partial<AuthFields>) => void;
  reset: () => void;
};

const EMPTY: AuthFields = {
  name: "",
  email: "",
  pw: "",
  showPw: false,
  terms: false,
};

/**
 * One form shared by Login, Register and Forgot, so an email typed on one screen
 * carries to the next.
 */
export const useAuthForm = create<AuthFormState>((set) => ({
  ...EMPTY,
  set: (p) => set(p),
  reset: () => set(EMPTY),
}));

export const emailValid = (email: string) => /.+@.+\..+/.test(email);

/** 0 empty · 1 weak · 2 good (8+) · 3 strong (12+) */
export const pwScore = (pw: string) =>
  pw.length >= 12 ? 3 : pw.length >= 8 ? 2 : pw.length ? 1 : 0;

export type AuthPath = "/login" | "/register" | "/forgot";

const AUTH_ROUTES = new Set(["login", "register", "forgot"]);
const isAuthRoute = (name: string) => AUTH_ROUTES.has(name);

/** The screen a guard sent the user here from, if any. */
function useAuthNext(): string | null {
  const { next } = useLocalSearchParams<{ next?: string }>();
  return typeof next === "string" && next.startsWith("/") ? next : null;
}

/** Move between the auth screens without losing the shared form. */
export function useAuthNav() {
  const go = (path: AuthPath) => router.push(path);
  const toLogin = () => router.replace("/login");
  return { go, toLogin };
}

/** Where the account lands: the requested screen, or its role's home. */
function goToRoleHome(next: string | null) {
  if (next) return;
  const role = useSession.getState().role;
  router.replace(
    isStaff(role) ? (role === "admin" ? "/admin" : "/staff") : "/",
  );
}

/**
 * Leaving an auth screen: strip the auth screens from the stack and continue to
 * `next` (e.g. the cart), then report the sign-in on the way out.
 */
export function useExitAuth() {
  const navigation = useNavigation();
  const next = useAuthNext();

  const leave = (continueTo?: string | null) => {
    const st = navigation.getState();
    const routes = st ? st.routes.slice(0, st.index + 1) : [];
    let n = 0;
    while (n < routes.length && isAuthRoute(routes[routes.length - 1 - n].name))
      n++;

    if (n > 0 && n < routes.length) {
      router.dismiss(n);
    } else {
      if (n > 1) router.dismiss(n - 1);
      router.replace("/");
    }
    if (continueTo) router.push(continueTo as Href);
  };

  return {
    next,
    finish: (
      user: User,
      title: string,
      sub: string | ((name: string) => string),
    ) => {
      startSession(user);
      haptic("success");
      leave(next);
      goToRoleHome(next);
      const line = typeof sub === "function" ? sub(user.name) : sub;
      setTimeout(() => {
        if (next === "/checkout")
          toast(title, "Continue to checkout", { icon: "lock_open" });
        else toast(title, line, { icon: "waving_hand" });
      }, 220);
      setTimeout(() => useAuthForm.getState().reset(), 700);
    },
    /** After Apple / Google sign-in. */
    finishProvider: (user: User) => {
      const via = user.provider === "apple" ? "Apple" : "Google";
      const first = user.name.split(" ")[0];
      startSession(user);
      haptic("success");
      leave(next);
      goToRoleHome(next);
      setTimeout(() => {
        if (next === "/checkout")
          toast("Signed in with " + via, "Continue to checkout", {
            icon: "lock_open",
          });
        else
          toast("Welcome, " + first, "Signed in with " + via, {
            icon: "waving_hand",
          });
      }, 220);
      setTimeout(() => useAuthForm.getState().reset(), 700);
    },
    /** "Browse as guest" / "Back to cart" - leave without signing in. */
    guest: () => leave(),
  };
}
