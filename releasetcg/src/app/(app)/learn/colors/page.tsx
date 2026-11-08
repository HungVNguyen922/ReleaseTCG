import { PaletteChips } from "@/app/(app)/components/cards/PaletteChips";

import { Callout } from "../components/Callout";
import { ColorGrid } from "../components/ColorGrid";
import { AXIS_LABEL, COLORS, type Axis } from "../components/colorData";
import { LessonLayout } from "../components/LessonLayout";
import { Bullets, InlineLink, Section } from "../components/Prose";

export const metadata = {
  title: "Learn: The Nine Colors",
};

function leansToward(code: string) {
  const [a, b] = code.split("") as Axis[];

  return a === b
    ? `${AXIS_LABEL[a]} (all the way)`
    : `${AXIS_LABEL[a]} and ${AXIS_LABEL[b]}`;
}

export default function ColorsPage() {
  return (
    <LessonLayout slug="colors">
      <p>
        Colors do two jobs. They decide where a card can be played, and they
        give each card a style. Every color is good at something different, and
        each leans toward one or two of the three ways to win.
      </p>

      <Section title="The color map">
        <ColorGrid />
      </Section>

      <Section title="The nine colors">
        <div className="grid gap-3 md:grid-cols-3">
          {COLORS.map((color) => (
            <div
              key={color.name}
              className="space-y-3 rounded-lg border bg-card p-4"
            >
              <div className="flex items-center gap-2">
                <PaletteChips palette={[color.name]} size="md" />
                <h3 className="text-lg font-semibold">{color.name}</h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {color.element}
                </span>
              </div>

              <p className="text-sm leading-6">{color.offers}</p>

              <p className="text-xs text-muted-foreground">
                Leans toward: {leansToward(color.code)}
              </p>

              <ul className="list-disc space-y-0.5 pl-5 text-sm">
                {color.themes.map((theme) => (
                  <li key={theme}>{theme}</li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5">
                {color.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border px-2 py-0.5 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          The keywords are words you’ll see often on that color’s cards. They’re
          explained in the glossary under{" "}
          <InlineLink href="/learn/additional-rules">Additional Rules</InlineLink>.
        </p>
      </Section>

      <Section title="Mixing colors">
        <p>
          Most cards have two or three colors, so a single card often carries
          more than one style. A Red and Green card, for example, brings Red’s
          damage and recursion together with Green’s drawing and healing. Every
          pair of colors appears on at least one card in the set, so you can mix
          freely.
        </p>
        <Callout variant="tip" title="Some starter ideas">
          <Bullets
            items={[
              <>
                <strong>Aggressive:</strong> Violet and Red, to deal damage and
                keep the pressure on.
              </>,
              <>
                <strong>Defensive:</strong> Orange with Yellow or Magenta, to
                blunt damage and slow your opponent down.
              </>,
              <>
                <strong>Drawing and combos:</strong> Green with Cyan, to draw
                deep and set up long chains.
              </>,
            ]}
          />
        </Callout>
        <p>
          To see every card in a color, use the color filter in the{" "}
          <InlineLink href="/gallery">Gallery</InlineLink>.
        </p>
      </Section>
    </LessonLayout>
  );
}
