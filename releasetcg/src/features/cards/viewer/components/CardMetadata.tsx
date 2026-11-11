import { findSet } from "@/lib/sets/sets";

type Props = {
  artist: string | null;
  cardNumber: string | null;
  setName: string | null;
};

export function CardMetadata({ artist, cardNumber, setName }: Props) {
  const identifier =
    cardNumber && setName
      ? `${cardNumber} - ${setName}`
      : cardNumber || setName || "—";

  const set = findSet(setName);

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold">Metadata</h3>

      <div className="grid grid-cols-[120px_1fr] gap-y-2">
        <span className="font-medium">Artist</span>
        <span>{artist || "Unknown"}</span>

        <span className="font-medium">Card</span>
        <span>{identifier}</span>

        {set && (
          <>
            <span className="font-medium">Set</span>
            <span>
              Set {set.number}: {set.name}
            </span>
          </>
        )}
      </div>
    </section>
  );
}
