// components/Layout.tsx
import { AppSidebar } from "~/components/layout/sidebar/member/app-sidebar";
import { SidebarProvider, useSidebar } from "../ui/sidebar";
import { type ReactNode } from "react";
import React, { useEffect, useState } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayout>{children}</MainLayout>
    </SidebarProvider>
  );
}

function MainLayout({ children }: { children: ReactNode }) {
  const { isMobile } = useSidebar();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(!isMobile); 
  }, [isMobile]);

  console.log("Sidebar open:", isMobile);

  return (
    <div className="flex w-full min-h-screen ">
  {/* Wrapper Sidebar */}
  <aside className={`border-r min-h-screen fixed left-0 top-0  ${isOpen ? "w-64" : "w-0"}`}>
    <AppSidebar />
  </aside>

  {/* Wrapper Konten */}
  <div
    className={`flex flex-1  ${
      isOpen ? "ml-64" : "ml-0"
    } justify-center`}
  >
    <main className="max-w-2xl w-full">{children}</main>
  </div>
</div>

  );
}
