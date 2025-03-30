import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, query, onSnapshot, getDoc, doc, orderBy, where } from "firebase/firestore";
import { app } from "~/lib/firebase";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import Layout from "~/components/layout/sidebar-member";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { GeistSans } from "geist/font/sans";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import Image from 'next/image';
import Head from "next/head";


const db = getFirestore(app);

export default function HomePage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; name: string }>>([]);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"regional" | "international">("regional");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!user?.uid) return; // Ensure user ID is defined
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const regional = (userDoc.data() as { regional?: string })?.regional;
        console.log("User Regional:", regional);

        const queryCondition =
          tab === "regional"
            ? query(collection(db, "posts"), orderBy("createdAt", "desc"), where("status", "==", "posted"),where("regional", "==", regional),where("postFor", "==", "regional"))
            : query(collection(db, "posts"), orderBy("createdAt", "desc"), where("status", "==", "posted"), where("postFor", "==", "international"));

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
  }, [user, loading, tab]);


  const handlePost = async () => {
    console.log("User:", user)
    if (!text.trim() || !user?.uid) return; // Pastikan tidak post kosong dan user login

    const currentUser = await getDoc(doc(db, "users", user.uid));

    await addDoc(collection(db, "posts"), {
      text: text.trim(),
      uid: user.uid,
      createdAt: new Date(),
      status: "requested",
      regional: (currentUser.data() as { regional?: string })?.regional,
      postFor: "regional"
    });

    setText(""); // Reset input setelah post
    alert("Post successful!");
  };
  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  const regionalTab = () => setTab("regional");
  const internationalTab = () => setTab("international");

  return (
        <Layout>
          <Head>
            <title>NCFI Prayer</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
            <div className="fixed w-full bg-white max-w-[598px]">
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
                <Separator className="mb-4 w-full" />
                <div className="flex h-1 mb-[1px] items-center justify-between gap-x-4 text-sm w-full mx-auto">
                  <button onClick={regionalTab} className={`ml-4 flex-1 py-2 transition-all ${
                    tab === "regional"
                    ? "w-full border-b-[4px] border-blue-500 font-semibold"
                    : ""
                    }`}>Regional</button>
                  <button onClick={internationalTab} className={`mr-4 flex-1 py-2 transition-all ${
                    tab === "international"
                    ? "w-full border-b-[4px] border-blue-500 font-semibold"
                    : ""
                    }`}>International</button>
                </div>
              </div>
              <Separator className="my-4 w-full" />
              <div>
                <Sheet>
                  <SheetTrigger className="w-full text-gray-500">Post Prayer Here ......</SheetTrigger>
                  <SheetContent className={`w-full ${GeistSans.className}`}>
                    <SheetHeader>
                      <SheetTitle>Post Prayer</SheetTitle>
                      <SheetDescription>
                        <div className="grid grid-cols-[40px_1fr] items-start">
                          <div>
                          <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full mt-1" />
                          </div>
                          <div>
                            <Textarea
                              value={text}
                              placeholder="Type your message here."
                              onChange={(e) => setText(e.target.value)}
                              className="resize-none min-h-[600px] border-none"/>
                          </div>
                          <SheetClose>
                            <Button className="fixed justify-center items-center right-4 bottom-3 bg-blue-600 hover:bg-blue-800 active:bg-primary/30" onClick={handlePost}>Send Prayer</Button>
                          </SheetClose>
                        </div>
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>            
              </div>
              <Separator className="mt-4 w-full" />
            </div>
            <div className="justify-center pt-40 w-full flex flex-col transition-all">
                <div>
                {posts.map((post) => (
                  <div key={post.id} className="border-b-[1px] py-2">
                    <button className="w-[600px] text-left">
                    <div className="grid grid-cols-[40px_1fr] items-start">
                      <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                      <div className="pl-4">
                        <div className="flex gap-1 items-center">
                          <p className="font-semibold">{post.name}</p>
                          <p className="flex pr-10 text-muted-foreground">&#x2022; {formatDate(new Date())}</p>
                        </div>
                        <p className="whitespace-normal break-all overflow-hidden pr-10">{post.text}</p>
                      </div>
                    </div>
                    </button>
                  </div>
                  ))}
                </div>
                </div>
            </div>

        </Layout>

      // </div>
  );
}

