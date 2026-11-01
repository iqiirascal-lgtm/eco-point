"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  LayoutDashboard,
  CheckCircle,
  Gift,
  ClipboardList,
  Target,
  LogOut,
} from "lucide-react";
import MobileNav from "@/components/MobileNav";

interface Profile {
  id: string;
  full_name: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data);
    };
    fetchProfile();
  }, []);

  const menu = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/admin/verifikasi",
      label: "Verifikasi Sampah",
      icon: CheckCircle,
    },
    { href: "/admin/merchandise", label: "Merchandise", icon: Gift },
    { href: "/admin/klaim", label: "Riwayat Klaim", icon: ClipboardList },
    { href: "/admin/challenges", label: "Kelola Misi", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#f2f5f3] flex">
      {/* Navigasi Mobile */}
      <MobileNav
        appName="ECO POINT"
        panelLabel="Admin Panel"
        userName={profile?.full_name || "Admin"}
        userMeta="Administrator"
        variant="dark"
        items={menu.map((m) => ({
          href: m.href,
          label: m.label,
          icon: <m.icon size={20} />,
        }))}
      />

      {/* Sidebar Desktop - Dark Green */}
      <aside className="hidden lg:flex w-64 bg-[#122b1f] p-5 flex-col sticky top-0 h-screen">
        {/* Branding */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shrink-0">
            <img
              src="/logo.png"
              alt="ECO POINT Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">
              ECO POINT
            </h1>
            <p className="text-[10px] text-white/60 leading-tight">
              UPJ Campus Waste Management
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {menu.map((m) => {
            const isActive = pathname === m.href;
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                  isActive
                    ? "bg-sage text-white font-bold shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white font-medium"
                }`}
              >
                <Icon size={18} />
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm">
              {(profile?.full_name || "A").charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-white truncate">
                {profile?.full_name || "Admin"}
              </p>
              <p className="text-[11px] text-white/60">Administrator</p>
            </div>
          </div>
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Konten */}
      <main className="flex-1 min-w-0 p-4 pt-20 lg:p-8 overflow-y-auto">  
        {children}
      </main>
    </div>
  );
}
