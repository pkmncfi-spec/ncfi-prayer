import { GeistSans } from "geist/font/sans";
import Link from "next/link"; // Jika menggunakan Next.js
import {
  Home,
  Search,
  Bookmark,
  Bell,
  Info,
  User,
  Send
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar";

// Menu items.
const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
  { title: "Notification", url: "/notification", icon: Bell },
  { title: "Help", url: "/help", icon: Info },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Request", url: "/request", icon: Send },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className={GeistSans.className}>
        <SidebarGroup>
          <SidebarGroupLabel>NCFI Prayer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ title, url, icon: Icon }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton className="h-12 text-xl flex items-center">
                    <Icon size={24} className="mr-4 w-6 h-6" />
                    <Link href={url} aria-label={title} className="w-full">
                      {title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
