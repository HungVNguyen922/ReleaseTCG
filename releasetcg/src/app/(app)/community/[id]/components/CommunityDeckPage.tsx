"use client";

import { useEffect, useRef, useState } from "react";

import type { CommunityDeck } from "@/types/community";
import { getCommunityDeck } from "@/utils/community";
import { createClient } from "@/utils/supabase/client";

import { useCards } from "@/app/(app)/deckbuilder/hooks/useCards";
import { useCommunityDeck } from "../hooks/useCommunityDeck";
import { useCommunityDeckActions } from "../hooks/useCommunityDeckActions";

import CommunityGuide from "./CommunityGuide/CommunityGuide";
import CommunityDeckOverview from "./CommunityDeckOverview";

type Props = {
  deckId: string;
};

export default function CommunityDeckPage({
  deckId,
}: Props) {
  const [deck, setDeck] =
    useState<CommunityDeck | null>(null);

  const [hoveredCardId, setHoveredCardId] =
    useState<string | null>(null);

  const [hoverAnchor, setHoverAnchor] =
    useState<DOMRect | null>(null);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        setCurrentUserId(data.user?.id ?? null);
      });
  }, []);

  const deckOverviewRef =
    useRef<HTMLDivElement>(null);

  const {
    cards,
    loading: cardsLoading,
  } = useCards();

  useEffect(() => {
    async function loadDeck() {
      try {
        const communityDeck =
          await getCommunityDeck(deckId);

        setDeck(communityDeck);
      } catch (error) {
        console.error(error);
      }
    }

    loadDeck();
  }, [deckId]);

  const { cardMap, coverCard, mainDeckCards, extraDeckCards } =
    useCommunityDeck(deck, cards);

  const hoveredCard = hoveredCardId ? cardMap.get(hoveredCardId) ?? null : null;

  const {
    handleSaveDescription,
    handleDelete,
    handleExportCode,
    handleExportImage,
  } = useCommunityDeckActions({
    deck,
    setDeck,
    cards,
    deckOverviewRef,
  });

  if (cardsLoading || !deck) {
    return (
      <div className="p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="grid grid-cols-2 gap-8">

        <CommunityGuide
          title={deck.title}
          author={deck.author}
          description={deck.description}
          canEdit={currentUserId !== null && currentUserId === deck.ownerId}
          onSaveDescription={handleSaveDescription}
          onDelete={handleDelete}
          onExportCode={handleExportCode}
          onExportImage={handleExportImage}
        />

        <div ref={deckOverviewRef}>
          <CommunityDeckOverview
            deckTitle={deck.title}
            author={deck.author}
            coverCard={coverCard}
            mainDeck={mainDeckCards}
            extraDeck={extraDeckCards}
            hoveredCard={hoveredCard}
            hoverAnchor={hoverAnchor}
            setHoveredCardId={setHoveredCardId}
            setHoverAnchor={setHoverAnchor}
          />
        </div>

      </div>
    </div>
  );
}