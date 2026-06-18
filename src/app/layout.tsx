import React from "react";
import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";

// Global styles (no client providers here — see (public)/layout and (app)/layout)
import "@/app/assets/scss/index.scss";
import "animate.css";
import "aos/dist/aos.css";

export const metadata: Metadata = {
  title: "Pebbo",
  description: "Pebbo Student Portal",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <NextTopLoader color="#FF5000" height={3} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
