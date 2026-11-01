import { createClient } from "@/lib/supabase";

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: "daily" | "weekly" | "special";
  target_type: "submissions" | "plastic" | "paper" | "points";
  target_value: number;
  reward_points: number;
  is_active: boolean;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  is_claimed: boolean;
}

/** Ambil semua tantangan aktif */
export async function getActiveChallenges(): Promise<Challenge[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching challenges:", error);
    return [];
  }
  return data || [];
}

/** Ambil progress user untuk semua tantangan */
export async function getUserChallenges(
  userId: string,
): Promise<UserChallenge[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_challenges")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user challenges:", error);
    return [];
  }
  return data || [];
}

/** Sync progress tantangan tipe 'points' dengan poin user saat ini */
export async function syncPointsChallenges(userId: string) {
  const supabase = createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("points")
    .eq("id", userId)
    .single();
  if (!profile) return;

  const challenges = await getActiveChallenges();
  const pointsChallenges = challenges.filter(
    (ch) => ch.target_type === "points",
  );
  if (pointsChallenges.length === 0) return;

  const userChallenges = await getUserChallenges(userId);
  const ucMap = new Map(userChallenges.map((uc) => [uc.challenge_id, uc]));

  for (const ch of pointsChallenges) {
    let uc: UserChallenge | undefined = ucMap.get(ch.id);

    // Buat record progress jika belum ada
    if (!uc) {
      const { data } = await supabase
        .from("user_challenges")
        .insert({ user_id: userId, challenge_id: ch.id, progress: 0 })
        .select()
        .single();
      uc = (data as UserChallenge) || undefined;
    }

    // ✅ GUARD: pastikan uc pasti ada sebelum dipakai
    if (!uc) continue;
    if (uc.is_claimed) continue;

    const newProgress = Math.min(profile.points, ch.target_value);
    const isCompleted = newProgress >= ch.target_value;

    await supabase
      .from("user_challenges")
      .update({
        progress: newProgress,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uc.id);
  }
}

/** Update progress tantangan setelah admin approve submission */
export async function updateChallengeProgress(
  userId: string,
  category: string,
) {
  const supabase = createClient();

  const challenges = await getActiveChallenges();
  const userChallenges = await getUserChallenges(userId);
  const ucMap = new Map(userChallenges.map((uc) => [uc.challenge_id, uc]));

  for (const ch of challenges) {
    // Skip tantangan yang tidak relevan dengan kategori submission
    if (ch.target_type === "plastic" && category !== "plastic") continue;
    if (ch.target_type === "paper" && category !== "paper") continue;
    if (ch.target_type === "points") continue; // di-handle syncPointsChallenges

    let uc: UserChallenge | undefined = ucMap.get(ch.id);

    // Buat record progress jika belum ada
    if (!uc) {
      const { data } = await supabase
        .from("user_challenges")
        .insert({ user_id: userId, challenge_id: ch.id, progress: 0 })
        .select()
        .single();
      uc = (data as UserChallenge) || undefined;
    }

    // ✅ GUARD: pastikan uc pasti ada sebelum dipakai
    if (!uc) continue;
    if (uc.is_claimed) continue;

    const newProgress = Math.min(uc.progress + 1, ch.target_value);
    const isCompleted = newProgress >= ch.target_value;

    await supabase
      .from("user_challenges")
      .update({
        progress: newProgress,
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq("id", uc.id);
  }

  // Sync tantangan tipe points (karena poin user baru saja bertambah)
  await syncPointsChallenges(userId);
}

/** Klaim reward tantangan yang sudah selesai */
export async function claimChallengeReward(
  userId: string,
  challengeId: string,
): Promise<{ success: boolean; message: string; reward?: number }> {
  const supabase = createClient();

  const { data: uc, error: ucError } = await supabase
    .from("user_challenges")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .single();

  if (ucError || !uc)
    return { success: false, message: "Progress tantangan tidak ditemukan" };
  if (!uc.is_completed)
    return { success: false, message: "Tantangan belum selesai" };
  if (uc.is_claimed) return { success: false, message: "Reward sudah diklaim" };

  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();
  if (!challenge)
    return { success: false, message: "Tantangan tidak ditemukan" };

  // Tambah poin user
  const { data: profile } = await supabase
    .from("users")
    .select("points")
    .eq("id", userId)
    .single();
  const newPoints = (profile?.points || 0) + challenge.reward_points;

  const { error: updateError } = await supabase
    .from("users")
    .update({ points: newPoints })
    .eq("id", userId);
  if (updateError) return { success: false, message: updateError.message };

  // Tandai sudah diklaim
  await supabase
    .from("user_challenges")
    .update({ is_claimed: true, updated_at: new Date().toISOString() })
    .eq("id", uc.id);

  // Catat transaksi poin
  await supabase.from("point_transactions").insert({
    user_id: userId,
    amount: challenge.reward_points,
    type: "challenge",
    description: `Reward misi: ${challenge.title}`,
  });

  return {
    success: true,
    message: `+${challenge.reward_points} poin!`,
    reward: challenge.reward_points,
  };
}
