import { NextResponse } from "next/server";

import { createClient } from "./server";

/**
 * Guard for admin-only API routes.
 *
 * Returns either `{ supabase }` for an authenticated admin, or
 * `{ error }` holding the 401/403 response to return immediately.
 */
export async function requireAdminApi() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    } as const;
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    } as const;
  }

  return { supabase } as const;
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unexpected error";
}
