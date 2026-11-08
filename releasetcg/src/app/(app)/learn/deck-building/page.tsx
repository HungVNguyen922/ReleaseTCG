// NOTE: These rules describe a 20-card Main Deck plus a 6-card Extra Deck with no Leaders.
// The deck builder (deckUtils.ts, buildPlaceholderDeck.ts) and the README currently use 15 / 5
// and a Leader slot. Update those if this page is the intended rule set.

import { Callout } from "../components/Callout";
import { LessonLayout } from "../components/LessonLayout";
import { Bullets, InlineLink, Section, Steps } from "../components/Prose";
import { SimpleTable } from "../components/SimpleTable";

export const metadata = {
  title: "Learn: Building a Deck",
};

export default function DeckBuildingPage() {
  return (
    <LessonLayout slug="deck-building">
      <p>
        A deck is 20 cards. The twist is that your cards get shuffled together
        with your opponent’s, so a good deck isn’t just a pile of strong cards.
        It’s a set of cards that work well together <em>and</em> still work when
        you also draw cards you didn’t pick.
      </p>

      <Section title="The rules of deck building">
        <SimpleTable
          headers={["Rule", "Detail"]}
          rows={[
            ["Deck size", "20 cards: 15 in your Main Deck and 5 in your Extra Deck."],
            ["Copies", "At most 2 copies of any card."],
            [
              "One-color and four-color cards",
              "At most 1 copy of any card with exactly 1 color or exactly 4 colors.",
            ],
            [
              "The Extra Deck",
              "Drawn from by Milling, and also your side deck: between games you can swap cards between your Main and Extra Decks.",
            ],
          ]}
        />
      </Section>

      <Section title="Remember: the pile is shared">
        <p>
          Only your opening hand comes entirely from your own deck. After that,
          about half of the Public Pile is yours and half is your opponent’s.
          Your Extra Deck is the one place you’re guaranteed to find your own
          cards, so choose it with care.
        </p>
      </Section>

      <Section title="A simple way to build">
        <Steps
          items={[
            <>
              <strong>Pick one or two colors to focus on.</strong> A deck built
              around a pair of colors gives you cards that share 2 or more colors
              with each other, which is exactly what PseudoPures and combos need.
              A random hand has a combo starter about half the time, while a
              focused two-color deck almost always does.
            </>,
            <>
              <strong>Choose how you want to win.</strong> Each color leans
              toward Knockout, Lockout or Deckout. Pick colors that pull in the
              same direction (see{" "}
              <InlineLink href="/learn/colors">The Nine Colors</InlineLink>).
            </>,
            <>
              <strong>Mix your Bulks.</strong> Include some Bulk 3 cards, which
              are the most common Parry, along with a few Bulk 1 and 5 cards that
              are hard for your opponent to answer.
            </>,
            <>
              <strong>Plan your Extra Deck.</strong> Fill it with cards you want
              guaranteed access to when you play 3 or more cards in a turn, and
              cards you might want to swap in against particular opponents.
            </>,
          ]}
        />
        <Callout variant="tip" title="Don’t forget defense">
          <p>
            Even an aggressive deck needs answers. Cards you can Parry with,
            plus some Block, Armor or healing, keep you in the game long enough
            to finish.
          </p>
        </Callout>
      </Section>

      <Section title="Try it out">
        <Bullets
          items={[
            <>
              Open the <InlineLink href="/deckbuilder">Deck Builder</InlineLink>{" "}
              to start a new deck.
            </>,
            <>
              Browse <InlineLink href="/community">Community Decks</InlineLink>{" "}
              for ideas and inspiration.
            </>,
            <>
              Look through the <InlineLink href="/gallery">Gallery</InlineLink>{" "}
              to filter every card by color.
            </>,
          ]}
        />
      </Section>
    </LessonLayout>
  );
}
