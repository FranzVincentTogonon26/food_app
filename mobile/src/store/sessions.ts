import { isStaff, type Role } from "@food_app/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Href } from "expo-router";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "./types";

type SessionState = {
  /** the signed-in account, or null */
  user: User | null;
  /** the account's team role; 'user' (a customer) until the server says otherwise */
  role: Role;
  /** Firebase has reported this launch's session (until then user is the saved one) */
  ready: boolean;
  /** the server confirmed role this launch */
  roleConfirmed: boolean;
  /** browsing as a guest without signing in */
  isGuest: boolean;
  signIn: (user: User) => void;
  updateUser: (patch: Partial<User>) => void;
  /** the server's word on the account's role */
  setRole: (role: Role) => void;
  setGuest: (guest: boolean) => void;
  signout: () => void;
  setReady: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      role: "user",
      ready: false,
      roleConfirmed: false,
      isGuest: false,
      signIn: (user) =>
        set((s) => {
          // if switching accounts, drop roleConfirmed so the new account re-validates
          const sameAccount = s.user?.vid === user.vid;
          return {
            user,
            role: user.role ?? s.role,
            roleConfirmed: sameAccount,
            isGuest: false,
          };
        }),
      updateUser: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : null })),
      setRole: (role) => set({ role, roleConfirmed: true }),
      setGuest: (isGuest) => set({ isGuest }),
      signout: () =>
        set({ user: null, role: "user", roleConfirmed: false, isGuest: false }),
      setReady: () => set({ ready: true }),
    }),
    {
      name: "ember-session",
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, role: s.role }),
    }
  )
);

/* selectors (use with useSession(selector)) */
export const selectSignedIn = (s: Pick<SessionState, "user">) => !!s.user?.vid;
export const selectUid = (s: Pick<SessionState, "user">) => s.user?.vid;

/** Only a signed-in admin. */
export const selectIsAdmin = (s: Pick<SessionState, "user" | "role">) =>
  !!s.user?.vid && s.role === "admin";

/** Any signed-in team member, admins included. */
export const selectIsStaff = (s: Pick<SessionState, "user" | "role">) =>
  !!s.user?.vid && isStaff(s.role);

/** The signed-in account's id, outside React. */
export const currentUid = () => useSession.getState().user?.vid;

/** Where each role works: the console for admins, the team queue for staff, the app for customers. */
export const homeFor = (role: Role): Href =>
  role === "admin" ? "/admin" : isStaff(role) ? "/staff" : "/";

const subscribeHydration = (cb: () => void) => useSession.persist.onFinishHydration(cb);
const getHydrated = () => useSession.persist.hasHydrated();

/** The saved session has loaded from the device (route guards wait for it, so nobody is bounced on launch). */
export const useSessionHydrated = () =>
  useSyncExternalStore(subscribeHydration, getHydrated, getHydrated);