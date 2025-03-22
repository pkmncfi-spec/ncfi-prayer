import Layout from "~/components/layout/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Card, CardContent } from "~/components/ui/card";
import * as React from "react";
import SearchBar from "~/components/ui/searchbar";

export default function Page() {
  return (
    <Layout>
      <SidebarTrigger />
      <main className="flex flex-col w-full max-w-[500px] mx-auto min-h-screen overflow-auto">
        <Card className="flex flex-col w-full items-center justify-start flex-1">
          {/* Header */}
          <div className="relative w-full h-16 bg-gray-100 flex items-center px-4 border-b border-gray-300">
            <div className="absolute left-1/2 top-1/2 w-6 h-6 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Search */}
          <SearchBar />
          <div className="relative w-full h-2 bg-white flex items-center px-4 border-b border-gray-300"></div>

          {/* Konten yang pernah dicari */}
          <CardContent className="w-full p-4 space-y-4">
            <p className="text-gray-700">Recent searches will appear here.</p>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
