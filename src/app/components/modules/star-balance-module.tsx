"use client";

import { useEffect, useState } from "react";
import Chip from "@/elements/chip/Chip";

interface StarBalanceModuleProps {
  initialStars?: number | string;
}

/**
 * Navbar star chip. Stars are a stored DB column (students.stars); this chip
 * holds its own state and listens for `starsUpdated` events so it reflects the
 * authoritative total the instant one is earned — instead of a stale prop.
 *
 * It deliberately ignores later `initialStars` prop changes: once mounted, the
 * event channel (fed only with authoritative DB values) is the source of truth,
 * so a stale Redux re-render can't push the number backwards.
 */
export function StarBalanceModule({ initialStars = 0 }: StarBalanceModuleProps) {
  const [stars, setStars] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("starBalance");
      if (saved != null && saved !== "") return parseInt(saved);
    }
    const seed = parseInt(`${initialStars}`);
    return Number.isFinite(seed) ? seed : 0;
  });

  useEffect(() => {
    const handleStarsUpdated = (event: any) => {
      const next = event?.detail?.newBalance;
      if (typeof next === "number" && Number.isFinite(next)) setStars(next);
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "starBalance" && e.newValue != null) {
        const v = parseInt(e.newValue);
        if (Number.isFinite(v)) setStars(v);
      }
    };

    window.addEventListener("starsUpdated", handleStarsUpdated as any);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("starsUpdated", handleStarsUpdated as any);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  return (
    <Chip
      icon={{
        name: "star-yellow",
        size: "medium",
      }}
      label={`${stars}`}
      theme={"white"}
      sx={{
        "& .MuiChip-label": {
          fontFamily: "'Advercase', serif !important",
          letterSpacing: "0.07rem",
        },
      }}
    />
  );
}
