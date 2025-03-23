import { GeistSans } from "geist/font/sans";
import Link from "next/link";
import {
  Home,
  Search,
  Bookmark,
  Bell,
  Info,
  User,
  Send,
  LogOut
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
import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";

// Menu items.
const items = [
  { title: "Home", url: "/home", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
  { title: "Notification", url: "/notification", icon: Bell },
  { title: "Help", url: "/help", icon: Info },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Request", url: "/request", icon: Send },
  { title: "Log Out", url: "/home", icon: LogOut },
];

export function AppSidebar() {
  const auth = getAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    void router.push("/login");
  };

  return (
    <Sidebar>
      <SidebarContent className={GeistSans.className}>
        <SidebarGroup>
          <SidebarGroupLabel>NCFI Prayer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(({ title, url, icon: Icon }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton onClick={title === "Log Out" ? handleLogout : undefined} className="h-12 text-xl flex items-center">
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
