import { BoardDiagram } from "../components/BoardDiagram";
import { Callout } from "../components/Callout";
import { LessonLayout } from "../components/LessonLayout";
import { InlineLink, Section } from "../components/Prose";
import { SimpleTable } from "../components/SimpleTable";

export const metadata = {
  title: "Learn: Knowing the Board",
};

export default function BoardPage() {
  return (
    <LessonLayout slug="board">
      <p>
        The board is small on purpose. There are six Gate Zones where the action
        happens, a few piles in the middle, and your own hand and reserves
        around the edges.
      </p>

      <Section title="The layout">
        <BoardDiagram />
      </Section>

      <Section title="Gates are shared">
        <p>
          The six <strong>Gate Zones</strong> sit in a grid, two rows of three.
          Each player has a row of three on their side (your Home Row). A stack
          of cards in a Gate Zone is called a <strong>Gate</strong>, and the{" "}
          <strong>top card</strong> of a Gate is the one that matters: it
          decides which colors can be played next, and its Power is used to
          build attacks.
        </p>
        <Callout variant="warning" title="Anyone can play on any Gate">
          <p>
            You’re not limited to your own row. You can play on your opponent’s
            Gates, and they can play on yours. That means the card you leave on
            top of a Gate can help your opponent just as much as it helps you.
          </p>
        </Callout>
      </Section>

      <Section title="Every zone, at a glance">
        <SimpleTable
          headers={["Zone", "What it is", "Key rule"]}
          rows={[
            [
              "Gate Zones (6)",
              "A 2×3 grid where cards are stacked to form Gates.",
              "Anyone can play on any Gate.",
            ],
            [
              "Set Zones (3 each)",
              "A face-down secondary hand, one under each column of Gate Zones.",
              "One card per zone. You can’t Parry with Set cards.",
            ],
            [
              "Public Pile",
              "The shared draw pile, made from both players’ remaining Main Decks.",
              "Normal draws come from here.",
            ],
            [
              "Gap",
              "A special discard pile used by card effects.",
              "Cards sent here are out of play.",
            ],
            [
              "Hand",
              "The cards you can play and Parry with.",
              "Maximum of 8 cards.",
            ],
            [
              "Extra Deck",
              "A 6-card reserve that is also your side deck between games.",
              "You draw from it by Milling (see Game Phases).",
            ],
            [
              "Field",
              "All Gates and Set Zones together.",
              "Card text uses this word.",
            ],
            [
              "Units",
              "All the cards that count as yours: Hand, Set Zones and Extra Deck.",
              "Also called “Controlled” in card text.",
            ],
          ]}
        />
      </Section>

      <Section title="Health">
        <p>
          Each player starts the game with <strong>10 health</strong>. If yours
          reaches 0, you lose by Knockout. Health is tracked next to your Extra
          Deck.
        </p>
      </Section>

      <Section title="Next up">
        <p>
          Now that you know where things live, see how a game begins in{" "}
          <InlineLink href="/learn/setup">Setting up a Game</InlineLink>.
        </p>
      </Section>
    </LessonLayout>
  );
}
