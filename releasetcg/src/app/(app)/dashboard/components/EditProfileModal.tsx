"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

import type { Profile } from "@/types/profiles";

import { ProfileSection } from "./ProfileSection";
import { PasswordSection } from "./PasswordSection";
import { updateProfile } from "@/utils/profile/updateProfile";
import {
  changePassword,
  sendPasswordVerificationCode,
} from "@/utils/profile/changePassword";
import { validatePassword } from "@/utils/profile/validation/validatePassword";

export function EditProfileModal({
  profile,
  onClose,
}: {
  profile: Profile | null;
  onClose: () => void;
}) {
  const [editingUsername, setEditingUsername] = useState(false);

  const [username, setUsername] = useState(
    profile?.username ?? ""
  );

  const [draftUsername, setDraftUsername] = useState(
    profile?.username ?? ""
  );

  const [bio, setBio] = useState(
    profile?.bio ?? ""
  );

  const [saving, setSaving] = useState(false);

  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const router = useRouter();

  // this sends the nonce so that the user can verify their password change 
  async function handleSendCode() {
    const { error } =
      await sendPasswordVerificationCode();
    
    if (error) {
      setPasswordError(error.message);
      return;
    }

    setCodeSent(true);
    setPasswordError("");
  }

  async function save() {
    setSaving(true);
    setPasswordError("");

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const {error } = await updateProfile(
      user.id,
      username,
      bio
    );

    if (error) {
      console.error(error);
      setSaving(false);
      return;
    }

    // Only attempt password change if user entered one
    if (newPassword.length > 0) {
      if (newPassword !== confirmPassword) {
        setPasswordError("Passwords do not match");
        setSaving(false);
        return;
      }

      const validation = validatePassword(newPassword);

      if (!validation.valid) {
        setPasswordError(validation.message);
        setSaving(false);
        return;
      }

      if (!verificationCode.trim()) {
        setPasswordError(
          "Verification code required"
        );
        setSaving(false);
        return;
      }

      const { error } = await changePassword(
        newPassword,
        verificationCode
      );

      if (error) {
        setPasswordError(error.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    onClose();
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-6 text-2xl font-bold">
          Edit Profile
        </h2>
        
        <ProfileSection
          username={username}
          setUsername={setUsername}
          draftUsername={draftUsername}
          setDraftUsername={setDraftUsername}
          bio={bio}
          setBio={setBio}
          editingUsername={editingUsername}
          setEditingUsername={setEditingUsername}
        />

        <PasswordSection
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          passwordError={passwordError}
          codeSent={codeSent}
          onSendCode={handleSendCode}
        />

        {/* Footer */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border px-4 py-2"
          >
            Cancel
          </button>

          <button
            data-testid="save-profile"
            onClick={save}
            disabled={saving}
            className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
