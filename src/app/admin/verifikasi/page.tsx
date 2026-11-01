"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Check, X, Clock, ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface Submission {
  id: string;
  user_id: string;
  category: string;
  photo_url: string;
  status: string;
  points_earned: number | null;
  created_at: string;
  users: { full_name: string; nim: string | null; email: string } | null;
}

const PAGE_SIZE = 5;

export default function VerifikasiPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Submission | null>(null);

  const supabase = createClient();

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("waste_submissions")
      .select("*, users ( full_name, nim, email )")
      .order("created_at", { ascending: false });
    setSubmissions((data as unknown as Submission[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const counts = {
    all: submissions.length,
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
  };

  const filtered =
    filter === "all"
      ? submissions
      : submissions.filter((s) => s.status === filter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ===== Logika Approve (poin + badge + misi) TETAP SAMA ===== */
  const handleApprove = async (id: string) => {
    const points = 10;

    await supabase
      .from("waste_submissions")
      .update({ status: "approved", points_earned: points })
      .eq("id", id);

    const submission = submissions.find((s) => s.id === id);
    if (submission) {
      const { data: user } = await supabase
        .from("users")
        .select("points")
        .eq("id", submission.user_id)
        .single();

      const newPoints = (user?.points || 0) + points;
      await supabase
        .from("users")
        .update({ points: newPoints })
        .eq("id", submission.user_id);

      await supabase.from("point_transactions").insert({
        user_id: submission.user_id,
        amount: points,
        type: "submission",
        description: `Setoran ${submission.category === "plastic" ? "plastik" : "kertas"} disetujui`,
      });

      const { checkAndAwardBadges } = await import("@/lib/badges");
      const newBadges = await checkAndAwardBadges(submission.user_id);

      const { updateChallengeProgress } = await import("@/lib/challenges");
      await updateChallengeProgress(submission.user_id, submission.category);

      if (newBadges.length > 0) {
        alert(
          `✅ Disetujui! +${points} poin\n🎖️ Badge baru diraih: ${newBadges.map((b) => b.name).join(", ")}`,
        );
      } else {
        alert(`✅ Disetujui! +${points} poin`);
      }
    }
    setDetail(null);
    fetchSubmissions();
  };

  const handleReject = async (id: string) => {
    if (!confirm("Tolak setoran ini?")) return;
    await supabase
      .from("waste_submissions")
      .update({ status: "rejected", points_earned: 0 })
      .eq("id", id);
    setDetail(null);
    fetchSubmissions();
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
    }) +
    " WIB";

  const tabs = [
    { key: "all", label: "Semua", count: counts.all },
    { key: "pending", label: "Menunggu", count: counts.pending },
    { key: "approved", label: "Disetujui", count: counts.approved },
    { key: "rejected", label: "Ditolak", count: counts.rejected },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
          Verifikasi Sampah
        </h2>
        <p className="text-sm text-darkgray-medium mt-1">
          Approve atau reject upload sampah dari mahasiswa.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === t.key
                ? "bg-[#122b1f] text-white shadow-sm"
                : "bg-white text-darkgray hover:bg-sage/10 hover:text-sage shadow-sm"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : paged.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Clock className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-sm text-darkgray-medium">
            Tidak ada submission untuk ditampilkan.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead className="bg-[#f2f5f3] border-b border-lightgray">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-bold text-darkgray-medium">
                    Mahasiswa
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-darkgray-medium">
                    Jenis Sampah
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-darkgray-medium">
                    Bukti Foto
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-darkgray-medium">
                    Tanggal Pengajuan
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-darkgray-medium">
                    Estimasi Poin
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-darkgray-medium">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lightgray">
                {paged.map((sub) => (
                  <tr key={sub.id} className="hover:bg-offwhite/50">
                    {/* Mahasiswa */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal/10 text-teal flex items-center justify-center font-bold text-sm shrink-0">
                          {(sub.users?.full_name || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-darkgray">
                            {sub.users?.full_name || "Mahasiswa"}
                          </p>
                          <p className="text-[11px] text-darkgray-medium">
                            {sub.users?.nim
                              ? `NIM ${sub.users.nim}`
                              : sub.users?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Jenis */}
                    <td className="px-6 py-4 text-sm text-darkgray capitalize">
                      {sub.category === "plastic" ? "Plastik" : "Kertas"}
                    </td>

                    {/* Foto */}
                    <td className="px-6 py-4">
                      {sub.photo_url && (
                        <img
                          src={sub.photo_url}
                          alt="Bukti"
                          className="w-16 h-14 rounded-lg object-cover border border-lightgray"
                        />
                      )}
                    </td>

                    {/* Tanggal */}
                    <td className="px-6 py-4 text-xs text-darkgray-medium">
                      {formatDate(sub.created_at)}
                    </td>

                    {/* Poin */}
                    <td className="px-6 py-4 text-sm font-bold text-darkgray">
                      {sub.status === "approved"
                        ? `+${sub.points_earned || 10} Poin`
                        : "+10 Poin"}
                    </td>

                    {/* Aksi */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 min-w-[180px]">
                        {sub.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(sub.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-sage text-white rounded-lg px-3 py-2 text-xs font-bold hover:bg-sage-dark transition-colors"
                            >
                              <Check size={14} /> Setujui
                            </button>
                            <button
                              onClick={() => handleReject(sub.id)}
                              className="flex-1 flex items-center justify-center gap-1.5 bg-coral text-white rounded-lg px-3 py-2 text-xs font-bold hover:opacity-90 transition-opacity"
                            >
                              <X size={14} /> Tolak
                            </button>
                          </div>
                        )}
                        <button
                          onClick={() => setDetail(sub)}
                          className="flex items-center justify-center gap-1.5 bg-lightgray/50 text-darkgray rounded-lg px-3 py-2 text-xs font-bold hover:bg-lightgray transition-colors"
                        >
                          <Eye size={14} /> Lihat Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer + Pagination */}
          <div className="px-6 py-4 border-t border-lightgray flex items-center justify-between">
            <p className="text-xs text-darkgray-medium">
              Menampilkan{" "}
              <span className="font-bold text-darkgray">{paged.length}</span>{" "}
              dari{" "}
              <span className="font-bold text-darkgray">{filtered.length}</span>{" "}
              data
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-lightgray/40 text-darkgray disabled:opacity-40 hover:bg-lightgray transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                    page === n
                      ? "bg-[#e5f2e9] text-sage border border-sage/40"
                      : "bg-lightgray/40 text-darkgray hover:bg-lightgray"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-lightgray/40 text-darkgray disabled:opacity-40 hover:bg-lightgray transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      {detail && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-darkgray [font-family:var(--font-bricolage)]">
                Detail Setoran
              </h3>
              <button
                onClick={() => setDetail(null)}
                className="p-2 rounded-lg hover:bg-lightgray/50 text-darkgray"
              >
                <X size={18} />
              </button>
            </div>

            {detail.photo_url && (
              <img
                src={detail.photo_url}
                alt="Bukti"
                className="w-full h-64 object-cover rounded-xl border border-lightgray mb-4"
              />
            )}

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-darkgray-medium">Mahasiswa:</span>{" "}
                <span className="font-bold text-darkgray">
                  {detail.users?.full_name || "-"}
                </span>
              </p>
              <p>
                <span className="text-darkgray-medium">NIM/Email:</span>{" "}
                {detail.users?.nim || detail.users?.email || "-"}
              </p>
              <p>
                <span className="text-darkgray-medium">Jenis:</span>{" "}
                <span className="capitalize">
                  {detail.category === "plastic" ? "Plastik" : "Kertas"}
                </span>
              </p>
              <p>
                <span className="text-darkgray-medium">Tanggal:</span>{" "}
                {formatDate(detail.created_at)}
              </p>
              <p>
                <span className="text-darkgray-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    detail.status === "approved"
                      ? "bg-sage/10 text-sage"
                      : detail.status === "rejected"
                        ? "bg-coral/10 text-coral"
                        : "bg-amber/10 text-amber"
                  }`}
                >
                  {detail.status === "approved"
                    ? "Disetujui"
                    : detail.status === "rejected"
                      ? "Ditolak"
                      : "Menunggu"}
                </span>
              </p>
            </div>

            {detail.status === "pending" && (
              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => handleApprove(detail.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-sage text-white rounded-xl py-2.5 text-sm font-bold hover:bg-sage-dark"
                >
                  <Check size={16} /> Setujui
                </button>
                <button
                  onClick={() => handleReject(detail.id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-coral text-white rounded-xl py-2.5 text-sm font-bold hover:opacity-90"
                >
                  <X size={16} /> Tolak
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
