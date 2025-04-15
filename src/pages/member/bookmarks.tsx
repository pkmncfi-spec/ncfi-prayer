import { DialogClose } from "@radix-ui/react-dialog";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { GeistSans } from "geist/font/sans";
import { Bookmark } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import router from "next/router";
import { useEffect, useState } from "react";
import Layout from "~/components/layout/sidebar-member";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";

const db = getFirestore();

export default function BookmarksPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Array<{ id: string; text: string; createdAt: Date; name: string }>>([]);
  const [selectedPost, setSelectedPost] = useState<{ id: string; text: string; createdAt: Date; name: string; imageURL?: string } | null>(null); // State for selected post
  const { user } = useAuth();

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
            const postIds: string[] = querySnapshot.docs.map((doc) => doc.data().postId as string);
        
            const posts = await Promise.all(
              postIds.map(async (postId) => {
                const postDoc = await getDoc(doc(db, "posts", postId));
                if (postDoc.exists()) {
                  const postData = postDoc.data() as { text: string; createdAt: any; uid: string; imageURL?: string };
                  const userDoc = await getDoc(doc(db, "users", postData.uid));
                  const userName = userDoc.exists() ? (userDoc.data() as { name: string }).name : "Unknown";
        
                  return {
                    id: postId,
                    text: postData.text,
                    createdAt: postData.createdAt instanceof Timestamp ? postData.createdAt.toDate() : new Date(),
                    name: userName,
                    imageURL: postData.imageURL ?? "", // Add imageURL if it exists
                  };
                }
                return null;
              })
            );
        
            setBookmarkedPosts(posts.filter((post) => post !== null) as Array<{ id: string; text: string; createdAt: Date; name: string; imageURL?: string }>);
          };
        
          void fetchPosts(); // Call the async function
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
      }
    };

    void fetchBookmarkedPosts();
  }, [user]);

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  async function handleUnbookmark(postId: string) {
    if (!user?.uid) {
      console.error("User is not logged in.");
      return;
    }
  
    try {
      console.log("Unbookmarking post with ID:", postId);
  
      // Query the bookmarks collection to find the document with the matching postId and user.uid
      const bookmarksQuery = query(
        collection(db, "bookmarks"),
        where("uid", "==", user.uid),
        where("postId", "==", postId)
      );
  
      const querySnapshot = await getDocs(bookmarksQuery);
  
      if (!querySnapshot.empty) {
        // Get the document ID of the bookmark
        const bookmarkDocId = querySnapshot.docs[0]?.id;
        if (!bookmarkDocId) {
          console.error("Bookmark document ID is undefined.");
          return;
        }
  
        // Delete the bookmark document from Firestore
        await deleteDoc(doc(db, "bookmarks", bookmarkDocId));
  
        // Update the state to remove the unbookmarked post
        setBookmarkedPosts((prev) => prev.filter((post) => post.id !== postId));
  
        // Close the dialog by resetting the selected post
        setSelectedPost(null);
  
        console.log(`Bookmark for post ${postId} deleted successfully.`);
      } else {
        console.error("No matching bookmark found.");
      }
    } catch (error) {
      console.error("Error unbookmarking post:", error);
    }
  }

  const handleRedirect = async (postId: string) => {
    await router.push("/member/post/" + postId);
  }

  return (
    <Layout>
      <Head>
        <title>Bookmarks</title>
      </Head>
      <div className="w-full max-w-[600px] border min-h-screen">
        {/* Fixed Header */}
        <div className="fixed w-full bg-white max-w-[598px] flex flex-cols top-0 pt-3 pb-2 border-b">
          <div className="">
          <SidebarTrigger />
          </div>
          <div className="w-full items-center justify-center pr-7">
            <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
            <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pt-20">
          {bookmarkedPosts.length === 0 && (
            <p className="text-center text-gray-500">No bookmarked posts found.</p>
          )}

          {bookmarkedPosts.map((post) => (
            <button className="text-left w-full" onClick={() => handleRedirect(post.id)} key={post.id}>
              
              <div
                  className="bg-white p-3 rounded-xl flex items-center border border-gray-300 shadow-sm mb-2 justify-between cursor-pointer" // Set the selected post
                >
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
                </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}