"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, Recycle, Gift, ArrowRight } from "lucide-react";
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

/* ===== Ilustrasi Kiri ===== */
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

/* ===== Ilustrasi Kanan ===== */
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

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const register = searchParams.get("register");
    if (register === "true") {
      router.push("/auth");
    }
  }, [searchParams, router]);

  /* Scroll halus ke bagian card */
  const scrollToCards = () => {
    document
      .getElementById("fitur")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`min-h-dvh flex flex-col bg-gradient-to-br from-[#f5faf4] via-[#e7f3e8] to-[#cbe2cf] relative overflow-x-clip [font-family:var(--font-poppins)] ${poppins.variable} ${bricolage.variable} ${geom.variable}`}
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
        className="pointer-events-none absolute top-1/4 -right-36 w-[600px] h-[600px] opacity-40"
        style={{
          background:
            "repeating-radial-gradient(circle at center, transparent 0 38px, rgba(101,143,90,0.14) 38px 40px)",
        }}
      />

      {/* Navbar */}
      <nav className="relative glass-card mx-3 sm:mx-6 mt-4 px-4 sm:px-5 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="ECO POINT Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-darkgray [font-family:var(--font-geom)] tracking-wide whitespace-nowrap">
              ECO POINT
            </h1>
            <p className="text-[11px] text-darkgray-medium hidden sm:block">
              UPJ Campus Waste Management
            </p>
          </div>
        </div>
        <div className="flex gap-1.5 sm:gap-2 shrink-0">
          <a
            href="/auth"
            className="btn-secondary text-[11px] sm:text-sm px-2.5 sm:px-4 py-2 [font-family:var(--font-bricolage)] font-bold"
          >
            Masuk
          </a>
          <a
            href="/auth?register=true"
            className="btn-primary text-[11px] sm:text-sm px-2.5 sm:px-4 py-2 [font-family:var(--font-bricolage)] font-bold"
          >
            Daftar
          </a>
        </div>
      </nav>

      {/* Main */}
      <main className="relative flex-1 flex flex-col max-w-6xl w-full mx-auto px-6 pt-14 pb-16">
        {/* Hero + Ilustrasi (flex-1 = menyerap ruang kosong layar tinggi) */}
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-8 items-center flex-1 py-6">
          <div className="hidden lg:block relative">
            <div className="w-64 h-64 ml-auto mr-6">
              <PaperIllustration />
            </div>
            <div className="absolute top-1/2 -right-2 bg-white rounded-full shadow-md px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-darkgray">
              <Gift size={14} className="text-amber" /> +100 Poin!
            </div>
          </div>

          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-sage/15 text-sage-dark px-3 py-1.5 rounded-full mb-5">
              <Recycle size={14} />
              <span className="text-xs font-medium">
                Program Bank Sampah Kampus
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-darkgray leading-tight [font-family:var(--font-bricolage)]">
              Ubah Sampah Menjadi <span className="text-sage">Merchandise</span>
            </h2>
            <p className="text-base md:text-lg text-darkgray-medium max-w-xl mx-auto mt-4 mb-7">
              Kumpulkan sampah plastik dan kertas di bank sampah UPJ, upload
              foto, dan tukarkan poinmu dengan merchandise eksklusif!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center px-2">
              <a
                href="/auth"
                className="btn-primary text-sm sm:text-base px-6 py-2.5 inline-flex items-center justify-center gap-2 whitespace-nowrap [font-family:var(--font-bricolage)] font-bold"
              >
                Mulai Sekarang <ArrowRight size={18} />
              </a>
              <button
                onClick={scrollToCards}
                className="btn-secondary text-sm sm:text-base px-6 py-2.5 whitespace-nowrap [font-family:var(--font-bricolage)] font-bold"
              >
                Pelajari Lebih Lanjut
              </button>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="w-64 h-64 ml-6">
              <BottleIllustration />
            </div>
            <div className="absolute top-1/2 -left-2 bg-white rounded-full shadow-md px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold text-darkgray">
              <Leaf size={14} className="text-sage" /> Eco Friendly
            </div>
          </div>
        </div>

        {/* 3 Card Fitur — target scroll */}
        <div id="fitur" className="grid md:grid-cols-3 gap-5 mt-8 scroll-mt-6">
          <div className="bg-white rounded-2xl p-6 shadow-md shadow-sage/10 hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 bg-green-100 rounded-xl flex items-center justify-center mb-3 text-xl">
              ♻️
            </div>
            <h3 className="text-lg font-bold text-darkgray mb-1.5 [font-family:var(--font-bricolage)]">
              Kumpulkan Sampah
            </h3>
            <p className="text-sm text-darkgray-medium">
              Setor sampah plastik dan kertas ke bank sampah yang tersedia di
              kampus UPJ.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md shadow-sage/10 hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 bg-sky-100 rounded-xl flex items-center justify-center mb-3 text-xl">
              📸
            </div>
            <h3 className="text-lg font-bold text-darkgray mb-1.5 [font-family:var(--font-bricolage)]">
              Upload & Klaim Poin
            </h3>
            <p className="text-sm text-darkgray-medium">
              Foto sampah yang sudah disetor, upload ke website, dan dapatkan
              poin reward.
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md shadow-sage/10 hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 bg-orange-100 rounded-xl flex items-center justify-center mb-3 text-xl">
              🎁
            </div>
            <h3 className="text-lg font-bold text-darkgray mb-1.5 [font-family:var(--font-bricolage)]">
              Tukar Merchandise
            </h3>
            <p className="text-sm text-darkgray-medium">
              Gunakan poinmu untuk menukar merchandise eksklusif dari tim ECO
              POINT.
            </p>
          </div>
        </div>
      </main>

      {/* Footer — penutup halaman */}
      <footer className="relative bg-white/50 backdrop-blur-sm border-t border-sage/20">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo ECO POINT"
              className="w-8 h-8 object-contain"
            />
            <div>
              <p className="text-sm font-bold text-darkgray [font-family:var(--font-geom)]">
                ECO POINT
              </p>
              <p className="text-[10px] text-darkgray-medium">
                UPJ Campus Waste Management
              </p>
            </div>
          </div>
          <p className="text-[11px] text-darkgray-medium text-center">
            © 2026 Tim ECO POINT — Universitas Pembangunan Jaya
          </p>
          <div className="flex gap-4 text-[11px] font-medium text-darkgray-medium">
            <a href="/auth" className="hover:text-sage transition-colors">
              Masuk
            </a>
            <a
              href="/auth?register=true"
              className="hover:text-sage transition-colors"
            >
              Daftar
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
