"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { HugeiconsIcon } from "@hugeicons/react"
import { LayoutBottomIcon, AudioWave01Icon, CommandIcon, ComputerTerminalIcon, RoboticIcon, BookOpen02Icon, Settings05Icon, CropIcon, PieChartIcon, MapsIcon, HomeIcon } from "@hugeicons/core-free-icons"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
import { Profile } from "@/types/profiles"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Play",
      url: "#",
      icon: (
        <HugeiconsIcon icon={ComputerTerminalIcon} strokeWidth={2} />
      ),
      isActive: true,
      items: [
        {
          title: "Create Lobby",
          url: "#",
        },
        {
          title: "Join Lobby",
          url: "#",
        },
      ],
    },
    {
      title: "Deck Builder",
      url: "#",
      icon: (
        <HugeiconsIcon icon={RoboticIcon} strokeWidth={2} />
      ),
      items: [
        {
          title: "New Deck",
          url: "/deckbuilder",
        },
        {
          title: "Community Decks",
          url: "/community",
        },
      ],
    },
    {
      title: "Gallery",
      url: "#",
      icon: (
        <HugeiconsIcon icon={BookOpen02Icon} strokeWidth={2} />
      ),
      items: [
        {
          title: "All Cards",
          url: "/gallery",
        },
        {
          title: "Set 1",
          url: "#",
        },
      ],
    },
    {
      title: "Learn",
      url: "#",
      icon: (
        <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />
      ),
      items: [
        {
          title: "Knowing the Board",
          url: "#",
        },
        {
          title: "Understanding a Card",
          url: "#",
        },
        {
          title: "Game Phases",
          url: "#",
        },
        {
          title: "Playing Cards and Attacks",
          url: "#",
        },
        {
          title: "Building a Deck",
          url: "#",
        },
        {
          title: "Setting up a Game",
          url: "#",
        },
        {
          title: "Additional Rules",
          url: "#",
        },
        {
          title: "FAQ",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: (
        <HugeiconsIcon icon={CropIcon} strokeWidth={2} />
      ),
    },
    {
      name: "Cosmetics",
      url: "#",
      icon: (
        <HugeiconsIcon icon={PieChartIcon} strokeWidth={2} />
      ),
    },
  ],
}

const adminProjects = [
  {
    name: "Card Manager",
    url: "/cardmanager",
    icon: (
      <HugeiconsIcon
        icon={LayoutBottomIcon}
        strokeWidth={2}
      />
    ),
  },
];

export function AppSidebar({
  user,
  profile,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: User | null
  profile?: Profile | null
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md hover:bg-muted"
        >
          <HugeiconsIcon icon={HomeIcon} strokeWidth={2} />
          Home
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        {profile?.role === "admin" && (
          <NavProjects projects={adminProjects} />
        )}
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
