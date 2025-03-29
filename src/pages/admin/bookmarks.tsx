import Layout from "~/components/layout/sidebar-member";
import { SidebarTrigger } from "~/components/ui/sidebar";
import Image from "next/image";
import SearchBar from "~/components/ui/searchbar";
import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";

export default function SearchPage() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookmarked, setBookmarked] = useState<boolean[]>([]);
  const [allBookmarkedItems, setAllBookmarkedItems] = useState<string[]>(["Prayer", "Faith", "Hope", "Love"]);

  const handleSearch = (query: string) => {
    if (!query) return;

    setHasSearched(true);

    if (!recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches]);
    }

    const results = mockSearchFunction(query);
    setSearchResults(results);
  };

  const mockSearchFunction = (query: string) => {
    return allBookmarkedItems.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  };

  useEffect(() => {
    setBookmarked(new Array(searchResults.length).fill(true));
  }, [searchResults]);

  useEffect(() => {
    setSearchResults(allBookmarkedItems);
  }, []);

  const toggleBookmark = (index: number) => {
    setBookmarked((prev) => {
      const newBookmarks = [...prev];
      newBookmarks[index] = !newBookmarks[index];
      return newBookmarks;
    });
    
    setAllBookmarkedItems((prev) => {
      const item = searchResults[index];
      if (!item) return prev;
      return prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item];
    });
  };

  return (
    <Layout>
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        <div className="fixed w-full bg-white max-w-[598px]">
          <div className="flex flex-col w-full items-center justify-center">
            <div className="sticky top-3 bg-white w-full z-10 py-3">
              <div className="flex items-center justify-between px-4">
                <SidebarTrigger />
                <div className="flex flex-col items-center justify-center pr-7 w-full">
                  <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
                  <p className="text-sm text-center text-muted-foreground">NCFI Prayer</p>
                </div>
              </div>
              <div className="w-full h-4 border-b border-gray-300"></div>
            </div>
          </div>

          <SearchBar onSearch={handleSearch} />
          <Separator className="my-2" />

          <div className="p-4">
            {hasSearched && searchResults.length === 0 && (
              <p className="text-center text-gray-500">Not Found</p>
            )}

            {searchResults.map((result, index) => (
              bookmarked[index] && (
                <div
                  key={index}
                  className="bg-white p-3 rounded-xl flex items-center border border-gray-300 shadow-sm mb-2 justify-between"
                >
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">{result}</p>
                    <a href="#" className="text-blue-500 text-xs">...click to see more</a>
                  </div>
                  <button
                    onClick={() => toggleBookmark(index)}
                    className="p-1 rounded-full hover:bg-gray-100 flex justify-center items-center"
                  >
                    <Bookmark
                      className={allBookmarkedItems.includes(result) ? "text-blue-500 fill-current" : "text-gray-500"}
                      size={18}
                    />
                  </button>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
