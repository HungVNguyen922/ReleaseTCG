import {
  getLessonNeighbors,
  learnHref,
  lessons,
} from "@/app/(app)/learn/lessons";

describe("learn lessons", () => {
  it("has unique, url-safe slugs", () => {
    const slugs = lessons.map((lesson) => lesson.slug);

    expect(new Set(slugs).size).toBe(slugs.length);

    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("gives every lesson a title, summary and reading time", () => {
    for (const lesson of lessons) {
      expect(lesson.title.length).toBeGreaterThan(0);
      expect(lesson.summary.length).toBeGreaterThan(0);
      expect(lesson.minutes).toBeGreaterThan(0);
    }
  });

  it("builds learn hrefs", () => {
    expect(learnHref("board")).toBe("/learn/board");
  });

  it("links neighbouring lessons", () => {
    const first = getLessonNeighbors(lessons[0].slug);
    const last = getLessonNeighbors(lessons[lessons.length - 1].slug);

    expect(first.prev).toBeNull();
    expect(first.next?.slug).toBe(lessons[1].slug);
    expect(last.next).toBeNull();
    expect(last.prev?.slug).toBe(lessons[lessons.length - 2].slug);
  });
});
