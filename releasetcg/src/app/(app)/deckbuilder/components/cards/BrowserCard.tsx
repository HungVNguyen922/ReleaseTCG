"use client";

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

  onClick: (
    card: PlayableCard
  ) => void;
};

export default function BrowserCard({
  card,
  counts,
  setHoveredCardId,
  setHoverAnchor,
  onClick,
}: Props) {
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-xl border bg-card shadow transition hover:-translate-y-1 hover:shadow-lg"
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
      onClick={() => onClick(card)}
    >
      <div className="relative aspect-[5/7] bg-black/5">
        <Image
          src={getCardImageUrl(card)}
          alt={card.name}
          fill
          sizes="(max-width: 768px) 50vw, 200px"
          className="object-cover"
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