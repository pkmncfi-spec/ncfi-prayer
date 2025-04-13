"use client";

import Layout from "~/components/layout/sidebar-international";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { signOut } from "firebase/auth";
import { app, auth } from "~/lib/firebase";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { deleteDoc, doc, getDoc, getFirestore, query, Timestamp, updateDoc } from "firebase/firestore";
import { collection, onSnapshot, orderBy, where } from "firebase/firestore";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import  Image  from "next/image";
import { GeistSans } from "geist/font/sans";
import { Textarea } from "~/components/ui/textarea";

const db = getFirestore(app);

export default function ProfilePage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; name: string; createdAt: Date}>>([]);
  
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [content, setContent] = useState("");
  const [contentAuthor, setContentAuthor] = useState("");
  const [postId, setPostId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [postDate, setPostDate] = useState<Date>(new Date());
  const [text, setText] = useState("");
  
    useEffect(() => {
      const fetchPosts = async () => {
            try {
              if (!user) return; // Ensure user is not null
              const userDoc = await getDoc(doc(db, "users", user.uid));
              const regional = (userDoc.data() as { regional?: string })?.regional;
              console.log("User Regional:", regional);
        
              const queryCondition = query(collection(db, "posts"), orderBy("createdAt", "desc"), where("uid", "==", user.uid), where("status", "==", "posted"), where("postFor", "==", "regional"));

        
              const unsubscribe = onSnapshot(queryCondition, (querySnapshot) => {
                const postsData = querySnapshot.docs.map((doc) => {
                  const data = doc.data() as { text: string; uid: string; createdAt: unknown };
                  return {
                    id: doc.id,
                    text: data.text,
                    uid: data.uid,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), // Safely convert Firestore Timestamp to Date
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

      async function getUserData(){
        if (!user) return; // Ensure user is not null
        const userDoc = await getDoc(doc(db, "users", user.uid)); 
        const userData = userDoc.data() as { name?: string };
        setFullName(userData?.name ?? "Unknown User");
      };

      void fetchPosts();
      void getUserData();
    }, [user]);

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

    const editPrayer = async (id: string) => {
      try {
        await updateDoc(doc(db, "posts", id), { text: content });
        setSheetOpen(false); // Close the sheet after accepting
        console.log("Prayer request accepted!");
      } catch (error) {
        console.error("Error accepting prayer request:", error);
      }
    }

    const deletePrayer = async (id: string) => {
      try {
        await deleteDoc(doc(db, "posts", id));
        setSheetOpen(false); // Close the sheet after accepting
        console.log("Prayer request accepted!");
      } catch (error) {
        console.error("Error accepting prayer request:", error);
      }
    }
  
    const handleLogout = async () => {
      try {
        await signOut(auth);
        await router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };
    
    function formatDate(date: Date): string {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
      }).format(date);
    }

    return (
      <Layout>
        <Head>
          <title>{fullName} - Profile</title>
          <meta name="description" content="User Profile Page" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
    
        <div className="flex flex-col w-full max-w-[600px] border h-screen overflow-hidden">
          {/* Fixed Header */}
          <div className="fixed w-full bg-white max-w-[598px] z-10">
            <SidebarTrigger />
            <Separator className="my" />
            <div className="bg-gray-400 h-24 flex justify-center"></div>
            <div className="relative flex flex-col items-right -mt-12 p-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              <h3 className="text-lg font-bold mt-2">{fullName}</h3>
              <h3 className="text-sm font-semibold mt-2">Your Posts</h3>
              <Button
                variant="ghost"
                className="absolute top-16 right-1 -translate-y-1/2 p-2"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 mt-64 overflow-y-auto px-4">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>   
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-3 rounded-lg flex items-start border border-gray-300 shadow-sm mb-2"
              >
                <div className="flex-1">
                  <p className="font-bold text-sm">
                    {post.name}{" "}
                    <span className="text-gray-500 font-normal">&#x2022; {formatDate(post.createdAt)}</span>
                  </p>
                  <p className="text-gray-700 text-xs break-all">
                    <p className="line-clamp-2">
                      {post.text}{" "}
                    </p>
                    <SheetTrigger>
                      <button onClick= {() => handleRequest(post.id)} className="text-blue-600 font-xs">
                        ...click to edit
                      </button>
                    </SheetTrigger>

                  </p>
                </div>
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
                      <div className="flex items-center justify-between w-full max-w-[360px] right-5 fixed bg-white bottom-0 pt-4 pb-2 pl-10 right-0 pr-6">
                        <Button onClick={() => editPrayer(postId)} className="bg-blue-600 hover:bg-blue-800 active:bg-primary/30 w-full text-xs mr-2">Edit</Button>
                        <Button onClick={() => deletePrayer(postId)} className="bg-red-700 hover:bg-red-900 active:bg-primary/30 w-full text-xs mr-2">Delete</Button>
                      </div>
                      </SheetFooter>
                </SheetContent>
            </Sheet>
          </div>
    
          {/* Logout Confirmation */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
                <p className="text-sm font-bold">Do you want to log out now?</p>
                <div className="flex flex-col gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full"
                  >
                    Yes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="w-full"
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </Layout>
    );
}
