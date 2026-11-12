"use client";
import { AdminCardSummary } from "@/types/cards";

import { useRouter } from "next/navigation";
import { PaletteChips } from "@/app/(app)/components/cards/PaletteChips";

type Props = {
  cards: AdminCardSummary[];

  /** Ids of the checked cards. */
  selected: Set<string>;

  /** Check or uncheck one card. `shift` extends from the last one clicked. */
  onToggle: (id: string, shift: boolean) => void;

  /** Check or uncheck every card shown. */
  onToggleAll: (checked: boolean) => void;
};

export function CardTable({
  cards,
  selected,
  onToggle,
  onToggleAll,
}: Props) {
  const router = useRouter();

  const checkedCount = cards.filter((card) =>
    selected.has(card.id)
  ).length;

  const allChecked =
    cards.length > 0 && checkedCount === cards.length;

  return (
    <div className="overflow-x-auto rounded-xl border">
        <table className="w-full border-collapse">
        <thead className="bg-muted">
            <tr className="border-b">
                <th className="w-10 p-3 text-left">
                    <input
                        type="checkbox"
                        aria-label="Select all shown cards"
                        className="size-4 cursor-pointer"
                        checked={allChecked}
                        ref={(el) => {
                            if (el) {
                                el.indeterminate =
                                    checkedCount > 0 && !allChecked;
                            }
                        }}
                        onChange={(e) =>
                            onToggleAll(e.target.checked)
                        }
                    />
                </th>

                <th className="p-3 text-left">
                    Card
                </th>

                <th className="p-3 text-left">
                    Stats
                </th>

                <th className="p-3 text-left">
                    Pool
                </th>

                <th className="p-3 text-left">
                    Palette
                </th>
            </tr>
        </thead>

        <tbody>
            {cards.map((card) => (
            <tr
                key={card.id}
                className={`cursor-pointer border-b hover:bg-muted ${
                    selected.has(card.id) ? "bg-muted/60" : ""
                }`}
                onClick={() =>
                    router.push(`/cardmanager/${card.id}`)
                }
            >
                <td
                    className="p-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        aria-label={`Select ${card.name}`}
                        className="size-4 cursor-pointer"
                        checked={selected.has(card.id)}
                        onChange={() => {}}
                        onClick={(e) =>
                            onToggle(card.id, e.shiftKey)
                        }
                    />
                </td>

                <td className="p-3">
                {card.name}
                </td>

                <td className="p-3">
                {card.power}/{card.bulk}
                </td>

                <td className="p-3 capitalize text-muted-foreground">
                {card.pool}
                </td>

                <td className="p-3">
                    <PaletteChips 
                    palette={card.palette} 
                    size="sm"
                />    
                </td>
            </tr>
            ))}
        </tbody>
        </table>
    </div>
  );
}
