"use client";

import {
  getCurrentLevel,
  getNextLevel,
  getProgressToNextLevel,
} from "@/lib/levels";

export default function LevelCard({ points }: { points: number }) {
  const current = getCurrentLevel(points);
  const next = getNextLevel(points);
  const progress = getProgressToNextLevel(points);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md shadow-sage/10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center text-2xl">
            {current.icon}
          </div>
          <div>
            <p className="text-[11px] text-darkgray-medium">
              Level {current.level}
            </p>
            <h3 className="text-lg font-bold text-darkgray [font-family:var(--font-bricolage)]">
              {current.name}
            </h3>
          </div>
        </div>
        {next && (
          <div className="text-right">
            <p className="text-[10px] text-darkgray-medium">Menuju</p>
            <p className="text-xs font-bold text-sage">
              {next.icon} {next.name}
            </p>
          </div>
        )}
      </div>

      <div className="mb-2">
        <div className="flex justify-between text-[11px] text-darkgray-medium mb-1">
          <span>Progress Level</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-lightgray/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sage to-teal rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {next ? (
        <p className="text-[11px] text-darkgray-medium">
          Kumpulkan{" "}
          <span className="font-bold text-sage">
            {next.minPoints - points} poin lagi
          </span>{" "}
          untuk naik ke level {next.name}!
        </p>
      ) : (
        <p className="text-[11px] text-amber font-bold">
          🎉 Level maksimal tercapai! Kamu legenda ECO POINT!
        </p>
      )}
    </div>
  );
}
