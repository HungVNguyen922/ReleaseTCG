import { Callout } from "../components/Callout";
import { LessonLayout } from "../components/LessonLayout";
import { PhaseTimeline } from "../components/PhaseTimeline";
import { Bullets, InlineLink, Section } from "../components/Prose";

export const metadata = {
  title: "Learn: Game Phases",
};

export default function PhasesPage() {
  return (
    <LessonLayout slug="phases">
      <p>
        Every turn follows the same four phases, in the same order. Most of the
        interesting decisions happen in the Action Phase, which has its own
        small sequence inside it.
      </p>

      <Section title="A turn at a glance">
        <PhaseTimeline />
      </Section>

      <Section title="Instant Phase">
        <p>
          A short window at the start of your turn. If you hold cards with quick
          actions (such as IP React cards), this is when you can play them.
          Most turns, you’ll simply move on.
        </p>
      </Section>

      <Section title="Action Phase">
        <p>
          This is where you make your <strong>Play</strong> for the turn, or
          choose to Pass. It runs through four steps:
        </p>
        <Bullets
          items={[
            <>
              <strong>Play:</strong> put cards onto a Gate. See{" "}
              <InlineLink href="/learn/plays">Playing Cards</InlineLink>.
            </>,
            <>
              <strong>Response:</strong> you get the first chance to respond
              with Reactions. Then your opponent can respond with Reactions or{" "}
              <InlineLink href="/learn/parries">Parries</InlineLink>, and it goes
              back and forth until nobody wants to play anything else.
            </>,
            <>
              <strong>Effect:</strong> the played cards’ effects resolve from top
              to bottom.
            </>,
            <>
              <strong>Attack:</strong> check the top of the Gate you played on
              for a Pair or Straight and deal damage. See{" "}
              <InlineLink href="/learn/attacks">Attacks and Damage</InlineLink>.
            </>,
          ]}
        />
      </Section>

      <Section title="Fill Phase">
        <Bullets
          items={[
            <>
              <strong>Fill:</strong> draw until you have 4 cards in hand. Each
              card you Loaded this turn lowers that target by 1.
            </>,
            <>
              <strong>Mill:</strong> if you played 3 or more cards this turn,
              draw 1 extra card from either your Extra Deck or any draw pile.
              Cards that were Parried, and cards played as Parries, count toward
              the 3.
            </>,
            <>
              <strong>Max:</strong> if you hold more than 8 cards, send cards
              from your hand to the Gap until you’re down to 8.
            </>,
          ]}
        />
      </Section>

      <Section title="End Phase">
        <p>Your turn ends, and play passes to the next player.</p>
        <Callout variant="tip" title="Why the Fill Phase matters">
          <p>
            Playing more cards in a turn means drawing more cards afterward, and
            playing 3 or more earns you a bonus draw. Big turns refill your hand
            faster, which is one reason combos are so powerful.
          </p>
        </Callout>
      </Section>
    </LessonLayout>
  );
}
