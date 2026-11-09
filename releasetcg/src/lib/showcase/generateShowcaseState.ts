import type { PlayableCard } from "@/types/cards"

import {
  SEATS,
  SLOTS,
  createSandboxState,
  drawCards,
  endTurn,
  gateZone,
  handZone,
  moveCards,
  otherSeat,
  setHealth,
  setZone,
  shuffleCards,
  togglePass,
  type Rng,
  type SandboxCard,
  type SandboxDeckInput,
  type SandboxState,
  type SeatId,
  type ZoneKey,
} from "@/lib/sandbox"

import { mulberry32 } from "./seededRng"

const MAIN_SIZE = 20
const EXTRA_SIZE = 6
const HAND_SIZE = 4
const MAX_HAND = 8

export interface ShowcaseOptions {
  /** How many turns to play out. Default: a random 4 to 9. */
  turns?: number

  /** Chance a defender with a matching Bulk Parries. Default 0.3. */
  parryChance?: number
}

function sharedColors(a: PlayableCard, b: PlayableCard) {
  return a.colors.filter((color) => b.colors.includes(color)).length
}

function copyLimit(card: PlayableCard) {
  return card.colors.length === 1 || card.colors.length === 4 ? 1 : 2
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)]
}

function pickWeighted<T>(
  items: readonly T[],
  weight: (item: T) => number,
  rng: Rng
): T {
  const weights = items.map(weight)

  let roll = rng() * weights.reduce((sum, w) => sum + w, 0)

  for (let i = 0; i < items.length; i++) {
    roll -= weights[i]

    if (roll <= 0) return items[i]
  }

  return items[items.length - 1]
}

/**
 * A believable deck: two focus colors, up to 2 copies of a card
 * (1 for one-color and four-color cards), 20 main + 6 extra.
 */
function buildShowcaseDeck(pool: readonly PlayableCard[], rng: Rng): SandboxDeckInput {
  const colors = [...new Set(pool.flatMap((card) => card.colors))]
  const focus = shuffleCards(colors, rng).slice(0, 2)

  const ranked = pool
    .map((card) => ({
      card,
      score: card.colors.filter((color) => focus.includes(color)).length + rng() * 0.9,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.card)

  const main: PlayableCard[] = []
  const copies = new Map<string, number>()

  const add = (card: PlayableCard) => {
    main.push(card)
    copies.set(card.id, (copies.get(card.id) ?? 0) + 1)
  }

  for (const card of ranked) {
    if (main.length >= MAIN_SIZE) break

    const wanted = copyLimit(card) === 2 && rng() < 0.55 ? 2 : 1

    for (let i = 0; i < wanted && main.length < MAIN_SIZE; i++) add(card)
  }

  // Top up with second copies, then (only for tiny card pools) with anything.
  for (const card of ranked) {
    if (main.length >= MAIN_SIZE) break

    if ((copies.get(card.id) ?? 0) < copyLimit(card)) add(card)
  }

  for (let i = 0; main.length < MAIN_SIZE && ranked.length > 0; i++) {
    add(ranked[i % ranked.length])
  }

  const extraPool = shuffleCards(
    ranked.filter((card) => !copies.has(card.id)),
    rng
  )

  const extraDeck = extraPool.slice(0, EXTRA_SIZE)

  for (let i = 0; extraDeck.length < EXTRA_SIZE && ranked.length > 0; i++) {
    extraDeck.push(ranked[i % ranked.length])
  }

  return { mainDeck: main, extraDeck }
}

function allGateZones(): ZoneKey[] {
  return SEATS.flatMap((seat) => SLOTS.map((slot) => gateZone(seat, slot)))
}

interface Plan {
  zone: ZoneKey
  cards: SandboxCard[]
}

/**
 * Picks a Play the way the rules allow it:
 * - Burn: one card that shares a color with a Gate's top card.
 * - PseudoPure (two cards sharing 2+ colors) played onto a matching Gate.
 * - Construct: a PseudoPure played into an empty Gate Zone.
 * A Pure or PseudoPure can then be Chained with more cards that each
 * share a color with the card before.
 */
function planPlay(state: SandboxState, seat: SeatId, rng: Rng): Plan | null {
  const hand = state.zones[handZone(seat)]

  if (hand.length === 0) return null

  const gates = allGateZones()
  const occupied = gates.filter((zone) => state.zones[zone].length > 0)
  const empty = gates.filter((zone) => state.zones[zone].length === 0)

  const singles: Plan[] = []
  const combos: Plan[] = []
  const constructs: Plan[] = []

  for (const card of hand) {
    for (const zone of occupied) {
      if (sharedColors(card.card, state.zones[zone][0].card) >= 1) {
        singles.push({ zone, cards: [card] })
      }
    }
  }

  for (let i = 0; i < hand.length; i++) {
    for (let j = i + 1; j < hand.length; j++) {
      const a = hand[i]
      const b = hand[j]

      if (sharedColors(a.card, b.card) < 2) continue

      for (const zone of occupied) {
        const top = state.zones[zone][0].card

        if (sharedColors(a.card, top) >= 1) combos.push({ zone, cards: [a, b] })
        if (sharedColors(b.card, top) >= 1) combos.push({ zone, cards: [b, a] })
      }

      for (const zone of empty) {
        constructs.push({ zone, cards: rng() < 0.5 ? [a, b] : [b, a] })
      }
    }
  }

  // Players spread out across the board instead of stacking one Gate forever:
  // shorter stacks are much more likely to be chosen.
  const byHeight = (candidate: Plan) =>
    1 / (1 + state.zones[candidate.zone].length) ** 2

  let plan: Plan | undefined

  if (constructs.length > 0 && rng() < 0.6) {
    plan = pickWeighted(constructs, byHeight, rng)
  } else if (combos.length > 0 && rng() < 0.55) {
    plan = pickWeighted(combos, byHeight, rng)
  } else if (singles.length > 0) {
    plan = pickWeighted(singles, byHeight, rng)
  } else if (combos.length > 0) {
    plan = pickWeighted(combos, byHeight, rng)
  } else if (constructs.length > 0) {
    plan = pickWeighted(constructs, byHeight, rng)
  }

  if (!plan) return null

  const cards = [...plan.cards]
  const startsChain =
    cards.length === 2 || (cards.length === 1 && cards[0].card.colors.length === 1)

  if (startsChain) {
    while (cards.length < 3 && rng() < 0.45) {
      const last = cards[cards.length - 1]

      const options = hand.filter(
        (candidate) =>
          !cards.includes(candidate) &&
          sharedColors(candidate.card, last.card) >= 1
      )

      if (options.length === 0) break

      cards.push(pick(options, rng))
    }
  }

  return { zone: plan.zone, cards }
}

/** Pair: top two share a Power. Straight: top three in a row, either direction. */
function attackDamage(state: SandboxState, zone: ZoneKey): number {
  const powers = state.zones[zone].slice(0, 3).map((sc) => sc.card.power)

  if (powers.length >= 2 && powers[0] === powers[1]) return powers[0]

  if (powers.length >= 3) {
    const [a, b, c] = powers

    if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1)) return b
  }

  return 0
}

