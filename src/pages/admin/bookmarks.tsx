"use client";

import Layout from "~/components/layout/sidebar-member";
import { SidebarTrigger } from "~/components/ui/sidebar";
import SearchBar from "~/components/ui/searchbar";
import { Bookmark } from "lucide-react";
import { useState } from "react";

export default function Bookmarks() {
  const [bookmarked, setBookmarked] = useState([true, true, true]);

  const toggleBookmark = (index) => {
    setBookmarked((prev) => {
      const newBookmarks = [...prev];
      newBookmarks[index] = !newBookmarks[index];
      return newBookmarks;
    });
  };

  return (
    <Layout>
      <SidebarTrigger />
      <main className="flex flex-col w-full max-w-[500px] mx-auto border min-h-screen">
        <div className="flex flex-col w-full items-center justify-center">
          <div className="flex flex-col items-center mt-2 w-full">
            <img src="favicon.ico" alt="NFCI Prayer" width="25" height="25" className="mx-auto" />
            <p className="text-sm text-muted-foreground">NCFI Prayer</p>
            <div className="relative w-full h-4 bg-gray-000 flex items-center border-b border-gray-300"></div>
          </div>
        </div>

        <SearchBar />
        <div className="relative w-full h-2 bg-white flex items-center px-4 border-b border-gray-300"></div>

        {bookmarked.map((isBookmarked, index) => (
          isBookmarked && (
            <div key={index} className="bg-white p-3 rounded-xl flex items-start border border-gray-300 shadow-sm mb-2 justify-between">
              <div className="flex-1">
                <a href="#" className="text-blue-500 text-xs">...click to see more</a>
              </div>
              <button onClick={() => toggleBookmark(index)} className="p-1 rounded-full hover:bg-gray-100">
                <Bookmark className={isBookmarked ? "text-blue-500 fill-current" : "text-gray-500"} size={18} />
              </button>
            </div>
          )
        ))}
      </main>
    </Layout>
  );
}
