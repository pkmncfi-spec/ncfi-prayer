import Layout from "~/components/layout/sidebar-regional";
import { SidebarTrigger } from "~/components/ui/sidebar";
import * as React from "react";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";

import { app } from "~/lib/firebase";
import { collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "~/context/authContext";
import Head from "next/head";
import { GeistSans } from "geist/font/sans";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";

const db = getFirestore(app);

export default function RequestPage() {
  const [posts, setPosts] = React.useState<Array<{ id: string; text: string; name: string }>>([]);
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
        
        const queryCondition = query(collection(db, "posts"), orderBy("createdAt", "desc"), where("status", "==", "requested"), where("regional", "==", regional), where("postFor", "==", "regional"))

        const unsubscribe = onSnapshot(queryCondition, (querySnapshot) => {
          const postsData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as { text: string; uid: string;}),
          }));

          const usersMap: Record<string, string> = {};
          Promise.all(
            postsData.map(async (post) => {
              if (!post.uid) return;
              if (!usersMap[post.uid]) {
                const userDoc = await getDoc(doc(db, "users", post.uid));
                usersMap[post.uid] = userDoc.exists() ? (userDoc.data() as { name: string }).name : "Unknown";
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
                <Dialog>
                  
                                
                {posts.map((post) => (
                  <div key={post.id} className="border-b-[1px] py-2">
                    <DialogTrigger>
                    <button onClick={() => handleRequest(post.id)} className="w-full align-left">
                    <div className="grid grid-cols-[40px_1fr] items-start">
                      <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                      <div className="pl-4 text-left text-sm">
                        <div className="flex gap-1 items-center">
                          <p className="font-semibold">{post.name}</p>
                          <p className="">sending prayer request</p>
                        </div>
                        <p className="flex pr-10 text-muted-foreground">dd mm yyyy</p>
                      </div>
                    </div>
                    </button>
                    </DialogTrigger>
                  </div>
                    
                ))}
                         <DialogContent className={`flex flex-col w-full max-w-[500px] mx-autoborder ${GeistSans.className}`}>
                  <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                    <DialogHeader>
                      <DialogTitle>{contentAuthor}</DialogTitle>
                      <DialogDescription>
                        <p className="whitespace-normal break-all overflow-hidden text-ellipsis">{content}</p>
                      </DialogDescription>
                    </DialogHeader>
                  </div>
                </DialogContent>
            </Dialog>      
                </div>
                </div>

        </Layout>
  );
}
