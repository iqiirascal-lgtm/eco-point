import { createClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();

  // Logout dari Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }

  // Revalidate cache
  revalidatePath("/", "layout");

  // Redirect ke halaman login
  return NextResponse.redirect(
    new URL("/", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
  );
}
