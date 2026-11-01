import * as React from "react"

/**
 * True on phones: narrow screens, plus touch screens held in landscape
 * (an iPhone in landscape is wider than 768px but only ~400px tall, and
 * a permanent desktop sidebar would eat a third of the screen).
 */
const MOBILE_QUERY =
  "(max-width: 767px), (pointer: coarse) and (max-height: 500px)"

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
