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

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

// Menu items.
const items = [
  { title: "Log Out", url: "/login", icon: LogOut },
];

const regions = [
  { name: "Afrika", url: "https://example.com/afrika" },
  { name: "Caribbean and North America", url: "https://example.com/caribbean" },
  { name: "Europe", url: "https://example.com/europe" },
  { name: "Latin America", url: "https://example.com/latin-america" },
  { name: "Pacific And East Asia", url: "https://example.com/pacific-asia" },
  { name: "South Asia And Middle East", url: "https://example.com/south-asia" }
];

export function AppSidebar() {
  const auth = getAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    await router.push("/");
  };

  return (
    <Sidebar>
    <SidebarContent className={GeistSans.className}>
      <SidebarGroup>
        <SidebarGroupLabel>NCFI Prayer</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu >
          {items.map(({ title, url, icon: Icon }) => {
                const isActive = router.pathname.startsWith(url);
                return (
                  <SidebarMenuItem key={title}>
                    <SidebarMenuButton
                      onClick={title === "Log Out" ? handleLogout : undefined}
                      className={`h-12 text-xl flex items-center ${isActive ? "font-bold" : ""}`}
                    >
                      <Icon className={`mr-3 !w-6 !h-6 ${isActive ? "stroke-2" : "stroke-[1]"}`} />
                      <Link href={url} aria-label={title} className="w-full">
                        {title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
          </SidebarMenu>
          

          {/* Tombol tambahan dengan popup dialog */}
         <div className="mt-6 flex flex-col space-y-3">
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  );
}
