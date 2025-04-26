import { GeistSans } from "geist/font/sans";
import {
  Bell,
  Bookmark,
  Home,
  Info,
  LogOut,
  Search,
  Send,
  User
} from "lucide-react";
import Link from "next/link";

import { getAuth, signOut } from "firebase/auth";
import { useRouter } from "next/router";
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


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";

// Menu items.
const items = [
  { title: "Home", url: "/international/home", icon: Home },
  { title: "Search", url: "/international/search", icon: Search },
  { title: "Bookmarks", url: "/international/bookmarks", icon: Bookmark },
  { title: "Notification", url: "/international/notification", icon: Bell },
  { title: "Help", url: "/international/help", icon: Info },
  { title: "Profile", url: "/international/profile", icon: User },
  { title: "Request", url: "/international/request", icon: Send },
  { title: "Log Out", url: "/login", icon: LogOut },
];

const regions = [
  { name: "Afrika", url: "https://ncfi.org/regions/africa/" },
  { name: "Caribbean and North America", url: "https://ncfi.org/regions/caribbean-and-north-america/" },
  { name: "Europe", url: "https://ncfi.org/regions/europe/" },
  { name: "Latin America", url: "https://ncfi.org/regions/latin-america" },
  { name: "Pacific And East Asia", url: "https://ncfi.org/regions/pacific-and-east-asia/" },
  { name: "South Asia And Middle East", url: "https://ncfi.org/regions/south-asia-and-middle-east/" }
];

const country = [
  "Ghana",
  "Nigeria",
  "Sierra Leone",
  "Zambia",
  "Canada",
  "Haiti",
  "USA",
  "Denmark",
  "United Kingdom & Ireland",
  "Finland",
  "Norway",
  "Spain",
  "Argentina",
  "Colombia",
  "Chile",
  "Cuba",
  "Ecuador",
  "Australia",
  "Fiji",
  "Hong Kong",
  "Indonesia",
  "Japan",
  "New Zealand",
  "Mongolia",
  "Papua New Guinea",
  "Philippines",
  "Singapore",
  "Malaysia",
  "South Korea",
  "Taiwan",
  "Bangladesh",
  "India",
  "Nepal",
  "Pakistan"
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
                <button onClick={() => {router.push("/international/devotion")}} className="px-4 py-3 border-2 border-gray-400 rounded-2xl text-center font-bold text-xl w-full transition-all duration-300 hover:bg-gray-300 active:scale-95">
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
