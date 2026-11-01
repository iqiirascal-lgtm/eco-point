"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import {
  Target,
  CheckCircle2,
  Gift,
  Flame,
  CalendarDays,
  Star,
} from "lucide-react";
import {
  getActiveChallenges,
  getUserChallenges,
  claimChallengeReward,
  Challenge,
  UserChallenge,
} from "@/lib/challenges";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const fetchData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const [chs, ucs] = await Promise.all([
      getActiveChallenges(),
      getUserChallenges(user.id),
    ]);
    setChallenges(chs);
    setUserChallenges(ucs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getProgress = (challengeId: string) =>
    userChallenges.find((uc) => uc.challenge_id === challengeId);

  const handleClaim = async (challengeId: string) => {
    if (!userId) return;
    setClaiming(challengeId);
    setMessage(null);

    const result = await claimChallengeReward(userId, challengeId);
    if (result.success) {
      setMessage({
        type: "success",
        text: `🎉 Misi selesai! ${result.message}`,
      });
      await fetchData();
    } else {
      setMessage({ type: "error", text: result.message });
    }
    setClaiming(null);
  };

  const typeIcon = (type: string) => {
    if (type === "daily") return <Flame size={16} className="text-coral" />;
    if (type === "weekly")
      return <CalendarDays size={16} className="text-teal" />;
    return <Star size={16} className="text-amber" />;
  };

  const typeLabel = (type: string) => {
    if (type === "daily") return "Harian";
    if (type === "weekly") return "Mingguan";
    return "Spesial";
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-darkgray flex items-center gap-2">
          <Target className="text-coral" size={32} /> Misi & Tantangan
        </h2>
        <p className="text-darkgray-medium mt-1">
          Selesaikan misi untuk mendapatkan poin tambahan!
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === "success"
              ? "bg-sage/10 text-sage-dark"
              : "bg-coral/10 text-coral"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <CheckCircle2 size={20} />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {challenges.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Target className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-darkgray-medium">
            Belum ada misi aktif. Tunggu tantangan baru dari admin!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {challenges.map((ch) => {
            const uc = getProgress(ch.id);
            const progress = uc?.progress || 0;
            const isCompleted = uc?.is_completed || false;
            const isClaimed = uc?.is_claimed || false;
            const percent = Math.min(
              100,
              Math.round((progress / ch.target_value) * 100),
            );

            return (
              <div
                key={ch.id}
                className={`glass-card p-6 ${isClaimed ? "opacity-70" : ""}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {typeIcon(ch.challenge_type)}
                    <span className="text-xs font-bold text-darkgray-medium uppercase">
                      {typeLabel(ch.challenge_type)}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-amber/10 text-amber rounded-full text-xs font-bold">
                    +{ch.reward_points} Poin
                  </span>
                </div>

                <h3 className="text-lg font-bold text-darkgray mb-1">
                  {ch.title}
                </h3>
                <p className="text-sm text-darkgray-medium mb-4">
                  {ch.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-darkgray-medium mb-1">
                    <span>Progress</span>
                    <span>
                      {progress}/{ch.target_value}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-lightgray/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-gradient-to-r from-sage to-teal"
                          : "bg-gradient-to-r from-amber to-orange-400"
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  {isClaimed ? (
                    <div className="flex items-center justify-center gap-2 text-sage font-bold text-sm py-2">
                      <CheckCircle2 size={18} /> Reward sudah diklaim
                    </div>
                  ) : isCompleted ? (
                    <button
                      onClick={() => handleClaim(ch.id)}
                      disabled={claiming === ch.id}
                      className="btn-primary w-full py-2 flex items-center justify-center gap-2"
                    >
                      {claiming === ch.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Gift size={16} /> Klaim Reward
                        </>
                      )}
                    </button>
                  ) : (
                    <p className="text-xs text-darkgray-medium text-center py-2">
                      Selesaikan misi untuk klaim reward
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
