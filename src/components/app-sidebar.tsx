import { GeistSans } from "geist/font/sans"
import { Home, Search, Bookmark, Bell, Info } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Search",
    url: "/search",
    icon: Search,
  },
  {
    title: "Bookmarks",
    url: "/bookmarks",
    icon: Bookmark,
  },
  {
    title: "Notification",
    url: "/notification",
    icon: Bell,
  },
  {
    title: "Help",
    url: "/help",
    icon: Info,
  }
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className={GeistSans.className}>
        <SidebarGroup>
          <SidebarGroupLabel>NCFI Prayer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12 text-xl">
                    <a href={item.url}>
                      <item.icon size={64} className="mr-5 w-10 h-10"/>
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
