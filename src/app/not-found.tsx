/**
 * not-found.tsx — App Router global 404 page.
 *
 * Fully server-rendered — zero client JS needed.
 * Replaces src/pages/404.jsx once the App Router is active.
 *
 * This file is automatically used by Next.js when a route is not found.
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found — Pebbo",
  description: "The page you are looking for does not exist.",
};

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "sans-serif",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          fontWeight: 700,
          margin: 0,
          color: "#8264FF",
        }}
      >
        404
      </h1>
      <h2 style={{ fontSize: "1.5rem", margin: "0.5rem 0 1rem" }}>
        Page Not Found
      </h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          padding: "0.75rem 1.5rem",
          background: "#8264FF",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Back to Home
      </Link>
    </div>
  );
}
