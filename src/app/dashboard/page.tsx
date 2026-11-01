"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Recycle, TrendingUp, Gift, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import LevelCard from "@/components/LevelCard";
import BadgeCollection from "@/components/BadgeCollection";

interface Submission {
  id: string;
  category: string;
  photo_url: string;
  status: string;
  points_earned: number;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string;
  points: number;
}

/* Ilustrasi empty state riwayat */
function EmptyIllustration() {
  return (
    <svg viewBox="0 0 220 120" fill="none" className="w-44 h-28 mx-auto mb-3">
      <rect x="30" y="70" width="90" height="10" rx="3" fill="#e8dcc0" />
      <rect x="34" y="60" width="86" height="10" rx="3" fill="#f3ead2" />
      <rect x="30" y="50" width="90" height="10" rx="3" fill="#e8dcc0" />
      <rect x="36" y="40" width="82" height="10" rx="3" fill="#fdf8ec" />
      <path
        d="M46 45h50M46 55h58M46 65h44"
        stroke="#d9c9a4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <rect x="140" y="38" width="22" height="52" rx="9" fill="#c3e8de" />
      <rect x="147" y="28" width="8" height="12" rx="3" fill="#c3e8de" />
      <rect x="145" y="22" width="12" height="7" rx="2" fill="#5aa99c" />
      <rect
        x="120"
        y="92"
        width="52"
        height="18"
        rx="9"
        fill="#d3ece5"
        transform="rotate(-8 146 101)"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/auth");
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          setError(`Failed to load profile: ${profileError.message}`);
        } else {
          setProfile(profileData);
        }

        const { data: submissionsData, error: submissionsError } =
          await supabase
            .from("waste_submissions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5);

        if (submissionsError) {
          setError(`Failed to load submissions: ${submissionsError.message}`);
        } else {
          setSubmissions(submissionsData || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <div className="bg-coral/10 border border-coral text-coral px-4 py-3 rounded-xl mb-4 text-sm">
          <p className="font-medium">Error: {error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary text-sm"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  const totalSubmissions = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
          Halo {profile?.full_name?.split(" ")[0] || "User"}!
        </h2>
        <p className="text-sm text-darkgray-medium mt-1">
          Mari lihat kontribusi lingkunganmu hari ini.
        </p>
      </div>

      {/* Stats Cards — compact di mobile, layout asli di desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md shadow-sage/10 flex items-center gap-3 md:block">
          <div className="w-9 h-9 md:w-11 md:h-11 bg-sage/10 rounded-xl flex items-center justify-center shrink-0 md:mb-4">
            <TrendingUp className="text-sage" size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] md:text-xs text-darkgray-medium font-medium">
              Total Poin
            </h3>
            <p className="text-xl md:text-3xl font-extrabold text-darkgray md:mt-1 [font-family:var(--font-bricolage)]">
              {profile?.points || 0}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md shadow-sage/10 flex items-center gap-3 md:block">
          <div className="w-9 h-9 md:w-11 md:h-11 bg-teal/10 rounded-xl flex items-center justify-center shrink-0 md:mb-4">
            <Recycle className="text-teal" size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] md:text-xs text-darkgray-medium font-medium">
              Sampah Disetor
            </h3>
            <p className="text-xl md:text-3xl font-extrabold text-darkgray md:mt-1 [font-family:var(--font-bricolage)]">
              {totalSubmissions}x
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md shadow-sage/10 flex items-center gap-3 md:block">
          <div className="w-9 h-9 md:w-11 md:h-11 bg-amber/10 rounded-xl flex items-center justify-center shrink-0 md:mb-4">
            <Gift className="text-amber" size={20} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] md:text-xs text-darkgray-medium font-medium">
              Menunggu Verifikasi
            </h3>
            <p className="text-xl md:text-3xl font-extrabold text-darkgray md:mt-1 [font-family:var(--font-bricolage)]">
              {pendingCount}
            </p>
          </div>
        </div>
      </div>

      {/* Level Card - GAMIFIKASI */}
      <LevelCard points={profile?.points || 0} />

      {/* Badge Collection - GAMIFIKASI */}
      <BadgeCollection userId={profile?.id || ""} />

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-md shadow-sage/10">
        <h3 className="text-lg font-bold text-darkgray mb-4 flex items-center gap-2 [font-family:var(--font-bricolage)]">
          <Clock size={18} className="text-sage" /> Riwayat Setoran Terbaru
        </h3>

        {submissions.length > 0 ? (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="flex items-center justify-between p-4 bg-[#f4faf3] rounded-xl border border-lightgray/60"
              >
                <div className="flex items-center gap-4">
                  {sub.photo_url && (
                    <img
                      src={sub.photo_url}
                      alt="Sampah"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-darkgray text-sm capitalize">
                      {sub.category === "plastic"
                        ? "Sampah Plastik"
                        : "Sampah Kertas"}
                    </p>
                    <p className="text-xs text-darkgray-medium">
                      {new Date(sub.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sub.status === "approved"
                        ? "bg-sage/10 text-sage"
                        : sub.status === "rejected"
                          ? "bg-coral/10 text-coral"
                          : "bg-amber/10 text-amber"
                    }`}
                  >
                    {sub.status === "approved"
                      ? "Disetujui"
                      : sub.status === "rejected"
                        ? "Ditolak"
                        : "Menunggu"}
                  </span>
                  {sub.status === "approved" && (
                    <p className="text-xs text-sage font-bold mt-1">
                      +{sub.points_earned || 10} Poin
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <EmptyIllustration />
            <p className="text-sm text-darkgray-medium">
              Belum ada riwayat setoran.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
