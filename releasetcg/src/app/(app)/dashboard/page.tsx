import { createClient } from "@/utils/supabase/server";
import { Box } from "../components/box";
import { EditProfileButton } from "./components/EditProfileButton";
import { redirect } from "next/navigation";

import DeckGrid from "./components/DeckGrid";
import { listDecks } from "@/lib/decks";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/emailpassword");
  }
  
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const decks = await listDecks(
    supabase,
    user.id
  );

  const wins = profile?.wins ?? 0;
  const losses = profile?.losses ?? 0;

  const totalGames = wins + losses;

  const winrate =
    totalGames === 0
      ? 0
      : Math.round((wins / totalGames) * 100);
      
  return (
    <>
      <Box>
        <div className="relative">
          <EditProfileButton profile={profile} />

          <p className="text-3xl font-bold">{profile?.username ?? user.email}</p>
          <p>{profile?.bio ?? "No bio available."}</p>
          <p>Winrate: {winrate}%</p>
        </div>
      </Box>

      <DeckGrid decks={decks} />
    </>
  );
}
