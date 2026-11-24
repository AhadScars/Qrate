"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  QrCode,
  Settings,
  Star,
  X,
} from "lucide-react";
import { DigiHubMark } from "@/components/brand";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/places", label: "Places", icon: MapPin },
  { href: "/dashboard/qr-codes", label: "QR codes", icon: QrCode },
  { href: "/dashboard/reviews", label: "Review activity", icon: Star },
  { href: "/dashboard/subscription", label: "Subscription", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({
  name,
  email,
  businessName,
  accessLabel,
  notices,
  children,
}: {
  name: string;
  email: string;
  businessName: string;
  accessLabel: string;
  notices: { id: string; text: string }[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <aside className={cn("fixed inset-y-0 left-0 z-30 w-72 bg-slate-950 p-5 text-slate-100 transition md:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between">
          <Link href="/dashboard/overview" className="font-display text-3xl text-white">
            Qrate
          </Link>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X />
          </button>
        </div>
        <p className="mt-4 text-sm text-slate-400">{businessName}</p>
        <p className="mt-1 text-xs text-amber-200">{accessLabel}</p>
        <nav className="mt-8 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm",
                  active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10",
                )}
              >
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <DigiHubMark className="mt-8 text-xs text-slate-400" />
      </aside>
      {open ? <button className="fixed inset-0 z-20 bg-slate-950/40 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu overlay" /> : null}
      <div className="md:pl-72">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </button>
          <div className="hidden text-sm text-slate-500 md:block">Business workspace</div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button className="rounded-full p-2 hover:bg-slate-100" onClick={() => setNotes((value) => !value)} aria-label="Notifications">
                <Bell size={18} />
              </button>
              {notes ? (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-3 text-sm shadow-xl ring-1 ring-slate-200">
                  {notices.length === 0 ? <p className="text-slate-500">No recent account activity.</p> : null}
                  {notices.map((notice) => (
                    <p key={notice.id} className="border-b border-slate-100 py-2 last:border-0">
                      {notice.text}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
            <details className="relative">
              <summary className="cursor-pointer list-none rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold">{name}</summary>
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-3 text-sm shadow-xl ring-1 ring-slate-200">
                <p className="font-semibold">{name}</p>
                <p className="text-slate-500">{email}</p>
                <form action={logoutAction} className="mt-3">
                  <button className="flex items-center gap-2 font-semibold text-red-600">
                    <LogOut size={16} /> Log out
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
