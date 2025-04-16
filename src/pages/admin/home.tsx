'use client';

import { useState, useEffect, useRef } from "react"; 
import { getFirestore, collection, addDoc, query, onSnapshot, getDoc, doc, orderBy, where, deleteDoc, getDocs, Timestamp } from "firebase/firestore";
import { app } from "~/lib/firebase";
import Layout from "~/components/layout/sidebar-member";
import { Separator } from "~/components/ui/separator";
import { GeistSans } from "geist/font/sans";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";
import Image from 'next/image';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Bookmark, BookmarkCheck, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "~/components/ui/sheet";
import axios from "axios";
import router from "next/router";

const db = getFirestore(app);


const regions = [
  { id: 'All', name: 'All' },
  { id: 'africa', name: 'Africa' },
  { id: 'cana', name: 'Caribean & North America' },
  { id: 'europe', name: 'Europe' },
  { id: 'latin america', name: 'Latin America' },
  { id: 'pacea', name: 'Pacific & East Asia' },
  { id: 'same', name: 'South Asia & Middle East' },
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
  const { user, loading } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [isOverflowing, setIsOverflowing] = useState<Record<string, boolean>>({});
  const paragraphRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeRegion, setActiveRegion] = useState("All");
  const [openRegionDropdown, setOpenRegionDropdown] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [openCountryDropdown, setOpenCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("All");

  // Sample country data - replace with your actual country list
  const countries = ["All", "Argentina", "Australia", "Bangladesh", "Canada", "Chile", "Colombia", "Cuba", "Haiti", "Hong Kong", "Denmark", "Ecuador", "Finland", "Ghana", "India", "Indonesia", "Japan", "Malaysia", "Mongolia", "Nepal", "New Zealand", "Nigeria", "Norway", "Pakistan", "Papua New Guinea", "Philippines", "Sierra Leone", "Singapore", "Spain", "United Kingdom & Ireland", "USA", "South Korea", "Taiwan"];

  useEffect(() => {
    let unsubscribePosts: () => void;
    let unsubscribeBookmarks: () => void;

    const fetchData = async () => {
      try {
        if (!user?.uid) return;

        // Create query based on activeRegion
        let postsQuery;
        
        if (activeRegion === "All") {
          postsQuery = query(
            collection(db, "posts"), 
            orderBy("createdAt", "desc")
          );
        } else {
          postsQuery = query(
            collection(db, "posts"),
            where("regional", "==", activeRegion), // ✅ pakai "regional"
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

          // Fetch user names
          const userPromises = Object.keys(usersMap).map(async (uid) => {
            const userDoc = await getDoc(doc(db, "users", uid));
            usersMap[uid] = userDoc.exists() 
              ? (userDoc.data() as { name: string }).name 
              : "Unknown";
          });

          await Promise.all(userPromises);

          setPosts(postsData.map(post => ({
            ...post,
            name: usersMap[post.uid] || "Unknown"
          })));
        });

        // Fetch bookmarks
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
  }, [user, loading, activeRegion]);

  useEffect(() => {
    // Check overflow after posts are rendered
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
  }, [posts]);

  function formatDate(dateInput: string | Date): string {
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
    }

  const toggleBookmark = async (postId: string) => {
    if (!user?.uid) return;

    try {
      const bookmarksQuery = query(
        collection(db, "bookmarks"),
        where("uid", "==", user.uid),
        where("postId", "==", postId)
      );

      const querySnapshot = await getDocs(bookmarksQuery);

      if (!querySnapshot.empty) {
        const bookmarkDocId = querySnapshot.docs[0]?.id;
        if (!bookmarkDocId) return;
        await deleteDoc(doc(db, "bookmarks", bookmarkDocId));
        setBookmarkedPosts(prev => prev.filter(id => id !== postId));
      } else {
        await addDoc(collection(db, "bookmarks"), {
          uid: user.uid,
          postId: postId,
          createdAt: new Date()
        });
        setBookmarkedPosts(prev => [...prev, postId]);
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleSelectRegion = (region: string) => {
    setSelectedRegion(region);
    setOpenRegionDropdown(false);
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setOpenCountryDropdown(false);
  };

  const handleResetFilters = () => {
    setSelectedRegion("All");
    setSelectedCountry("All");
    setStartDate("");
    setEndDate("");
    setActiveRegion("All");
  };

  const handleApplyFilters = () => {
    setActiveRegion(selectedRegion);
    setSettingsSheetOpen(false);
  };

  const handleSeeMore = async (postId: string) => {
    await router.push("/regional/post/" + postId);
  }

  return (
    <Layout>
      <div className={`${GeistSans.className} flex flex-col w-full max-w-[600px] border min-h-screen`}>
        <div className="fixed w-full bg-white max-w-[598px]">
          <div className="flex flex-cols-2 mt-4">
            <SidebarTrigger />
            <div className="w-full items-center justify-center pr-7">
              <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
              <p className="text-sm text-center text-muted-foreground">NCFI Prayer</p>
            </div>
            <button onClick={() => setSettingsSheetOpen(true)}>
              <SlidersHorizontal className="mr-2 h-5 w-5 text-gray-600 rounded-md hover:bg-gray-100 transition" />
            </button>
          </div>
          <Separator className="mb-4 w-full" />
          
          {/* Tab Post */}
          <div className="flex h-1 mb-[1px] items-center justify-center text-sm w-full mx-auto">
            <button className="py-2 px-4 border-b-4 border-blue-400 font-semibold">
              Posts
            </button>
          </div>
          <Separator className="mt-4 w-full" />
        </div>

        <Sheet open={settingsSheetOpen} onOpenChange={setSettingsSheetOpen}>
          <SheetContent side="right" className={`${GeistSans.className} flex flex-col h-full p-0`}>
            {/* Header */}
            <div className="p-4">
              <SheetHeader>
                <SheetTitle>Post Filter</SheetTitle>
                <div className="my-2 h-px bg-gray-300" />
              </SheetHeader>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto px-4 space-y-4">
              {/* Region */}
              <div>
                <label className="text-sm font-medium block mb-1">Regional</label>
                <div className="relative">
                  <div
                    className="w-full border rounded-md px-3 py-2 cursor-pointer bg-white"
                    onClick={() => setOpenRegionDropdown(!openRegionDropdown)}
                  >
                    {selectedRegion}
                  </div>

                  {openRegionDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto">
                      <ul className="divide-y divide-gray-100">
                        {regions.map((region, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectRegion(region.id)}
                          >
                            {region.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="text-sm font-medium block mb-1">Country</label>
                <div className="relative">
                  <div
                    className="w-full border rounded-md px-3 py-2 cursor-pointer bg-white"
                    onClick={() => setOpenCountryDropdown(!openCountryDropdown)}
                  >
                    {selectedCountry}
                  </div>

                  {openCountryDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow max-h-48 overflow-y-auto">
                      <ul className="divide-y divide-gray-100">
                        {countries.map((country, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleSelectCountry(country)}
                          >
                            {country}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div>
                <label className="text-sm font-medium block mb-1">Dates</label>
                <div className="flex items-center space-x-2">
                  {/* Start Date */}
                  <div className="relative w-28">
                    {startDate === "" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm pointer-events-none">
                        None
                      </span>
                    )}
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`border rounded-md px-2 py-1 text-sm w-full ${
                        startDate === "" ? "text-transparent" : "text-black"
                      }`}
                    />
                  </div>

                  <span className="text-gray-500">-</span>

                  {/* End Date */}
                  <div className="relative w-28">
                    {endDate === "" && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-sm pointer-events-none">
                        None
                      </span>
                    )}
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`border rounded-md px-2 py-1 text-sm w-full ${
                        endDate === "" ? "text-transparent" : "text-black"
                      }`}
                    />
                  </div>

                  {/* All Button */}
                  <div className="relative justify-end">
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                    className="text-sm text-black bg-white px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 transition"
                  >
                    All
                  </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <SheetFooter className="border-t border-gray-200 px-4 py-4">
              <div className="flex justify-right w-full space-x-2">
                <button 
                  onClick={handleResetFilters}
                  className="bg-blue-500 text-white rounded-full px-4 py-1 text-sm hover:bg-blue-700 transition"
                >
                  Reset
                </button>
                <button 
                  onClick={handleApplyFilters}
                  className="bg-blue-500 text-white rounded-full px-4 py-1 text-sm hover:bg-blue-700 transition"
                >
                  Apply
                </button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Separator className="mb-2 w-full" />

        {/* Post List */}
        <div className="justify-center pt-24 w-full flex flex-col">
          {/* Region Filter Buttons */}
          <div className="w-full overflow-x-auto px-2 sticky top-[104px] bg-white z-10 py-2 border-b">
            <div className="flex space-x-2 pb-2">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => setActiveRegion(region.id)}
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
          {posts
            .filter(post => 
              activeRegion === "All" || post.regional === activeRegion
            )
            .map((post) => (
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
            
                    {post.imageURL ? (
                      <div className="w-full mt-2 pr-10">
                        <Image
                          src={post.imageURL}
                          alt="Post Image"
                          width={500}
                          height={300}
                          className="text-left rounded-lg object-cover max-h-[200px] mb-2"
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </button>
              </div>
            ))}
          
          {/* Empty State */}
          {posts.filter(post => 
            activeRegion === "All" || post.regional === activeRegion
          ).length === 0 && (
            <div className="text-center py-10 text-gray-500">
              {activeRegion === "All" 
                ? "No posts available" 
                : `No posts found in ${activeRegion} region`}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
