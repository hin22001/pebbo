/**
 * Single source of truth for auth-related route lists.
 * Used by Authentication.js (guard) and Auth.js (whitelist).
 * Phase 4: consolidated so (app) route guard and all path checks stay in sync.
 */

/** Paths that do not require authentication (public + localized variants). */
export const PUBLIC_PATHS = [
  "/",
  "/en",
  "/zh",
  "/login",
  "/login/verify",
  "/zh/login",
  "/zh/login/verify",
  "/en/login",
  "/en/login/verify",
  "/login/",
  "/login/verify/",
  "/zh/login/",
  "/zh/login/verify/",
  "/en/login/",
  "/en/login/verify/",
  "/signup/",
  "/signup",
  "/en/signup/",
  "/zh/signup/",
  "/en/signup",
  "/zh/signup",
  "/forgot/",
  "/forgot",
  "/en/forgot/",
  "/zh/forgot/",
  "/en/forgot",
  "/zh/forgot",
  "/reset-password/",
  "/reset-password",
  "/en/reset-password/",
  "/zh/reset-password/",
  "/en/reset-password",
  "/zh/reset-password",
  "/payment-success/",
  "/payment-success",
  "/en/payment-success/",
  "/zh/payment-success/",
  "/en/payment-success",
  "/zh/payment-success",
  "/activate-account/",
  "/activate-account",
  "/en/activate-account/",
  "/zh/activate-account/",
  "/en/activate-account",
  "/zh/activate-account",
  "/download/",
  "/download",
  "/en/download/",
  "/zh/download/",
  "/en/download",
  "/zh/download",
  "/contact/",
  "/contact",
  "/en/contact/",
  "/zh/contact/",
  "/en/contact",
  "/zh/contact",
  "/about/",
  "/about",
  "/en/about/",
  "/zh/about/",
  "/en/about",
  "/zh/about",
  "/pricing/",
  "/pricing",
  "/en/pricing/",
  "/zh/pricing/",
  "/en/pricing",
  "/zh/pricing",
  "/onboarding/placement/",
  "/onboarding/placement",
  "/onboarding/results/",
  "/onboarding/results",
  "/onboarding/resume-gate/",
  "/onboarding/resume-gate",
];

/** Paths unpaid students are allowed to access (onboarding, payment-success, pricing). */
export const UNPAID_STUDENT_ALLOWED_PATHS = [
  "/onboarding/placement",
  "/onboarding/placement/",
  "/onboarding/results",
  "/onboarding/results/",
  "/onboarding/resume-gate",
  "/onboarding/resume-gate/",
  "/payment-success",
  "/payment-success/",
  "/pricing",
  "/pricing/",
];

export function isPublicPath(pathname) {
  return pathname != null && PUBLIC_PATHS.includes(pathname);
}

export function isUnpaidStudentAllowedPath(pathname) {
  return pathname != null && UNPAID_STUDENT_ALLOWED_PATHS.includes(pathname);
}
