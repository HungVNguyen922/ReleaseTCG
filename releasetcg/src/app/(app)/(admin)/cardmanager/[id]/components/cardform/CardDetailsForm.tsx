"use client";

import { BasicInfoSection } from "./sections/BasicInfoSection";
import { PaletteSection } from "./sections/PaletteSection";
import { CardTextSection } from "./sections/CardTextSection";
import { MetadataSection } from "./sections/MetadataSection";
import { Footer } from "./Footer";

import { CardForm } from "./types";
import { useCardForm } from "../hooks/useCardForm";

import { getCardImageUrl } from "@/lib/images/getCardImageUrl";

type Props = {
  id?: string;
  initial: CardForm;
};

export function CardDetailsForm({ id, initial }: Props) {
  const {
    form,
    update,
    handleSave,
    handleDelete,
    hasChanges,
    state,
    isNew,
  } = useCardForm({ id, initial });

  const imageSrc =
    form.cardNumber.trim() && form.setName.trim()
      ? getCardImageUrl(form)
      : "/placeholder.png";

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_420px] md:h-app">
      <div className="overflow-y-auto p-8 space-y-8">
        <BasicInfoSection form={form} update={update} />
        <PaletteSection form={form} update={update} />
        <CardTextSection form={form} update={update} />
        <MetadataSection form={form} update={update} />

        <Footer
          isNew={isNew}
          hasChanges={hasChanges}
          state={state}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      </div>

      <div className="hidden border-l bg-muted/10 p-6 md:flex">
        <div className="sticky top-6 flex w-full justify-center">
          <img
            src={imageSrc}
            alt={form.name}
            className="w-[320px] rounded-lg object-contain shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}