// components/Layout.tsx
import { AppSidebar } from "~/components/app-sidebar";
import { SidebarProvider } from "../ui/sidebar";
import { type ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar tetap di kiri */}
        <aside className="w-64 border-r min-h-screen fixed left-0 top-0">
          <AppSidebar />
        </aside>

        {/* Konten utama, geser ke kanan dengan padding-left */}
        <div className="flex flex-1 justify-center pl-64">
          <main className="max-w-2xl w-full p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}