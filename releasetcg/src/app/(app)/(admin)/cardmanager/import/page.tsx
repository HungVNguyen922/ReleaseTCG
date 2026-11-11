import Link from "next/link"

import { ImportCardsForm } from "./ImportCardsForm"

export const metadata = {
  title: "Import cards",
}

export default function ImportCardsPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <header className="space-y-1">
        <Link
          href="/cardmanager"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Card Manager
        </Link>

        <h1 className="text-3xl font-bold">Import cards from CSV</h1>

        <p className="text-muted-foreground">
          Upload a card sheet exported as CSV. Nothing is saved until you check
          the file and confirm.
        </p>
      </header>

      <ImportCardsForm />
    </main>
  )
}
