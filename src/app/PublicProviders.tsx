"use client";

import React, { useEffect, useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Helpers } from "@/app/utils";
import Config from "@/app/constant/Config";
import AOS from "aos";

/**
 * Minimal client providers for public routes (landing, login, signup, about, etc.).
 * Theme + MUI locale + AOS only. No Redux, Auth, or MainLayout — keeps public bundle small.
 */
export default function PublicProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<ReturnType<typeof createTheme> | null>(null);

  useEffect(() => {
    AOS.init({ easing: "ease-out-quad", duration: 1000 });
    const lang = Helpers.getCurrentLanguage();
    const muiLang: string = (Config as any).muiLocale?.[lang] || "enUS";
    let muiLocale;
    try {
      muiLocale = require("@mui/material/locale")[muiLang];
    } catch {
      muiLocale = require("@mui/material/locale")["enUS"];
    }
    setTheme(
      createTheme(
        {
          palette: {
            primary: { main: Helpers.getColor() || "#1DA1F2" },
            secondary: { main: Helpers.getColor("secondary") || "#14171A" },
          },
        },
        muiLocale,
      ),
    );
  }, []);

  const currentTheme = theme || createTheme();

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={currentTheme}>{children}</ThemeProvider>
    </LocalizationProvider>
  );
}
