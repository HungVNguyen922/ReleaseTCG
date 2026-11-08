import { FaqItem } from "../components/FaqItem";
import { InlineLink, Section } from "../components/Prose";
import { LessonLayout } from "../components/LessonLayout";

export const metadata = {
  title: "Learn: FAQ",
};

export default function FaqPage() {
  return (
    <LessonLayout slug="faq">
      <p>
        Quick answers to common questions. Each answer points to the lesson with
        the full explanation.
      </p>

      <Section title="Playing cards">
        <div className="space-y-2">
          <FaqItem question="Can I play on my opponent’s Gates?">
            <p>
              Yes. Any player can play on any Gate. The top card of every Gate is
              shared, so think about what you leave behind. See{" "}
              <InlineLink href="/learn/board">Knowing the Board</InlineLink>.
            </p>
          </FaqItem>
          <FaqItem question="What if I can’t play any card?">
            <p>
              You Pass, which sends you to the Fill Phase with 1 extra draw. You
              get only 1 Pass per game, and if you have no plays and no Pass
              left, you lose by Lockout.
            </p>
          </FaqItem>
          <FaqItem question="Does Loading count as a play?">
            <p>
              No. Loading doesn’t end your turn and doesn’t count as a Play for
              Lockout. If Loading is all you can do, you have no plays.
            </p>
          </FaqItem>
          <FaqItem question="Why is my hand smaller after I Load a card?">
            <p>
              Each card you Load this turn lowers your Fill size by 1. You still
              hold the same number of cards overall, but some are now face down
              in your Set Zones.
            </p>
          </FaqItem>
          <FaqItem question="What’s a Pure, and why do I need one?">
            <p>
              A Pure is a card with exactly one color. Pures and PseudoPures (two
              cards sharing 2 or more colors) are what unlock multi-card combos.
              See <InlineLink href="/learn/plays">Playing Cards</InlineLink>.
            </p>
          </FaqItem>
          <FaqItem question="What’s the biggest hand I can hold?">
            <p>8 cards. Anything above that goes to the Gap in your Fill Phase.</p>
          </FaqItem>
          <FaqItem question="When can I draw from my Extra Deck?">
            <p>
              Normally only by Milling: if you play 3 or more cards in a turn,
              you draw 1 extra card from either your Extra Deck or any draw pile.
              Some card effects also reference it.
            </p>
          </FaqItem>
        </div>
      </Section>

      <Section title="Attacks and Parries">
        <div className="space-y-2">
          <FaqItem question="How much damage can an attack do?">
            <p>
              A Pair deals damage equal to its Power, and a Straight deals the
              median value. In practice that’s usually 2 to 3, and a Pair can’t
              be worth more than 5. See{" "}
              <InlineLink href="/learn/attacks">Attacks and Damage</InlineLink>.
            </p>
          </FaqItem>
          <FaqItem question="Do Parries need to match colors?">
            <p>
              No. A Parry only needs the same Bulk as the Play it answers.
            </p>
          </FaqItem>
          <FaqItem question="How do I Parry a multi-card Play?">
            <p>You match the Bulk of the Play’s top card only.</p>
          </FaqItem>
          <FaqItem question="Can a Parry be Parried?">
            <p>
              Yes. The two players can trade Parries back and forth, and
              whoever makes the last one wins the exchange. See{" "}
              <InlineLink href="/learn/parries">Parries and Responses</InlineLink>.
            </p>
          </FaqItem>
          <FaqItem question="What happens to cards that were Parried?">
            <p>
              They stay on the board, but their effects and attack are canceled.
              They still count as played for Mill and Deckout. If the original
              Play wins the exchange, it resolves as though the Parries weren’t
              there.
            </p>
          </FaqItem>
          <FaqItem question="Can I Parry with a card in my Set Zone?">
            <p>No. Parries must come from your hand.</p>
          </FaqItem>
        </div>
      </Section>

      <Section title="Winning">
        <div className="space-y-2">
          <FaqItem question="How exactly do I win by Deckout?">
            <p>
              Wait until the Public Pile has 0 cards, then play every card in
              your Hand and Set Zones. Your Extra Deck doesn’t count, and
              Parrying can’t stop you.
            </p>
          </FaqItem>
          <FaqItem question="What if both players would lose at the same time?">
            <p>
              It can’t happen. Effects resolve one at a time, so one player
              always reaches the win condition first.
            </p>
          </FaqItem>
          <FaqItem question="Which win condition should I aim for?">
            <p>
              Knockout tends to be fastest, Lockout takes setup, and Deckout is
              the long-game finish. You don’t have to decide up front. See{" "}
              <InlineLink href="/learn/how-to-win">How to Win</InlineLink>.
            </p>
          </FaqItem>
        </div>
      </Section>

      <Section title="Setup and decks">
        <div className="space-y-2">
          <FaqItem question="Who goes first?">
            <p>
              The player whose card is on top of the Public Pile after setup.
            </p>
          </FaqItem>
          <FaqItem question="What’s a Starter?">
            <p>
              The card you place face down in your center Gate Zone during
              setup.
            </p>
          </FaqItem>
          <FaqItem question="How big is a deck, and how many copies can I run?">
            <p>
              26 cards: 20 Main and 6 Extra. At most 2 copies of a card, or 1
              copy if the card has exactly 1 or 4 colors. See{" "}
              <InlineLink href="/learn/deck-building">Building a Deck</InlineLink>.
            </p>
          </FaqItem>
          <FaqItem question="Can more than two people play?">
            <p>
              The game is designed for two players. Attacks are aimed at a
              chosen target, who becomes the defending player, but larger games
              haven’t been fully tested.
            </p>
          </FaqItem>
        </div>
      </Section>
    </LessonLayout>
  );
}
