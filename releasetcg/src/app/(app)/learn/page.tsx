import Link from "next/link";

import { learnHref, lessons } from "./lessons";

export const metadata = {
  title: "Learn to Play",
};

export default function LearnIndexPage() {
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-8 space-y-3">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
          Learn to Play
        </h1>
        <p className="text-lg text-muted-foreground">
          {lessons.length} short lessons, about {totalMinutes} minutes in total.
          Each one builds on the last, so read them in order the first time
          through. After that, use them as a reference.
        </p>
        <Link
          href={learnHref(lessons[0].slug)}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Start with {lessons[0].title} →
        </Link>
      </header>

      <ol className="grid gap-3 sm:grid-cols-2">
        {lessons.map((lesson, i) => (
          <li key={lesson.slug}>
            <Link
              href={learnHref(lesson.slug)}
              className="flex h-full gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {i + 1}
              </span>
              <span className="space-y-1">
                <span className="block font-semibold">{lesson.title}</span>
                <span className="block text-sm leading-6 text-muted-foreground">
                  {lesson.summary}
                </span>
                <span className="block text-xs text-muted-foreground">
                  about {lesson.minutes} min
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
