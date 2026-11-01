"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { CheckCircle, Clock, XCircle } from "lucide-react";

interface Redemption {
  id: string;
  user_id: string;
  merchandise_id: string;
  status: string;
  created_at: string;
  users?: {
    full_name: string;
    email: string;
  };
  merchandise?: {
    name: string;
    points_required: number;
  };
}

export default function KlaimPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchRedemptions = async () => {
    const { data, error } = await supabase
      .from("redemptions")
      .select("*, users(full_name, email), merchandise(name, points_required)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRedemptions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const handleComplete = async (id: string) => {
    const { error } = await supabase
      .from("redemptions")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      alert("Gagal update status: " + error.message);
    } else {
      fetchRedemptions();
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Yakin ingin membatalkan klaim ini? Poin akan dikembalikan."))
      return;

    const redemption = redemptions.find((r) => r.id === id);
    if (!redemption) return;

    // Update status redemption
    await supabase
      .from("redemptions")
      .update({ status: "cancelled" })
      .eq("id", id);

    // Kembalikan poin ke user
    const { data: user } = await supabase
      .from("users")
      .select("points")
      .eq("id", redemption.user_id)
      .single();

    await supabase
      .from("users")
      .update({
        points:
          (user?.points || 0) + (redemption.merchandise?.points_required || 0),
      })
      .eq("id", redemption.user_id);

    fetchRedemptions();
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-darkgray">Riwayat Klaim</h2>
        <p className="text-darkgray-medium mt-1">
          Pantau dan proses penukaran poin mahasiswa.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : redemptions.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Clock className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-darkgray-medium">Belum ada riwayat klaim.</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-offwhite border-b border-lightgray">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-darkgray-medium">
                    Mahasiswa
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-darkgray-medium">
                    Merchandise
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-darkgray-medium">
                    Tanggal
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-darkgray-medium">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-darkgray-medium">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lightgray">
                {redemptions.map((redemption) => (
                  <tr key={redemption.id} className="hover:bg-offwhite/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-darkgray">
                        {redemption.users?.full_name}
                      </p>
                      <p className="text-sm text-darkgray-medium">
                        {redemption.users?.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-darkgray">
                        {redemption.merchandise?.name}
                      </p>
                      <p className="text-sm text-sage">
                        {redemption.merchandise?.points_required} Poin
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-darkgray-medium">
                      {new Date(redemption.created_at).toLocaleDateString(
                        "id-ID",
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          redemption.status === "completed"
                            ? "bg-sage/10 text-sage"
                            : redemption.status === "cancelled"
                              ? "bg-coral/10 text-coral"
                              : "bg-amber/10 text-amber"
                        }`}
                      >
                        {redemption.status === "completed"
                          ? "Selesai"
                          : redemption.status === "cancelled"
                            ? "Dibatalkan"
                            : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {redemption.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleComplete(redemption.id)}
                            className="text-sage hover:bg-sage/10 p-2 rounded-lg transition-colors"
                            title="Tandai Selesai"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleCancel(redemption.id)}
                            className="text-coral hover:bg-coral/10 p-2 rounded-lg transition-colors"
                            title="Batalkan"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
