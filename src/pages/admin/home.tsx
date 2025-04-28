'use client';

import { useState, useEffect, useRef, useCallback } from "react"; 
import { getFirestore, collection, addDoc, query, onSnapshot, getDoc, doc, orderBy, where, deleteDoc, getDocs, Timestamp } from "firebase/firestore";
import { app } from "~/lib/firebase";
import Layout from "~/components/layout/sidebar-admin";
import { Separator } from "~/components/ui/separator";
import { GeistSans } from "geist/font/sans";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";
import Image from 'next/image';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Bookmark, BookmarkCheck, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "~/components/ui/sheet";
import axios from "axios";
import { useRouter } from "next/navigation";

const db = getFirestore(app);

interface Region {
  id: string;
  name: string;
  countries: string[];
}

const regions: Region[] = [
  { id: 'All', name: 'All', countries: [] },
  {
    id: 'africa',
    name: 'Africa',
    countries: ["Ghana", "Nigeria", "Sierra Leone", "Zambia"],
  },
  {
    id: 'cana',
    name: 'Caribbean & North America',
    countries: ["Canada", "Haiti", "USA"],
  },
  {
    id: 'europe',
    name: 'Europe',
    countries: ["Denmark", "United Kingdom & Ireland", "Finland", "Norway", "Spain"],
  },
  {
    id: 'latin america',
    name: 'Latin America',
    countries: ["Argentina", "Colombia", "Chile", "Cuba", "Ecuador"],
  },
  {
    id: 'pacea',
    name: 'Pacific & East Asia',
    countries: [ "Australia", "Fiji", "Hong Kong", "Indonesia", "Japan", "New Zealand", "Mongolia", "Papua New Guinea", "Philippines", "Singapore", "Malaysia", "South Korea", "Taiwan"],
  },
  {
    id: 'same',
    name: 'South Asia & Middle East',
    countries: ["Bangladesh", "India", "Nepal", "Pakistan"],
  },
];

