/**
 * (public) Route Group Layout
 *
 * Lightweight: PublicProviders only (theme + MUI locale + AOS).
 * No Redux, Auth, or MainLayout — public pages load with a smaller client bundle.
 */
import React from "react";
import PublicProviders from "../PublicProviders";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicProviders>{children}</PublicProviders>;
}
