import { Callout } from "../components/Callout";
import { LessonLayout } from "../components/LessonLayout";
import { Bullets, Section, SubSection } from "../components/Prose";
import { SimpleTable } from "../components/SimpleTable";

export const metadata = {
  title: "Learn: Additional Rules",
};

export default function AdditionalRulesPage() {
  return (
    <LessonLayout slug="additional-rules">
      <p>
        This page collects the smaller rules, the edge cases, and the words you’ll
        run into on card text. Skim it once, then come back whenever something
        looks unfamiliar.
      </p>

      <Section title="How things resolve">
        <Bullets
          items={[
            <>
              <strong>Gate Resolution:</strong> a card only completely resolves
              its effects while it sits on a Gate. Some effects trigger
              otherwise, but this is the norm.
            </>,
            <>
              <strong>No self targeting:</strong> a card’s targeting effects
              can’t target itself or copies of itself.
            </>,
            <>
              <strong>No ties:</strong> effects resolve one at a time down the
              chain, so two players can’t win at the same instant. The first
              player to reach 0 health wins.
            </>,
          ]}
        />
        <Callout variant="example" title="Why ties can’t happen">
          <p>
            You have 2 health and are about to take 4 damage, and your opponent
            also has 2 health. You play a Reflect that deals 2 damage to them.
            That damage resolves first, so they’re knocked out before the 4
            damage to you can resolve.
          </p>
        </Callout>
      </Section>

      <Section title="Winning, in the fine print">
        <Bullets
          items={[
            <>
              <strong>Lockout</strong> applies whenever you have no plays
              available and no Pass left. Loading a card does not count as a
              play.
            </>,
            <>
              <strong>Deckout</strong> needs the Public Pile to be empty and
              every card in your Hand and Set Zones played. Your Extra Deck
              doesn’t need to be empty.
            </>,
            <>
              <strong>Parrying can’t stop Deckout,</strong> because Parried
              cards still count as played.
            </>,
          ]}
        />
      </Section>

      <Section title="Draw piles and hand size">
        <Bullets
          items={[
            <>
              The Public Pile is a draw pile, but effects like <strong>Rend</strong>{" "}
              can create extra draw piles in empty Gate Zones. Many effects say
              “any draw pile.”
            </>,
            <>
              Your hand holds at most <strong>8 cards</strong>. Anything above
              that goes to the Gap at the end of your Fill Phase.
            </>,
            <>
              <strong>Mill</strong> and <strong>Pass</strong> both draw from any
              draw pile, and Mill can also draw from your Extra Deck.
            </>,
          ]}
        />
      </Section>

      <Section title="Health and board words">
        <SimpleTable
          headers={["Term", "Meaning"]}
          rows={[
            ["Brim", "8 to 10 health."],
            ["Wavering", "4 to 7 health."],
            ["Brink", "1 to 3 health."],
            ["Healthy", "You have more health than an opponent."],
            ["Fragile", "You have less health than an opponent."],
            ["Peak", "On the tallest Gate."],
            ["Valley", "On the shortest Gate."],
            ["Tall Gate", "A Gate with 6 or more cards."],
            ["Surrounded", "No empty Gate Zones border it."],
          ]}
        />
      </Section>

      <Section title="Glossary">
        <SubSection title="Words for groups of cards">
          <SimpleTable
            headers={["Term", "Meaning"]}
            rows={[
              ["Held", "Cards in your hand only."],
              ["Turf", "Cards in your hand or Set Zones."],
              [
                "Controlled / Units",
                "Any card in your hand, Set Zones or Extra Deck.",
              ],
              [
                "Starter",
                "The card you set as the first card in your Gate during setup.",
              ],
              [
                "Combo",
                "A Play built by combining cards or Gates: Chain, Liminal, Construct, Bound or Split.",
              ],
              [
                "Revealed",
                "Any time a card becomes known from an unknown position, such as scanning it or flipping a Loaded card face up.",
              ],
              [
                "Straight",
                "Three cards on top of a Gate forming a numerical sequence, up or down.",
              ],
            ]}
          />
        </SubSection>

        <SubSection title="Keywords on cards">
          <p className="text-sm text-muted-foreground">
            A short summary of common keywords. If a card’s own text says
            something different, the card wins.
          </p>
          <SimpleTable
            headers={["Group", "Keywords"]}
            rows={[
              [
                "Moving cards",
                <>
                  <strong>Draw</strong>; <strong>Recycle</strong> (send to the
                  bottom of a draw pile); <strong>Refresh / Shove</strong> (send
                  cards from your hand to the bottom of a draw pile, then draw
                  that many); <strong>Rend</strong> (draw the top card of a
                  Gate); <strong>Scrounge</strong> (draw from Gates);{" "}
                  <strong>Stockpile</strong> (send cards from an opponent’s hand
                  to a draw pile); <strong>Recruit</strong> (draw the first cards
                  of a draw pile that are from your Main Deck);{" "}
                  <strong>Renew</strong> (bring a card back from the Gap);{" "}
                  <strong>Steal</strong>; <strong>Gift</strong>;{" "}
                  <strong>Bounce</strong> (send a card on the Field to an
                  opponent’s hand); <strong>Gap</strong>; <strong>Set</strong>.
                </>,
              ],
              [
                "Looking",
                <>
                  <strong>Scan</strong> (look at the top cards of a draw pile);{" "}
                  <strong>Stack</strong> (rearrange the top cards of a draw
                  pile).
                </>,
              ],
              [
                "Stopping things",
                <>
                  <strong>Block X</strong> (negate X damage);{" "}
                  <strong>Armor X</strong> (cap the damage you take);{" "}
                  <strong>Reflect</strong>; <strong>Disarm</strong> (negate a
                  Play); <strong>Drought</strong> (prevent a player’s next
                  draw); <strong>Shut Down</strong> (flip cards face down);{" "}
                  <strong>Barrier</strong> (has health and can’t be played on).
                </>,
              ],
              [
                "Damage",
                <>
                  <strong>Leech</strong> (deal damage and gain that much health);{" "}
                  <strong>Lethal</strong> (deal enough damage to knock out);{" "}
                  <strong>Blitz</strong> (reveal the top card of a draw pile onto
                  a Gate and deal damage equal to its Power);{" "}
                  <strong>Detonate</strong> (trigger effects on a Gate);{" "}
                  <strong>Beat</strong> (attacks using Bulks only);{" "}
                  <strong>Ultimate</strong>; <strong>Underdog</strong>;{" "}
                  <strong>Recoil</strong>.
                </>,
              ],
              [
                "Position",
                <>
                  <strong>Shift / Rebuild</strong> (move Gates or cards);{" "}
                  <strong>Peak</strong>; <strong>Valley</strong>;{" "}
                  <strong>Surrounded</strong>; <strong>Border</strong> (side by
                  side); <strong>Diagonal</strong> (corner to corner).
                </>,
              ],
              [
                "State and timing",
                <>
                  <strong>Faceup</strong> (works while face up);{" "}
                  <strong>Latent</strong> (works within a Gate);{" "}
                  <strong>Ripped</strong> (if removed from its zone);{" "}
                  <strong>Unload</strong> (played from a Set Zone);{" "}
                  <strong>Always</strong>; <strong>IP / EP / FP</strong> (Instant
                  / End / Fill Phase).
                </>,
              ],
              [
                "Exchange text",
                <>
                  <strong>Parrying</strong> (while this card is being used to
                  Parry); <strong>Parried</strong> (if this card’s Play is
                  Parried).
                </>,
              ],
            ]}
          />
        </SubSection>
      </Section>
    </LessonLayout>
  );
}
