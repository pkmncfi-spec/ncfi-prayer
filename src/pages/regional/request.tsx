import { SidebarTrigger } from "~/components/ui/sidebar";
import * as React from "react";
import Image from "next/image";
import { app } from "~/lib/firebase";
import { collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "~/context/authContext";
import Head from "next/head";
import { GeistSans } from "geist/font/sans";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";

const db = getFirestore(app);

export default function RequestPage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; name: string; createdAt: Date }>>([]);
  const {user, loading} = useAuth();
  const [content, setContent] = useState("");
  const [contentAuthor, setContentAuthor] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!user) return; // Ensure user is not null
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const regional = (userDoc.data() as { regional?: string })?.regional;
        console.log("User Regional:", regional);
  
        const queryCondition = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          where("status", "==", "requested"),
          where("regional", "==", regional),
          where("postFor", "==", "regional")
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

  const handleRequest = (id: string) => {
    const selectedPost = posts.find((post) => post.id === id);
    if (selectedPost) {
      setContent(selectedPost.text);
      setContentAuthor(selectedPost.name);
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
                <Sheet>             
                {posts.map((post) => (
                  <div key={post.id} className="border-b-[1px] py-2 w-full">
                    <SheetTrigger>
                    <button onClick={() => handleRequest(post.id)} className="w-full align-left">
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
                         <SheetContent className={`flex flex-col w-full max-w-[500px] mx-autoborder ${GeistSans.className}`}>
                    <SheetHeader>
                      <SheetTitle>{contentAuthor}</SheetTitle>
                      <SheetDescription>
                        <p className="whitespace-normal break-all overflow-hidden text-ellipsis">{content}</p>
                      </SheetDescription>
                    </SheetHeader>
                </SheetContent>
            </Sheet>      
                </div>
                </div>

        </Layout>
  );
}
