"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type EventPayload = {
  event_id?: string;
  event_type: string;
  path?: string;
  question_id?: number;
  event_ts?: string;
  metadata?: Record<string, unknown>;
};

const FLUSH_INTERVAL_MS = 10_000;
const MAX_BATCH_SIZE = 50;
const TRACK_ENDPOINT = "/api/track";

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const key = "_pebbo_activity_sid";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const nextId = generateId();
  sessionStorage.setItem(key, nextId);
  return nextId;
}

let queue: EventPayload[] = [];
let sessionId = "";
let flushing = false;

function ensureSessionId(): string {
  if (!sessionId) {
    sessionId = getSessionId();
  }
  return sessionId;
}

async function flushQueue() {
  if (flushing || queue.length === 0) return;
  const sid = ensureSessionId();
  if (!sid) return;

  flushing = true;

  // Take batch out of queue — these events are considered sent.
  // Tracking is best-effort: if the request fails, we drop them
  // rather than re-queue and risk duplicates.
  const batch = queue.splice(0, MAX_BATCH_SIZE);

  try {
    await fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid, events: batch }),
      keepalive: true,
    });
  } catch {
    // Best-effort — silently drop on network failure.
    // The DB function handles dedup for any that did land.
  } finally {
    flushing = false;
  }
}

export function trackEvent(
  eventType: string,
  extra: Partial<Omit<EventPayload, "event_type" | "event_id" | "event_ts">> = {},
) {
  ensureSessionId();
  queue.push({
    event_id: generateId(),
    event_type: eventType,
    path:
      extra.path ||
      (typeof window !== "undefined" ? window.location.pathname : undefined),
    event_ts: new Date().toISOString(),
    ...extra,
  });

  if (queue.length >= MAX_BATCH_SIZE) {
    void flushQueue();
  }
}

export function useActivityTracker() {
  const pathname = usePathname();
  const previousPathRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sessionId = getSessionId();
    timerRef.current = setInterval(() => {
      void flushQueue();
    }, FLUSH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushQueue();
      }
    };

    const onBeforeUnload = () => {
      void flushQueue();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      void flushQueue();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (!pathname) return;

    if (previousPathRef.current && previousPathRef.current !== pathname) {
      trackEvent("page_exit", { path: previousPathRef.current });
    }

    trackEvent("page_view", { path: pathname });
    previousPathRef.current = pathname;
  }, [pathname]);

  return { trackEvent };
}
