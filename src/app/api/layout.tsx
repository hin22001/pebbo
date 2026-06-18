/**
 * API route segment config: force all /api/* routes to be dynamic.
 * Most routes use getAuthClient() (Supabase), which calls cookies() — they cannot be statically generated.
 * This prevents "Dynamic server usage: Route ... couldn't be rendered statically because it used `cookies`" at build.
 */
export const dynamic = "force-dynamic";

export default function ApiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