interface Post {
  id: string;
  title: string;
  text: string;
  uid: string;
  createdAt?: string;
  imageURL?: string;
  regional?: string;
  country?: string;
  postFor?: string;
  status?: string;
  name: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const { user, loading } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [isOverflowing, setIsOverflowing] = useState<Record<string, boolean>>({});
  const paragraphRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeRegion, setActiveRegion] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState<string>("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false)

  const toggleRegionDropdown = useCallback(() => {
    setOpenDropdown(prev => prev === 'region' ? null : 'region');
  }, []);

  const toggleCountryDropdown = useCallback(() => {
    setOpenDropdown(prev => prev === 'country' ? null : 'country');
  }, []);

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

  const applyFilters = useCallback((postsToFilter = posts) => {
    let result = [...postsToFilter];
  
    // Filter by region
    if (activeRegion !== "All") {
      result = result.filter(post => post.regional === activeRegion);
    }
  
    // Filter by country
    if (selectedCountry !== "All") {
      result = result.filter(post => post.country === selectedCountry);
    }
  
    // Filter by status
    if (selectedStatus !== "All") {
      result = result.filter(post => post.status === selectedStatus);
    }
  
    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
  
      result = result.filter(post => {
        if (!post.createdAt) return false;
        const postDate = new Date(post.createdAt);
        return postDate >= start && postDate <= end;
      });
    } else if (startDate) {
      const start = new Date(startDate);
      result = result.filter(post => {
        if (!post.createdAt) return false;
        return new Date(post.createdAt) >= start;
      });
    } else if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(post => {
        if (!post.createdAt) return false;
        return new Date(post.createdAt) <= end;
      });
    }
  
    setFilteredPosts(result);
  }, [posts, activeRegion, selectedCountry, selectedStatus, startDate, endDate]);

  useEffect(() => {
    if (!startDate && !endDate) {
      setSelectedStatus('All');
    } else {
      setSelectedStatus('');
    }
  }, [startDate, endDate]);

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
  }, [filteredPosts]);

  useEffect(() => {
    if (selectedRegion === "All") {
      setFilteredCountries([]);
    } else {
      const selected = regions.find(r => r.id === selectedRegion);
      setFilteredCountries(selected?.countries || []);
    }
  }, [selectedRegion]);

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
          applyFilters(postsWithNames);
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
  }, [user, loading, activeRegion, applyFilters]);

  const handleSelectRegion = useCallback((regionId: string) => {
    setSelectedRegion(regionId);
    setSelectedCountry("All");
    setOpenDropdown(null);
  }, []);

  const handleSelectCountry = useCallback((country: string) => {
    setSelectedCountry(country);
    setOpenDropdown(null);
  }, []);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    handleResize(); // Check on initial render
    window.addEventListener("resize", handleResize); // Listen for window resize

    return () => {
        window.removeEventListener("resize", handleResize); // Cleanup listener
    };
  }, []);

  const handleResetFilters = useCallback(() => {
    setSelectedRegion("All");
    setSelectedCountry("All");
    setSelectedStatus("All");
    setStartDate("");
    setEndDate("");
    setActiveRegion("All");
    setFilteredCountries([]);
    applyFilters();
  }, [applyFilters]);

  const handleApplyFilters = useCallback(() => {
    setActiveRegion(selectedRegion);
    applyFilters();
    setSettingsSheetOpen(false);
  }, [selectedRegion, applyFilters]);

  const handleSeeMore = useCallback((postId: string) => {
    router.push("/admin/post/" + postId);
  }, [router]);

  return (
    <Layout>
      <div className="flex w-full">
      <div className={`${GeistSans.className} flex flex-col w-full max-w-[600px] border min-h-screen`}>
        <div className="fixed w-full bg-white max-w-[598px] z-20 top-0">
          <div className="flex flex-cols-2 mt-3">
            {isMobile ? (<div className="ml-2 mt-1.5">
              <SidebarTrigger />
            </div>): (<div className="ml-9 mt-1.5"></div>)}
            <div className="w-full items-center justify-center pr-2 pb-2">
              <Image 
                src="/favicon.ico" 
                alt="NFCI Prayer" 
                width={25} 
                height={25} 
                className="mx-auto"
                priority
              />
              <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
            </div>
            <button 
              onClick={() => setSettingsSheetOpen(true)}
              aria-label="Filter posts"
            >
              <SlidersHorizontal className="mr-2 mb-4 h-5 w-5 text-gray-600 rounded-md hover:bg-gray-100 transition" />
            </button>
          </div>
          <Separator className="mb-4 w-full" />
          
          <div className="flex h-1 mb-[1px] items-center justify-center text-sm w-full mx-auto">
            <button className="py-2 px-4 border-b-4 border-blue-500 font-semibold">
              Posts
            </button>
          </div>
          <Separator className="mt-4 w-full" />
        </div>

        <Sheet open={settingsSheetOpen} onOpenChange={setSettingsSheetOpen}>
          <SheetContent side="right" className={`${GeistSans.className} flex flex-col h-full p-0`}>
            <div className="p-4">
              <SheetHeader>
                <SheetTitle>Post Filter</SheetTitle>
                <div className="my-2 h-px bg-gray-300" />
              </SheetHeader>
            </div>

            <div className="flex-1 overflow-auto px-4 space-y-4">
              {/* Region Filter */}
              <div className="space-y-2">
                <label className="text-base font-medium">Regional</label>
              <div className="relative">
                <button
                  className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm text-left bg-white"
                  onClick={toggleRegionDropdown}
                >
                  <span>{selectedRegion && selectedRegion !== "All" ? regions.find(r => r.id === selectedRegion)?.name : "Select Region"}</span> 
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${openDropdown === 'region' ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdown === 'region' && (
                  <div className="absolute z-10 mt-1 w-full text-sm  bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <ul className="py-1">
                      {regions.filter(region => region.name !== "All").map((region) => (
                          <li
                            key={region.id}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                              selectedRegion === region.id ? "bg-blue-50 text-blue-600" : ""
                            }`}
                            onClick={() => handleSelectRegion(region.id)}
                            role="option"
                            aria-selected={selectedRegion === region.id}
                          >
                            {region.name}
                          </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

              {/* Country Filter */}
              <div className="space-y-2">
                <label className="text-base font-medium">Country</label>
              <div className="relative">
                <button
                  className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-left text-sm  bg-white"
                  onClick={toggleCountryDropdown}
                >
                  <span>{selectedCountry && selectedCountry !== "All" ? selectedCountry : "Select Country"}</span>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${openDropdown === 'country' ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {openDropdown === 'country' && (
                    <div 
                      className="absolute z-10 mt-1 w-full text-sm  bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto"
                      role="listbox"
                    >
                      <ul className="py-1 max-h-48 overflow-y-auto">
                        {(selectedRegion === "All"
                          ? regions.flatMap(region => region.countries)
                          : regions.find(region => region.id === selectedRegion)?.countries || []
                        ).map((country) => (
                          <li
                            key={country}
                            className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                              selectedCountry === country ? "bg-blue-50 text-blue-600" : ""
                            }`}
                            onClick={() => handleSelectCountry(country)}
                            role="option"
                            aria-selected={selectedCountry === country}
                          >
                            {country}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-base font-medium">Dates</label>
                <div className="flex items-center gap-2">
                  {/* Start Date */}
                  <div className="relative w-[120px]">
                    {!startDate && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-800 pointer-events-none">
                        None
                      </span>
                    )}
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full border rounded-md px-3 py-2 text-xs ${
                        !startDate ? "text-transparent" : "text-black"
                      }`}
                      max={endDate || undefined}
                    />
                  </div>

                  <span className="text-gray-500">-</span>

                  {/* End Date */}
                  <div className="relative w-[120px]">
                    {!endDate && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-800 pointer-events-none">
                        None
                      </span>
                    )}
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full border rounded-md px-3 py-2 text-xs ${
                        !endDate ? "text-transparent" : "text-black"
                      }`}
                      min={startDate || undefined}
                    />
                  </div>

                  <button
                    className={`justify-end ml-auto border rounded-md px-3 py-2 text-sm ${
                      selectedStatus === 'All'
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setSelectedStatus('All');
                    }}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t p-4">
              <div className="flex justify-right gap-2">
                <button
                  onClick={handleResetFilters}
                  className="py-1 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="py-1 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-700 transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <Separator className="mb-2 w-full" />

        {/* Post List */}
        <div className="justify-center pt-24 w-full flex flex-col">
          {/* Region Filter Buttons */}
          <div className="w-full overflow-x-auto px-2 sticky top-[97px] bg-white py-2 border-l border-b">
            <div className="flex space-x-2 pt-1">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => {
                    setActiveRegion(region.id);
                    applyFilters();
                  }}
                  className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition 
                    ${activeRegion === region.id 
                      ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"}`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>

          {/* Filtered Posts */}
          {(() => {
            const visiblePosts = filteredPosts.filter(
              (post) => activeRegion === "All" || post.regional === activeRegion
            );

            return visiblePosts.map((post) => (
              <div key={post.id} className="grid grid-cols-[40px_1fr] items-start border-b pb-2 pt-2">
                <div>
                  <Image
                    src="/image.png"
                    alt="NFCI Prayer"
                    width={30}
                    height={30}
                    className="rounded-full ml-5 mt-1"
                  />
                </div>
                <button onClick={() => handleSeeMore(post.id)} className="hover:cursor-pointer">
                  <div className="pl-4">
                    <div className="flex gap-1 items-center">
                      <p className="font-bold text-lg">{post.name}</p>
                      <p className="flex pr-10 text-muted-foreground">
                        &#x2022; {post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown Date"}
                      </p>
                    </div>
                    <p className="text-left font-semibold text-gray-700 whitespace-normal break-all pr-10">
                      {post.title ? post.title : "No Title"}
                    </p>
                    <p
                      ref={(el) => {
                        paragraphRefs.current[post.id] = el;
                      }}
                      className="text-left whitespace-normal break-all overflow-hidden pr-10 line-clamp-3"
                    >
                      {post.text}
                    </p>

                    {isOverflowing[post.id] && (
                      <p className="text-left text-blue-500 hover:underline hover:cursor-pointer">
                        ...see more
                      </p>
                    )}

                    {post.imageURL && (
                      <div className="w-full mt-2 pr-10">
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
                </button>
              </div>
            ));
          })()}

          {/* Empty State */}
          {filteredPosts.filter(post => 
            activeRegion === "All" || post.regional === activeRegion
          ).length === 0 && (
            <div className="text-center py-10 text-gray-500">
              {activeRegion === "All" 
                ? "No posts available" 
                : `No posts found`}
            </div>
          )}
        </div>
        </div>
        </div>
    </Layout>
  );
}
