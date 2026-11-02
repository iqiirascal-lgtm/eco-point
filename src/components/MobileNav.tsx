"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";

export interface MobileNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  items: MobileNavItem[];
  appName: string;
  panelLabel: string;
  userName: string;
  userMeta: string;
  variant?: "light" | "dark";
}

export default function MobileNav({
  items,
  appName,
  panelLabel,
  userName,
  userMeta,
  variant = "light",
}: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const dark = variant === "dark";

  // Logout client-side Supabase: akhiri sesi lalu kembali ke /auth.
  // Tidak pakai <form> sama sekali -> tidak ada submit -> dialog iOS hilang.
  const handleLogout = async () => {
    setOpen(false);
    try {
      await supabase.auth.signOut();
    } catch {
      // abaikan glitch jaringan; tetap keluar dari UI
    }
    router.push("/auth");
    router.refresh();
  };

  return (
    <>
      {/* ===== Mobile Top Bar ===== */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 z-40 mx-2 mt-2 rounded-2xl shadow-sm px-4 py-3 flex items-center justify-between backdrop-blur-md ${
          dark ? "bg-[#122b1f]/95" : "bg-white/90"
        }`}
      >
        <div className="flex items-center gap-2">
          {dark ? (
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt={`${appName} Logo`}
                className="w-6 h-6 object-contain"
              />
            </div>
          ) : (
            <img
              src="/logo.png"
              alt={`${appName} Logo`}
              className="w-9 h-9 object-contain"
            />
          )}
          <div>
            <h1
              className={`text-sm font-bold ${dark ? "text-white" : "text-darkgray"}`}
            >
              {appName}
            </h1>
            <p
              className={`text-[10px] ${dark ? "text-white/60" : "text-darkgray-medium"}`}
            >
              {panelLabel}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`p-2 rounded-xl transition-colors ${
            dark
              ? "text-white hover:bg-white/10"
              : "text-darkgray hover:bg-sage/10"
          }`}
          aria-label="Buka menu"
        >
          <Menu size={24} />
        </button>
      </header>

      {/* ===== Overlay Gelap ===== */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== Drawer Sidebar ===== */}
      <aside
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-[60] w-72 max-w-[85vw] shadow-2xl p-6 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${dark ? "bg-[#122b1f]" : "bg-white"}`}
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {dark ? (
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt={`${appName} Logo`}
                  className="w-7 h-7 object-contain"
                />
              </div>
            ) : (
              <img
                src="/logo.png"
                alt={`${appName} Logo`}
                className="w-10 h-10 object-contain"
              />
            )}
            <div>
              <h1
                className={`text-lg font-bold ${dark ? "text-white" : "text-darkgray"}`}
              >
                {appName}
              </h1>
              <p
                className={`text-xs ${dark ? "text-white/60" : "text-darkgray-medium"}`}
              >
                {panelLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={`p-2 rounded-xl transition-colors ${
              dark
                ? "text-white hover:bg-white/10"
                : "text-darkgray hover:bg-coral/10"
            }`}
            aria-label="Tutup menu"
          >
            <X size={22} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-sage text-white font-bold"
                    : dark
                      ? "text-white/70 hover:bg-white/10 hover:text-white"
                      : "text-darkgray hover:bg-sage/10 hover:text-sage"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info + Logout */}
        <div
          className={`border-t pt-4 ${dark ? "border-white/10" : "border-lightgray"}`}
        >
          <div className="flex items-center gap-3 mb-4 px-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                dark ? "bg-white/10 text-white" : "bg-teal/10 text-teal"
              }`}
            >
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p
                className={`text-sm font-bold truncate ${dark ? "text-white" : "text-darkgray"}`}
              >
                {userName}
              </p>
              <p
                className={`text-xs truncate ${dark ? "text-white/60" : "text-darkgray-medium"}`}
              >
                {userMeta}
              </p>
            </div>
          </div>

          {/* TANPA <form>: tombol biasa type="button" -> tidak submit -> dialog iOS lenyap */}
          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
              dark
                ? "bg-white/10 text-white hover:bg-white/20"
                : "text-coral hover:bg-coral/10"
            }`}
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
