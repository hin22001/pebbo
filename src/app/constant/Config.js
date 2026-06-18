// ========================================
// ======== ENVIRONMENT CONFIG ============
// ========================================
const appName = "Pebbo";
const appNameVar = "pebbo-web";
const logo = require("@/images/logo/logo-pebbo.svg");
const defaultLanguage = "en";
const currency = "$";
const localeList = ["en", "zh"];
const currencyLocale = {
  en: "en-US",
  zh: "zh",
};
const muiLocale = {
  en: "enUS",
  zh: "zhHK",
};
const userYear = 2;

export const isProd = process.env.NEXT_PUBLIC_IS_PROD === "true" ? true : false;

// ===================================
// ======== COOKIE CONFIG ============
// ===================================

export const urlCookie =
  process.env.NEXT_PUBLIC_IS_LOCAL_DEV === "false"
    ? process.env.NEXT_PUBLIC_URL_COOKIES || ".pebbo.io"
    : "";
export const isCookie = process.env.NEXT_PUBLIC_IS_COOKIES || "false";
export const cookieName =
  "_pebbo" + (process.env.NEXT_PUBLIC_IS_PROD === "true" ? "" : "_dev");
/** Session payload cookie for server-readable auth (Phase 4). Client dual-writes here; server reads in getSessionFromCookies. */
export const sessionCookieName = "_pebbo_session";

export const isLocalDev =
  process.env.NEXT_PUBLIC_IS_LOCAL_DEV === "true" ? true : false;

// ===================================
// ======== TOKEN CONFIG =============
// ===================================

export const token = process.env.NEXT_PUBLIC_DEV_TOKEN;
export const loginKey = process.env.NEXT_PUBLIC_LOGIN_KEY || "";
export const jwtSecret = process.env.NEXT_PUBLIC_JWT_SECRET || "";

// ================================
// ======== API CONFIG ============
// ================================

export const apiURL =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? process.env.NEXT_PUBLIC_API_URL_PROD
    : process.env.NEXT_PUBLIC_API_URL_DEV;
export const apiKey = process.env.NEXT_PUBLIC_API_KEY;

export const apiURLNotification =
  process.env.NEXT_PUBLIC_IS_PROD === "true"
    ? process.env.NEXT_PUBLIC_API_SECOND_URL_PROD
    : process.env.NEXT_PUBLIC_API_SECOND_URL_DEV;

// ===========================
// ====== EXPORT VAR =========
// ===========================
const Config = {
  isProd,

  isCookie,
  cookieName,
  sessionCookieName,
  urlCookie,

  token,
  jwtSecret,
  loginKey,

  apiURL,
  apiKey,

  apiURLNotification,
  appName,
  appNameVar,
  logo,
  defaultLanguage,
  localeList,
  currency,
  currencyLocale,
  muiLocale,
  userYear,
};

export default Config;
