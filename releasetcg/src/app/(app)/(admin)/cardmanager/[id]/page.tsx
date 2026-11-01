import { notFound } from "next/navigation";
import { getCard } from "@/utils/supabase/cards/getCard";
import { CardDetailsForm } from "./components/cardform/CardDetailsForm";
import { normalizeCard } from "./components/cardform/normalizeCard";

export default async function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const card = await getCard(id);

  if (!card) {
    notFound();
  }

  return (
    <main className="h-app">
        <CardDetailsForm
            id={card.id}
            initial={normalizeCard(card)}
        />
    </main>
  );
}