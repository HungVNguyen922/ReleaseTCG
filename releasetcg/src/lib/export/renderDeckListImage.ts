import type { PlayableCard } from "@/types/cards";
import type { DeckEntry } from "@/types/decks";

import { getCardImageUrl } from "@/lib/images/getCardImageUrl";

/**
 * Draws a deck list as one picture:
 *
 *   - the deck name across the top
 *   - the EXTRA DECK in its own gold panel, first
 *   - the MAIN DECK in its own panel underneath
 *   - every card with a red badge showing how many copies are in the deck
 *
 * It paints onto a canvas instead of taking a screenshot of the page, so the
 * result is always the same size and doesn't depend on the screen it was
 * exported from.
 */

export type DeckListEntry = {
  card: PlayableCard;
  count: number;
};

export type DeckListInput = {
  name: string;
  extraDeck: DeckListEntry[];
  mainDeck: DeckListEntry[];
};

/** Looks up the cards of a saved deck. Entries whose card can't be found are skipped. */
export function resolveDeckEntries(
  entries: DeckEntry[],
  cards: PlayableCard[]
): DeckListEntry[] {
  const byId = new Map(cards.map((card) => [card.id, card]));

  return entries.flatMap((entry) => {
    const card = byId.get(entry.cardId);

    return card && entry.count > 0 ? [{ card, count: entry.count }] : [];
  });
}

// ---------------------------------------------------------------------------
// Look and size. Everything is in pixels of the finished picture.
// ---------------------------------------------------------------------------

const STYLE = {
  columns: 5,
  cardWidth: 270,
  /** Used until a card image loads and tells us its real shape. */
  cardRatio: 7 / 5,
  gap: 24,
  outerPad: 36,

  /** Space around the cards inside a panel. The top is larger: the label sits on the border. */
  panelPadX: 24,
  panelPadTop: 40,
  panelPadBottom: 24,
  panelRadius: 22,
  panelStroke: 2,
  sectionGap: 34,
  titleBlock: 112,

  badgeRatio: 0.12,
  badgeInset: 8,

  background: "#1b1b1d",
  titleColor: "#ffffff",
  titleFont: 'Georgia, "Times New Roman", serif',
  uiFont: 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',

  badgeColor: "#e0161d",
  badgeText: "#ffffff",

  extra: {
    label: "EXTRA DECK",
    stroke: "rgba(245, 179, 1, 0.85)",
    fill: "rgba(245, 179, 1, 0.055)",
    text: "#ffcf4d",
  },
  main: {
    label: "MAIN DECK",
    stroke: "rgba(140, 156, 190, 0.7)",
    fill: "rgba(255, 255, 255, 0.03)",
    text: "#cfd6e6",
  },
} as const;

// ---------------------------------------------------------------------------
// Layout (no drawing here, so it is easy to test)
// ---------------------------------------------------------------------------

export type PlacedCard = {
  entry: DeckListEntry;
  x: number;
  y: number;
};

export type PlacedSection = {
  key: "extra" | "main";
  label: string;
  /** Copies in this section. */
  total: number;
  x: number;
  y: number;
  width: number;
  height: number;
  cards: PlacedCard[];
};

export type DeckListLayout = {
  width: number;
  height: number;
  cardWidth: number;
  cardHeight: number;
  sections: PlacedSection[];
};

function sumCounts(entries: DeckListEntry[]) {
  return entries.reduce((sum, entry) => sum + entry.count, 0);
}

/**
 * Works out where everything goes. Extra deck first, then main deck; an empty
 * section gets no panel. Rows that aren't full (the last one) are centered.
 */
export function layoutDeckList(
  input: Pick<DeckListInput, "extraDeck" | "mainDeck">,
  cardHeight: number = Math.round(STYLE.cardWidth * STYLE.cardRatio)
): DeckListLayout {
  const { columns, cardWidth, gap, outerPad, panelPadX } = STYLE;

  const panelWidth =
    columns * cardWidth + (columns - 1) * gap + panelPadX * 2;

  const width = panelWidth + outerPad * 2;

  const groups = [
    { key: "extra" as const, label: STYLE.extra.label, entries: input.extraDeck },
    { key: "main" as const, label: STYLE.main.label, entries: input.mainDeck },
  ].filter((group) => group.entries.length > 0);

  const sections: PlacedSection[] = [];

  let y = STYLE.titleBlock;

  for (const group of groups) {
    const rows = Math.ceil(group.entries.length / columns);

    const height =
      STYLE.panelPadTop +
      rows * cardHeight +
      (rows - 1) * gap +
      STYLE.panelPadBottom;

    const cards: PlacedCard[] = group.entries.map((entry, index) => {
      const row = Math.floor(index / columns);
      const inRow = Math.min(columns, group.entries.length - row * columns);
      const rowWidth = inRow * cardWidth + (inRow - 1) * gap;

      return {
        entry,
        x:
          outerPad +
          (panelWidth - rowWidth) / 2 +
          (index % columns) * (cardWidth + gap),
        y: y + STYLE.panelPadTop + row * (cardHeight + gap),
      };
    });

    sections.push({
      key: group.key,
      label: group.label,
      total: sumCounts(group.entries),
      x: outerPad,
      y,
      width: panelWidth,
      height,
      cards,
    });

    y += height + STYLE.sectionGap;
  }

  // Bottom margin: the gap after the last panel is replaced by the outer padding.
  const height = groups.length > 0 ? y - STYLE.sectionGap + outerPad : y;

  return { width, height, cardWidth, cardHeight, sections };
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Shrinks the font until the text fits, but never below `minSize`. */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: string,
  family: string,
  startSize: number,
  minSize: number
) {
  let size = startSize;

  ctx.font = `${weight} ${size}px ${family}`;

  while (size > minSize && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${family}`;
  }

  return size;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
) {
  const lines: string[] = [];
  let line = "";

  for (const word of text.split(/\s+/)) {
    const attempt = line ? `${line} ${word}` : word;

    if (line && ctx.measureText(attempt).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = attempt;
    }
  }

  if (line) lines.push(line);

  return lines;
}

async function loadCardImage(card: PlayableCard): Promise<ImageBitmap | null> {
  try {
    // "reload" skips the browser cache: a copy cached earlier by a plain
    // <img> has no CORS headers and would taint the canvas.
    const response = await fetch(getCardImageUrl(card), {
      mode: "cors",
      cache: "reload",
    });

    if (!response.ok) return null;

    return await createImageBitmap(await response.blob());
  } catch {
    return null;
  }
}

/** Stands in for a card whose image couldn't be loaded. */
function drawMissingCard(
  ctx: CanvasRenderingContext2D,
  card: PlayableCard,
  x: number,
  y: number,
  w: number,
  h: number
) {
  roundedRect(ctx, x, y, w, h, 16);
  ctx.fillStyle = "#2c2c31";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#55555c";
  ctx.stroke();

  ctx.fillStyle = "#e5e5ea";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 26px ${STYLE.uiFont}`;

  const lines = wrapLines(ctx, card.name, w - 36);
  const lineHeight = 34;
  const top = y + h / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, i) => ctx.fillText(line, x + w / 2, top + i * lineHeight));
}

