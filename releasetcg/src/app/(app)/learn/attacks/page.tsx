import { Callout } from "../components/Callout";
import { PowerRow } from "../components/Examples";
import { LessonLayout } from "../components/LessonLayout";
import { Bullets, InlineLink, Section } from "../components/Prose";

export const metadata = {
  title: "Learn: Attacks and Damage",
};

export default function AttacksPage() {
  return (
    <LessonLayout slug="attacks">
      <p>
        Playing a card isn’t an attack by itself. Damage comes from the{" "}
        <strong>Power</strong> numbers on top of the Gate you played on. When the
        Attack step arrives, look at the top cards of that Gate and check for one
        of two patterns.
      </p>

      <Section title="Pair">
        <p>
          If the <strong>top 2 cards</strong> have the same Power, you deal
          damage equal to that Power.
        </p>
        <PowerRow
          powers={[1, 3, 3]}
          counted={2}
          result="Pair of 3s → 3 damage"
        />
      </Section>

      <Section title="Straight">
        <p>
          If the <strong>top 3 cards</strong> form a numerical sequence, going up
          or down, you deal damage equal to the <strong>middle (median)</strong>{" "}
          value.
        </p>
        <PowerRow
          powers={[2, 3, 4]}
          counted={3}
          result="2-3-4 → 3 damage"
        />
        <PowerRow
          powers={[4, 3, 2]}
          counted={3}
          result="4-3-2 (descending also counts) → 3 damage"
        />
        <PowerRow
          powers={[3, 4, 5]}
          counted={3}
          result="3-4-5 → 4 damage (the biggest Straight possible)"
        />
      </Section>

      <Section title="No pattern, no damage">
        <p>
          If you don’t have a Pair or a Straight, your Play does 0 damage. It can
          still be worth making for its effects.
        </p>
        <PowerRow
          powers={[1, 3, 4]}
          counted={3}
          result="No Pair, no Straight → 0 damage"
        />
      </Section>

      <Section title="Choosing a target">
        <p>
          When you set up an attack, you choose who the damage is aimed at. The
          targeted player is the <strong>defending player</strong>: they receive
          the damage, and they’re the one who gets to respond with Parries.
        </p>
      </Section>

      <Section title="Setting up, and denying, attacks">
        <p>
          Because anyone can play on any Gate, the top of every Gate is a shared
          opportunity. A few things follow from that:
        </p>
        <Bullets
          items={[
            <>
              <strong>Look before you leave.</strong> If you leave a Power 3 on
              top of a Gate, your opponent may be able to play another Power 3
              and score a Pair.
            </>,
            <>
              <strong>Build toward it.</strong> Straights need three cards in a
              row, so chains and combos are the natural way to line one up in a
              single turn.
            </>,
            <>
              <strong>Expect small numbers.</strong> A Pair can’t be worth more
              than 5, and the best Straight deals 4. Against 10 health, you’ll
              usually need several hits, or card effects that deal damage
              directly.
            </>,
          ]}
        />
        <Callout variant="note" title="Damage can be stopped">
          <p>
            A Parry cancels the whole Play, attack included. Effects such as
            Block, Armor and Heal also soften damage. Learn how Parries work next
            in{" "}
            <InlineLink href="/learn/parries">Parries and Responses</InlineLink>.
          </p>
        </Callout>
      </Section>
    </LessonLayout>
  );
}
