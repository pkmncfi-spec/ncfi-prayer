import Layout from "~/components/layout/sidebar-regional";
import { SidebarTrigger } from "~/components/ui/sidebar";
import Image from 'next/image';
import SearchBar from "~/components/ui/searchbar";
import { useState } from "react";
import { Separator } from "~/components/ui/separator";

export default function SearchPage() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (query: string) => {
    if (!query) return;
    
    setHasSearched(true);
    
    if (!recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches]);
    }
    
    const results = mockSearchFunction(query);
    setSearchResults(results);
  };

  // Fungsi pencarian simulasi
  const mockSearchFunction = (query: string) => {
    const mockData = ["Prayer", "Faith", "Hope", "Love"];
    return mockData.filter(item => item.toLowerCase().includes(query.toLowerCase()));
  };

  return (
    <Layout>
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        <div className="fixed w-full bg-white max-w-[598px]">
          {/* Header */}
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
          
          {/* Search */}
          <SearchBar onSearch={handleSearch} />
          <Separator className="my-2" />
          
          {/* Search Results */}
          <div className="p-4">
            {hasSearched && searchResults.length === 0 && (
              <p className="text-center text-gray-500">Not Found</p>
            )}
            {searchResults.length > 0 && (
              <ul>
                {searchResults.map((result, index) => (
                  <li key={index} className="py-1">{result}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
