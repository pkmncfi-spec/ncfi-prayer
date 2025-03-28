import Layout from "~/components/layout/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import * as React from "react";
import SearchBar from "~/components/ui/searchbar";

export default function Page() {
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
        </div>

        {/* Search */}
        <SearchBar />
        <div className="relative w-full h-2 bg-white flex items-center px-4 border-b border-gray-300"></div>

        {/* Konten yang pernah dicari */}
        <div className="w-full p-4 space-y-4">
          <p className="text-gray-700">Recent searches will appear here.</p>
        </div>
      </main>
    </Layout>
  );
}
