"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

// Redux
import { Provider } from "react-redux";
import { legacy_createStore as createStore, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import reducers from "@/app/contexts/redux/reducers";

// MUI
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

// Contexts & Layout
import { Authentication } from "@/app/contexts";
import { UserProvider } from "@/app/contexts/UserContext";
import { TimerProvider } from "@/app/contexts/TimerContext";
import Auth from "@/app/data/local/Auth";
import ActivityTrackerProvider from "@/app/components/ActivityTrackerProvider";
import WebVitalsReporter from "@/app/components/WebVitalsReporter";
import { isPublicPath } from "@/app/config/authRoutes";

// Utils
import { Helpers } from "@/app/utils";
import Config from "@/app/constant/Config";

// Code-split MainLayout (preserve SSR, reduce dev bundle)
const MainLayout = dynamic(
  () => import("@/layouts/MainLayout/MainLayout"),
  { loading: () => null }  // null loading state (instant render)
);

// Supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Create the Redux store (consistent with _app.js)
const store = createStore(reducers, applyMiddleware(thunkMiddleware));

type ClientProvidersProps = {
  children: React.ReactNode;
  initialUser?: import("@/app/contexts/UserContext").UserContextValue | null;
};

export default function ClientProviders({
  children,
  initialUser = null,
}: ClientProvidersProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<any>(null);

  // Cast problematic components to any to bypass React 18 children type issues
  const ReduxProvider = Provider as any;
  const ConnectedAuthentication = Authentication as any;
  const ConnectedMainLayout = MainLayout as any;

  // Determine if it's a root/landing page
  const isRootPage = useMemo(() => {
    if (!pathname) return true;
    return (
      /^(\/[a-z]{2})?(\/(contact|about|pricing))?$/.test(pathname) ||
      pathname === "/"
    );
  }, [pathname]);

  const shouldReportWebVitals = useMemo(() => {
    if (!pathname || !initialUser) return false;
    const normalizedPath =
      pathname !== "/" && pathname.endsWith("/")
        ? pathname.slice(0, -1)
        : pathname;
    return !isPublicPath(normalizedPath);
  }, [pathname, initialUser]);

  useEffect(() => {
    // Lazy-load AOS after mount
    import("aos").then((AOS) => {
      AOS.default.init({
        easing: "ease-out-quad",
        duration: 1000,
      });
    });

    // Theme initialization with lazy-loaded MUI locale
    const lang = Helpers.getCurrentLanguage();
    const muiLang: string = (Config as any).muiLocale?.[lang] || "enUS";

    import("@mui/material/locale").then((localeModule: any) => {
      let muiLocale;
      try {
        muiLocale = localeModule[muiLang] || localeModule["enUS"];
      } catch (e) {
        muiLocale = localeModule["enUS"];
      }

      const newTheme = createTheme(
        {
          palette: {
            primary: { main: Helpers.getColor() || "#1DA1F2" },
            secondary: { main: Helpers.getColor("secondary") || "#14171A" },
          },
        },
        muiLocale,
      );

      setTheme(newTheme);
    });

    // Supabase auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        // Sign out logic
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Seed client-side Auth store with server-fetched user to avoid redundant profile fetches
  useEffect(() => {
    if (initialUser) {
      Auth.setDataUser(initialUser as any);
    }
  }, [initialUser]);

  // Avoid rendering until theme is ready during hydration if possible
  // but better to just render with fallback to avoid blank screen
  const currentTheme = theme || createTheme();

  return (
    <ReduxProvider store={store}>
      <UserProvider initialUser={initialUser ?? null}>
        <TimerProvider>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <ThemeProvider theme={currentTheme}>
              <ConnectedAuthentication>
                <ActivityTrackerProvider>
                  {isRootPage ? (
                    children
                  ) : (
                    <>
                      {shouldReportWebVitals && <WebVitalsReporter />}
                      <ConnectedMainLayout initialUser={initialUser ?? null}>
                        {children}
                      </ConnectedMainLayout>
                    </>
                  )}
                </ActivityTrackerProvider>
              </ConnectedAuthentication>
            </ThemeProvider>
          </LocalizationProvider>
        </TimerProvider>
      </UserProvider>
    </ReduxProvider>
  );
}
