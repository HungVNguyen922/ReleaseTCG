import { createEmptyCard } from "@/lib/cards/createEmptyCard";
import { CardDetailsForm } from "../[id]/components/cardform/CardDetailsForm";

export default function NewCardPage() {
  const emptyCard = createEmptyCard();

  return (
    <main className="h-app">
      <CardDetailsForm initial={emptyCard} />
    </main>
  );
}