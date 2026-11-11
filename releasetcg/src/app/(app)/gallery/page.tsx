import { Gallery } from "./Gallery";
import { getPublicCards } from "@/utils/supabase/cards/getPublicCards";
import { findSet } from "@/lib/sets/sets";

type Props = {
  searchParams: Promise<{ set?: string | string[] }>;
};

export default async function GalleryPage({ searchParams }: Props) {
  const params = await searchParams;

  // /gallery?set=IRFO opens the gallery filtered to that set.
  const requested = Array.isArray(params.set) ? params.set[0] : params.set;
  const initialSetName = findSet(requested)?.code ?? "";

  const cards = await getPublicCards();

  return (
    <main className="h-app overflow-hidden">
      {/* The key restarts the gallery when the sidebar switches sets. */}
      <Gallery
        key={initialSetName || "all"}
        initialCards={cards}
        initialSetName={initialSetName}
      />
    </main>
  );
}
