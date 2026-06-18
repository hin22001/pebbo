import { createHash } from "crypto";

const FALLBACK_SALT = "pebbo-net-salt-2026";

function getIpPrefix(ip: string): string {
  if (!ip) return "unknown";

  const trimmed = ip.split(",")[0].trim();

  if (trimmed.includes(":")) {
    // IPv6 /56 using first 4 hextets
    const parts = trimmed.split(":");
    return `${parts.slice(0, 4).join(":")}::/56`;
  }

  const parts = trimmed.split(".");
  if (parts.length < 4) return trimmed;

  // IPv4 /24 prefix
  return `${parts.slice(0, 3).join(".")}.0/24`;
}

export function computeNetworkHash(
  ip: string | null,
  userAgent: string | null,
): string | null {
  if (!ip) return null;

  const salt = process.env.NETWORK_HASH_SALT || FALLBACK_SALT;
  const ipPrefix = getIpPrefix(ip);
  const uaFamily = (userAgent || "unknown").slice(0, 80);
  const raw = `${ipPrefix}|${uaFamily}|${salt}`;

  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

export function extractRegion(headers: Headers): string | null {
  return (
    headers.get("x-vercel-ip-city") ||
    headers.get("x-vercel-ip-country-region") ||
    headers.get("x-vercel-ip-country") ||
    null
  );
}

export function extractIp(headers: Headers): string | null {
  return headers.get("x-forwarded-for") || headers.get("x-real-ip") || null;
}
