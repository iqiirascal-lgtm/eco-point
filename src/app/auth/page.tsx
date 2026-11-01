"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  User,
  Phone,
  NotebookPen,
  Coins,
  Leaf,
} from "lucide-react";
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

/* ===== Ilustrasi Kiri (Kertas & Kardus) ===== */
function PaperIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className="w-full h-full drop-shadow-sm"
    >
      <rect
        x="55"
        y="38"
        width="92"
        height="72"
        rx="7"
        fill="#f2e3c0"
        transform="rotate(-8 100 74)"
      />
      <rect
        x="62"
        y="50"
        width="92"
        height="72"
        rx="7"
        fill="#fdf8ec"
        transform="rotate(4 108 86)"
      />
      <path
        d="M78 72h60M78 84h60M78 96h42"
        stroke="#d9c9a4"
        strokeWidth="3.5"
        strokeLinecap="round"
        transform="rotate(4 108 86)"
      />
      <rect x="38" y="122" width="84" height="56" rx="7" fill="#d9a06b" />
      <rect x="38" y="122" width="84" height="15" rx="7" fill="#c08552" />
      <path d="M80 122v56" stroke="#b06f3f" strokeWidth="3" />
      <circle cx="146" cy="166" r="16" fill="#ecece6" />
      <path
        d="M138 161l8 6 10-8"
        stroke="#c9c9c0"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M164 52l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f4c542" />
    </svg>
  );
}

/* ===== Ilustrasi Kanan (Botol & Kemasan) ===== */
function BottleIllustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      className="w-full h-full drop-shadow-sm"
    >
      <rect x="58" y="62" width="36" height="92" rx="13" fill="#c3e8de" />
      <rect x="69" y="46" width="14" height="18" rx="4" fill="#c3e8de" />
      <rect x="66" y="38" width="20" height="10" rx="3" fill="#5aa99c" />
      <path d="M58 92h36M58 114h36" stroke="#9fd4c8" strokeWidth="3" />
      <rect x="112" y="72" width="42" height="82" rx="7" fill="#f3e2c3" />
      <path d="M112 72l21-19 21 19z" fill="#e3cda2" />
      <rect x="121" y="98" width="24" height="20" rx="4" fill="#8fbf9f" />
      <path d="M56 162h36l-5 30h-26z" fill="#cfe3f5" />
      <path d="M164 48l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#f4c542" />
      <path
        d="M38 118l2.5 5.5 5.5 2.5-5.5 2.5-2.5 5.5-2.5-5.5-5.5-2.5 5.5-2.5z"
        fill="#f4c542"
      />
    </svg>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nim, setNim] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const { data: profile } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        router.push(profile?.role === "admin" ? "/admin" : "/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              nim: nim || null,
              phone: phone || null,
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          const { error: insertError } = await supabase.from("users").insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            nim: nim || null,
            phone: phone || null,
            points: 0,
            role: "student",
          });
          if (insertError && !insertError.message.includes("duplicate")) {
            console.error("Insert profile error:", insertError);
          }
          alert(
            "Registrasi berhasil! Silakan login dengan email dan password Anda.",
          );
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  return (
    <div
      className={`min-h-screen relative overflow-hidden bg-gradient-to-br from-[#f5faf4] via-[#e7f3e8] to-[#cbe2cf] [font-family:var(--font-poppins)] ${poppins.variable} ${bricolage.variable} ${geom.variable} flex items-center justify-center py-10 px-4`}
    >
      {/* Garis kontur */}
      <div
        className="pointer-events-none absolute -top-28 -left-28 w-[520px] h-[520px] opacity-40"
        style={{
          background:
            "repeating-radial-gradient(circle at center, transparent 0 34px, rgba(101,143,90,0.16) 34px 36px)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-[600px] h-[600px] opacity-40"
        style={{
          background:
            "repeating-radial-gradient(circle at center, transparent 0 38px, rgba(101,143,90,0.14) 38px 40px)",
        }}
      />

      {/* Ilustrasi Kiri + Chip */}
      <div className="hidden lg:block absolute left-4 xl:left-10 top-1/2 -translate-y-1/2 w-48 h-48 xl:w-72 xl:h-72">
        <PaperIllustration />
        <div className="absolute -top-3 -left-2 bg-white rounded-full shadow-md px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-darkgray">
          <Coins size={14} className="text-amber" /> +100 Poin!
        </div>
      </div>

      {/* Ilustrasi Kanan + Chip */}
      <div className="hidden lg:block absolute right-4 xl:right-10 top-1/2 -translate-y-1/2 w-48 h-48 xl:w-72 xl:h-72">
        <BottleIllustration />
        <div className="absolute -bottom-3 -right-2 bg-white rounded-full shadow-md px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-darkgray">
          <Leaf size={14} className="text-sage" /> Eco Friendly
        </div>
      </div>

      {/* Card Auth */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="w-16 h-16 bg-sage/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <img
            src="/logo.png"
            alt="ECO POINT Logo"
            className="w-9 h-9 object-contain"
          />
        </div>

        <h1 className="text-xl font-extrabold text-darkgray text-center [font-family:var(--font-bricolage)]">
          ECO POINT UPJ
        </h1>
        <p className="text-xs text-darkgray-medium text-center mt-1 mb-6">
          {isLogin ? "Masuk ke akun Anda" : "Buat akun baru"}
        </p>

        {/* Error Banner */}
        {error && (
          <div className="bg-coral/10 border border-coral text-coral text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          className="w-full border border-lightgray rounded-xl py-2.5 flex items-center justify-center gap-2 bg-white hover:bg-offwhite transition-colors text-sm font-medium text-darkgray"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
            />
          </svg>
          Lanjutkan dengan Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-lightgray"></div>
          <span className="text-[11px] text-darkgray-medium">
            atau dengan email
          </span>
          <div className="flex-1 h-px bg-lightgray"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-darkgray-medium"
                  />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                    placeholder="Nama lengkap Anda"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-darkgray mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-darkgray-medium"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                placeholder="user@gmail.com"
              />
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  NIM (Opsional)
                </label>
                <div className="relative">
                  <NotebookPen
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-darkgray-medium"
                  />
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                    placeholder="Masukkan NIM"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-darkgray mb-1.5">
                  Nomor Telepon (Opsional)
                </label>
                <div className="relative">
                  <Phone
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-darkgray-medium"
                  />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                    placeholder="08123456788"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-darkgray mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-darkgray-medium"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-lightgray text-sm focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 text-sm [font-family:var(--font-bricolage)] font-bold"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                {isLogin ? "Masuk" : "Daftar"} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-xs text-darkgray-medium text-center mt-5">
          {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-sage font-bold hover:underline"
          >
            {isLogin ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>
    </div>
  );
}
