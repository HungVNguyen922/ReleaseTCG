import Link from "next/link"

import { getPublicCards } from "@/utils/supabase/cards/getPublicCards"

import { Box } from "./components/box"
import { HomeShowcase } from "./components/home/HomeShowcase"

// Each visit opens on a freshly generated match.
export const dynamic = "force-dynamic"

const primaryLink =
  "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"

const secondaryLink =
  "inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"

export default async function Page() {
  const cards = await getPublicCards()

  const initialSeed = Math.floor(Math.random() * 2 ** 31)

  return (
    <div className="flex min-h-dvh flex-col">
      <h1 className="py-4 text-center text-4xl font-bold">ReleaseTCG</h1>

      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-4 py-6 lg:grid-cols-[minmax(0,34rem)_minmax(0,1fr)]">
        <HomeShowcase cards={cards} initialSeed={initialSeed} />

        <Box>
          <div className="grid grid-cols-1 gap-4">
            <h2 className="text-4xl font-bold">Welcome to ReleaseTCG!</h2>

            <p className="text-lg text-muted-foreground">
              Learn to juggle 9 colors each with their unique abilities and
              traits.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/learn" className={primaryLink}>
                Learn to play
              </Link>

              <Link href="/sandbox" className={secondaryLink}>
                Try the sandbox
              </Link>

              <Link href="/gallery" className={secondaryLink}>
                Browse the cards
              </Link>
            </div>
          </div>
        </Box>
      </section>
    </div>
  )
}
