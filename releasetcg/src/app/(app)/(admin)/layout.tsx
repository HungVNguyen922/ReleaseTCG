import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getUserProfile } from "@/utils/supabase/getUserProfile";

//
// Everything under (admin) requires a signed-in admin.
//

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user, profile } = await getUserProfile();

  if (!user) {
    redirect("/emailpassword");
  }

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
