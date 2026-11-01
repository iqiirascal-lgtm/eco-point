"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Camera, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// ⚠️ Sesuaikan dengan nama bucket di Supabase Storage Anda (cek menu Storage)
const BUCKET = "waste-photos";

export default function UploadPage() {
  const [category, setCategory] = useState<"plastic" | "paper">("plastic");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
    };
    init();
  }, []);

  const handleFile = (f: File) => {
    setMessage(null);
    if (!f.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "File harus berupa gambar (PNG/JPG).",
      });
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setMessage({ type: "error", text: "Ukuran file maksimal 5MB." });
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const resetFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!file || !userId) return;
    setUploading(true);
    setMessage(null);
    try {
      const ext = file.name.split(".").pop();
      const path = `${userId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(path);

      const { error: insertError } = await supabase
        .from("waste_submissions")
        .insert({
          user_id: userId,
          category,
          photo_url: urlData.publicUrl,
          status: "pending",
          points_earned: 0,
        });
      if (insertError) throw insertError;

      setMessage({
        type: "success",
        text: "Setoran berhasil dikirim! Tunggu verifikasi admin untuk mendapatkan poin.",
      });
      resetFile();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Gagal mengirim setoran.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
          Setor Sampah
        </h2>
        <p className="text-sm text-darkgray-medium mt-1">
          Upload foto bukti setoran sampahmu untuk mendapatkan poin.
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-white rounded-2xl p-8 shadow-md shadow-sage/10 max-w-3xl mx-auto">
        {/* Pesan Status */}
        {message && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm font-medium ${
              message.type === "success"
                ? "bg-sage/10 text-sage-dark border border-sage/30"
                : "bg-coral/10 text-coral border border-coral/30"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {message.text}
          </div>
        )}

        {/* Jenis Sampah */}
        <label className="block text-sm font-medium text-darkgray mb-3">
          Jenis Sampah
        </label>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setCategory("plastic")}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              category === "plastic"
                ? "border-sage bg-sage/10 shadow-sm"
                : "border-lightgray bg-white hover:border-sage/40"
            }`}
          >
            <p
              className={`font-bold ${
                category === "plastic" ? "text-sage-dark" : "text-darkgray"
              }`}
            >
              Plastik
            </p>
            <p className="text-xs text-darkgray-medium mt-1">
              Botol, Kemasan, dll
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCategory("paper")}
            className={`rounded-xl border-2 p-4 text-center transition-all ${
              category === "paper"
                ? "border-sage bg-sage/10 shadow-sm"
                : "border-lightgray bg-white hover:border-sage/40"
            }`}
          >
            <p
              className={`font-bold ${
                category === "paper" ? "text-sage-dark" : "text-darkgray"
              }`}
            >
              Kertas
            </p>
            <p className="text-xs text-darkgray-medium mt-1">
              Kardus, Buku, HVS
            </p>
          </button>
        </div>

        {/* Foto Bukti */}
        <label className="block text-sm font-medium text-darkgray mb-3">
          Foto Bukti
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
          <div className="relative rounded-xl overflow-hidden border border-lightgray mb-6">
            <img
              src={preview}
              alt="Preview foto sampah"
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={resetFile}
              className="absolute top-2 right-2 bg-white/90 rounded-full px-3 py-1 text-xs font-bold text-coral hover:bg-white"
            >
              Ganti
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className="w-full h-44 border-2 border-dashed border-lightgray rounded-xl flex flex-col items-center justify-center gap-2 hover:border-sage hover:bg-sage/5 transition-colors mb-6"
          >
            <Camera size={32} className="text-gray-400" />
            <p className="text-sm font-medium text-darkgray">
              Klik atau drag foto ke sini
            </p>
            <p className="text-xs text-darkgray-medium">PNG, JPG up to 5MB</p>
          </button>
        )}

        {/* Tombol Kirim */}
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-bold [font-family:var(--font-bricolage)] transition-colors ${
            !file || uploading
              ? "bg-sage/50 text-white cursor-not-allowed"
              : "bg-sage text-white hover:bg-sage-dark shadow-sm"
          }`}
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Upload size={18} /> Kirim Setoran
            </>
          )}
        </button>
      </div>
    </div>
  );
}
