"use client";

import { useRouter } from "next/navigation";

export function CardManagerHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          Card Manager
        </h1>

        <p className="text-muted-foreground">
          Manage every card in the game.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => router.push("/cardmanager/import")}
          className="rounded border px-4 py-2 hover:bg-muted"
        >
          Import CSV
        </button>

        <button
          onClick={() =>
            router.push("/cardmanager/newCard")
          }
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + New Card
        </button>
      </div>
    </div>
  );
}


