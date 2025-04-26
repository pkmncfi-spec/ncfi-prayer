import { GeistSans } from "geist/font/sans";
import Layout from "~/components/layout/sidebar-member";
import { SidebarTrigger } from "~/components/ui/sidebar";
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from "react";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { getFirestore, collection, query, getDocs, orderBy, doc, getDoc, where, Timestamp, onSnapshot } from "firebase/firestore";
import { app } from "~/lib/firebase";
import { useRouter } from "next/router";
import { useAuth } from "~/context/authContext";

interface Post {
  id: string;
  title: string;
  text: string;
  uid: string;
  createdAt: string;
  imageURL?: string;
  country?: string;
  regional?: string;
  postFor?: string;
  status?: string;
  name: string;
}

type User = {
  uid: string; // Use uid as the unique identifier
  username: string;
};

export default function SearchPage() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOverflowing, setIsOverflowing] = useState<Record<string, boolean>>({});
  const [activeRegion, setActiveRegion] = useState("All");
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const resultsContainerRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [isMobile, setIsMobile] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const { user, loading } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  const db = getFirestore(app);

  // Store search state in session storage with user-specific key
  useEffect(() => {
    if (!user?.uid) return;
    const userSpecificKey = `searchData_${user.uid}`;
    const savedSearchData = sessionStorage.getItem(userSpecificKey);
    
    if (savedSearchData) {
      try {
        const { searchQuery: savedQuery, searchResults: savedResults } = JSON.parse(savedSearchData);
        if (savedQuery) {
          setSearchQuery(savedQuery);
          setHasSearched(true);
        }
        if (savedResults) {
          setSearchResults(savedResults);
        }
      } catch (error) {
        console.error('Error parsing search data:', error);
      }
    }
  }, [user?.uid]);

  // Save search state to session storage with user-specific key
  useEffect(() => {
    if (!user?.uid || !hasSearched) return;

    const userSpecificKey = `searchData_${user.uid}`;
    const searchData = {
      searchQuery,
      searchResults
    };
    
    try {
      sessionStorage.setItem(userSpecificKey, JSON.stringify(searchData));
    } catch (error) {
      console.error('Error saving search data:', error);
    }
  }, [searchQuery, searchResults, hasSearched, user?.uid]);

  const formatDate = useCallback((dateInput: string | Date): string => {
    try {
      const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      }).format(date);
    } catch {
      return "Unknown Date";
    }
  }, []);

  // Save recent searches to localStorage with user-specific key
  useEffect(() => {
    if (!user?.uid) return;

    const userSpecificKey = `recentSearches_${user.uid}`;
    const savedSearches = localStorage.getItem(userSpecificKey);
    
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (error) {
        console.error('Error parsing recent searches:', error);
        setRecentSearches([]);
      }
    }
  }, [user?.uid]);

  // Load recent searches from localStorage with user-specific key
  useEffect(() => {
    if (!user?.uid) return;

    const userSpecificKey = `recentSearches_${user.uid}`;
    try {
      localStorage.setItem(userSpecificKey, JSON.stringify(recentSearches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  }, [recentSearches, user?.uid]);

  useEffect(() => {
    const checkOverflow = () => {
      const newOverflowState: Record<string, boolean> = {};
      Object.entries(paragraphRefs.current).forEach(([postId, element]) => {
        if (element) {
          const isOverflow = element.scrollHeight > element.clientHeight;
          newOverflowState[postId] = isOverflow;
        }
      });
      setIsOverflowing(newOverflowState);
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [posts, searchResults]);

  useEffect(() => {
    let unsubscribePosts: () => void;
    let unsubscribeBookmarks: () => void;

    const fetchData = async () => {
      try {
        if (!user?.uid) return;

        let postsQuery;
        
        if (activeRegion === "All") {
          postsQuery = query(
            collection(db, "posts"), 
            orderBy("createdAt", "desc")
          );
        } else {
          postsQuery = query(
            collection(db, "posts"),
            where("regional", "==", activeRegion),
            orderBy("createdAt", "desc")
          );
        }
        
        unsubscribePosts = onSnapshot(postsQuery, async (querySnapshot) => {
          const postsData: Post[] = [];
          const usersMap: Record<string, string> = {};
          
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            postsData.push({
              id: doc.id,
              title: data.title || "",
              text: data.text || "",
              uid: data.uid,
              createdAt: data.createdAt instanceof Timestamp 
                ? data.createdAt.toDate().toISOString() 
                : new Date().toISOString(),
              imageURL: data.imageURL || "",
              regional: data.regional || "Unknown", 
              country: data.country || "Unknown",  
              postFor: data.postFor || "",
              status: data.status || "",
              name: "Unknown",
            });            
            
            if (data.uid && !usersMap[data.uid]) {
              usersMap[data.uid] = "";
            }
          }

          const userPromises = Object.keys(usersMap).map(async (uid) => {
            const userDoc = await getDoc(doc(db, "users", uid));
            usersMap[uid] = userDoc.exists() 
              ? (userDoc.data() as { name: string }).name 
              : "Unknown";
          });

          await Promise.all(userPromises);

          const postsWithNames = postsData.map(post => ({
            ...post,
            name: usersMap[post.uid] || "Unknown"
          }));

          setPosts(postsWithNames);
        });

        if (user?.uid) {
          const bookmarksQuery = query(
            collection(db, "bookmarks"),
            where("uid", "==", user.uid)
          );

          unsubscribeBookmarks = onSnapshot(bookmarksQuery, (querySnapshot) => {
            const bookmarkedIds = querySnapshot.docs.map(doc => doc.data().postId);
            setBookmarkedPosts(bookmarkedIds);
          });
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    return () => {
      if (unsubscribePosts) unsubscribePosts();
      if (unsubscribeBookmarks) unsubscribeBookmarks();
    };
  }, [user, loading, activeRegion, db]);

  const handleSearch = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      if (user?.uid) {
        const userSpecificKey = `searchData_${user.uid}`;
        sessionStorage.removeItem(userSpecificKey);
      }
      return;
    }
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const searchTermLower = searchTerm.toLowerCase();
      
      const results = posts.filter(post => {
        const title = post.title || "";
        const text = post.text || "";
        return (
          title.toLowerCase().includes(searchTermLower) || 
          text.toLowerCase().includes(searchTermLower)
        );
      });
      
      setSearchResults(results);
      
      if (searchTerm && !recentSearches.includes(searchTerm)) {
        setRecentSearches(prev => [searchTerm, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [posts, recentSearches, user?.uid]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setHasSearched(false);
      if (user?.uid) {
        const userSpecificKey = `searchData_${user.uid}`;
        sessionStorage.removeItem(userSpecificKey);
      }
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch, user?.uid]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    if (user?.uid) {
      const userSpecificKey = `searchData_${user.uid}`;
      sessionStorage.removeItem(userSpecificKey);
    }
  }, [user?.uid]);

  const highlightText = useCallback((text: string | undefined, query: string) => {
    if (!text || !query) return text || '';
    
    try {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.split(regex).map((part, i) => 
        part.toLowerCase() === query.toLowerCase() ? 
        <span key={i} className="bg-yellow-200">{part}</span> : 
        part
      );
    } catch (error) {
      console.error('Error highlighting text:', error);
      return text;
    }
  }, []);

  useEffect(() => {
    // Detect if the screen width is mobile
    const handleResize = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize); // Listen for window resize

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup listener
    };
  }, []);

  const handleSeeMore = async (postId: string) => {
    if (user?.uid) {
      const userSpecificKey = `searchData_${user.uid}`;
      const searchData = {
        searchQuery,
        searchResults
      };
      sessionStorage.setItem(userSpecificKey, JSON.stringify(searchData));
    }
    await router.push("/member/post/" + postId);
  }

  return (
    <Layout>
      <div className={`flex flex-col w-full max-w-[600px] border min-h-screen ${GeistSans.className}`}>
        <div className="fixed w-full bg-white max-w-[598px]">
          {/* Header */}
          <div className="flex flex-cols mt-3 border-b pb-2">
            {isMobile ? (<div className="ml-2 mt-1.5">
              <SidebarTrigger />
            </div>): (<div className="ml-10 mt-1.5"></div>)}
            <div className="w-full items-center justify-center pr-10">
              <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
              <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
            </div>
          </div>
          
          {/* Custom Search Bar */}
          <div className="px-4 py-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or content..."
                className={`w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${GeistSans.className}`}
                aria-label="Search posts"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${GeistSans.className}`}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <Separator className="mb-4" />
          
          {/* Search Results */}
          <div 
            ref={resultsContainerRef}
            className={`px-4 py-2 overflow-y-auto ${GeistSans.className}`}
            style={{ maxHeight: 'calc(100vh - 165px)' }}
          >
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-4 border-b">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-3 w-1/3 mt-2" />
                  </div>
                ))}
              </div>
            ) : hasSearched ? (
              searchResults.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 mb-2">
                  <h1 className={`text-2xl font-bold text-left   ${GeistSans.className}`}>
                    Post
                  </h1>
                    Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
                  </p>
                  {searchResults.map((post) => (
                    <button 
                      key={post.id} 
                      onClick={() => handleSeeMore(post.id)} 
                      className={`w-full text-left hover:bg-gray-200 transition-colors rounded-3xl border border-gray-300 shadow-sm ${GeistSans.className}`}
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-full bg-gray-400 mt-1 flex-shrink-0" />
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <p className="font-bold text-lg">{post.country}</p>
                              <p className="text-muted-foreground">
                                &#x2022; {post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown Date"}
                              </p>
                            </div>
                            
                            <p className={`text-left font-semibold text-gray-700 whitespace-normal break-all ${GeistSans.className}`}>
                              {highlightText(post.title, searchQuery) || "No Title"}
                            </p>
                            
                            <p
                              ref={(el) => {
                                paragraphRefs.current[post.id] = el;
                              }}
                              className={`text-left whitespace-normal break-all overflow-hidden line-clamp-3 ${GeistSans.className}`}
                            >
                              {highlightText(post.text, searchQuery)}
                            </p>
                            
                            {isOverflowing[post.id] && (
                              <p className={`text-left text-blue-500 hover:underline hover:cursor-pointer ${GeistSans.className}`}>
                                ...see more
                              </p>
                            )}
                            
                            {post.imageURL && (
                              <div className="w-full mt-2">
                                <Image
                                  src={post.imageURL}
                                  alt="Post Image"
                                  width={500}
                                  height={300}
                                  className="text-left rounded-lg object-cover max-h-[200px] mb-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={`flex flex-col items-center justify-center py-8 ${GeistSans.className}`}>
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                  {recentSearches.length > 0 && (
                    <>
                      <p className="text-sm text-gray-400 mt-4 mb-2">Recent searches:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(search)}
                            className={`px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors ${GeistSans.className}`}
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            ) : recentSearches.length > 0 && (
              <div className={`py-4 ${GeistSans.className}`}>
                <p className="text-sm text-gray-400 mb-2">Recent searches:</p>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => setSearchQuery(search)}
                      className={`px-3 py-1 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors ${GeistSans.className}`}
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
