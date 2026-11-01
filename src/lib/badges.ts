import { createClient } from "@/lib/supabase";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria_type: "submissions" | "plastic" | "paper" | "points";
  criteria_value: number;
}

export interface UserBadge extends Badge {
  earned_at: string;
}

/**
 * Ambil semua badge yang tersedia di sistem
 */
export async function getAllBadges(): Promise<Badge[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("badges")
    .select("*")
    .order("criteria_value", { ascending: true });

  if (error) {
    console.error("Error fetching badges:", error);
    return [];
  }
  return data || [];
}

/**
 * Ambil badge yang sudah diraih user
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_badges")
    .select(
      `
      earned_at,
      badges (id, name, description, icon, criteria_type, criteria_value)
    `,
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user badges:", error);
    return [];
  }

  return (data || []).map((ub: any) => ({
    ...ub.badges,
    earned_at: ub.earned_at,
  }));
}

/**
 * Hitung statistik user untuk cek kriteria badge
 */
async function getUserStats(userId: string) {
  const supabase = createClient();

  // Hitung total submission approved
  const { count: totalSubmissions } = await supabase
    .from("waste_submissions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "approved");

  // Hitung submission plastik approved
  const { count: plasticCount } = await supabase
    .from("waste_submissions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "approved")
    .eq("category", "plastic");

  // Hitung submission kertas approved
  const { count: paperCount } = await supabase
    .from("waste_submissions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "approved")
    .eq("category", "paper");

  // Ambil total poin user
  const { data: profile } = await supabase
    .from("users")
    .select("points")
    .eq("id", userId)
    .single();

  return {
    submissions: totalSubmissions || 0,
    plastic: plasticCount || 0,
    paper: paperCount || 0,
    points: profile?.points || 0,
  };
}

/**
 * Cek dan award badge baru yang memenuhi kriteria
 * Dipanggil setelah admin approve submission
 * @returns Array badge baru yang di-award
 */
export async function checkAndAwardBadges(userId: string): Promise<Badge[]> {
  const supabase = createClient();

  const stats = await getUserStats(userId);
  const allBadges = await getAllBadges();
  const userBadges = await getUserBadges(userId);

  // Badge yang sudah dimiliki user
  const ownedBadgeIds = new Set(userBadges.map((b) => b.id));

  // Badge yang baru di-award
  const newBadges: Badge[] = [];

  for (const badge of allBadges) {
    // Skip jika sudah dimiliki
    if (ownedBadgeIds.has(badge.id)) continue;

    // Cek kriteria
    let earned = false;
    const value = stats[badge.criteria_type];

    if (value >= badge.criteria_value) {
      earned = true;
    }

    if (earned) {
      // Insert ke user_badges
      const { error } = await supabase.from("user_badges").insert({
        user_id: userId,
        badge_id: badge.id,
      });

      if (!error) {
        newBadges.push(badge);

        // Insert ke point_transactions untuk riwayat (bonus badge)
        await supabase.from("point_transactions").insert({
          user_id: userId,
          amount: 0,
          type: "badge_bonus",
          description: `Meraih badge: ${badge.name}`,
        });
      }
    }
  }

  return newBadges;
}
