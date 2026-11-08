import { Callout } from "../components/Callout";
import { LessonLayout } from "../components/LessonLayout";
import { Bullets, InlineLink, Section, Steps } from "../components/Prose";
import { SimpleTable } from "../components/SimpleTable";

export const metadata = {
  title: "Learn: Parries and Responses",
};

export default function ParriesPage() {
  return (
    <LessonLayout slug="parries">
      <p>
        You don’t just sit and watch while your opponent plays. After every
        Play there’s a <strong>Response step</strong>, and the main way to
        interrupt a Play is the <strong>Parry</strong>. Parries are the
        game’s central conflict, so they’re worth understanding well.
      </p>

      <Section title="The Response step">
        <Steps
          items={[
            "After you make a Play, you get priority first to play Reactions.",
            "When you pass priority, the defending player (the player being attacked) can play Reactions or Parries.",
            "This goes back and forth until neither player can or wants to play anything else.",
          ]}
        />
      </Section>

      <Section title="What is a Parry?">
        <p>
          A <strong>Parry</strong> is a card from your hand whose{" "}
          <strong>Bulk equals the Bulk of the Play</strong> you’re answering.
          Colors don’t matter at all. A successful Parry cancels that Play’s
          effects and its attack.
        </p>
        <Bullets
          items={[
            "Parries must come from your hand. Cards in your Set Zones can’t Parry.",
            "Parrying costs you a card, so it shrinks your options on your next turn.",
            "Against a multi-card Play, you only match the Bulk of its top card.",
          ]}
        />
      </Section>

      <Section title="Parry exchanges">
        <p>
          A Parry can itself be Parried. The player who made the original Play
          can answer with another card of the same Bulk, and the two of you can
          trade back and forth. That’s a <strong>Parry exchange</strong>, and
          it decides whether the original Play happens.
        </p>
        <Callout variant="example" title="A worked example">
          <ol className="list-decimal space-y-1 pl-5">
            <li>Alex makes a Play whose top card has Bulk 3.</li>
            <li>Sam Parries with another Bulk 3 card.</li>
            <li>Alex Parries Sam’s Parry with a third Bulk 3 card.</li>
            <li>Sam has no more Bulk 3 cards and can’t answer.</li>
          </ol>
          <p>
            Alex wins the exchange, so Alex’s Play goes through as if none of the
            Parries were on the board.
          </p>
        </Callout>

        <p>The rules for who wins and what stays behind:</p>
        <Bullets
          items={[
            <>
              <strong>Whoever makes the last Parry wins.</strong> If the original
              Play wins, its effects and attack resolve normally. If it loses,
              the Play is canceled.
            </>,
            <>
              <strong>Everything stays on the board.</strong> Parried cards and
              Parry cards remain on the Gate, and they all count as cards played
              (for Mill and for Deckout).
            </>,
            <>
              <strong>Parry cards don’t add to the original Play.</strong> If the
              original Play wins, it resolves as though they weren’t there.
            </>,
          ]}
        />
        <Callout variant="note" title="Parrying can’t stop a Deckout">
          <p>
            Since Parried cards still count as played, a Parry can’t prevent
            someone from winning by Deckout.
          </p>
        </Callout>
      </Section>

      <Section title="Bulk is a bluff">
        <p>
          Because a Parry needs an exact Bulk match, the Bulk of the card you
          lead with tells you how likely it is to be stopped. In the Iridescent
          Foray set, roughly:
        </p>
        <SimpleTable
          headers={["Bulk of the Play", "Cards in the set", "Chance a 4-card hand can Parry it"]}
          rows={[
            ["1", "9", "about 38%"],
            ["2", "17", "about 62%"],
            ["3", "29", "about 84%"],
            ["4", "17", "about 62%"],
            ["5", "9", "about 38%"],
          ]}
        />
        <p className="text-xs text-muted-foreground">
          Approximate figures for a random 4-card hand. Real decks and shared
          piles will shift them.
        </p>
        <Bullets
          items={[
            <>
              <strong>Bulk 3 plays</strong> are strong but easy to answer.
            </>,
            <>
              <strong>Bulk 1 and 5 plays</strong> are the ones most likely to
              slip through, so they make good vanguards.
            </>,
            <>
              <strong>End your combos on a 1 or 5</strong> to make the whole
              Play harder to stop.
            </>,
            <>
              <strong>Hold spare copies.</strong> In a long exchange, whoever has
              more cards of that Bulk wins.
            </>,
          ]}
        />
      </Section>

      <Section title="Other ways to respond">
        <SimpleTable
          headers={["Response", "What it does"]}
          rows={[
            [
              "Reactions (React, Opp React, IP React)",
              "Cards you can play in response to a Play, as shown in their trait.",
            ],
            [
              "Disarm",
              "Negates a Play without needing to match its Bulk.",
            ],
            [
              "Block, Armor, Reflect",
              "Work on damage instead of canceling the Play itself.",
            ],
            [
              "Double",
              "Gives you another Play this turn, even if the first one is Parried.",
            ],
          ]}
        />
        <p>
          Next, learn how to put it all together in{" "}
          <InlineLink href="/learn/deck-building">Building a Deck</InlineLink>.
        </p>
      </Section>
    </LessonLayout>
  );
}
