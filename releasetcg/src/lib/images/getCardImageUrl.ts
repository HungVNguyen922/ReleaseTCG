import { PlayableCard } from "@/types/cards";

const SUPABASE_PROJECT_URL =
  "https://nelejiwidolomftgrcjt.supabase.co";

const BUCKET = "CardImages";

type ImageSourceCard = Pick<PlayableCard, "cardNumber" | "setName">;

function buildCardImageFilename(card: ImageSourceCard): string {
  const num = card.cardNumber?.replace("/", "_");
  const set = card.setName;

  if (!num || !set) return "1_81 - IRFO.png";

  const raw = `${num} - ${set}.png`;
  return encodeURIComponent(raw);
}

export function getCardImageUrl(card: ImageSourceCard) {
  const fileName = buildCardImageFilename(card);
  return `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET}/${fileName}`;
}

export const CARD_BACK_IMAGE_URL =
  `${SUPABASE_PROJECT_URL}/storage/v1/object/public/${BUCKET}/ReleaseTCGCardBack.png`;