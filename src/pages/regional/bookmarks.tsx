import { useState, useEffect } from "react";
import { collection, doc, getDoc, getFirestore, onSnapshot, query, where } from "firebase/firestore";
import { useAuth } from "~/context/authContext";
import Layout from "~/components/layout/sidebar-regional";
import { SidebarTrigger } from "~/components/ui/sidebar";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "~/components/ui/dialog";
import { GeistSans } from "geist/font/sans";

const db = getFirestore();

export default function BookmarksPage() {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Array<{ id: string; text: string; createdAt: Date; name: string }>>([]);
  const [selectedPost, setSelectedPost] = useState<{ id: string; text: string; createdAt: Date; name: string } | null>(null); // State for selected post
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      if (!user?.uid) return;

      try {
        // Query the bookmarks collection for the current user's bookmarks
        const bookmarksQuery = query(
          collection(db, "bookmarks"),
          where("uid", "==", user.uid)
        );

        const unsubscribe = onSnapshot(bookmarksQuery, async (querySnapshot) => {
          const postIds = querySnapshot.docs.map((doc) => doc.data().postId);

          // Fetch the details of each bookmarked post
          const posts = await Promise.all(
            postIds.map(async (postId) => {
              const postDoc = await getDoc(doc(db, "posts", postId));
              if (postDoc.exists()) {
                const postData = postDoc.data() as { text: string; createdAt: any; uid: string };
                const userDoc = await getDoc(doc(db, "users", postData.uid));
                const userName = userDoc.exists() ? (userDoc.data() as { name: string }).name : "Unknown";

                return {
                  id: postId,
                  text: postData.text,
                  createdAt: postData.createdAt?.toDate() || new Date(),
                  name: userName,
                };
              }
              return null;
            })
          );

          // Filter out any null values (in case a post was deleted)
          setBookmarkedPosts(posts.filter((post) => post !== null));
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
      }
    };

    fetchBookmarkedPosts();
  }, [user]);

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  return (
    <Layout>
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        {/* Fixed Header */}
        <div className="fixed w-full bg-white max-w-[598px] z-10">
          <div className="flex flex-col w-full items-center justify-center">
            <div className="sticky top-3 bg-white w-full z-10 mt-4">
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
        </div>
  
        <div className="flex-1 mt-20 overflow-y-auto p-4">
          {bookmarkedPosts.length === 0 && (
            <p className="text-center text-gray-500">No bookmarked posts found.</p>
          )}

          {bookmarkedPosts.map((post) => (
            <Dialog key={post.id}>
              <DialogTrigger asChild>
                <div
                  className="bg-white p-3 rounded-xl flex items-center border border-gray-300 shadow-sm mb-2 justify-between cursor-pointer"
                  onClick={() => setSelectedPost(post)} // Set the selected post
                >
                <div className="grid grid-cols-[40px_1fr] items-start">
                  <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full  mt-1" />
                  <div>
                    <div className="flex gap-1 items-center">
                      <p className="font-semibold">{post.name}</p>
                      <p className="flex pr-10 text-muted-foreground">&#x2022; {post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown Date"}</p>
                    </div>
                    <p className="whitespace-normal break-all overflow-hidden pr-10 line-clamp-6">{post.text}</p>
                    <p className="text-blue-500">click to see more....</p>
                  </div>
                </div>
                </div>

              </DialogTrigger>
              <DialogContent className={`${GeistSans.className}`}>
                <DialogHeader>
                  <DialogTitle>{selectedPost?.name}</DialogTitle>
                  <DialogDescription>
                    <p className="text-black">{selectedPost?.text}</p>
                    <p className="text-gray-500 mt-2">{selectedPost?.createdAt.toLocaleString()}</p>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </Layout>
  );
}