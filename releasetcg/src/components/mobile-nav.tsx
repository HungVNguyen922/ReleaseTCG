"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar"

/**
 * On phones the sidebar is a slide-in sheet, so something has to open it.
 * Normal pages get a slim top bar. The sandbox needs every pixel of height
 * for the board, so it gets a small floating button instead.
 */
export function MobileNav() {
  const { isMobile, setOpenMobile } = useSidebar()
  const pathname = usePathname()

  // Close the slide-in sidebar after following a link.
  React.useEffect(() => {
    setOpenMobile(false)
  }, [pathname, setOpenMobile])

  const floating = pathname.startsWith("/sandbox")

  const barHeight = isMobile && !floating ? "3rem" : "0px"

  React.useEffect(() => {
    document.documentElement.style.setProperty("--topbar-h", barHeight)

    return () => {
      document.documentElement.style.removeProperty("--topbar-h")
    }
  }, [barHeight])

  if (!isMobile) {
    return null
  }

  if (floating) {
    return (
      <SidebarTrigger
        className="fixed left-2 top-2 z-50 size-9 rounded-full border bg-background/90 shadow"
      />
    )
  }

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur">
      <SidebarTrigger />
      <span className="text-sm font-semibold">Release TCG</span>
    </header>
  )
}
