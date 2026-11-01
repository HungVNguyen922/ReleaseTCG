"use client";

import type { PlayableCard } from "@/types/cards";

import CardInspector from "@/app/(app)/components/cards/CardInspector";

type Props = {
  card: PlayableCard | null;
  anchor: DOMRect | null;
};

const POPUP_WIDTH = 360;
const POPUP_MAX_HEIGHT = 420;
const GAP = 16;
const SCREEN_PADDING = 16;

export default function CardPreviewPopup({
  card,
  anchor,
}: Props) {
  if (!card || !anchor) {
    return null;
  }

  // Prefer displaying to the right.
  let left = anchor.right + GAP;

  // If it would overflow, display to the left.
  if (
    left + POPUP_WIDTH >
    window.innerWidth - SCREEN_PADDING
  ) {
    left = anchor.left - POPUP_WIDTH - GAP;
  }

  // Clamp horizontally.
  left = Math.max(
    SCREEN_PADDING,
    Math.min(
      left,
      window.innerWidth -
        POPUP_WIDTH -
        SCREEN_PADDING
    )
  );

  // Prefer aligning with the top of the card.
  let top = anchor.top;

  // If it would overflow the bottom, move it upward.
  if (
    top + POPUP_MAX_HEIGHT >
    window.innerHeight - SCREEN_PADDING
  ) {
    top =
      window.innerHeight -
      POPUP_MAX_HEIGHT -
      SCREEN_PADDING;
  }

  // Clamp to the top.
  top = Math.max(SCREEN_PADDING, top);

  return (
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left,
        top,
      }}
    >
      <div
        className="
          w-[360px] max-w-[90vw]
          max-h-[420px]
          overflow-hidden
          rounded-xl
          border
          bg-background
          shadow-2xl
        "
      >
        <CardInspector card={card} />
      </div>
    </div>
  );
}