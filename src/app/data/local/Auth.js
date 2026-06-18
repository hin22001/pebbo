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
    try {
      if (typeof window != "undefined" && dataUser) {
        localStorage.setItem("dataUser", JSON.stringify(dataUser));
        // Phase 4: dual-write minimal session for server-readable auth (getSessionFromCookies)
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
          maxAge: 60 * 60 * 24 * 7,
          ...(Config.urlCookie && { domain: Config.urlCookie }),
        });
      }
    } catch (err) {}
  },

  getDataUser: () => {
    try {
      if (typeof window != "undefined") {
        return JSON.parse(localStorage?.getItem("dataUser") || "null");
      }
    } catch (err) {
      return null;
    }
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
          "coinBalance",
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
        year: parseInt(response?.payload?.data?.year) || 2,
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
          year: parseInt(response?.payload?.data?.year) || 2,
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

        // Sync coin balance from DB to localStorage if available
        const totalCoins = response.payload?.data?.total_coins;
        if (typeof totalCoins === "number" && typeof window !== "undefined") {
          localStorage.setItem("coinBalance", totalCoins.toString());
          // Dispatch event to update UI components listening for coin changes
          const event = new CustomEvent("coinBalanceUpdated", {
            detail: { newBalance: totalCoins },
          });
          window.dispatchEvent(event);
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
