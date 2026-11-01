"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Target, Plus, Trash2, Power } from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_type: string;
  target_value: number;
  reward_points: number;
  is_active: boolean;
}

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    challenge_type: "weekly",
    target_type: "submissions",
    target_value: 3,
    reward_points: 20,
  });

  const supabase = createClient();

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });
    setChallenges(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("challenges").insert([formData]);
    if (error) {
      alert("Gagal membuat misi: " + error.message);
    } else {
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        challenge_type: "weekly",
        target_type: "submissions",
        target_value: 3,
        reward_points: 20,
      });
      fetchChallenges();
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase
      .from("challenges")
      .update({ is_active: !current })
      .eq("id", id);
    fetchChallenges();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus misi ini?")) return;
    await supabase.from("challenges").delete().eq("id", id);
    fetchChallenges();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
            Kelola Misi
          </h2>
          <p className="text-sm text-darkgray-medium mt-1">
            Buat dan kelola tantangan untuk mahasiswa.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-1.5 text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap shrink-0 [font-family:var(--font-bricolage)] font-bold"
        >
          <Plus size={14} /> Buat Misi
        </button>
      </div>

      {/* Form Buat Misi */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-darkgray mb-4 [font-family:var(--font-bricolage)]">
            Misi Baru
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-darkgray mb-1.5">
                Judul Misi
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                placeholder="Contoh: Pahlawan Plastik Minggu Ini"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-darkgray mb-1.5">
                Deskripsi
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                placeholder="Deskripsi singkat misi"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Tipe Misi
                </label>
                <select
                  value={formData.challenge_type}
                  onChange={(e) =>
                    setFormData({ ...formData, challenge_type: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage outline-none bg-white"
                >
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="special">Spesial</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Target
                </label>
                <select
                  value={formData.target_type}
                  onChange={(e) =>
                    setFormData({ ...formData, target_type: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage outline-none bg-white"
                >
                  <option value="submissions">Total Setoran</option>
                  <option value="plastic">Sampah Plastik</option>
                  <option value="paper">Sampah Kertas</option>
                  <option value="points">Poin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Jumlah Target
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.target_value}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target_value: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Reward Poin
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.reward_points}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reward_points: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">
                Simpan Misi
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary text-sm"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Misi */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Target className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-sm text-darkgray-medium">
            Belum ada misi. Klik "Buat Misi" untuk mulai.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {challenges.map((ch) => (
            <div
              key={ch.id}
              className={`bg-white rounded-2xl p-6 shadow-sm ${!ch.is_active ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-darkgray text-lg [font-family:var(--font-bricolage)]">
                    {ch.title}
                  </h3>
                  <p className="text-sm text-darkgray-medium mt-1">
                    {ch.description}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => toggleActive(ch.id, ch.is_active)}
                    className={`p-2 rounded-lg transition-colors ${
                      ch.is_active
                        ? "text-sage hover:bg-sage/10"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                    title={ch.is_active ? "Nonaktifkan" : "Aktifkan"}
                  >
                    <Power size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(ch.id)}
                    className="p-2 rounded-lg text-coral hover:bg-coral/10 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="px-3 py-1 bg-teal/10 text-teal rounded-full text-xs font-bold capitalize">
                  {ch.challenge_type}
                </span>
                <span className="px-3 py-1 bg-offwhite border border-lightgray rounded-full text-xs font-medium">
                  Target: {ch.target_value} {ch.target_type}
                </span>
                <span className="px-3 py-1 bg-amber/10 text-amber rounded-full text-xs font-bold">
                  +{ch.reward_points} poin
                </span>
                {!ch.is_active && (
                  <span className="px-3 py-1 bg-coral/10 text-coral rounded-full text-xs font-bold">
                    Nonaktif
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
