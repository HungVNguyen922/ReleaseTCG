"use client"

import { useEffect, useMemo, useState, useSyncExternalStore } from "react"

import { CardModal } from "@/features/cards/CardModal"
import { generateShowcaseState } from "@/lib/showcase/generateShowcaseState"
import { randomSeed } from "@/lib/showcase/seededRng"
import type { PlayableCard } from "@/types/cards"

import { MatchPreview } from "./MatchPreview"

const ROTATE_MS = 9000

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)"

function subscribeToMotionPreference(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION)

  query.addEventListener("change", onChange)

  return () => query.removeEventListener("change", onChange)
}

type Props = {
  cards: PlayableCard[]
  /** Chosen on the server, so every visit opens on a different match. */
  initialSeed: number
}

export function HomeShowcase({ cards, initialSeed }: Props) {
  const [seed, setSeed] = useState(initialSeed)
  const [autoRotate, setAutoRotate] = useState(true)
  const [hovering, setHovering] = useState(false)
  const [inspected, setInspected] = useState<PlayableCard | null>(null)

  const reducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  )

  const state = useMemo(
    () => generateShowcaseState(cards, seed),
    [cards, seed]
  )

  useEffect(() => {
    if (!autoRotate || hovering || reducedMotion || inspected) return

    const timer = window.setInterval(() => setSeed(randomSeed()), ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [autoRotate, hovering, reducedMotion, inspected, seed])

  if (!state) {
    return (
      <div className="rounded-2xl border p-8 text-center text-sm text-muted-foreground">
        The match preview isn’t available right now.
      </div>
    )
  }

  return (
    <div
      className="w-full space-y-3"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocusCapture={() => setHovering(true)}
      onBlurCapture={() => setHovering(false)}
    >
      {/* A new key fades the next match in. */}
      <div key={seed} className="animate-in fade-in duration-500">
        <MatchPreview state={state} onCardClick={setInspected} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          A randomly generated match. Click any card to look closer.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSeed(randomSeed())}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
          >
            New match
          </button>

          {!reducedMotion && (
            <button
              type="button"
              aria-pressed={autoRotate}
              onClick={() => setAutoRotate((on) => !on)}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
              {autoRotate ? "Pause" : "Auto-play"}
            </button>
          )}
        </div>
      </div>

      <CardModal
        card={inspected}
        open={inspected !== null}
        onOpenChange={(open) => {
          if (!open) setInspected(null)
        }}
      />
    </div>
  )
}
