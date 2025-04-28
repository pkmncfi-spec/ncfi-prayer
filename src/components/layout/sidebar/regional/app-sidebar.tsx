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
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

// Menu items.
const items = [
  { title: "Home", url: "/regional/home", icon: Home },
  { title: "Search", url: "/regional/search", icon: Search },
  { title: "Bookmarks", url: "/regional/bookmarks", icon: Bookmark },
  { title: "Notification", url: "/regional/notification", icon: Bell },
  { title: "Help", url: "/regional/help", icon: Info },
  { title: "Profile", url: "/regional/profile", icon: User },
  { title: "Request", url: "/regional/request", icon: Send },
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
    setTimeout(() => {
      router.replace("/");
    }, 300);
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
                <button onClick={() => router.push("/regional/devotion")} className="px-4 py-3 border-2 border-gray-400 rounded-2xl text-center font-bold text-xl w-full transition-all duration-300 hover:bg-gray-300 active:scale-95">
                  Today&#39;s Devotion
                </button>
            {/* Button Region menggunakan Sheet */}
            <Sheet>
              <SheetTrigger className="px-4 py-3 border-2 border-gray-400 rounded-2xl text-center font-bold text-xl w-full transition-all duration-300 hover:bg-gray-300 active:scale-95">
                Region List
              </SheetTrigger>
              <SheetContent className={`w-full p-4 ${GeistSans.className}`}>
                <SheetHeader>
                  <SheetTitle className="text-2xl font-bold">Region</SheetTitle>
                </SheetHeader>
                <ul className="mt-4 space-y-4">
                  {regions.map((region, index) => (
                    <li key={index}>
                      <a href={region.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-4 px-4 py-3 rounded-lg hover:bg-gray-200 transition">
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                        <span className="text-lg">{region.name}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </SheetContent>
            </Sheet>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  );
}
