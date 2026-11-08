import type { ColorMatchMode } from "@/types/cards";

export type GallerySort = "name" | "power" | "bulk" | "setName";
export type SortDirection = "asc" | "desc";

export type GalleryFilterState = {
  search: string;
  setName: string;
  /** Up to 4 selected colors. Empty means "any color". */
  colors: string[];
  colorMode: ColorMatchMode;
  sort: GallerySort;
  direction: SortDirection;
};
