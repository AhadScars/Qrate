import { Resolver } from "node:dns/promises";
import https from "node:https";

const FID = "(0x[0-9a-f]{1,16}:0x[0-9a-f]{1,16})";
const publicDns = new Resolver();
publicDns.setServers(["1.1.1.1", "8.8.8.8"]);

export function placeIdFromFid(fid: string) {
  const [aHex, bHex] = fid.split(":");
  if (!aHex || !bHex) return null;
  const bytes = Buffer.alloc(20);
  bytes[0] = 0x0a;
  bytes[1] = 0x12;
  bytes[2] = 0x09;
  bytes.writeBigUInt64LE(BigInt(aHex), 3);
  bytes[11] = 0x11;
  bytes.writeBigUInt64LE(BigInt(bHex), 12);
  return bytes.toString("base64url");
}

export function fidFromUrl(url: string) {
  const decoded = safeDecode(url);
  const match =
    decoded.match(new RegExp(`!3m\\d+!1s${FID}`, "i")) ||
    decoded.match(new RegExp(`!1s${FID}`, "i")) ||
    decoded.match(new RegExp(`[?&]ftid=${FID}`, "i")) ||
    decoded.match(new RegExp(FID, "i"));
  const fid = match?.[1];
  if (!fid || fid.toLowerCase().startsWith("0x0:")) return null;
  return fid;
}

const PLACE_ID = /^ChIJ[A-Za-z0-9_-]{10,120}$/;

export function placeIdFromInput(raw: string) {
  const trimmed = raw.trim();
  return PLACE_ID.test(trimmed) ? trimmed : null;
}

export function reviewUrlFromPlaceId(placeId: string) {
  return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
}

export function isDirectReviewUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    if (host === "search.google.com" && parsed.pathname.includes("/local/writereview") && parsed.searchParams.get("placeid")) {
      return true;
    }
    if (host === "g.page" && /\/review\/?$/.test(parsed.pathname)) return true;
    return false;
  } catch {
    return false;
  }
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function allowedHost(hostname: string) {
  const host = hostname.toLowerCase();
  return host === "g.page" || host.endsWith(".goo.gl") || host.endsWith("google.com") || host.endsWith(".google.com");
}

export async function resolveGoogleReviewUrl(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  const placeId = placeIdFromInput(trimmed);
  if (placeId) return reviewUrlFromPlaceId(placeId);
  if (isDirectReviewUrl(trimmed)) return trimmed;

  let current = trimmed;
  for (let hop = 0; hop < 5; hop += 1) {
    const direct = reviewUrlFromMaps(current);
    if (direct) return direct;
    let parsed: URL;
    try {
      parsed = new URL(current);
    } catch {
      return trimmed;
    }
    if (!allowedHost(parsed.hostname)) return trimmed;
    const response = await fetchRedirect(current);
    const location = response?.location;
    if (!response || !location || response.status < 300 || response.status >= 400) break;
    const next = new URL(location, current);
    const consent = next.searchParams.get("continue");
    current = next.hostname.includes("consent.google.") && consent ? consent : next.toString();
  }
  return reviewUrlFromMaps(current) ?? trimmed;
}

function fetchRedirect(current: string) {
  const parsed = new URL(current);
  return new Promise<{ status: number; location: string | null } | null>((resolve) => {
    const req = https.request(
      {
        host: parsed.hostname,
        servername: parsed.hostname,
        path: `${parsed.pathname}${parsed.search}`,
        method: "GET",
        headers: {
          Host: parsed.hostname,
          accept: "text/html",
          "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        },
        timeout: 8000,
        lookup: (hostname, options, callback) => {
          const done = typeof options === "function" ? options : callback;
          publicDns.resolve4(hostname).then(
            (addresses) => {
              if (options && typeof options === "object" && options.all) {
                done(null, addresses.map((address) => ({ address, family: 4 })));
                return;
              }
              done(null, addresses[0], 4);
            },
            (error: NodeJS.ErrnoException) => done(error, "", 4),
          );
        },
      },
      (response) => {
        response.resume();
        const location = response.headers.location;
        resolve({ status: response.statusCode ?? 0, location: Array.isArray(location) ? location[0] : location ?? null });
      },
    );
    req.on("error", () => resolve(null));
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
}

function reviewUrlFromMaps(url: string) {
  if (isDirectReviewUrl(url)) return url;
  const fid = fidFromUrl(url);
  if (!fid) return null;
  const placeId = placeIdFromFid(fid);
  return placeId ? reviewUrlFromPlaceId(placeId) : null;
}