/** The red count badge on a card's bottom-right corner. */
function drawBadge(
  ctx: CanvasRenderingContext2D,
  count: number,
  cardX: number,
  cardY: number,
  cardHeight: number
) {
  const r = Math.round(STYLE.cardWidth * STYLE.badgeRatio);
  const { badgeInset } = STYLE;

  const cx = cardX + STYLE.cardWidth - badgeInset;
  const cy = cardY + cardHeight - badgeInset;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = STYLE.badgeColor;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
  ctx.stroke();

  ctx.fillStyle = STYLE.badgeText;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.round(r * 1.1)}px ${STYLE.uiFont}`;
  ctx.fillText(String(count), cx, cy + 1);
}

/** A small tag sitting on a panel's top border, like the legend of a fieldset. */
function drawTag(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  stroke: string
) {
  ctx.font = `700 19px ${STYLE.uiFont}`;

  const height = 32;
  const width = Math.ceil(ctx.measureText(text).width) + 28;

  roundedRect(ctx, x, y - height / 2, width, height, height / 2);
  ctx.fillStyle = STYLE.background;
  ctx.fill();
  ctx.lineWidth = STYLE.panelStroke;
  ctx.strokeStyle = stroke;
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + 14, y + 1);
}

/**
 * Paints the deck list and returns it as a PNG.
 * Rejects if the canvas can't be created.
 */
export async function renderDeckListImage(
  input: DeckListInput
): Promise<Blob> {
  const entries = [...input.extraDeck, ...input.mainDeck];

  // Load every distinct card image once, all at the same time.
  const unique = [...new Map(entries.map((e) => [e.card.id, e.card])).values()];

  const loaded = new Map<string, ImageBitmap | null>();

  await Promise.all(
    unique.map(async (card) => {
      loaded.set(card.id, await loadCardImage(card));
    })
  );

  // Use the real shape of the card art for the card height.
  const sample = [...loaded.values()].find((image) => image !== null);

  const cardHeight = sample
    ? Math.round((STYLE.cardWidth * sample.height) / sample.width)
    : Math.round(STYLE.cardWidth * STYLE.cardRatio);

  const layout = layoutDeckList(input, cardHeight);

  const canvas = document.createElement("canvas");
  canvas.width = layout.width;
  canvas.height = layout.height;

  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Couldn't create the image.");

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Background
  ctx.fillStyle = STYLE.background;
  ctx.fillRect(0, 0, layout.width, layout.height);

  // Title
  const title = input.name.trim() || "Untitled Deck";

  ctx.fillStyle = STYLE.titleColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  fitFont(
    ctx,
    title,
    layout.width - STYLE.outerPad * 2,
    "700",
    STYLE.titleFont,
    64,
    32
  );

  ctx.fillText(title, layout.width / 2, STYLE.titleBlock / 2 + 2);

  // Sections
  for (const section of layout.sections) {
    const look = section.key === "extra" ? STYLE.extra : STYLE.main;

    roundedRect(
      ctx,
      section.x,
      section.y,
      section.width,
      section.height,
      STYLE.panelRadius
    );
    ctx.fillStyle = look.fill;
    ctx.fill();
    ctx.lineWidth = STYLE.panelStroke;
    ctx.strokeStyle = look.stroke;
    ctx.stroke();

    drawTag(
      ctx,
      `${look.label}  ·  ${section.total}`,
      section.x + 24,
      section.y,
      look.text,
      look.stroke
    );

    for (const { entry, x, y } of section.cards) {
      const image = loaded.get(entry.card.id) ?? null;

      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 5;

      if (image) {
        ctx.drawImage(image, x, y, layout.cardWidth, layout.cardHeight);
      } else {
        drawMissingCard(ctx, entry.card, x, y, layout.cardWidth, layout.cardHeight);
      }

      ctx.restore();

      drawBadge(ctx, entry.count, x, y, layout.cardHeight);
    }
  }

  for (const image of loaded.values()) image?.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Couldn't create the image.")),
      "image/png"
    );
  });
}
