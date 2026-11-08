import { PaletteChips } from "@/app/(app)/components/cards/PaletteChips";

import { Callout } from "../components/Callout";
import { ColorPath, MatchExample } from "../components/Examples";
import { LessonLayout } from "../components/LessonLayout";
import { Bullets, InlineLink, Section, SubSection } from "../components/Prose";
import { SimpleTable } from "../components/SimpleTable";

export const metadata = {
  title: "Learn: Playing Cards",
};

export default function PlaysPage() {
  return (
    <LessonLayout slug="plays">
      <p>
        On your turn you make one <strong>Play</strong>, or Pass. A Play is
        either a single card or a multi-card combo. Almost every Play comes down
        to one idea: matching colors.
      </p>

      <Section title="The color-matching rule">
        <p>
          To play a card on a Gate, it needs to share{" "}
          <strong>at least one color</strong> with the card on top of that Gate.
          Remember, you can play on any Gate, including your opponent’s.
        </p>
        <MatchExample
          top={["Red", "Blue"]}
          played={["Blue", "Green"]}
          works
          note="They share Blue."
        />
        <MatchExample
          top={["Red", "Blue"]}
          played={["Yellow"]}
          works={false}
          note="No colors in common."
        />
      </Section>

      <Section title="Single-card Plays">
        <SubSection title="Burn">
          <p>
            The everyday Play. Put 1 card from your hand face up onto an
            existing Gate. It must share at least 1 color with the top card of
            that Gate.
          </p>
        </SubSection>

        <SubSection title="Liminal">
          <p>
            Merge two neighboring Gates into one. It works when{" "}
            <strong>adjacent Gates share 2 or more colors</strong> with each
            other. Play 1 card that shares at least 1 color with them, and the
            Gates combine into a single Gate. You choose which of the two Gate
            Zones the merged Gate ends up in.
          </p>
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Left Gate top</span>
              <PaletteChips palette={["Red", "Blue"]} size="md" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Right Gate top</span>
              <PaletteChips palette={["Red", "Blue", "Green"]} size="md" />
            </div>
            <span className="text-muted-foreground">
              They share Red and Blue (2 colors), so the Gates are eligible to
              merge.
            </span>
          </div>
        </SubSection>

        <SubSection title="Load">
          <p>
            Place a card from your hand <strong>face down</strong> into one of
            your Set Zones (one card per zone). It’s a way to save a card for
            later and hide it from your opponent.
          </p>
          <Bullets
            items={[
              "Loading doesn’t end your turn, and you can do it several times.",
              "Each card you Load this turn lowers your Fill size by 1, so you’ll refill to fewer cards.",
              "Loaded cards can’t be used to Parry.",
              "Loading does not count as a Play for Lockout.",
            ]}
          />
        </SubSection>
      </Section>

      <Section title="Pass">
        <p>
          If you’d rather not Play (or can’t), you can Pass. You go straight to
          the Fill Phase and <strong>draw 1 additional card</strong> from any
          draw pile.
        </p>
        <Callout variant="warning" title="You only get one Pass per game">
          <p>
            If you have no plays available and no Pass left, you lose by
            Lockout. Think twice before spending your Pass early.
          </p>
        </Callout>
      </Section>

      <Section title="Multi-card Plays (Combos)">
        <p>
          Combos let you play several cards in one turn, which triggers all their
          effects at once. They’re built from two special building blocks:
        </p>
        <Bullets
          items={[
            <>
              <strong>Pure:</strong> a card with exactly one color. Pures can be
              played on top of each other.
            </>,
            <>
              <strong>PseudoPure:</strong> two cards that share 2 or more colors.
            </>,
          ]}
        />
        <p>
          If you hold a Pure or a PseudoPure, you unlock the four combos below.
        </p>

        <SimpleTable
          headers={["Combo", "How it works"]}
          rows={[
            [
              "Chain",
              "Start with a Pure or PseudoPure, then keep stacking cards on top, as long as each shares at least 1 color with the card before it.",
            ],
            [
              "Construct",
              "With any 2 Pures or PseudoPures, play both into any empty Gate Zone.",
            ],
            [
              "Bound",
              "With a PseudoPure, play any number of cards between its two cards, as long as they all share a color that the PseudoPure also shares.",
            ],
            [
              "Split",
              "With a PseudoPure, play each of its cards into a different Gate Zone at the same time.",
            ],
          ]}
        />

        <SubSection title="A Chain, step by step">
          <ColorPath
            steps={[["Red"], ["Red", "Blue"], ["Blue", "Green"], ["Green"]]}
          />
          <p>
            Each card shares a color with the one before it: Red, then Red and
            Blue (shares Red), then Blue and Green (shares Blue), then Green
            (shares Green). That’s four cards in one Play.
          </p>
        </SubSection>

        <Callout variant="tip" title="Why combos are worth building toward">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Playing <strong>3 or more cards</strong> earns you a bonus draw
              (Mill).
            </li>
            <li>Every card’s effects trigger in the same turn.</li>
            <li>
              When your opponent tries to Parry a combo, they match only the{" "}
              <strong>top card’s Bulk</strong>, so end your chain on a card with
              the Bulk you want them to face.
            </li>
          </ul>
        </Callout>
      </Section>

      <Section title="Which Play should I choose?">
        <SimpleTable
          headers={["If…", "Try…"]}
          rows={[
            ["A card in your hand matches a Gate’s top color", "Burn"],
            [
              "Two neighboring Gates share 2+ colors and you want to merge them",
              "Liminal",
            ],
            ["You want to save or hide a card for later", "Load"],
            [
              "You hold a Pure or PseudoPure and cards that link by color",
              "A combo (Chain, Construct, Bound or Split)",
            ],
            ["You have no legal Play and a Pass left", "Pass"],
          ]}
        />
        <p>
          After you make your Play, your opponent gets to respond. That’s the
          subject of{" "}
          <InlineLink href="/learn/parries">Parries and Responses</InlineLink>,
          but first, see how a Play turns into damage in{" "}
          <InlineLink href="/learn/attacks">Attacks and Damage</InlineLink>.
        </p>
      </Section>
    </LessonLayout>
  );
}
