"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase";
import {
  LayoutDashboard,
  Upload,
  Gift,
  Trophy,
  Target,
  History,
  LogOut,
} from "lucide-react";
import MobileNav from "@/components/MobileNav";
import { Bricolage_Grotesque, Poppins, Outfit } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-bricolage",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

const geom = Outfit({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-geom",
});

interface Profile {
  id: string;
  full_name: string;
  points: number;
}

export default function DashboardLayout({
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
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/upload", label: "Setor Sampah", icon: Upload },
    { href: "/dashboard/merchandise", label: "Tukar Poin", icon: Gift },
    { href: "/dashboard/leaderboard", label: "Peringkat", icon: Trophy },
    { href: "/dashboard/challenges", label: "Misi", icon: Target },
    { href: "/dashboard/history", label: "Riwayat Poin", icon: History },
  ];

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-[#8fbb92] via-[#e2efdf] to-[#f4faf3] relative [font-family:var(--font-poppins)] ${poppins.variable} ${bricolage.variable} ${geom.variable}`}
    >
      {/* Garis kontur dekoratif kanan-atas */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[560px] h-[420px] opacity-30"
        style={{
          background:
            "repeating-radial-gradient(circle at top right, transparent 0 36px, rgba(72,94,41,0.18) 36px 38px)",
        }}
      />

      {/* Navigasi Mobile */}
      <MobileNav
        appName="ECO POINT"
        panelLabel="Student Panel"
        userName={profile?.full_name || "Mahasiswa"}
        userMeta={`${profile?.points || 0} Poin`}
        items={menu.map((m) => ({
          href: m.href,
          label: m.label,
          icon: <m.icon size={20} />,
        }))}
      />

      <div className="flex relative">
        {/* Sidebar Desktop */}
        <aside className="hidden lg:flex w-64 bg-white rounded-2xl shadow-lg m-4 p-5 flex-col sticky top-4 h-[calc(100vh-2rem)]">
          {/* Branding */}
          <div className="flex items-center gap-3 mb-8">
            <img
              src="/logo.png"
              alt="ECO POINT Logo"
              className="w-11 h-11 object-contain"
            />
            <div>
              <h1 className="text-base font-bold text-darkgray [font-family:var(--font-geom)] tracking-wide">
                ECO POINT
              </h1>
              <p className="text-[10px] text-darkgray-medium leading-tight">
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
                      : "text-darkgray-medium hover:bg-sage/10 hover:text-sage font-medium"
                  }`}
                >
                  <Icon size={18} />
                  <span>{m.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info + Logout */}
          <div className="border-t border-lightgray pt-4 mt-4">
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center font-bold text-sm">
                {(profile?.full_name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-darkgray truncate">
                  {profile?.full_name || "Mahasiswa"}
                </p>
                <p className="text-[11px] text-darkgray-medium">
                  {profile?.points || 0} Poin
                </p>
              </div>
            </div>
            <form action="/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-coral hover:bg-coral/10 transition-colors text-sm font-medium"
              >
                <LogOut size={18} />
                <span>Keluar</span>
              </button>
            </form>
          </div>
        </aside>

        {/* Konten */}
        <main className="flex-1 min-w-0 p-4 pt-20 lg:pt-8 lg:pr-8 relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
