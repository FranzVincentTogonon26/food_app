import { endSession, startSession } from "@/store/accountSession";
import { useSession } from "@/store/sessions";
import type { User } from "@/store/types";

/**
 * The account layer, in its local-first form. Same exports as the final file, so
 * the sign-in screens are already written the final way - but sign-in is faked
 * on purpose: the user lives in the session store on this phone, and no password
 * is checked. Real accounts with Firebase replace this one file.
 */

export type AccountResult =
  | { ok: true; user: User }
  | { ok: false; cancelled?: boolean; message: string };

export function authMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Something went wrong. Try again.";
}

const vidFor = (key: string) =>
  "local-" +
  key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const nameFrom = (email: string) => {
  const n = email.trim().split("@")[0] || "Ember guest";
  return n.charAt(0).toUpperCase() + n.slice(1);
};

export async function signInWithEmail(
  email: string,
  _password: string,
): Promise<AccountResult> {
  const vid = vidFor(email);
  const prev = useSession.getState().user;
  return {
    ok: true,
    user:
      prev?.vid === vid
        ? prev
        : { vid, name: nameFrom(email), email: email.trim() },
  };
}

export async function registerWithEmail(
  name: string,
  email: string,
  _password: string,
): Promise<AccountResult> {
  return {
    ok: true,
    user: { vid: vidFor(email), name: name.trim(), email: email.trim() },
  };
}

/** Nothing is sent yet; the screen still says a link is on its way. */
export async function sendPasswordReset(
  _email: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  return { ok: true };
}

export async function signInWithProvider(
  provider: "apple" | "google",
): Promise<AccountResult> {
  const name = provider === "apple" ? "Apple guest" : "Google guest";
  return {
    ok: true,
    user: {
      vid: vidFor(provider),
      name,
      email: `${provider}@example.com`,
      provider,
    },
  };
}

export async function updateAccountProfile(patch: {
  name: string;
  phone?: string;
}): Promise<void> {
  useSession.getState().updateUser({ name: patch.name, phone: patch.phone });
}

export { startSession };

export async function signOutAccount(): Promise<void> {
  endSession();
}

/** Nothing to listen to yet: local accounts restore with the session store. */
export function useAccountSession() {}
