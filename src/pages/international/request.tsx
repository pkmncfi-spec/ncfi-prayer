import { SidebarTrigger } from "~/components/ui/sidebar";
import * as React from "react";
import Image from "next/image";
import { app } from "~/lib/firebase";
import { collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "~/context/authContext";
import Head from "next/head";
import { GeistSans } from "geist/font/sans";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import Layout from "~/components/layout/sidebar-international";
import { Separator } from "~/components/ui/separator";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";

const db = getFirestore(app);

export default function RequestPage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; name: string; createdAt: Date }>>([]);
  const {user, loading} = useAuth();
  const [content, setContent] = useState("");
  const [contentAuthor, setContentAuthor] = useState("");
  const [postId, setPostId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [postDate, setPostDate] = useState<Date>(new Date());

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!user) return; // Ensure user is not null
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const regional = (userDoc.data() as { regional?: string })?.regional;
        const country = (userDoc.data() as { country?: string })?.country;
        console.log("User Regional:", regional);
  
        const queryCondition = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          where("status", "==", "requested"),
          where("postFor", "==", "international")
        );
  
        const unsubscribe = onSnapshot(queryCondition, (querySnapshot) => {
          const postsData = querySnapshot.docs.map((doc) => {
            const data = doc.data() as { text: string; uid: string; createdAt: unknown };
            return {
              id: doc.id,
              text: data.text,
              uid: data.uid,
              createdAt: data.createdAt?.toDate() || new Date(), // Convert Firestore Timestamp to Date
            };
          });
  
          const usersMap: Record<string, string> = {};
          Promise.all(
            postsData.map(async (post) => {
              if (!post.uid) return;
              if (!usersMap[post.uid]) {
                const userDoc = await getDoc(doc(db, "users", post.uid));
                usersMap[post.uid] = userDoc.exists()
                  ? (userDoc.data() as { name: string }).name
                  : "Unknown";
              }
            })
          )
            .then(() => {
              const enrichedPosts = postsData.map((post) => ({
                ...post,
                name: usersMap[post.uid] ?? "Unknown",
              }));
              setPosts(enrichedPosts);
            })
            .catch((error) => {
              console.error("Error fetching user data:", error);
            });
        });
  
        return unsubscribe;
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    void fetchPosts();
  }, [user, loading]);

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "long", // Full month name (e.g., "March")
      day: "2-digit", // Day with leading zero if needed (e.g., "29")
      year: "numeric", // Full year (e.g., "2025")
    }).format(date);
  }

  const editPrayer = async (id: string) => {
    try {
      await updateDoc(doc(db, "posts", id), { text: content });
      setSheetOpen(false); 
      console.log("Prayer request accepted!");
    } catch (error) {
      console.error("Error accepting prayer request:", error);
    }
  }

  const handleRequest = (id: string) => {
    const selectedPost = posts.find((post) => post.id === id);
    if (selectedPost) {
      setContent(selectedPost.text);
      setContentAuthor(selectedPost.name);
      setPostId(selectedPost.id);
      setSheetOpen(true); // Open the sheet
      setPostDate(selectedPost.createdAt); // Set the post date
    }
  };

  const acceptPrayer = async (postId: string) => {
    try {
      await updateDoc(doc(db, "posts", postId), { status: "posted" });
      setSheetOpen(false); // Close the sheet after accepting
      console.log("Prayer request accepted!");
    } catch (error) {
      console.error("Error accepting prayer request:", error);
    }
  };

  const rejectPrayer = async (postId: string) => {
    try {
      await updateDoc(doc(db, "posts", postId), { status: "rejected" });
      setSheetOpen(false); // Close the sheet after rejecting
      console.log("Prayer request accepted!");
    } catch (error) {
      console.error("Error accepting prayer request:", error);
    }
  };

  return (
    <Layout>
          <Head>
            <title>NCFI Prayer</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
            <div className="fixed w-full bg-white border-b max-w-[598px]">
              <div>
                <div className="flex flex-cols mt-2 mb-2">
                  <div className="">
                  <SidebarTrigger />
                  </div>
                  <div className="w-full items-center justify-center pr-7">
                    <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
                    <p className="text-sm text-center text-muted-foreground">NCFI Prayer</p>
                  </div>
                </div>
              </div>
            </div>
                <div className="pt-16 w-full flex flex-col transition-all">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>             
                {posts.map((post) => (
                  <div key={post.id} className="border-b-[1px] py-2 w-full">
                    <SheetTrigger>
                    <button onClick={() => handleRequest(post.id)} className="w-[600px] align-left">
                    <div className="grid grid-cols-[40px_1fr] items-start">
                      <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                      <div className="pl-4 text-left text-s">
                        <div className="flex gap-1 items-center">
                          <p className="font-semibold">{post.name}</p>
                          <p className="">sending prayer request</p>
                        </div>
                        <p className="flex pr-10 text-muted-foreground text-xs">{formatDate(post.createdAt)}</p>
                      </div>
                    </div>
                    </button>
                    </SheetTrigger>
                  </div>
                    
                ))}
                <SheetContent className={`flex flex-col w-full mx-autoborder ${GeistSans.className} overflow-y-auto`}>
                    <SheetHeader className="">
                      <div className="flex items-center fixed min-w-screen bg-white top-0 pt-4 pb-4 pl-2 mr-4">
                        <SheetClose className="pr-5 text-xl ">&#10006;</SheetClose>
                        <SheetTitle className="text-2xl w-full font-bold text-left pr-20">Prayer Request</SheetTitle>
                      </div>
                      </SheetHeader>
                      <Separator className="w-full"/>
                      <SheetDescription className="pt-6">
                        <div className="grid grid-cols-[40px_1fr] items-start">
                          <div>
                          <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full mt-1" />
                          </div>
                          <div>
                            <div className="flex gap-1 items-center">
                              <p className="flex font-semibold">{contentAuthor}</p>
                              <p className="text-muted-foreground">&#x2022; {formatDate(postDate)}</p>
                            </div>
                            <div>
                              <Textarea
                                value={content}
                                placeholder="Type your message here."
                                onChange={(e) => setContent(e.target.value)}
                                className="resize-none min-h-[600px] border-none"/>
                            </div>
                            {/* <p className="text-sm whitespace-normal text-left break-all overflow-hidden pr-5 mb-5">{content}</p> */}
                          </div>
                        </div>
                      </SheetDescription>
                      <SheetFooter className="">
                      <div className="flex items-center justify-between fixed bg-white bottom-0 pt-4 pb-2 pl-10 right-0 mr-4 pr-6">
                        <Button onClick={() => acceptPrayer(postId)} className="bg-blue-600 hover:bg-blue-800 active:bg-primary/30 w-full text-xs mr-2">Accept Prayer</Button>
                        <Button onClick={() => editPrayer(postId)} className="bg-blue-600 hover:bg-blue-800 active:bg-primary/30 w-full text-xs mr-2">Edit</Button>
                        <Button onClick={() => rejectPrayer(postId)} className="bg-red-700 hover:bg-red-900 active:bg-primary/30 w-full text-xs mr-2">Reject Prayer</Button>
                      </div>
                      </SheetFooter>
                </SheetContent>
            </Sheet>      
                </div>
                </div>

        </Layout>
  );
}
