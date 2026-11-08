import { ReactNode } from "react";

import { PlayableCard } from "@/types/cards";

import { CardImage } from "./components/CardImage";
import { CardHeader } from "./components/CardHeader";
import { CardStats } from "./components/CardStats";
import { CardEffects } from "./components/CardEffects";
import { CardFlavorText } from "./components/CardFlavorText";
import { CardMetadata } from "./components/CardMetadata";

type Props = {
  card: PlayableCard;
  children?: ReactNode;
};

export function CardViewer({ card, children }: Props) {
  return (
    <div className="grid h-full md:grid-cols-[360px_minmax(0,1fr)] bg-gray-200">
      <div className="flex items-center justify-center p-8">
        <CardImage card={card} />
      </div>

      <div className="min-w-0 overflow-y-auto items-center p-8 rounded-3xl">
        <div className="space-y-5">
          <CardHeader name={card.name} />

          <CardStats power={card.power} bulk={card.bulk} colors={card.colors} />

          <CardEffects
            trait={card.trait}
            effect1={card.effect1}
            effect2={card.effect2}
            clarify1={card.clarify1}
            clarify2={card.clarify2}
            clarify3={card.clarify3}
          />

          <CardFlavorText flavor_text={card.flavor} />

          <CardMetadata
            artist={card.artist}
            cardNumber={card.cardNumber}
            setName={card.setName}
          />

          {children}
        </div>
      </div>
    </div>
  );
}
