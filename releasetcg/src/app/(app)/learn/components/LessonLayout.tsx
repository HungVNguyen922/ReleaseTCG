import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { getLessonNeighbors, learnHref, lessons } from "../lessons";

export function LessonLayout({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);

  if (index === -1) {
    notFound();
  }

  const lesson = lessons[index];
  const { prev, next } = getLessonNeighbors(slug);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 text-sm text-muted-foreground"
      >
        <Link href="/learn" className="hover:text-foreground hover:underline">
          Learn
        </Link>
        <span className="mx-2">/</span>
        <span>{lesson.title}</span>
      </nav>

      <header className="mb-8 border-b pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Lesson {index + 1} of {lessons.length} · about {lesson.minutes} min
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          {lesson.title}
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">{lesson.summary}</p>
      </header>

      <article className="space-y-8 [&_p]:leading-7">{children}</article>

      <footer className="mt-12 grid gap-3 border-t pt-6 sm:grid-cols-2">
        {prev ? (
          <Link
            href={learnHref(prev.slug)}
            className="rounded-lg border p-4 hover:bg-muted"
          >
            <span className="block text-xs text-muted-foreground">
              ← Previous
            </span>
            <span className="font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}

        {next ? (
          <Link
            href={learnHref(next.slug)}
            className="rounded-lg border p-4 text-right hover:bg-muted"
          >
            <span className="block text-xs text-muted-foreground">
              Next →
            </span>
            <span className="font-medium">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </footer>
    </main>
  );
}
