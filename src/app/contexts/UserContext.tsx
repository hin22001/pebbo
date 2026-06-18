"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch } from "react-redux";
import { assignMainLayout } from "@/app/contexts/redux/actions";
import Auth from "@/app/data/local/Auth";
import Config from "@/app/constant/Config";
import Cookies from "js-cookie";
import UserAPI from "@/app/data/api/UserAPI";

export type UserContextValue = {
  name?: string;
  year?: number;
  role?: { id?: string; name?: string };
  paying?: boolean;
  onboarding_completed?: boolean;
  profile_image?: string | number;
  stars?: string;
  education_level?: string;
  email?: string;
  [key: string]: unknown;
} | null;

type UserContextState = {
  user: UserContextValue;
  refreshUser: () => Promise<UserContextValue | null>;
};

const UserContext = createContext<UserContextState | undefined>(undefined);

function syncInitialUserToClient(initialUser: UserContextValue) {
  if (typeof window === "undefined" || !initialUser) return;
  try {
    localStorage.setItem("dataUser", JSON.stringify(initialUser));
    const payload = {
      role: initialUser?.role?.name ?? initialUser?.role,
      onboarding_completed: initialUser?.onboarding_completed,
      paying: initialUser?.paying,
      name: initialUser?.name,
      year: initialUser?.year,
    };
    const value = btoa(
      unescape(encodeURIComponent(JSON.stringify(payload))),
    );
    Cookies.set(Config.sessionCookieName, value, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      ...(Config.urlCookie && { domain: Config.urlCookie }),
    });
  } catch {
    // ignore
  }
}

type UserProviderProps = {
  initialUser?: UserContextValue | null;
  children: React.ReactNode;
};

export function UserProvider({
  initialUser = null,
  children,
}: UserProviderProps) {
  const [user, setUser] = useState<UserContextValue>(initialUser ?? null);
  const dispatch = useDispatch();
  const hasSynced = React.useRef(false);

  const refreshUser = useCallback(async (): Promise<UserContextValue | null> => {
    try {
      const res = await UserAPI.getMe();
      const dataUser =
        (res as { payload?: { data?: UserContextValue } })?.payload?.data ??
        (res as { data?: UserContextValue })?.data ??
        null;
      if (dataUser) {
        syncInitialUserToClient(dataUser);
        (dispatch as (action: unknown) => void)(
          assignMainLayout({
            type: "ASSIGN_UPDATE_USER_INFO",
            value: dataUser,
          }),
        );
        setUser(dataUser);
        return dataUser;
      }
      return null;
    } catch {
      return null;
    }
  }, [dispatch]);

  useEffect(() => {
    if (!initialUser || hasSynced.current) return;
    hasSynced.current = true;
    syncInitialUserToClient(initialUser);
    (dispatch as (action: unknown) => void)(
      assignMainLayout({
        type: "ASSIGN_UPDATE_USER_INFO",
        value: initialUser,
      }),
    );
    setUser(initialUser);
  }, [initialUser, dispatch]);

  const value = useMemo<UserContextState>(
    () => ({
      user: user ?? initialUser ?? null,
      refreshUser,
    }),
    [user, initialUser, refreshUser],
  );

  return (
    <UserContext.Provider value={value}>{children}</UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  const context = useContext(UserContext);
  if (context === undefined) {
    return typeof window !== "undefined" ? Auth.getDataUser() : null;
  }
  return context.user ?? null;
}

/** Call after profile update to sync latest user to localStorage + Redux + context */
export function useRefreshUser(): () => Promise<UserContextValue | null> {
  const context = useContext(UserContext);
  return context?.refreshUser ?? (async () => null);
}
