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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { Bookmark, BookmarkCheck } from "lucide-react";


const db = getFirestore(app);

export default function HomePage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; name: string; createdAt?: string }>>([]);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"regional" | "international">("regional");
  const { user, loading } = useAuth();
  const router = useRouter();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        if (!user?.uid) return; // Ensure user ID is defined
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const regional = (userDoc.data() as { regional?: string })?.regional;
        console.log("User Regional:", regional);

        if (!regional && tab === "regional") {
          console.warn("Regional value is undefined for the user.");
          setPosts([]); // Clear posts if regional is undefined
          return;
        }

        const queryCondition =
          tab === "regional"
            ? query(collection(db, "posts"), orderBy("createdAt", "desc"), where("status", "==", "posted"),where("regional", "==", regional),where("postFor", "==", "regional"))
            : query(collection(db, "posts"), orderBy("createdAt", "desc"), where("status", "==", "posted"), where("postFor", "==", "international"));

            const unsubscribe = onSnapshot(queryCondition, (querySnapshot) => {
              const postsData = querySnapshot.docs.map((doc) => {
                const data = doc.data() as { text: string; uid: string; createdAt?: any };
                return {
                  id: doc.id,
                  text: data.text,
                  uid: data.uid,
                  createdAt: data.createdAt?.toDate() || null, // Convert Firestore Timestamp to Date or set to null
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
      postFor: "regional",
      country: (currentUser.data() as { country?: string })?.country,
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

  const toggleBookmark = (postId: string) => {
    setBookmarkedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  return (
        <Layout>
          <Head>
            <title>NCFI Prayer</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
            <div className="fixed w-full bg-white max-w-[598px] top-0">
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
                  <SheetTrigger className="w-full text-gray-500">Request Prayer Here ......</SheetTrigger>
                  <SheetContent className={`w-full ${GeistSans.className}`}>
                    <SheetHeader>
                      <SheetTitle>Request Prayer</SheetTitle>
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
                            <Button className="fixed justify-center items-center right-4 bottom-3 bg-blue-600 hover:bg-blue-800 active:bg-primary/30" onClick={handlePost}>Post Prayer</Button>
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
                <Dialog key={post.id}>
                  <DialogTrigger asChild>
                    <button className="text-left border-b-[1px] w-full py-2 transition-all duration-300 hover:bg-gray-100 active:scale-95">
                      <div className="grid grid-cols-[40px_1fr] items-start">
                        <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                        <div className="pl-4">
                          <div className="flex gap-1 items-center">
                            <p className="font-semibold">{post.name}</p>
                            <p className="flex pr-10 text-muted-foreground">&#x2022; {post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown Date"}</p>
                          </div>
                          <p className="whitespace-normal break-all overflow-hidden pr-10 line-clamp-6">{post.text}</p>
                          <p className="text-blue-500">...see more</p>
                        </div>
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className={`flex flex-col ${GeistSans.className}`}>
                    <div className="rounded-lg p-8 flex flex-col">
                      <DialogHeader className="flex justify-between items-center w-full">
                        <div className="flex items-center space-x-2 w-full justify-between">
                          <DialogTitle className="text-lg">{post.name}'s Prayer</DialogTitle>
                          <button onClick={() => toggleBookmark(post.id)}>
                            {bookmarkedPosts.includes(post.id) ? (
                              <BookmarkCheck className="w-6 h-6 text-blue-500 fill-current" />
                            ) : (
                              <Bookmark className="w-6 h-6 text-gray-600" />
                            )}
                          </button>
                        </div>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto">
                        <DialogDescription className="break-words text-black overflow-y-auto max-h-[450px]">
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
      // </div>
  );
}

