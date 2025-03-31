import { useState } from "react";
import { usePathname } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, pageType: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const pathname = usePathname();

  // Menentukan jenis halaman berdasarkan URL
  const pageType = pathname.includes("bookmarks") ? "bookmarks" : "search";

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim(), pageType);
      if (pageType === "search") {
        setRecentSearches((prev) => [searchQuery, ...prev.filter(q => q !== searchQuery)].slice(0, 5));
      }
      setQuery(""); // Membersihkan search bar setelah pencarian
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(query);
    }
  };

  return (
    <div className="relative w-full max-w-[580px] mx-auto">
      <div className="relative border border-gray-200 rounded-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600" size={20} />
        <Input
          type="text"
          placeholder={pageType === "search" ? "Search by region..." : "Search bookmarks..."}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>
      {pageType === "search" && recentSearches.length > 0 && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-md p-2">
          <p className="text-gray-600 text-sm mb-1">Recent Searches:</p>
          <ul>
            {recentSearches.map((search, index) => (
              <li key={index}>
                <button
                  onClick={() => setQuery(search)}
                  className="w-full text-left p-1 flex items-center hover:bg-gray-100 rounded cursor-pointer text-gray-800"
                >
                  <Search className="mr-2 text-gray-600" size={16} />
                  {search}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
