import { PaletteChips } from "@/app/(app)/components/cards/PaletteChips";

import { Callout } from "../components/Callout";
import { ExampleCard } from "../components/ExampleCard";
import { LessonLayout } from "../components/LessonLayout";
import { Bullets, InlineLink, Section } from "../components/Prose";
import { SimpleTable } from "../components/SimpleTable";

export const metadata = {
  title: "Learn: Understanding a Card",
};

const COLOR_NAMES = [
  "Red",
  "Orange",
  "Yellow",
  "Green",
  "Cyan",
  "Blue",
  "Violet",
  "Magenta",
  "Pink",
];

export default function CardsPage() {
  return (
    <LessonLayout slug="cards">
      <p>
        Every card tells you three things at a glance: where it can be played
        (its colors), how hard it hits and how hard it is to stop (Power and
        Bulk), and what it does (its text).
      </p>

      <Section title="Anatomy of a card">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          <ExampleCard
            name="Example Card"
            power={3}
            bulk={2}
            palette={["Red", "Blue"]}
            trait="changes how this card can be played"
            effects={[
              "triggers when the card is played",
              "triggers after Effect 1",
            ]}
          />
          <Bullets
            items={[
              <>
                <strong>Top left:</strong> two circles. The{" "}
                <strong>dark circle is Power</strong> and the{" "}
                <strong>light circle is Bulk</strong>.
              </>,
              <>
                <strong>Top middle:</strong> the card’s name.
              </>,
              <>
                <strong>Top right:</strong> the color palette, with up to four
                colors.
              </>,
              <>
                <strong>Middle text:</strong> a Trait, then Effect 1 and Effect
                2.
              </>,
            ]}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          This is an illustrative card, not one from the card pool.
        </p>
      </Section>

      <Section title="Power and Bulk">
        <p>
          <strong>Power</strong> is your offense. It’s the number used to build
          Pairs and Straights, which is how you deal damage (see{" "}
          <InlineLink href="/learn/attacks">Attacks and Damage</InlineLink>).
        </p>
        <p>
          <strong>Bulk</strong> is your defense. When your opponent makes a
          Play, you can stop it by playing a card from your hand with{" "}
          <em>equal Bulk</em> (see{" "}
          <InlineLink href="/learn/parries">Parries and Responses</InlineLink>).
        </p>
        <Callout variant="tip" title="A rough trade-off">
          <p>
            Most cards have a Power and Bulk that add up to somewhere around 5
            to 7. A hard-hitting card usually has low Bulk, and a sturdy card
            usually has low Power, so the stats help you tell what a card is
            for.
          </p>
        </Callout>
      </Section>

      <Section title="Colors">
        <p>
          There are nine colors, and each card has between one and four of them.
          Colors decide <strong>where a card can be played</strong>: to play a
          card on top of another, they usually need to share at least one color.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COLOR_NAMES.map((name) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm"
            >
              <PaletteChips palette={[name]} size="md" />
              <span>{name}</span>
            </div>
          ))}
        </div>
        <p>
          Cards with <strong>one color</strong> are called <em>Pures</em> and
          are the key to multi-card plays. Cards with one or four colors are
          also limited to a single copy per deck. Each color has its own style
          of play, which you can explore in{" "}
          <InlineLink href="/learn/colors">The Nine Colors</InlineLink>.
        </p>
      </Section>

      <Section title="Traits">
        <p>
          A <strong>Trait</strong> changes how a card can be played. Some common
          ones:
        </p>
        <SimpleTable
          headers={["Trait", "What it means"]}
          rows={[
            [
              "React / Opp React / IP React",
              "You can play this card in response to any Play, to an opponent’s Play, or during an Instant Phase.",
            ],
            ["Float", "You may play this card into an empty Gate Zone."],
            [
              "Double",
              "You get another Play this turn, even if this one is Parried.",
            ],
            [
              "Totem",
              "Stays on the board with health equal to its Bulk, and goes to the Gap when it’s knocked out.",
            ],
            ["BLK 2, 4", "This card counts as both Bulk 2 and Bulk 4."],
          ]}
        />
      </Section>

      <Section title="Effects">
        <p>
          A card’s effects happen <strong>top to bottom</strong>: Effect 1
          resolves, then Effect 2. They trigger when the card is played unless
          the text says otherwise (for example, “Faceup” effects work while the
          card is face up). If an effect triggers another effect, the new one
          resolves first.
        </p>
        <p>
          A card only fully resolves its effects while it’s sitting on a Gate.
          Unfamiliar words in the text are explained in the glossary under{" "}
          <InlineLink href="/learn/additional-rules">
            Additional Rules
          </InlineLink>
          .
        </p>
        <Callout variant="tip" title="Read a card in four steps">
          <p>
            1) Colors: where can it go? 2) Bulk: could it Parry? 3) Power: does
            it help build an attack? 4) Text: what happens when it lands?
          </p>
        </Callout>
      </Section>
    </LessonLayout>
  );
}
