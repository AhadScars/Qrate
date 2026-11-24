import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const preferredRegion = "bom1";

export const metadata: Metadata = {
  title: "Qrate",
  description: "QR review drafts for local businesses. Customers edit the words and submit them on Google themselves.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable} h-full antialiased`} suppressHydrationWarning>
      {/* ColorZilla adds cz-shortcut-listen on body before hydration. */}
      <body className="min-h-full" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
