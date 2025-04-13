import { DialogClose } from "@radix-ui/react-dialog";
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import { GeistSans } from "geist/font/sans";
import { Bookmark } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Layout from "~/components/layout/sidebar-member";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
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
        const bookmarkDocId = querySnapshot.docs[0].id;
  
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
              <DialogContent className={`flex flex-col ${GeistSans.className}`}>
                <div className="rounded-lg p-8 flex flex-col">
                  <DialogHeader className="flex justify-between items-center w-full">
                    <div className="flex items-center space-x-2 w-full justify-between">
                      <DialogClose className="flex items-center space-x-2 w-full justify-between">
                        <DialogTitle className="text-lg">{selectedPost?.name}</DialogTitle>
                        <button onClick={() => handleUnbookmark(selectedPost?.id ?? "")}>
                          <Bookmark className="w-6 h-6 text-blue-500 fill-current"  />
                        </button>
                      </DialogClose>
                    </div>
                  </DialogHeader>
                  <div className="flex-1 overflow-y-auto">
                    <DialogDescription className="break-words text-black overflow-y-auto max-h-[450px]">
                      <p>{selectedPost?.text}</p>
                      {selectedPost?.imageURL ? (
                        <div className="w-full mt-2">
                          <Image
                            src={selectedPost?.imageURL ?? ""}
                            alt="Post Image"
                            width={500}
                            height={300}
                            className="rounded-lg object-cover mb-2"
                          />
                        </div>
                      ):(<></>)}
                      <p className="text-gray-500 mt-2">{selectedPost?.createdAt.toLocaleString()}</p>
                    </DialogDescription>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </Layout>
  );
}