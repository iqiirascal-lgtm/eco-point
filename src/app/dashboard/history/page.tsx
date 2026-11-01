"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  History,
  TrendingUp,
  TrendingDown,
  Award,
  Recycle,
  ShoppingBag,
  Target,
  Star,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type:
    | "submission"
    | "redemption"
    | "challenge"
    | "badge_bonus"
    | "admin_adjust";
  description: string | null;
  created_at: string;
}

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("point_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setTransactions(data || []);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  const styleFor = (type: string) => {
    switch (type) {
      case "submission":
        return {
          icon: <Recycle size={18} />,
          bg: "bg-sage/10",
          text: "text-sage",
        };
      case "redemption":
        return {
          icon: <ShoppingBag size={18} />,
          bg: "bg-coral/10",
          text: "text-coral",
        };
      case "challenge":
        return {
          icon: <Target size={18} />,
          bg: "bg-teal/10",
          text: "text-teal",
        };
      case "badge_bonus":
        return {
          icon: <Award size={18} />,
          bg: "bg-amber/10",
          text: "text-amber",
        };
      default:
        return {
          icon: <Star size={18} />,
          bg: "bg-lightgray/50",
          text: "text-darkgray-medium",
        };
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    ", " +
    new Date(d).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)] flex items-center gap-2">
          <History className="text-teal shrink-0" size={26} /> Riwayat Poin
        </h2>
        <p className="text-sm text-darkgray-medium mt-1">
          Detail semua transaksi poin yang Anda dapatkan dan gunakan.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-md shadow-sage/10">
          <History className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-sm text-darkgray-medium">
            Belum ada riwayat transaksi.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md shadow-sage/10 overflow-hidden">
          <div className="divide-y divide-lightgray">
            {transactions.map((tx) => {
              const s = styleFor(tx.type);
              const isPositive = tx.amount > 0;
              const isZero = tx.amount === 0;

              return (
                <div key={tx.id} className="flex items-center gap-3 p-4">
                  {/* Ikon tipe */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.bg} ${s.text}`}
                  >
                    {s.icon}
                  </div>

                  {/* Deskripsi — KUNCI FIX: min-w-0 + truncate */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-darkgray truncate">
                      {tx.description || "Transaksi"}
                    </p>
                    <p className="text-[11px] text-darkgray-medium truncate">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>

                  {/* Jumlah — shrink-0 agar tidak terdorong keluar */}
                  <div
                    className={`shrink-0 flex items-center gap-1 font-bold text-sm sm:text-base ${
                      isZero
                        ? "text-amber"
                        : isPositive
                          ? "text-sage"
                          : "text-coral"
                    }`}
                  >
                    {isZero ? (
                      <Star size={14} />
                    ) : isPositive ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>{isPositive ? `+${tx.amount}` : tx.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
