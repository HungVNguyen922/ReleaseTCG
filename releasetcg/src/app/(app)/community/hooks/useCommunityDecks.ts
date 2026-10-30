"use client";

import { useEffect, useState } from "react";

import type {
  CommunityDeckSummary,
  CommunityFilter,
} from "@/types/community";

import { listCommunityDecks } from "@/utils/community";

type Props = {
  search: string;
  filter: CommunityFilter;
};

export function useCommunityDecks({ search, filter }: Props) {
  const [decks, setDecks] = useState<CommunityDeckSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    //
    // Ignore responses from superseded searches so a slow, older
    // request can't overwrite newer results.
    //

    let cancelled = false;

    async function load() {
      setLoading(true);

      try {
        const result = await listCommunityDecks({ search, filter });

        if (!cancelled) {
          setDecks(result);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [search, filter]);

  return { decks, loading };
}