import type { ReactNode } from "react";

export function FaqItem({
  question,
  children,
}: {
  question: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-lg border bg-card px-4 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
        <span>{question}</span>
        <span
          aria-hidden
          className="text-xl leading-none text-muted-foreground transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-3 space-y-2 text-sm text-foreground/80 [&_p]:leading-6">
        {children}
      </div>
    </details>
  );
}
