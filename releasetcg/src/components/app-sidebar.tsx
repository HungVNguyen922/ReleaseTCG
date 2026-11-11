"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LayoutBottomIcon,
  ComputerTerminalIcon,
  RoboticIcon,
  BookOpen02Icon,
  Settings05Icon,
  CropIcon,
  PieChartIcon,
} from "@hugeicons/core-free-icons"
import type { User } from "@supabase/supabase-js"
import { Profile } from "@/types/profiles"

import { learnHref, lessons } from "@/app/(app)/learn/lessons"
import { SETS, setGalleryHref } from "@/lib/sets/sets"

/**
 * The Home icon used to be `HomeIcon` from the Hugeicons package, which isn't
 * an icon that package exports, so nothing rendered. This is drawn inline
 * instead, so it can't go missing.
 */
function HomeGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  )
}

const data = {
  navMain: [
    {
      title: "Play",
      url: "#",
      icon: <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />,
      isActive: true,
      items: [
        { title: "Sandbox", url: "/sandbox" },
        { title: "Create Lobby", url: "#" },
        { title: "Join Lobby", url: "#" },
      ],
    },
    {
      title: "Deck Builder",
      url: "#",
      icon: <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />,
      items: [
        { title: "New Deck", url: "/deckbuilder" },
        { title: "Community Decks", url: "/community" },
      ],
    },
    {
      title: "Gallery",
      url: "#",
      icon: <HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />,
      items: [
        { title: "All Cards", url: "/gallery" },
        // One link per set in src/lib/sets/sets.ts, in set order.
        ...SETS.map((set) => ({
          title: `Set ${set.number}: ${set.name}`,
          url: setGalleryHref(set),
        })),
      ],
    },
    {
      title: "Learn",
      url: "#",
      icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
      items: lessons.map((lesson) => ({
        title: lesson.title,
        url: learnHref(lesson.slug),
      })),
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: <HugeiconsIcon icon={CropIcon} strokeWidth={2} />,
    },
    {
      name: "Cosmetics",
      url: "#",
      icon: <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />,
    },
  ],
}

const adminProjects = [
  {
    name: "Card Manager",
    url: "/cardmanager",
    icon: <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={2} />,
  },
]

export function AppSidebar({
  user,
  profile,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: User | null
  profile?: Profile | null
}) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Home" isActive={pathname === "/"}>
              <Link href="/">
                <HomeGlyph />
                <span>Home</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* The menus read the URL's query string, which needs a Suspense boundary. */}
        <React.Suspense fallback={null}>
          <NavMain items={data.navMain} />
          <NavProjects projects={data.projects} />
          {profile?.role === "admin" && (
            <NavProjects label="Admin" projects={adminProjects} />
          )}
        </React.Suspense>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: profile?.username ?? user?.email ?? "Guest",
            email: user?.email ?? "",
            avatar: "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
