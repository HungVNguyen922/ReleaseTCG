"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/types/profiles";
import { EditProfileModal } from "./EditProfileModal";

export function EditProfileButton({
  profile,
}: {
  profile: Profile | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="absolute top-0 right-0" onClick={() => setOpen(true)}>
        Edit Profile
      </Button>

      {open && (
        <EditProfileModal
          profile={profile}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
