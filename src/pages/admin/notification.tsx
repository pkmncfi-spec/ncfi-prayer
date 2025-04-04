"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, query, onSnapshot, orderBy, getDoc, doc } from "firebase/firestore";
import { app } from "~/lib/firebase";
import { Separator } from "~/components/ui/separator";
import Layout from "~/components/layout/sidebar-admin";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import Image from "next/image";
import { Bookmark, BookmarkCheck } from "lucide-react";

const db = getFirestore(app);

interface Post {
  id: string;
  text: string;
  uid: string;
  name: string;
}

interface User {
  name?: string;
}

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Post[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, "posts"), orderBy("createdAt", "desc")), (snapshot) => {
      void (async () => {
        try {
          const postsData: Post[] = snapshot.docs.map((doc) => {
            const data = doc.data() as Partial<Post>;
            return {
              id: doc.id,
              text: data.text ?? "No content",
              uid: data.uid ?? "",
              name: "Loading...",
            };
          });

          const uniqueUids = [...new Set(postsData.map((post) => post.uid))];
          const usersMap: Record<string, string> = {};

          await Promise.all(
            uniqueUids.map((uid) =>
              uid
                ? getDoc(doc(db, "users", uid))
                    .then((userDoc) => {
                      const userData = userDoc.data() as User | undefined;
                      usersMap[uid] = userData?.name ?? "Unknown";
                    })
                    .catch((error) => {
                      console.error(`Error fetching user ${uid}:`, error);
                      usersMap[uid] = "Unknown";
                    })
                : Promise.resolve()
            )
          );

          setNotifications(postsData.map((post) => ({
            ...post,
            name: usersMap[post.uid] ?? "Unknown",
          })));
        } catch (error) {
          console.error("Error fetching posts:", error);
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
    <Layout>
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        <div className="fixed w-full bg-white max-w-[598px]">
          <div>
            <div className="flex flex-cols-2 mt-4">
              <div className="">
                <SidebarTrigger />
              </div>
              <div className="w-full items-center justify-center pr-7">
                <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
                <p className="text-sm text-center text-muted-foreground">NCFI Prayer</p>
              </div>
            </div>
          </div>
          <Separator className="my-0" />
        </div>

        <div className="flex-1 overflow-y-auto mt-[80px] px-2">
          <h2 className="text-lg font-semibold mb-2">Today</h2>

          <Dialog>
            <DialogTrigger asChild>
              <button className="bg-white p-4 rounded-2xl w-full text-left transition-all duration-300 hover:bg-gray-100 active:scale-95 border border-gray-300">
                <p className="text-sm font-semibold">Today's devotion has been posted</p>
                 <span className="text-blue-500 text-xs underline">Click to see more..</span>
                   </button>
            </DialogTrigger>
              <DialogContent className="flex flex-col w-full max-w-[600px] ml-24 border min-h-screen">
                <div className="bg-white p-8 rounded-lg max-w-[598px]">
                  <DialogHeader>
                    <DialogTitle>Today's Devotion</DialogTitle>
                      <DialogDescription>
                        "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." (Proverbs 3:5-6)
                      </DialogDescription>
                   </DialogHeader>
                </div>
              </DialogContent>
          </Dialog>

          <div className="space">
            {notifications.map((post) => (
              <Dialog key={post.id}>
                <DialogTrigger asChild>
                  <button className="bg-white p-4 rounded-2xl w-full text-left transition-all duration-300 hover:bg-gray-100 active:scale-95 flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                      <p className="text-xs break-words w-full">
                      <span className="font-semibold text-base">{post.name}</span> Posted a new prayer
                      </p>
                  </button>
                </DialogTrigger>
                <DialogContent className="flex flex-col w-full max-w-[600px] ml-24 border min-h-screen">
                  <div className="bg-white p-8 rounded-lg max-w-[598px] h-[750px] overflow-y-auto flex flex-col">
                  <DialogHeader className="flex justify-between items-center w-full">
                      <div className="flex items-center space-x-2 w-full justify-between">
                        <DialogTitle className="font-serif text-lg">{post.name}'s Prayer</DialogTitle>
                          <button onClick={() => toggleBookmark(post.id)}>
                            {bookmarkedPosts.includes(post.id) ? (
                              <BookmarkCheck className="w-6 h-6 text-blue-500 fill-current" />
                            ) : (
                              <Bookmark className="w-6 h-6 text-gray-500" />
                            )}
                          </button>
                      </div>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto">
                      <DialogDescription className="break-words font-serif">
                        {post.text}
                      </DialogDescription>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
