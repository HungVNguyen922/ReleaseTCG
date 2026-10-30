"use client";

import { useState } from "react";

import CommunityGuideToolbar from "./CommunityGuideToolbar";

type Props = {
  title: string;
  author: string;
  description: string;

  canEdit?: boolean;

  onSaveDescription: (
    description: string
  ) => Promise<void>;

  onDelete: () => void;
  onExportCode: () => void;
  onExportImage: () => void;
};

export default function CommunityGuide({
  title,
  author,
  description,

  canEdit = false,

  onSaveDescription,
  onDelete,
  onExportCode,
  onExportImage,
}: Props) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [draft, setDraft] =
    useState(description);

  //
  // Re-sync the draft when the saved description changes
  // (derived during render rather than in an effect).
  //

  const [lastDescription, setLastDescription] =
    useState(description);

  if (description !== lastDescription) {
    setLastDescription(description);
    setDraft(description);
  }

  async function handleSave() {
    await onSaveDescription(draft);

    setIsEditing(false);
  }

  function handleCancel() {
    setDraft(description);
    setIsEditing(false);
  }

  return (
    <div className="flex h-full flex-col rounded-xl border bg-card p-6">

      <div className="space-y-2 border-b pb-4">
        <h1 className="text-3xl font-bold">
          {title}
        </h1>

        <p className="text-sm text-muted-foreground">
          by {author}
        </p>
      </div>

      <div className="mt-6 flex-1">

        {isEditing ? (
          <textarea
            value={draft}
            onChange={(e) =>
              setDraft(e.target.value)
            }
            className="
              min-h-[350px]
              w-full
              resize-none
              rounded-lg
              border
              bg-background
              p-4
              leading-7
              outline-none
            "
          />
        ) : (
          <div className="whitespace-pre-wrap leading-7">
            {description}
          </div>
        )}

      </div>

      <CommunityGuideToolbar
        canEdit={canEdit}
        isEditing={isEditing}
        onStartEditing={() =>
          setIsEditing(true)
        }
        onSave={handleSave}
        onCancel={handleCancel}
        onDelete={onDelete}
        onExportCode={onExportCode}
        onExportImage={onExportImage}
      />

    </div>
  );
}