function playRandomTurn(
  start: SandboxState,
  rng: Rng,
  parryChance: number
): SandboxState {
  let state = start

  const seat = state.activeSeat
  const foe = otherSeat(seat)

  let played = 0
  let loaded = 0

  const plan = planPlay(state, seat, rng)

  if (plan) {
    for (const sc of plan.cards) {
      state = moveCards(state, [sc.id], plan.zone, {
        position: "top",
        faceUp: true,
        as: "none",
      })
    }

    played = plan.cards.length

    const top = state.zones[plan.zone][0].card

    const answers = state.zones[handZone(foe)].filter(
      (sc) => sc.card.bulk === top.bulk
    )

    let parried = false

    if (answers.length > 0 && rng() < parryChance) {
      // Parries are played onto the Gate and stay there.
      state = moveCards(state, [pick(answers, rng).id], plan.zone, {
        position: "top",
        faceUp: true,
        as: "none",
      })

      parried = true
      played += 1
    }

    const damage = parried ? 0 : attackDamage(state, plan.zone)

    if (damage > 0) {
      // A showcase match never ends: nobody drops below 1 health.
      state = setHealth(state, foe, Math.max(1, state.health[foe] - damage))
    }
  } else if (!state.passUsed[seat]) {
    state = togglePass(state, seat)
    state = drawCards(state, seat, 1)
  }

  // Sometimes tuck a card face down in a Set Zone (each Load lowers the refill).
  for (let i = 0; i < 2; i++) {
    const hand = state.zones[handZone(seat)]

    if (hand.length < 3 || rng() >= 0.28 / (i + 1)) continue

    const free = SLOTS.filter((slot) => state.zones[setZone(seat, slot)].length === 0)

    if (free.length === 0) break

    state = moveCards(state, [pick(hand, rng).id], setZone(seat, pick(free, rng)), {
      faceUp: false,
      as: "none",
    })

    loaded += 1
  }

  const handNow = state.zones[handZone(seat)].length
  const target = Math.max(0, HAND_SIZE - loaded)
  const mill = played >= 3 ? 1 : 0

  const need = Math.min(Math.max(0, target - handNow) + mill, MAX_HAND - handNow)

  if (need > 0) state = drawCards(state, seat, need)

  return endTurn(state)
}

/**
 * Builds a random mid-game position to show off on the home page.
 *
 * Two random decks are shuffled together and a handful of turns are played
 * with random but rules-following plays, so the board has real color chains,
 * a few Parries, face-down Set cards and some damage on the scoreboard.
 *
 * The same seed always gives the same position.
 */
export function generateShowcaseState(
  cards: readonly PlayableCard[],
  seed: number,
  options: ShowcaseOptions = {}
): SandboxState | null {
  if (cards.length < 12) return null

  const rng = mulberry32(seed)

  let state = createSandboxState(
    {
      P1: buildShowcaseDeck(cards, rng),
      P2: buildShowcaseDeck(cards, rng),
    },
    {
      rng,
      startingHandSize: HAND_SIZE,
      firstSeat: rng() < 0.5 ? "P1" : "P2",
    }
  )

  const turns = options.turns ?? 4 + Math.floor(rng() * 6)
  const parryChance = options.parryChance ?? 0.3

  for (let i = 0; i < turns; i++) {
    state = playRandomTurn(state, rng, parryChance)
  }

  // A few cards the effects sent to the Gap.
  const gapCount = Math.floor(rng() * 4)

  if (gapCount > 0) {
    const ids = state.zones.public.slice(0, gapCount).map((sc) => sc.id)

    state = moveCards(state, ids, "gap", { faceUp: true, as: "none" })
  }

  return { ...state, log: [], chain: { plays: [], parries: [] } }
}
