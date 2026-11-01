import { Gallery } from "./Gallery";
import { getPublicCards } from "@/utils/supabase/cards/getPublicCards";

export default async function GalleryPage() {
  const cards = await getPublicCards();

  return (
    <main className="h-app overflow-hidden">
      <Gallery initialCards={cards} />
    </main>
  );
}