import { Callout } from "../components/Callout";
import { LessonLayout } from "../components/LessonLayout";
import { InlineLink, Section, Steps } from "../components/Prose";

export const metadata = {
  title: "Learn: Setting up a Game",
};

export default function SetupPage() {
  return (
    <LessonLayout slug="setup">
      <p>
        Setup takes about a minute. The one unusual step is shuffling both
        players’ decks together, which is what creates the shared Public Pile.
      </p>

      <Section title="What you need">
        <p>
          A built deck of <strong>20 cards</strong>: a 15-card Main Deck and a
          5-card Extra Deck. If you haven’t built one yet, see{" "}
          <InlineLink href="/learn/deck-building">Building a Deck</InlineLink>.
        </p>
      </Section>

      <Section title="Step by step">
        <Steps
          items={[
            <>
              <strong>Set your Extra Deck aside.</strong> Keep it apart from
              your Main Deck. You won’t draw from it until later.
            </>,
            <>
              <strong>Shuffle your Main Deck and draw 5 cards.</strong>
            </>,
            <>
              <strong>Build the Public Pile.</strong> Both players shuffle their
              remaining Main Decks together into one shared draw pile.
            </>,
            <>
              <strong>Choose your Starter.</strong> Pick 1 card from your hand
              and place it <em>face down</em> in your center Gate Zone.
            </>,
            <>
              <strong>Decide who goes first.</strong> The player whose card is
              on top of the Public Pile goes first. Turns proceed clockwise.
            </>,
            <>
              <strong>Flip your Starters face up and begin.</strong>
            </>,
          ]}
        />
      </Section>

      <Section title="What to expect">
        <p>
          After placing your Starter you’ll hold 4 cards, which is the size you
          refill to each turn. In a two-player game the Public Pile starts with
          about 30 cards, and roughly half of them are your own.
        </p>
        <Callout variant="tip" title="Choosing a Starter">
          <p>
            Your Starter’s colors decide what can be played on that Gate first.
            Pick a card whose colors connect to the rest of your hand so you
            have options on your first turn.
          </p>
        </Callout>
      </Section>

      <Section title="Between games">
        <p>
          Your Extra Deck doubles as a side deck. Between games you can swap
          cards between your Main Deck and Extra Deck to adjust to what you’ve
          seen.
        </p>
      </Section>

      <Section title="Next up">
        <p>
          With the game set up, learn how a turn flows in{" "}
          <InlineLink href="/learn/phases">Game Phases</InlineLink>.
        </p>
      </Section>
    </LessonLayout>
  );
}
