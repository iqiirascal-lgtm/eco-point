"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Package,
  Plus,
  Trash2,
  Camera,
  X,
  Search,
  Pencil,
  ChevronDown,
} from "lucide-react";

const BUCKET = "merchandise-images";

interface Merch {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  stock: number;
  image_url: string | null;
}

function SelectBox({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <div className="relative min-w-[150px]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 rounded-xl border border-lightgray bg-white text-sm outline-none focus:border-sage flex items-center justify-between gap-2 hover:border-sage/50 transition-colors"
      >
        <span className="truncate">{current?.label}</span>
        <ChevronDown size={14} className="text-darkgray-medium shrink-0" />
      </button>

      {open && (
        <>
          {/* klik di luar = tutup */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-1 w-full bg-white border border-lightgray rounded-xl shadow-lg overflow-hidden">
            {options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                  o.value === value
                    ? "bg-sage/10 text-sage font-bold"
                    : "text-darkgray hover:bg-sage/10"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminMerchandisePage() {
  const [merchList, setMerchList] = useState<Merch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Merch | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "aktif" | "habis">(
    "all",
  );
  const [sortBy, setSortBy] = useState<
    "points_asc" | "points_desc" | "name" | "stock"
  >("points_asc");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    points_required: 50,
    stock: 10,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const fetchMerch = async () => {
    const { data } = await supabase
      .from("merchandise")
      .select("*")
      .order("points_required", { ascending: true });
    setMerchList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchMerch();
  }, []);

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) return alert("File harus berupa gambar.");
    if (f.size > 5 * 1024 * 1024) return alert("Ukuran maksimal 5MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", points_required: 50, stock: 10 });
    setFile(null);
    setPreview(null);
    setEditing(null);
    if (inputRef.current) inputRef.current.value = "";
    setShowForm(false);
  };

  const startEdit = (m: Merch) => {
    setEditing(m);
    setFormData({
      name: m.name,
      description: m.description || "",
      points_required: m.points_required,
      stock: m.stock,
    });
    setPreview(m.image_url);
    setFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let image_url: string | null = editing ? editing.image_url : null;
    if (file) {
      const ext = file.name.split(".").pop();
      const path = `merch-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file);
      if (!uploadError) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        image_url = data.publicUrl;
      }
    }

    if (editing) {
      const { error } = await supabase
        .from("merchandise")
        .update({ ...formData, image_url })
        .eq("id", editing.id);
      if (error) return alert("Gagal mengubah: " + error.message);
    } else {
      const { error } = await supabase
        .from("merchandise")
        .insert([{ ...formData, image_url }]);
      if (error) return alert("Gagal menambah: " + error.message);
    }

    resetForm();
    fetchMerch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus merchandise ini?")) return;
    await supabase.from("merchandise").delete().eq("id", id);
    fetchMerch();
  };

  // Filter + sort (client-side, instan)
  const filtered = merchList
    .filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
    .filter((m) =>
      statusFilter === "all"
        ? true
        : statusFilter === "aktif"
          ? m.stock > 0
          : m.stock <= 0,
    )
    .sort((a, b) => {
      if (sortBy === "points_asc") return a.points_required - b.points_required;
      if (sortBy === "points_desc")
        return b.points_required - a.points_required;
      if (sortBy === "stock") return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
            Kelola Merchandise
          </h2>
          <p className="text-sm text-darkgray-medium mt-1">
            Tambah dan kelola produk reward untuk mahasiswa.
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Tambah Merchandise
        </button>
      </div>

      {/* Form Tambah / Ubah */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-darkgray mb-4 [font-family:var(--font-bricolage)]">
            {editing ? `Ubah: ${editing.name}` : "Merchandise Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Nama
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
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
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Poin Required
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.points_required}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      points_required: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Stok
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      stock: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-darkgray mb-1.5">
                Foto Produk (Opsional — kosongkan untuk pakai gambar saat ini)
              </label>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {preview ? (
                <div className="relative rounded-xl overflow-hidden border border-lightgray w-full h-40 bg-[#fbfcfb]">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 object-contain p-2"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(editing ? editing.image_url : null);
                      if (inputRef.current) inputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 text-coral"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-lightgray rounded-xl flex flex-col items-center justify-center gap-1.5 hover:border-sage hover:bg-sage/5 transition-colors"
                >
                  <Camera size={24} className="text-gray-400" />
                  <p className="text-xs font-medium text-darkgray">
                    Klik untuk upload foto
                  </p>
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">
                {editing ? "Simpan Perubahan" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary text-sm"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toolbar: Search + Filter + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-darkgray-medium"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama merchandise..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-lightgray bg-white text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
          />
        </div>

        <SelectBox
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as any)}
          options={[
            { value: "all", label: "Status: Semua" },
            { value: "aktif", label: "Status: Aktif" },
            { value: "habis", label: "Status: Habis" },
          ]}
        />

        <SelectBox
          value={sortBy}
          onChange={(v) => setSortBy(v as any)}
          options={[
            { value: "points_asc", label: "Sort: Poin Terendah" },
            { value: "points_desc", label: "Sort: Poin Tertinggi" },
            { value: "name", label: "Sort: Nama A-Z" },
            { value: "stock", label: "Sort: Stok Terbanyak" },
          ]}
        />
      </div>

      {/* Grid Card - SCROLL VERTIKAL */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <Package className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-sm text-darkgray-medium">
            Tidak ada merchandise yang cocok.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
          {filtered.map((m) => (
            <div
              key={m.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col"
            >
              {/* Gambar + Chip Status */}
              <div className="relative bg-[#fbfcfb]">
                <span
                  className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm ${
                    m.stock > 0
                      ? "bg-[#e5f2e9] text-sage"
                      : "bg-rose-100 text-rose-500"
                  }`}
                >
                  {m.stock > 0 ? "Aktif ●" : "Habis ●"}
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

                <div className="flex items-center justify-between gap-2 mt-1.5 sm:mt-0 sm:mb-3 pt-1.5 sm:pt-3 border-t border-lightgray">
                  <span className="text-sm sm:text-base font-bold text-sage whitespace-nowrap">
                    {m.points_required} Poin
                  </span>
                  <span className="text-[9px] sm:text-xs text-darkgray-medium flex items-center gap-1.5 whitespace-nowrap">
                    Stok: {m.stock}
                    {m.stock > 0 && m.stock <= 5 && (
                      <span className="hidden sm:inline px-2 py-0.5 bg-amber/15 text-amber rounded-full text-[10px] font-bold">
                        Hampir Habis
                      </span>
                    )}
                  </span>
                </div>

                {/* Tombol Admin (mini di mobile) */}
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2 sm:mt-0">
                  <button
                    onClick={() => startEdit(m)}
                    className="flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-lightgray/40 text-darkgray hover:bg-lightgray/70 text-[10px] sm:text-xs font-bold transition-colors"
                  >
                    <Pencil size={13} /> Ubah
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    className="flex items-center justify-center gap-1 py-1.5 sm:py-2 rounded-lg bg-coral/10 text-coral hover:bg-coral/20 text-[10px] sm:text-xs font-bold transition-colors"
                  >
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Jumlah Data */}
      <div className="bg-white rounded-2xl px-5 py-3 shadow-sm flex items-center justify-between">
        <p className="text-xs text-darkgray-medium">
          Menampilkan{" "}
          <span className="font-bold text-darkgray">{filtered.length}</span>{" "}
          dari{" "}
          <span className="font-bold text-darkgray">{merchList.length}</span>{" "}
          data
        </p>
        <p className="text-[10px] text-darkgray-medium">
          Scroll ke bawah untuk melihat semua merchandise
        </p>
      </div>
    </div>
  );
}
