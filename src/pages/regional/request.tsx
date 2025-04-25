"use client";

import { collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from "firebase/firestore";
import Head from "next/head";
import Image from "next/image";
import router from "next/router";
import { useEffect, useState } from "react";
import Layout from "~/components/layout/sidebar-regional";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";
import { app } from "~/lib/firebase";


const db = getFirestore(app);

export default function RequestPage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; name: string; createdAt: Date; uid: string; imageURL?: string | null }>>([]);
  const {user, loading} = useAuth();
  const [isMobile, setIsMobile] = useState(false);

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
    const fetchPosts = async () => {
      try {
        if (!user) return; // Ensure user is not null
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const regional = (userDoc.data() as { regional?: string })?.regional;
        const country = (userDoc.data() as { country?: string })?.country;
  
        const queryCondition = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc"),
          where("status", "==", "requested"),
          where("regional", "==", regional),
          where("postFor", "==", "regional"),
          where("country", "==", country)
        );
  
        const unsubscribe = onSnapshot(queryCondition, (querySnapshot) => {
          const postsData = querySnapshot.docs.map((doc) => {
            const data = doc.data() as { text: string; uid: string; createdAt: unknown; imageURL?: string };
            return {
              id: doc.id,
              text: data.text,
              uid: data.uid,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), // Safely convert Firestore Timestamp to Date
              image: data.imageURL ?? null,
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

  const handleRequest = async (id: string) => {
    await router.push("/regional/request/" + id);
  };

  return (
    <Layout>
          <Head>
            <title>Request</title>
            <meta name="description" content="User Post Page" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
              <div className="fixed w-full bg-white max-w-[598px] top-0 border-b">
                <div>
                  <div className="flex flex-cols mt-3 mb-2">
                    {isMobile ? (<div className="ml-2 mt-1.5">
                      <SidebarTrigger />
                    </div>): (<div className="ml-10 mt-1.5"></div>)}
                    <div className="w-full items-center justify-center pr-10">
                      <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
                      <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
                    </div>
                  </div>
                </div>
              </div>
                <div className="pt-16 w-full flex flex-col transition-all">
                {posts.length === 0 && <p className="mt-2 text-center text-muted-foreground">No prayer requests</p>}
                {posts.map((post) => (
                  <div key={post.id} className="border-b-[1px] py-2 w-full">
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
                  </div>
                    
                ))}    
                </div>
                </div>

        </Layout>
  );
}
