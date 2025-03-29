import Layout from "~/components/layout/sidebar-member";
import { SidebarTrigger } from "~/components/ui/sidebar";
import * as React from "react";

export default function RequestPage() {
  return (
    <Layout>
      <SidebarTrigger />
      <main className="flex flex-col w-full max-w-[500px] mx-autoborder min-h-screen">
        {/* Header */}
        <div className="flex flex-col w-full items-center justify-center">
          <div className="flex flex-col items-center mt-2 w-full">
            <img src="favicon.ico" alt="NFCI Prayer" width="25" height="25" className="mx-auto" />
            <p className="text-sm text-muted-foreground">NCFI Prayer</p>
            <div className="relative w-full h-4 bg-gray-000 flex items-center border-b border-gray-300"></div>
          </div>
          {/* Konten Post Request yang dilakukan */}
          <div className="flex flex-col w-full min-h-screen"></div>
        </div>
      </main>
    </Layout>
  );
}
