import { useState, useEffect } from "react";
import { getFirestore, collection, query, onSnapshot, getDoc, doc, orderBy } from "firebase/firestore";
import { app } from "~/lib/firebase";
import Layout from "~/components/layout/sidebar";
import { Separator } from "~/components/ui/separator";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import Image from 'next/image';
import Head from "next/head";

const db = getFirestore(app);

export default function HomePage() {
  const [posts, setPosts] = useState<{ id: string; text: string; uid: string; name: string }[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "posts"), orderBy("createdAt", "desc")),
      (querySnapshot) => {
        const fetchPosts = async () => {
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as { text: string; uid: string }),
          }));

          const usersMap: Record<string, string> = {};

          await Promise.all(
            postsData.map(async (post) => {
              if (post.uid && !usersMap[post.uid]) {
                const userDoc = await getDoc(doc(db, "users", post.uid));
                usersMap[post.uid] = userDoc.exists()
                  ? (userDoc.data() as { name: string }).name
                  : "Unknown";
              }
            })
          );

          const enrichedPosts = postsData.map((post) => ({
            ...post,
            name: usersMap[post.uid] ?? "Unknown",
          }));

          setPosts(enrichedPosts);
        };

        fetchPosts().catch((error) => {
          console.error("Error fetching user data:", error);
        });
      }
    );

    return () => unsubscribe();
  }, [user, loading, router]);

  return (
    <Layout>
      <Head>
        <title>NCFI Prayer</title>
        <meta name="description" content="Prayer app for NCFI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        <div className="fixed w-full bg-white max-w-[598px]">
          <div className="flex flex-cols-2 mt-4">
            <SidebarTrigger />
            <div className="w-full items-center justify-center pr-7">
              <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
              <p className="text-sm text-center text-muted-foreground">NCFI Prayer</p>
            </div>
          </div>
          <Separator className="mb-4 w-full" />
          
          {/* Tab Post */}
          <div className="flex h-1 mb-[1px] items-center justify-center text-sm w-full mx-auto">
            <button className="py-2 px-4 border-b-2 border-blue-500 font-semibold">
              Posts
            </button>
          </div>
          <Separator className="mt-4 w-full" />
        </div>
        
        {/* Post List */}
        <div className="justify-center pt-24 w-full flex flex-col">
          {posts.map((post) => (
            <div key={post.id} className="border-b-[1px] py-2">
              <div className="grid grid-cols-[40px_1fr] items-start">
                <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                <div className="pl-4">
                  <p className="font-semibold">{post.name}</p>
                  <p className="whitespace-normal break-all overflow-hidden pr-10">{post.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
