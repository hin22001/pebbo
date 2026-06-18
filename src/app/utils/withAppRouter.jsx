"use client";
/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import Config from "@/app/constant/Config";

/**
 * withAppRouter — Higher-Order Component for using next/navigation in class components.
 *
 * Emulates legacy next/router contract for drop-in use in existing class components.
 * Provides a `router` prop with:
 *   - pathname         — current pathname string
 *   - asPath           — pathname + search (legacy Router.asPath)
 *   - query            — object of search params (like old Router.query)
 *   - locale           — derived from path or default
 *   - push(path)       — client-side navigation (SPA)
 *   - replace(path)    — replace current history entry
 *   - back() / refresh()
 *   - searchParams     — raw URLSearchParams instance (App Router only)
 *
 * Safe for both App Router and Pages Router environments.
 */
export function withAppRouter(WrappedComponent) {
  function WithAppRouterWrapper(props) {
    let router = null;
    let pathname = "";
    let searchParams = null;
    let query = {};

    // 1. Try App Router hooks first
    try {
      const {
        useRouter,
        usePathname,
        useSearchParams,
      } = require("next/navigation");
      router = useRouter();
      pathname = usePathname() ?? "";
      searchParams = useSearchParams();

      if (searchParams) {
        for (const [key, value] of searchParams.entries()) {
          query[key] = value;
        }
      }
    } catch (appRouterError) {
      // 2. Fallback to Pages Router
      try {
        const { useRouter: usePagesRouter } = require("next/router");
        const pagesRouter = usePagesRouter();
        router = pagesRouter;
        pathname = pagesRouter.pathname ?? "";
        query = pagesRouter.query ?? {};
      } catch (pagesRouterError) {
        // Fallback for SSR or edge cases
      }
    }

    // Legacy: asPath = pathname + search string
    const searchString =
      searchParams && typeof searchParams.toString === "function"
        ? searchParams.toString()
        : "";
    const asPath = searchString ? `${pathname}?${searchString}` : pathname;

    // Legacy: locale from path first segment or default
    const segment = pathname.split("/").filter(Boolean)[0];
    const locale =
      Config?.localeList?.includes(segment) ? segment : Config?.defaultLanguage ?? "en";

    // App Router push/replace only accept href string; legacy code passes { pathname, query }
    const buildHref = (arg) => {
      if (typeof arg === "string") return arg;
      if (arg && typeof arg === "object" && arg.pathname) {
        const q = arg.query && typeof arg.query === "object" ? arg.query : {};
        const search = new URLSearchParams();
        Object.keys(q).forEach((k) => {
          if (q[k] != null && q[k] !== "") search.set(k, String(q[k]));
        });
        const queryString = search.toString();
        return queryString ? `${arg.pathname}?${queryString}` : arg.pathname;
      }
      return String(arg);
    };
    const appRouter = {
      push: (hrefOrConfig) => (router?.push ? router.push(buildHref(hrefOrConfig)) : undefined),
      replace: (hrefOrConfig) => (router?.replace ? router.replace(buildHref(hrefOrConfig)) : undefined),
      back: router?.back?.bind(router),
      refresh: router?.refresh?.bind(router),
      pathname,
      asPath,
      query,
      locale,
      searchParams: searchParams ?? null,
    };

    return <WrappedComponent {...props} router={appRouter} />;
  }

  WithAppRouterWrapper.displayName = `withAppRouter(${WrappedComponent.displayName || WrappedComponent.name || "Component"})`;

  return WithAppRouterWrapper;
}

export default withAppRouter;
