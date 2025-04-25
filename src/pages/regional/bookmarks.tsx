import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import router from "next/router";
import { useEffect, useState } from "react";
import Layout from "~/components/layout/sidebar-regional";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";

const db = getFirestore();

export default function BookmarksPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Array<{ 
    id: string; 
    bookmarkId: string; // Add this
    text: string; 
    createdAt: Date; 
    name: string;
    imageURL?: string;
  }>>([]);  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [pendingDeletions, setPendingDeletions] = useState<Set<string>>(new Set());
    
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

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      if (!user?.uid) return;

      try {
        // Query the bookmarks collection for the current user's bookmarks
        const bookmarksQuery = query(
          collection(db, "bookmarks"),
          orderBy("createdAt", "desc"),
          where("uid", "==", user.uid),
        );

        const unsubscribe = onSnapshot(bookmarksQuery, (querySnapshot) => {
          const fetchPosts = async () => {
            // Create an array of objects with postId and bookmarkId
            const bookmarkData = querySnapshot.docs.map((doc) => ({
              postId: doc.data().postId as string,
              bookmarkId: doc.id // Store the bookmark document ID
            }));
            
            const posts = await Promise.all(
              bookmarkData.map(async ({ postId, bookmarkId }) => {
                const postDoc = await getDoc(doc(db, "posts", postId));
                if (postDoc.exists()) {
                  const postData = postDoc.data() as { text: string; createdAt: any; uid: string; imageURL?: string };
                  const userDoc = await getDoc(doc(db, "users", postData.uid));
                  const userName = userDoc.exists() ? (userDoc.data() as { name: string }).name : "Unknown";
            
                  return {
                    id: postId,
                    bookmarkId: bookmarkId, // Include the bookmark ID in the returned object
                    text: postData.text,
                    createdAt: postData.createdAt instanceof Timestamp ? postData.createdAt.toDate() : new Date(),
                    name: userName,
                    imageURL: postData.imageURL ?? "",
                  };
                }
                return null;
              })
            );
            
            setBookmarkedPosts(posts.filter((post) => post !== null) as Array<{ id: string; bookmarkId: string; text: string; createdAt: Date; name: string; imageURL?: string }>);
          };
        
          void fetchPosts();
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
      }
    };

    void fetchBookmarkedPosts();
  }, [user?.uid]);

  const handleDelete = async (bookmarkId: string) => {
    try {
      // Add to pending deletions for immediate UI feedback
      setPendingDeletions(prev => new Set(prev).add(bookmarkId));
      await deleteDoc(doc(db, "bookmarks", bookmarkId));
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      // Remove from pending deletions if operation failed
      setPendingDeletions(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookmarkId);
        return newSet;
      });
    }
  };

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  const handleRedirect = async (postId: string) => {
    await router.push("/regional/post/" + postId);
  }

  return (
    <Layout>
      <Head>
        <title>Bookmarks</title>
      </Head>
      <div className="w-full max-w-[600px] border min-h-screen">
        {/* Fixed Header */}
        <div className="fixed w-full bg-white max-w-[598px] flex flex-cols top-0 pt-3 pb-2 border-b">
        {isMobile ? (
          <div className="ml-2 mt-1.5">
            <SidebarTrigger />
          </div>
        ) : (
          <div className="ml-8 mt-1.5"></div>
        )}
          <div className="w-full items-center justify-center pr-9">
            <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
            <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pt-20">
          {bookmarkedPosts.length === 0 && (
            <p className="text-center text-gray-500">No bookmarked posts found.</p>
          )}

          {bookmarkedPosts.map((post) => (
              !pendingDeletions.has(post.bookmarkId) && (
                <div key={post.id} className="bg-white p-3 rounded-xl flex items-center border border-gray-300 shadow-sm mb-2 justify-between cursor-pointer">
                <button className="text-left w-full" onClick={() => handleRedirect(post.id)}>

                <div className="grid grid-cols-[40px_1fr] items-start">
                  <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full  mt-1" />
                  <div>
                    <div className="flex gap-1 items-center">
                      <p className="font-semibold">{post.name}</p>
                      <p className="flex pr-10 text-muted-foreground">&#x2022; {post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown Date"}</p>
                    </div>
                    <p className="whitespace-normal break-all overflow-hidden pr-10 line-clamp-2">{post.text}</p>
                    <p className="text-blue-500">click to see more....</p>
                  </div>
                </div>
                </button>

                <div>
                  <button onClick={() => handleDelete(post.bookmarkId)} className="text-blue-500">
                  {pendingDeletions ? (
                        <BookmarkCheck className="w-6 h-6 text-blue-500 fill-current text-right" />
                    ) : (
                        <Bookmark className="w-6 h-6 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
              )
          ))}
        </div>
      </div>
    </Layout>
  );
}