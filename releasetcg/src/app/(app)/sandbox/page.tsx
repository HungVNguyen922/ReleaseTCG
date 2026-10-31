import SandboxController from "@/sandbox-ui/SandboxController";

import { toPlayableCard } from "@/lib/cards/cardMapper";

import { getEngineCards } from "@/utils/supabase/cards/getEngineCards";

//
// Play-test sandbox: both players on one device, no rules enforced.
// Loads every card the signed-in user can see so saved decks that
// contain draft cards still work.
//

export default async function SandboxPage() {

  const cards = (await getEngineCards()).map(toPlayableCard);

  return (
    <main className="h-screen overflow-hidden">
      <SandboxController cards={cards} />
    </main>
  );
}
