"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Package, Gift, Lock, Coins } from "lucide-react";

interface Merch {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  stock: number;
  image_url: string | null;
}

interface Profile {
  id: string;
  full_name: string;
  points: number;
}

export default function MerchandisePage() {
  const [merchList, setMerchList] = useState<Merch[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, merchRes] = await Promise.all([
      supabase.from("users").select("*").eq("id", user.id).single(),
      supabase
        .from("merchandise")
        .select("*")
        .order("points_required", { ascending: true }),
    ]);

    setProfile(profileRes.data);
    setMerchList(merchRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClaim = async (merch: Merch) => {
    if (!profile) return;
    if (profile.points < merch.points_required) {
      alert("Poin Anda tidak cukup untuk menukar merchandise ini.");
      return;
    }
    if (merch.stock <= 0) {
      alert("Stok merchandise ini sedang habis.");
      return;
    }
    if (!confirm(`Tukar ${merch.name} dengan ${merch.points_required} poin?`))
      return;

    setClaiming(merch.id);
    try {
      const newPoints = profile.points - merch.points_required;
      const { error: userError } = await supabase
        .from("users")
        .update({ points: newPoints })
        .eq("id", profile.id);
      if (userError) throw userError;

      const { error: redError } = await supabase.from("redemptions").insert({
        user_id: profile.id,
        merchandise_id: merch.id,
        status: "pending",
      });
      if (redError) throw redError;

      await supabase
        .from("merchandise")
        .update({ stock: merch.stock - 1 })
        .eq("id", merch.id);

      await supabase.from("point_transactions").insert({
        user_id: profile.id,
        amount: -merch.points_required,
        type: "redemption",
        description: `Tukar merchandise: ${merch.name}`,
      });

      alert(`Berhasil menukar ${merch.name}! Menunggu konfirmasi admin.`);
      await fetchData();
    } catch (err: any) {
      alert("Gagal menukar: " + err.message);
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
          Tukar Poin 
        </h2>
        <p className="text-sm text-darkgray-medium mt-1">
          Tukarkan poinmu dengan merchandise eksklusif ECO POINT.
        </p>
      </div>

      {/* Card Poin Anda — pola card Total Poin dashboard */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md shadow-sage/10 flex items-center gap-3 md:gap-4">
        <div className="w-9 h-9 md:w-11 md:h-11 bg-amber/10 rounded-xl flex items-center justify-center shrink-0">
          <Coins className="text-amber" size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[11px] md:text-xs text-darkgray-medium font-medium">
            Poin Anda
          </h3>
          <p className="text-xl md:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
            {profile?.points || 0}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] md:text-xs text-darkgray-medium">
            Tersedia untuk ditukar
          </p>
          <p className="text-sm md:text-base font-bold text-sage">
            {merchList.length} Produk
          </p>
        </div>
      </div>

      {/* Grid: mobile 2 kolom ala marketplace, sm+ tetap seperti semula */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
          {merchList.map((m) => {
            const insufficient = (profile?.points || 0) < m.points_required;
            const outOfStock = m.stock <= 0;

            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl shadow-md shadow-sage/10 overflow-hidden flex flex-col"
              >
                {/* Gambar Produk */}
                <div className="relative bg-[#fbfcfb]">
                  <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/90 rounded-full text-[9px] sm:text-[10px] font-bold text-darkgray-medium shadow-sm">
                    Stok: {m.stock}
                  </span>
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="w-full aspect-square sm:aspect-auto sm:h-40 object-contain p-2 sm:p-3"
                    />
                  ) : (
                    <div className="w-full aspect-square sm:aspect-auto sm:h-40 flex items-center justify-center">
                      <Package className="text-sage" size={36} />
                    </div>
                  )}
                </div>

                {/* Isi Card */}
                <div className="p-3 sm:p-5 flex flex-col flex-1">
                  <h3 className="text-xs sm:text-base font-bold text-darkgray line-clamp-2 [font-family:var(--font-bricolage)]">
                    {m.name}
                  </h3>
                  <p className="hidden sm:block text-xs text-darkgray-medium mt-1 mb-4 flex-1">
                    {m.description}
                  </p>

                  <div className="flex items-center justify-between mt-1.5 sm:mt-0 sm:mb-3">
                    <span className="flex items-center gap-1 text-sm sm:text-base font-bold text-sage">
                      <Coins size={13} className="sm:hidden shrink-0" />
                      {m.points_required} Poin
                    </span>
                  </div>

                  <button
                    onClick={() => handleClaim(m)}
                    disabled={insufficient || outOfStock || claiming === m.id}
                    className={`mt-auto w-full py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl flex items-center justify-center gap-1.5 text-[11px] sm:text-sm font-bold [font-family:var(--font-bricolage)] transition-colors ${
                      insufficient || outOfStock
                        ? "bg-lightgray/50 text-darkgray-medium cursor-not-allowed"
                        : "bg-sage text-white hover:bg-sage-dark"
                    }`}
                  >
                    {outOfStock ? (
                      <>
                        <Lock size={14} /> Stok Habis
                      </>
                    ) : insufficient ? (
                      <>
                        <Lock size={14} /> Poin Kurang
                      </>
                    ) : claiming === m.id ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Gift size={14} />
                        <span className="sm:hidden">Tukar</span>
                        <span className="hidden sm:inline">Tukar Sekarang</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
