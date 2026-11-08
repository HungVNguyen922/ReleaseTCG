import { Callout } from "../components/Callout";
import { LessonLayout } from "../components/LessonLayout";
import { Bullets, InlineLink, Section } from "../components/Prose";
import { SimpleTable } from "../components/SimpleTable";

export const metadata = {
  title: "Learn: How to Win",
};

export default function HowToWinPage() {
  return (
    <LessonLayout slug="how-to-win">
      <p>
        This is a head-to-head card game, built for two players, where you and
        your opponent draw from <strong>one shared pile</strong>. Before any
        rules, it helps to know what you’re aiming for. There are three
        different ways to win, and any of them can happen in any game.
      </p>

      <Section title="Three ways to win">
        <SimpleTable
          headers={["Win condition", "How you do it", "What it usually looks like"]}
          rows={[
            [
              "Knockout",
              "Reduce your opponent’s health from 10 to 0.",
              "Fast, aggressive games.",
            ],
            [
              "Lockout",
              "Leave your opponent with no plays on their turn and no Pass left.",
              "Mid-game finishes that need some setup, like draining their hand or blocking their colors.",
            ],
            [
              "Deckout",
              "Once the Public Pile is empty, play every card left in your Hand and Set Zones.",
              "Slow games that go the distance.",
            ],
          ]}
        />
        <Callout variant="note" title="Tendencies, not rules">
          <p>
            Knockout tends to win early, Lockout takes some setup, and Deckout
            is the long-game finish. But a strong turn of combos can speed any
            of them up, and a stubborn defense can drag any of them out.
          </p>
        </Callout>
      </Section>

      <Section title="Why every game feels different">
        <p>
          Each player brings their own deck, but after you draw your opening
          hand,{" "}
          <strong>both players’ remaining cards are shuffled together</strong>{" "}
          into a single draw pile called the Public Pile. From then on you draw
          from it, which means you’ll be holding your opponent’s cards as well
          as your own.
        </p>
        <p>
          That shuffle is what makes the game flexible. You can’t plan your
          whole game around the cards in your deck, because you never know
          exactly what you’ll draw. Instead you read your hand, spot the
          combinations, and adapt.
        </p>
      </Section>

      <Section title="What you do on a turn">
        <Bullets
          items={[
            <>
              <strong>Play cards</strong> onto shared Gates by matching colors.
            </>,
            <>
              <strong>Build Pairs and Straights</strong> from the Power of the
              cards on top of a Gate to deal damage.
            </>,
            <>
              <strong>Parry</strong> your opponent’s plays by answering with a
              card of equal Bulk.
            </>,
          ]}
        />
        <Callout variant="tip" title="You don’t need to pick a plan on turn one">
          <p>
            Most players find their route to victory from the cards they
            actually draw. Keep an eye on all three win conditions, and go for
            whichever one your hand and the board make easiest.
          </p>
        </Callout>
      </Section>

      <Section title="Where to go next">
        <p>
          Next, learn to read a card in{" "}
          <InlineLink href="/learn/cards">Understanding a Card</InlineLink>.
          Once you know the cards and the board, the rest of the lessons walk
          through a turn from start to finish.
        </p>
      </Section>
    </LessonLayout>
  );
}
