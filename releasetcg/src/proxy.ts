import type { NextRequest } from "next/server";

import { updateSession } from "@/utils/supabase/middleware";

//
// Next.js 16 renamed the `middleware` convention to `proxy`.
// This keeps the Supabase auth session fresh on every request.
//

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
