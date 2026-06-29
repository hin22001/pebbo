import { Config } from "@/app/constant";
import Cookies from "js-cookie";
import { LoginAPI } from "@/app/data/api";
import { Helpers } from "@/app/utils";
import Language from "./Language";
import UserAPI from "../api/UserAPI";
import { PUBLIC_PATHS } from "@/app/config/authRoutes";

const Auth = {
  /** @deprecated Use PUBLIC_PATHS from @/app/config/authRoutes. Kept for backwards compatibility. */
  whiteListPath: PUBLIC_PATHS,
  getAuth: async () => {
    const res = await LoginAPI.getIsAuth();

    const isAuth = res?.status == 200;
    return isAuth;
  },
  isAuthenticated: async () => {
    try {
      if (typeof window === "undefined") return true;

      if (Config.isCookie === "false") {
        return true;
      } else {
        const arrUrls = Auth.whiteListPath;
        const pathname = window.location.pathname;

        if (!arrUrls.includes(pathname)) {
          const isAuth = Auth.getDataUser() != null;
          return isAuth;
        }
        return true;
      }
    } catch (err) {
      return false;
    }
  },

  setDataUser: (dataUser) => {
    if (typeof window === "undefined" || !dataUser) return;

    // Write the server-readable session cookie FIRST. getDataUser() falls back
    // to this cookie when localStorage is empty/unavailable, so it must be the
    // more durable of the two writes — set it before the localStorage write,
    // which can throw (quota/blocked) and would otherwise skip the cookie.
    // Phase 4: dual-write minimal session for server-readable auth (getSessionFromCookies)
    try {
      const payload = {
        role: dataUser?.role?.name ?? dataUser?.role,
        onboarding_completed: dataUser?.onboarding_completed,
        paying: dataUser?.paying,
        name: dataUser?.name,
        year: dataUser?.year,
      };
      const value = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      Cookies.set(Config.sessionCookieName, value, {
        path: "/",
        sameSite: "lax",
        expires: 7, // js-cookie: days (NOT maxAge — that's unsupported and a number crashes set())
        ...(Config.urlCookie && { domain: Config.urlCookie }),
      });
    } catch (err) {
      console.warn("Auth.setDataUser: failed to write session cookie", err);
    }

    try {
      localStorage.setItem("dataUser", JSON.stringify(dataUser));
    } catch (err) {
      console.warn("Auth.setDataUser: failed to write dataUser to localStorage", err);
    }
  },

  getDataUser: () => {
    if (typeof window === "undefined") return null;

    try {
      const raw = localStorage?.getItem("dataUser");
      if (raw) return JSON.parse(raw);
    } catch (err) {
      console.warn(
        "Auth.getDataUser: localStorage read failed, falling back to session cookie",
        err,
      );
    }

    // Fallback: reconstruct a minimal user from the durable _pebbo_session
    // cookie. Covers the first-login window where the localStorage write isn't
    // yet readable/available, which would otherwise make the auth gate read
    // "no user" and falsely log the user out on their first navigation.
    return Auth.getSessionFromCookie();
  },

  // Decode the server-readable _pebbo_session cookie into a gate-compatible
  // user shape. Inverse of the payload encoded in setDataUser (and mirrors the
  // server-side getSessionFromCookies). Returns null if the cookie is absent or
  // malformed — so a logged-out user (logout clears the cookie) still reads null.
  getSessionFromCookie: () => {
    try {
      if (typeof window === "undefined") return null;
      const raw = Cookies.get(Config.sessionCookieName);
      if (!raw) return null;
      const decoded = JSON.parse(decodeURIComponent(escape(atob(raw))));
      if (!decoded || typeof decoded !== "object") return null;
      return {
        name: decoded.name,
        year: decoded.year,
        paying: decoded.paying,
        onboarding_completed: decoded.onboarding_completed,
        role: decoded.role ? { id: decoded.role, name: decoded.role } : undefined,
      };
    } catch (err) {
      return null;
    }
  },

  // --- Coin balance reconciliation -------------------------------------------
  // The navbar coin chip (CoinBalanceModule) renders from localStorage only.
  // The DB is the source of truth (user_coins.total_coins = unique-correct
  // questions + sum(coin_transactions)). These helpers push the authoritative
  // DB value into the chip's observer channel so it never drifts.

  // Reward redemption (RewardPage) is currently localStorage-only — it has no
  // DB row — so the spendable balance shown = DB total minus locally-recorded
  // spend. With no redemptions this is just the DB total. If redemption ever
  // moves server-side, the spend term naturally goes to 0 and this collapses to
  // the raw DB total.
  computeDisplayCoins: (dbTotal) => {
    const base = Number(dbTotal);
    if (!Number.isFinite(base)) return null;
    if (typeof window === "undefined") return base;
    try {
      const raw = localStorage.getItem("redeemedRewards");
      const spent = raw
        ? JSON.parse(raw).reduce((sum, r) => sum + (Number(r?.cost) || 0), 0)
        : 0;
      return Math.max(0, base - spent);
    } catch (err) {
      return base;
    }
  },

  // Snap the coin chip to an absolute value (writes localStorage + notifies the
  // mounted CoinBalanceModule via the event it already listens for).
  syncCoinBalance: (value) => {
    const v = Number(value);
    if (!Number.isFinite(v) || typeof window === "undefined") return;
    localStorage.setItem("coinBalance", String(v));
    window.dispatchEvent(
      new CustomEvent("coinBalanceUpdated", { detail: { newBalance: v } }),
    );
  },

  // Stars mirror the coin channel: stored DB column (students.stars), pushed to
  // the navbar StarBalanceModule via an event so the chip updates the instant a
  // star is earned. Only ever written with authoritative DB values — there is no
  // local increment, so it cannot drift.
  syncStars: (value) => {
    const v = Number(value);
    if (!Number.isFinite(v) || typeof window === "undefined") return;
    localStorage.setItem("starBalance", String(v));
    window.dispatchEvent(
      new CustomEvent("starsUpdated", { detail: { newBalance: v } }),
    );
  },

  getToken: () => {
    try {
      if (Config.isCookie === "false") {
        return Config.token;
      } else {
        const token = Cookies.get(Config.cookieName);
        return token;
      }
    } catch (err) {}
  },

  setToken: (token) => {
    try {
      if (typeof window != "undefined") {
        Cookies.set(Config.cookieName, token, {
          expires: 6, // ==> 7 day token will be expired, sync with back end
          domain: Config.urlCookie,
          ...(Config.isProd && {
            httpOnly: true,
            sameSite: "strict",
            path: "/",
            secure: true,
          }),
        });
      }
    } catch (err) {}
  },

  logout: async () => {
    try {
      if (typeof window != "undefined") {
        const lang = Helpers.getCurrentLanguage();

        try {
          const response = await LoginAPI.postSignOut();
        } catch (err) {}

        // Selective localStorage clearing - preserve onboarding and settings
        const keysToPreserve = [
          "soundEnabled",
          // NOTE: "coinBalance" is intentionally NOT preserved — it is a
          // per-user value reconciled from the DB on next load. Preserving it
          // leaked the previous user's balance into the next login.
          "ava",
          "intro_completed",
          "app_version",
          "checkin",
          "hasSeenStreakPopup",
          "language",
          "modalTeacher",
        ];

        // Preservation logic for contextual onboarding (intro_completed_*) and study logs (pebbo_*)
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (!key) continue;

          const isPreserved =
            keysToPreserve.includes(key) ||
            key.startsWith("intro_completed_") ||
            key.startsWith("pebbo_");

          if (!isPreserved) {
            keysToRemove.push(key);
          }
        }

        keysToRemove.forEach((key) => localStorage.removeItem(key));

        Cookies.remove(Config.sessionCookieName, {
          path: "/",
          ...(Config.urlCookie && { domain: Config.urlCookie }),
        });

        Language.setLanguage(lang);
        sessionStorage.clear();
        window.location.replace("/login");

        return response;
      }
    } catch (err) {}
  },

  refreshCurrentUser: async (options = {}) => {
    try {
      const force = options?.force ?? false;

      if (!force) {
        const existingUser = Auth.getDataUser();
        if (existingUser) {
          return existingUser;
        }
      }

      let response = await LoginAPI.getStudentProfile();
      if (!response?.payload?.data) {
        response = await UserAPI.getProfile();
      }
      const profileName =
        response?.payload?.data?.first_name +
        " " +
        response?.payload?.data?.last_name;

      let refactorDataUser = {
        name:
          profileName?.length > 1
            ? profileName
            : response?.payload?.data?.email?.split("@")[0],
        education_level: response?.payload?.data?.education_level,
        year: 2, // App rule: every logged-in user defaults to grade 2 (DB left unchanged)
        role: {
          id: "student",
          name: "Student",
        },
      };

      if (response?.payload?.status === 200) {
        const data = response.payload?.data;

        refactorDataUser = {
          stars: response.payload?.data?.stars || "0",
          name:
            profileName?.length > 1
              ? profileName
              : response.payload?.data?.email?.split("@")[0],
          education_level: response?.payload?.data?.education_level,
          year: 2, // App rule: every logged-in user defaults to grade 2 (DB left unchanged)
          profile_image: response?.payload?.data?.profile_image,
          paying: response?.payload?.data?.paying ?? false,
          onboarding_completed:
            response?.payload?.data?.onboarding_completed ?? false,
          role: {
            id: "student",
            name: "Student",
          },
        };

        Auth.setDataUser(refactorDataUser);

        // Reconcile coin chip to the authoritative DB total (spend-aware).
        const totalCoins = response.payload?.data?.total_coins;
        if (typeof totalCoins === "number") {
          Auth.syncCoinBalance(Auth.computeDisplayCoins(totalCoins));
        }

        try {
          // const { assignMainLayout } = require('@/app/contexts/redux/actions')
          // await assignMainLayout({
          //   type: 'ASSIGN_UPDATE_USER_INFO',
          //   value: data,
          // })
        } catch (err) {}

        return refactorDataUser;
      }

      return null;
    } catch (err) {
      return null;
    }
  },

  getSignInRedirect: () => {
    // => keepData = Boolean

    try {
      return JSON.parse(sessionStorage.getItem("sign-in-redirect"));
    } catch (err) {
      return null;
    }
  },

  setSignInRedirect: (params) => {
    // => keepData = Boolean

    // => Params
    // => removeData: Boolean
    // => type: sign-in || sign-up
    // => auth: google || facebook || apple

    try {
      if (!params?.removeData) {
        sessionStorage.setItem(
          "sign-in-redirect",
          JSON.stringify({
            type: params?.type,
            auth: params?.auth,
          }),
        );
      } else if (params?.removeData) {
        sessionStorage.removeItem("sign-in-redirect");
      }
    } catch (err) {}
  },

  checkLocalAuth: () => {
    try {
      const pathname = window.location.pathname;
      const arrUrls = Auth.whiteListPath;

      const isWhiteList = arrUrls.includes(pathname);

      const authUser = Auth.getDataUser() != null;

      if (isWhiteList || authUser) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  },
};

export default Auth;
