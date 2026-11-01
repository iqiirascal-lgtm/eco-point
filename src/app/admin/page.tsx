"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import {
  Users,
  Recycle,
  Gift,
  TrendingUp,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  XCircle,
  ClipboardList,
} from "lucide-react";

interface RecentSubmission {
  id: string;
  category: string;
  status: string;
  created_at: string;
  users: { full_name: string } | null;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} mnt lalu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [newThisWeek, setNewThisWeek] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [totalMerch, setTotalMerch] = useState(0);
  const [pendingClaims, setPendingClaims] = useState(0);
  const [recent, setRecent] = useState<RecentSubmission[]>([]);
  const [chart, setChart] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        students,
        newStudents,
        pendingSub,
        merch,
        pendingClaim,
        recentSubs,
        allSubs,
      ] = await Promise.all([
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "student"),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .eq("role", "student")
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("waste_submissions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("merchandise")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("redemptions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("waste_submissions")
          .select("id, category, status, created_at, users ( full_name )")
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("waste_submissions")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(100),
      ]);

      setTotalStudents(students.count || 0);
      setNewThisWeek(newStudents.count || 0);
      setPendingSubmissions(pendingSub.count || 0);
      setTotalMerch(merch.count || 0);
      setPendingClaims(pendingClaim.count || 0);
      setRecent((recentSubs.data || []) as unknown as RecentSubmission[]);

      // Chart 7 hari terakhir
      const days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        return (allSubs.data || []).filter(
          (s: any) => (s.created_at as string).slice(0, 10) === key,
        ).length;
      });
      setChart(days);

      setLoading(false);
    };

    fetchStats();
  }, []);

  const max = Math.max(...chart, 1);
  const points = chart
    .map((c, i) => `${i * (100 / 6)},${36 - (c / max) * 30}`)
    .join(" ");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
          Dashboard Admin 👋
        </h2>
        <p className="text-sm text-darkgray-medium mt-1">
          Pantau aktivitas bank sampah ECO POINT.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-5">
            {/* Total Mahasiswa */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm flex items-center gap-3 md:block">
              <div className="w-9 h-9 md:w-11 md:h-11 bg-[#e5f2e9] rounded-xl flex items-center justify-center shrink-0 md:mb-4">
                <Users className="text-sage" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] md:text-xs text-darkgray-medium font-medium">
                  Total Mahasiswa
                </p>
                <p className="text-xl md:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
                  {totalStudents}
                </p>
                <p className="text-[10px] md:text-[11px] text-sage font-bold md:mt-2">
                  +{newThisWeek} minggu ini
                </p>
              </div>
            </div>

            {/* Menunggu Verifikasi */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm flex items-center gap-3 md:block relative">
              {pendingSubmissions > 0 && (
                <span className="absolute top-3 right-3 md:top-5 md:right-5 px-2.5 py-1 bg-amber/15 text-amber rounded-full text-[9px] md:text-[10px] font-bold">
                  Butuh Tindakan
                </span>
              )}
              <div className="w-9 h-9 md:w-11 md:h-11 bg-amber/10 rounded-xl flex items-center justify-center shrink-0 md:mb-4">
                <Recycle className="text-amber" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] md:text-xs text-darkgray-medium font-medium">
                  Menunggu Verifikasi
                </p>
                <p className="text-xl md:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
                  {pendingSubmissions}
                </p>
              </div>
            </div>

            {/* Total Merchandise */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm flex items-center gap-3 md:block">
              <div className="w-9 h-9 md:w-11 md:h-11 bg-sky-100 rounded-xl flex items-center justify-center shrink-0 md:mb-4">
                <Gift className="text-sky-600" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] md:text-xs text-darkgray-medium font-medium">
                  Total Merchandise
                </p>
                <p className="text-xl md:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
                  {totalMerch}
                </p>
              </div>
            </div>

            {/* Klaim Pending */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm flex items-center gap-3 md:block relative">
              {pendingClaims > 0 && (
                <span className="absolute top-3 right-3 md:top-5 md:right-5 px-2.5 py-1 bg-rose-100 text-rose-500 rounded-full text-[9px] md:text-[10px] font-bold">
                  Segera Proses
                </span>
              )}
              <div className="w-9 h-9 md:w-11 md:h-11 bg-rose-100 rounded-xl flex items-center justify-center shrink-0 md:mb-4">
                <TrendingUp className="text-rose-500" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] md:text-xs text-darkgray-medium font-medium">
                  Klaim Pending
                </p>
                <p className="text-xl md:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
                  {pendingClaims}
                </p>
              </div>
            </div>
          </div>

          {/* Two Columns */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Aksi Cepat */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-darkgray mb-4 [font-family:var(--font-bricolage)]">
                Aksi Cepat
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/admin/verifikasi"
                  className="bg-[#e5f2e9] border border-sage/20 rounded-xl p-4 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-sage-dark">
                        Verifikasi Sampah
                      </p>
                      <p className="text-xs text-darkgray-medium mt-1">
                        Approve/reject upload mahasiswa
                      </p>
                    </div>
                    <span className="bg-white rounded-lg p-2 shadow-sm group-hover:scale-110 transition-transform">
                      <ArrowUpRight size={16} className="text-sage" />
                    </span>
                  </div>
                </Link>

                <Link
                  href="/admin/merchandise"
                  className="bg-sky-50 border border-sky-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-bold text-darkgray">
                    Kelola Merchandise
                  </p>
                  <p className="text-xs text-darkgray-medium mt-1">
                    Tambah/edit produk reward
                  </p>
                </Link>

                <Link
                  href="/admin/klaim"
                  className="bg-amber-50 border border-amber-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-bold text-amber">Proses Klaim</p>
                  <p className="text-xs text-darkgray-medium mt-1">
                    Konfirmasi penukaran poin
                  </p>
                </Link>
              </div>
            </div>

            {/* Chart + Aktivitas */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-darkgray mb-4 [font-family:var(--font-bricolage)]">
                Tinjauan Setoran Terkini
              </h3>

              <svg
                viewBox="0 0 100 40"
                className="w-full h-24 mb-5"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3e8e6b" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#3e8e6b" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon
                  points={`0,40 ${points} 100,40`}
                  fill="url(#gradArea)"
                />
                <polyline
                  points={points}
                  fill="none"
                  stroke="#3e8e6b"
                  strokeWidth="1.5"
                />
              </svg>

              <h4 className="text-sm font-bold text-darkgray mb-3">
                Aktivitas Terkini
              </h4>
              <div className="space-y-3">
                {recent.length === 0 ? (
                  <p className="text-xs text-darkgray-medium">
                    Belum ada aktivitas.
                  </p>
                ) : (
                  recent.map((r) => (
                    <div key={r.id} className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          r.status === "approved"
                            ? "bg-[#e5f2e9] text-sage"
                            : r.status === "rejected"
                              ? "bg-rose-100 text-rose-500"
                              : "bg-amber/10 text-amber"
                        }`}
                      >
                        {r.status === "approved" ? (
                          <CheckCircle2 size={16} />
                        ) : r.status === "rejected" ? (
                          <XCircle size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-darkgray truncate">
                          {r.category === "plastic"
                            ? "Setoran Plastik"
                            : "Setoran Kertas"}
                        </p>
                        <p className="text-[11px] text-darkgray-medium truncate">
                          {r.users?.full_name || "Mahasiswa"}
                        </p>
                      </div>
                      <span className="text-[10px] text-darkgray-medium shrink-0">
                        {timeAgo(r.created_at)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
