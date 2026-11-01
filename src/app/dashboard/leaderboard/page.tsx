"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Trophy, Crown, Medal } from "lucide-react";
import { getCurrentLevel } from "@/lib/levels";

interface Student {
  id: string;
  full_name: string;
  points: number;
}

export default function LeaderboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setCurrentUserId(user.id);

      const { data } = await supabase
        .from("users")
        .select("id, full_name, points")
        .eq("role", "student")
        .order("points", { ascending: false })
        .limit(50);

      setStudents(data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const myIndex = students.findIndex((s) => s.id === currentUserId);
  const myRank = myIndex + 1;
  const me = myIndex >= 0 ? students[myIndex] : null;
  const myLevel = me ? getCurrentLevel(me.points) : null;

  const top3 = students.slice(0, 3);
  const rest = students.slice(3, 10);
  const podiumOrder = [top3[1], top3[0], top3[2]]; // urutan tampil: #2 #1 #3

  const podiumMeta = (i: number) =>
    i === 1
      ? {
          height: "h-28 md:h-40",
          bg: "bg-gradient-to-b from-amber-300 to-amber-500",
          ring: "ring-4 ring-amber-200",
          avatar: "bg-gradient-to-br from-amber-300 to-amber-500",
        }
      : i === 0
        ? {
            height: "h-20 md:h-32",
            bg: "bg-gradient-to-b from-gray-300 to-gray-400",
            ring: "",
            avatar: "bg-gradient-to-br from-gray-300 to-gray-400",
          }
        : {
            height: "h-16 md:h-24",
            bg: "bg-gradient-to-b from-orange-300 to-orange-500",
            ring: "",
            avatar: "bg-gradient-to-br from-orange-300 to-orange-500",
          };

  return (
    <div className="space-y-5">
      {/* Header — ukuran aman 320px */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)] flex items-center gap-2">
          <Trophy className="text-amber shrink-0" size={26} /> Papan Peringkat
        </h2>
        <p className="text-sm text-darkgray-medium mt-1">
          Top 10 mahasiswa paling aktif di ECO POINT. Jadilah yang terbaik!
        </p>
      </div>

      {/* Posisi Anda — min-w-0 + truncate */}
      {me && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md shadow-sage/10 flex items-center gap-3">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sage/15 text-sage flex items-center justify-center font-bold shrink-0">
            {me.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-darkgray-medium">Posisi Anda</p>
            <p className="text-lg font-bold text-darkgray truncate">
              {me.full_name}
            </p>
            <p className="text-[11px] text-darkgray-medium truncate">
              {myLevel?.icon} Level {myLevel?.level} - {myLevel?.name}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl sm:text-3xl font-extrabold text-darkgray [font-family:var(--font-bricolage)]">
              #{myRank}
            </p>
            <p className="text-xs font-bold text-sage">{me.points} Poin</p>
          </div>
        </div>
      )}

      {/* Podium 3 Besar — compact di mobile */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md shadow-sage/10">
        <h3 className="text-base sm:text-lg font-bold text-darkgray text-center mb-4 sm:mb-6 flex items-center justify-center gap-2 [font-family:var(--font-bricolage)]">
          <Trophy size={18} className="text-amber" /> 3 Besar
        </h3>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end">
          {podiumOrder.map((s, i) => {
            if (!s) return <div key={i} />;
            const m = podiumMeta(i);
            const initials = s.full_name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <div key={s.id} className="flex flex-col items-center min-w-0">
                <div
                  className={`w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-white text-sm md:text-xl shadow-md shrink-0 ${m.avatar} ${m.ring}`}
                >
                  {initials}
                </div>
                <p className="text-[11px] md:text-sm font-bold text-darkgray text-center mt-2 w-full truncate">
                  {s.full_name}
                </p>
                <p className="text-[10px] md:text-xs font-bold text-sage mb-2">
                  {s.points} poin
                </p>
                <div
                  className={`w-full ${m.height} ${m.bg} rounded-t-xl flex items-start justify-center pt-2 text-white`}
                >
                  {i === 1 ? <Crown size={18} /> : <Medal size={16} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Peringkat 4-10 */}
      {rest.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md shadow-sage/10 overflow-hidden">
          <div className="divide-y divide-lightgray">
            {rest.map((s, i) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 p-4 ${
                  s.id === currentUserId ? "bg-sage/10" : ""
                }`}
              >
                <span className="w-8 h-8 rounded-full bg-lightgray/50 text-darkgray-medium flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 4}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-darkgray truncate">
                    {s.full_name}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-bold text-sage">
                  {s.points} Poin
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
