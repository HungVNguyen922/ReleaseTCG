"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { isRouteActive } from "@/components/nav-utils"

export function NavProjects({
  label = "Projects",
  projects,
}: {
  label?: string
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams() ?? new URLSearchParams()

  return (
    // Stays visible when the sidebar is collapsed: icons with tooltips.
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              tooltip={item.name}
              isActive={isRouteActive(pathname, searchParams, item.url)}
            >
              <Link href={item.url}>
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
