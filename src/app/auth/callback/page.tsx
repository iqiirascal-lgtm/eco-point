import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: { code: string };
}) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      searchParams.code,
    );

    if (error) {
      throw error;
    }

    // Check if user exists in users table, if not create one
    if (data.user) {
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!existingUser) {
        // Create new user record
        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          full_name:
            data.user.user_metadata.full_name || data.user.email!.split("@")[0],
          nim: null,
          phone: null,
          points: 0,
          role: "student",
        });
      }
    }
  } catch (error) {
    console.error("Error exchanging code for session:", error);
    redirect("/auth?error=oauth_failed");
  }

  redirect("/dashboard");
}
