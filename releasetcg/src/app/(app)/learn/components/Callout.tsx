import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant = "tip" | "note" | "warning" | "example";

const VARIANTS: Record<Variant, { label: string; classes: string }> = {
  tip: {
    label: "Tip",
    classes: "border-emerald-500 bg-emerald-500/10",
  },
  note: {
    label: "Note",
    classes: "border-sky-500 bg-sky-500/10",
  },
  warning: {
    label: "Watch out",
    classes: "border-amber-500 bg-amber-500/10",
  },
  example: {
    label: "Example",
    classes: "border-violet-500 bg-violet-500/10",
  },
};

export function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: ReactNode;
}) {
  const style = VARIANTS[variant];

  return (
    <aside className={cn("rounded-lg border-l-4 p-4 text-sm", style.classes)}>
      <p className="mb-1 font-semibold">{title ?? style.label}</p>
      <div className="space-y-2 [&_p]:leading-6">{children}</div>
    </aside>
  );
}
