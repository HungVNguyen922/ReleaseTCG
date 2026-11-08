type Props = {
  trait: string | null;
  effect1: string | null;
  effect2: string | null;

  /** Plain-language explanation of the trait. */
  clarify1?: string | null;
  /** Plain-language explanation of effect 1. */
  clarify2?: string | null;
  /** Plain-language explanation of effect 2. */
  clarify3?: string | null;
};

function CardTextBlock({
  title,
  text,
  clarification,
}: {
  title: string;
  text: string | null;
  clarification?: string | null;
}) {
  if (!text) {
    return null;
  }

  return (
    <div>
      <h4 className="font-semibold">
        {title}
      </h4>

      <p className="whitespace-pre-wrap">
        {text}
      </p>

      {clarification && (
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
          {clarification}
        </p>
      )}
    </div>
  );
}

export function CardEffects({
  trait,
  effect1,
  effect2,
  clarify1,
  clarify2,
  clarify3,
}: Props) {
  return (
    <section className="space-y-2">

      <h3 className="text-lg font-semibold">
        Card Text
      </h3>

      <CardTextBlock
        title="Trait"
        text={trait}
        clarification={clarify1}
      />

      <CardTextBlock
        title="Effect 1"
        text={effect1}
        clarification={clarify2}
      />

      <CardTextBlock
        title="Effect 2"
        text={effect2}
        clarification={clarify3}
      />
    </section>
  );
}
