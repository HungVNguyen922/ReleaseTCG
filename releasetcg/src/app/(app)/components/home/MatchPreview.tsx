"use client"

import Image from "next/image"

import CardBack from "@/game-ui/components/cards/CardBack"
import { getCardImageUrl } from "@/lib/images/getCardImageUrl"
import {
  SLOTS,
  gateZone,
  handZone,
  setZone,
  type SandboxCard,
  type SandboxState,
  type SeatId,
} from "@/lib/sandbox"
import type { PlayableCard } from "@/types/cards"

// Sizes scale with the width of the board (container query units), so the
// whole preview shrinks neatly on small screens.
const GATE_W = "w-[14cqw]"
const SET_W = "w-[8cqw]"
const PILE_W = "w-[9cqw]"
const HAND_W = "w-[10cqw]"

const ROUNDED = "rounded-[1.4cqw]"
const SMALL_TEXT = "text-[max(10px,2.2cqw)]"

type CardClick = (card: PlayableCard) => void

function Face({ sc, onCardClick }: { sc: SandboxCard; onCardClick?: CardClick }) {
  return (
    <button
      type="button"
      title={sc.card.name}
      onClick={() => onCardClick?.(sc.card)}
      className={`relative block h-full w-full overflow-hidden border bg-card shadow-md transition hover:-translate-y-[0.5cqw] hover:shadow-lg focus-visible:outline-2 ${ROUNDED}`}
    >
      <Image
        src={getCardImageUrl(sc.card)}
        alt={sc.card.name}
        fill
        sizes="(max-width: 640px) 25vw, 140px"
        className="object-cover"
        draggable={false}
      />
    </button>
  )
}

function Empty() {
  return (
    <div
      className={`h-full w-full border-2 border-dashed border-muted-foreground/30 ${ROUNDED}`}
    />
  )
}

function GateSlot({
  cards,
  onCardClick,
}: {
  cards: SandboxCard[]
  onCardClick?: CardClick
}) {
  const top = cards[0]

  return (
    <div className={`relative aspect-[5/7] ${GATE_W}`}>
      {!top && <Empty />}

      {cards.length > 2 && (
        <div
          aria-hidden
          className={`absolute inset-0 -translate-y-[1.2cqw] translate-x-[1.2cqw] border bg-muted ${ROUNDED}`}
        />
      )}

      {cards.length > 1 && (
        <div
          aria-hidden
          className={`absolute inset-0 -translate-y-[0.6cqw] translate-x-[0.6cqw] border bg-muted/80 ${ROUNDED}`}
        />
      )}

      {top && (
        <div className="absolute inset-0">
          {top.faceUp ? <Face sc={top} onCardClick={onCardClick} /> : <CardBack />}
        </div>
      )}

      {cards.length > 1 && (
        <span className="absolute -bottom-[1cqw] -right-[1cqw] z-10 rounded-full bg-primary px-[1.4cqw] text-[max(9px,2cqw)] font-bold text-primary-foreground">
          {cards.length}
        </span>
      )}
    </div>
  )
}

function SetSlot({ cards }: { cards: SandboxCard[] }) {
  return (
    <div className={`aspect-[5/7] ${SET_W}`}>{cards.length > 0 ? <CardBack /> : <Empty />}</div>
  )
}

function PileSlot({
  label,
  cards,
  faceUp = false,
  onCardClick,
}: {
  label: string
  cards: SandboxCard[]
  faceUp?: boolean
  onCardClick?: CardClick
}) {
  const top = cards[0]

  return (
    <div className="flex flex-col items-center gap-[0.6cqw]">
      <div className={`relative aspect-[5/7] ${PILE_W}`}>
        {!top ? (
          <Empty />
        ) : faceUp ? (
          <Face sc={top} onCardClick={onCardClick} />
        ) : (
          <CardBack />
        )}

        {cards.length > 0 && (
          <span className="absolute -bottom-[1cqw] -right-[1cqw] z-10 rounded-full bg-primary px-[1.4cqw] text-[max(9px,2cqw)] font-bold text-primary-foreground">
            {cards.length}
          </span>
        )}
      </div>

      <span className={`${SMALL_TEXT} text-muted-foreground`}>{label}</span>
    </div>
  )
}

function Health({ label, value }: { label: string; value: number }) {
  return (
    <span
      className={`rounded-full border bg-background px-[2cqw] py-[0.5cqw] font-semibold ${SMALL_TEXT}`}
    >
      {label} <span aria-hidden>♥</span> {value}
    </span>
  )
}

function GateRow({
  state,
  seat,
  onCardClick,
}: {
  state: SandboxState
  seat: SeatId
  onCardClick?: CardClick
}) {
  return (
    <div className="flex justify-center gap-[5cqw]">
      {SLOTS.map((slot) => (
        <GateSlot
          key={slot}
          cards={state.zones[gateZone(seat, slot)]}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  )
}

function SetRow({ state, seat }: { state: SandboxState; seat: SeatId }) {
  return (
    <div className="flex justify-center gap-[10cqw]">
      {SLOTS.map((slot) => (
        <SetSlot key={slot} cards={state.zones[setZone(seat, slot)]} />
      ))}
    </div>
  )
}

/**
 * A read-only picture of a match, from Player 1's side of the table.
 * Face-up cards can be clicked to inspect them.
 */
export function MatchPreview({
  state,
  onCardClick,
}: {
  state: SandboxState
  onCardClick?: CardClick
}) {
  const hand = state.zones[handZone("P1")]
  const foeHand = state.zones[handZone("P2")].length

  return (
    <div className="@container w-full">
      <div className="flex flex-col items-center gap-[1.5cqw] rounded-2xl border bg-card p-[3cqw] shadow-sm">
        <span className={`${SMALL_TEXT} text-muted-foreground`}>
          Opponent · {foeHand} cards in hand
        </span>

        <SetRow state={state} seat="P2" />
        <GateRow state={state} seat="P2" onCardClick={onCardClick} />

        <div className="flex w-full items-center justify-between px-[4cqw]">
          <PileSlot label="Gap" cards={state.zones.gap} faceUp onCardClick={onCardClick} />

          <div className="flex flex-col items-center gap-[1cqw]">
            <div className="flex items-center gap-[1.5cqw]">
              <Health label="Opponent" value={state.health.P2} />
              <Health label="You" value={state.health.P1} />
            </div>

            <span className={`${SMALL_TEXT} text-muted-foreground`}>
              Turn {state.turn} ·{" "}
              {state.activeSeat === "P1" ? "Your turn" : "Opponent’s turn"}
            </span>
          </div>

          <PileSlot label="Public pile" cards={state.zones.public} />
        </div>

        <GateRow state={state} seat="P1" onCardClick={onCardClick} />
        <SetRow state={state} seat="P1" />

        <div className="flex justify-center pt-[1cqw]">
          {hand.map((sc, index) => (
            <div
              key={sc.id}
              className={`aspect-[5/7] shrink-0 ${HAND_W} ${index > 0 ? "-ml-[2cqw]" : ""}`}
            >
              <Face sc={sc} onCardClick={onCardClick} />
            </div>
          ))}
        </div>

        <span className={`${SMALL_TEXT} text-muted-foreground`}>Your hand</span>
      </div>
    </div>
  )
}
