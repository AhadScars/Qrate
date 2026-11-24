const FID = "(0x[0-9a-f]{1,16}:0x[0-9a-f]{1,16})";

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
    const response = await fetch(current, {
      method: "GET",
      redirect: "manual",
      headers: { "user-agent": "QrateLinkResolver/1.0" },
    });
    const location = response.headers.get("location");
    if (!location || response.status < 300 || response.status >= 400) break;
    const next = new URL(location, current);
    const consent = next.searchParams.get("continue");
    current = next.hostname.includes("consent.google.") && consent ? consent : next.toString();
  }
  return reviewUrlFromMaps(current) ?? trimmed;
}

function reviewUrlFromMaps(url: string) {
  if (isDirectReviewUrl(url)) return url;
  const fid = fidFromUrl(url);
  if (!fid) return null;
  const placeId = placeIdFromFid(fid);
  return placeId ? reviewUrlFromPlaceId(placeId) : null;
}
