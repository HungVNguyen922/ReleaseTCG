"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";

import type { PlayableCard } from "@/types/cards";

import { getCardImageUrl } from "@/lib/images/getCardImageUrl";

type Props = {
  card: PlayableCard;

  counts?: {
    main: number;
    extra: number;
  };

  setHoveredCardId: (
    id: string | null
  ) => void;

  setHoverAnchor: (
    anchor: DOMRect | null
  ) => void;

  /** Left click: add the card to the deck. */
  onClick: (
    card: PlayableCard
  ) => void;

  /** Right click (or long-press on touch screens): show card details. */
  onInspect: (
    card: PlayableCard
  ) => void;
};

const LONG_PRESS_MS = 500;

export default function BrowserCard({
  card,
  counts,
  setHoveredCardId,
  setHoverAnchor,
  onClick,
  onInspect,
}: Props) {
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  useEffect(() => {
    const timer = pressTimer;

    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  function cancelPress() {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function startPress() {
    longPressed.current = false;
    cancelPress();

    pressTimer.current = window.setTimeout(() => {
      pressTimer.current = null;
      longPressed.current = true;
      onInspect(card);
    }, LONG_PRESS_MS);
  }

  return (
    <div
      className="group cursor-pointer select-none overflow-hidden rounded-lg border bg-card shadow transition [-webkit-touch-callout:none] hover:-translate-y-0.5 hover:shadow-lg"
      onMouseEnter={(e) => {
        // Touch screens fake a hover on tap; the popup would just get in the way.
        if (window.matchMedia("(hover: none)").matches) return;

        setHoveredCardId(card.id);

        setHoverAnchor(
          e.currentTarget.getBoundingClientRect()
        );
      }}
      onMouseLeave={() => {
        setHoveredCardId(null);
        setHoverAnchor(null);
      }}
      onMouseDown={() => {
        longPressed.current = false;
      }}
      onClick={() => {
        // A long-press already opened the details, so don't also add the card.
        if (longPressed.current) {
          longPressed.current = false;
          return;
        }

        onClick(card);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        cancelPress();
        onInspect(card);
      }}
      onTouchStart={startPress}
      onTouchMove={cancelPress}
      onTouchEnd={cancelPress}
      onTouchCancel={cancelPress}
    >
      <div className="relative aspect-[5/7] bg-black/5">
        <Image
          src={getCardImageUrl(card)}
          alt={card.name}
          fill
          sizes="(max-width: 768px) 34vw, 160px"
          className="object-cover"
          draggable={false}
        />

        {(counts?.main || counts?.extra) && (
          <div className="absolute right-1 top-1 flex flex-col gap-1">
            {counts.main > 0 && (
              <div className="rounded bg-blue-600/90 px-1.5 py-0.5 text-[10px] text-white">
                M {counts.main}
              </div>
            )}

            {counts.extra > 0 && (
              <div className="rounded bg-purple-600/90 px-1.5 py-0.5 text-[10px] text-white">
                E {counts.extra}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
