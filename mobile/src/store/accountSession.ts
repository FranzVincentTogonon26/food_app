import { useSession } from "./sessions";
import { useApp } from "./store";
import type { User } from "./types";

/*
 * Starting and ending a session touches both stores: the session (who) and the app
 * data that belongs to that account (points, vouchers, orders, bookings).
 * lib/account.ts calls these as Firebase Auth reports sign-ins and sign-outs.
 */

/**
 * Signs `user` in on this device. Switching straight to another account clears
 * the previous one's data.
 */
export function startSession(user: User): void {
  const session = useSession.getState();
  if (session.user?.vid && session.user.vid !== user.vid)
    useApp.getState().clearAccount();
  session.signIn(user);
}

/** Forgets the signed-in user on this device (the menu, cart and settings stay). */
export function endSession(): void {
  useSession.getState().signout();
  useApp.getState().clearAccount();
}
