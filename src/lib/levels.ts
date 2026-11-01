export interface Level {
  level: number;
  name: string;
  minPoints: number;
  icon: string;
}

export const LEVELS: Level[] = [
  { level: 1, name: "Pemula Hijau", minPoints: 0, icon: "🌱" },
  { level: 2, name: "Eco Rookie", minPoints: 50, icon: "🌿" },
  { level: 3, name: "Eco Warrior", minPoints: 150, icon: "♻️" },
  { level: 4, name: "Eco Hero", minPoints: 300, icon: "🌍" },
  { level: 5, name: "Eco Legend", minPoints: 500, icon: "👑" },
];

export function getCurrentLevel(points: number): Level {
  let current = LEVELS[0];
  for (const l of LEVELS) {
    if (points >= l.minPoints) current = l;
  }
  return current;
}

export function getNextLevel(points: number): Level | null {
  const current = getCurrentLevel(points);
  const idx = LEVELS.findIndex((l) => l.level === current.level);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1] : null;
}

export function getProgressToNextLevel(points: number): number {
  const current = getCurrentLevel(points);
  const next = getNextLevel(points);
  if (!next) return 100;
  const range = next.minPoints - current.minPoints;
  const progress = points - current.minPoints;
  return Math.min(100, Math.round((progress / range) * 100));
}
