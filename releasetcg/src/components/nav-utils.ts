/**
 * Is `url` the page we're on?
 *
 * - "#" placeholders are never active.
 * - A link with a query ("/gallery?set=IRFO") is active only when the page has
 *   those same query values, so "All Cards" and "Set 1" don't light up together.
 * - A link without a query is active on that exact page when no query is set,
 *   and on any page below it ("/deckbuilder/123").
 */
export function isRouteActive(
  pathname: string,
  searchParams: URLSearchParams,
  url: string
): boolean {
  if (url === "#") return false

  const target = new URL(url, "http://local")

  if (pathname !== target.pathname) {
    return pathname.startsWith(`${target.pathname}/`)
  }

  const wanted = [...target.searchParams.entries()]

  if (wanted.length === 0) return searchParams.toString() === ""

  return wanted.every(([key, value]) => searchParams.get(key) === value)
}
