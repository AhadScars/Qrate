import QRCode from "qrcode";
import { readFile } from "fs/promises";
import { qrDestination } from "@/lib/utils";

export async function renderQrSvg(input: {
  publicId: string;
  fgColor: string;
  bgColor: string;
  logoPath?: string | null;
  logoMime?: string | null;
  includeLogo?: boolean;
}) {
  const svg = await QRCode.toString(qrDestination(input.publicId), {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 1,
    color: { dark: input.fgColor, light: input.bgColor },
  });
  if (!input.includeLogo || !input.logoPath) return svg;
  try {
    const bytes = await readFile(input.logoPath);
    const href = `data:${input.logoMime || "image/png"};base64,${bytes.toString("base64")}`;
    const overlay = `<rect x="40%" y="40%" width="20%" height="20%" fill="${input.bgColor}" rx="8"/><image href="${href}" x="42%" y="42%" width="16%" height="16%"/>`;
    return svg.replace("</svg>", `${overlay}</svg>`);
  } catch {
    return svg;
  }
}

export async function renderQrPng(input: { publicId: string; fgColor: string; bgColor: string }) {
  return QRCode.toBuffer(qrDestination(input.publicId), {
    type: "png",
    errorCorrectionLevel: "H",
    margin: 1,
    width: 768,
    color: { dark: input.fgColor, light: input.bgColor },
  });
}
