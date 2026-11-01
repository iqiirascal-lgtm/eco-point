"use client";

import { useEffect, useState } from "react";
import { Award, Lock } from "lucide-react";
import { getAllBadges, getUserBadges, Badge, UserBadge } from "@/lib/badges";

interface Props {
  userId: string;
}

export default function BadgeCollection({ userId }: Props) {
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [ownedBadges, setOwnedBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      setLoading(true);
      const [all, owned] = await Promise.all([
        getAllBadges(),
        getUserBadges(userId),
      ]);
      setAllBadges(all);
      setOwnedBadges(owned);
      setLoading(false);
    };
    if (userId) fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md shadow-sage/10">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const ownedIds = new Set(ownedBadges.map((b) => b.id));
  const ownedCount = ownedBadges.length;
  const totalCount = allBadges.length;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md shadow-sage/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-darkgray flex items-center gap-2 [font-family:var(--font-bricolage)]">
          <Award size={18} className="text-amber" /> Koleksi Lencana
        </h3>
        <span className="px-3 py-1 bg-amber/10 text-amber rounded-full text-xs font-bold">
          {ownedCount}/{totalCount}
        </span>
      </div>

      {totalCount === 0 ? (
        <p className="text-darkgray-medium text-center py-6 text-sm">
          Belum ada lencana tersedia.
        </p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {allBadges.map((badge) => {
            const isOwned = ownedIds.has(badge.id);
            return (
              <div
                key={badge.id}
                title={`${badge.name}: ${badge.description}`}
                className={`flex flex-col items-center p-3 rounded-xl transition-all ${
                  isOwned
                    ? "bg-gradient-to-br from-amber/10 to-sage/15 border border-amber/40 shadow-sm"
                    : "bg-[#f4faf3] border border-lightgray/60"
                }`}
              >
                {isOwned ? (
                  <div className="text-2xl mb-1">{badge.icon}</div>
                ) : (
                  <Lock className="text-gray-400 mb-1" size={22} />
                )}
                <p
                  className={`text-[10px] text-center font-bold ${
                    isOwned ? "text-darkgray" : "text-gray-500"
                  }`}
                >
                  {badge.name}
                </p>
                {!isOwned && (
                  <p className="text-[9px] text-gray-400 text-center mt-0.5">
                    {badge.criteria_value} {badge.criteria_type}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
