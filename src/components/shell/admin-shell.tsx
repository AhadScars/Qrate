"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, FolderTree, LayoutDashboard, LogOut, Menu, QrCode, Settings, X, FileText } from "lucide-react";
import { DigiHubMark } from "@/components/brand";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin/overview", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/qr", label: "QR codes", icon: QrCode },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/review-templates", label: "Templates", icon: FileText },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ name, children }: { name: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <aside className={cn("fixed inset-y-0 left-0 z-30 w-72 overflow-y-auto bg-indigo-950 p-5 text-indigo-50 md:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">Super admin</p>
            <Link href="/admin/overview" className="font-display text-3xl text-white">
              Qrate
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu">
            <X />
          </button>
        </div>
        <nav className="mt-8 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={cn("flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm", active ? "bg-white text-indigo-950" : "hover:bg-white/10")}>
                <Icon size={18} />
                {link.label}
              </Link>
            );
          })}
        </nav>
        <DigiHubMark className="mt-8 text-xs text-indigo-200" />
      </aside>
      {open ? <button className="fixed inset-0 z-20 bg-slate-950/40 md:hidden" onClick={() => setOpen(false)} aria-label="Close menu overlay" /> : null}
      <div className="md:pl-72">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu />
          </button>
          <p className="text-sm text-slate-500">Platform control</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold">{name}</span>
            <form action={logoutAction}>
              <button className="inline-flex items-center gap-1 font-semibold text-red-600">
                <LogOut size={16} /> Log out
              </button>
            </form>
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
