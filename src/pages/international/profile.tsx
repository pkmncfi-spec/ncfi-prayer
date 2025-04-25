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

  
    useEffect(() => {
      const fetchPosts = async () => {
            try {
              if (!user) return; // Ensure user is not null
              const userDoc = await getDoc(doc(db, "users", user.uid));
              const regional = (userDoc.data() as { regional?: string })?.regional;
              console.log("User Regional:", regional);
        
              const queryCondition = query(collection(db, "posts"),
              orderBy("createdAt", "desc"),
              where("uid", "==", user.uid),
              where("status", "==", "posted"));

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

    const handleRequest = async (id: string) => {
      await router.push("/international/edit/" + id);
    };
  
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
          <title>Profile - {fullName}</title>
          <meta name="description" content="User Profile Page" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
    
        <div className="flex flex-col w-full max-w-[600px] border h-screen overflow-hidden">
          {/* Fixed Header */}
          <div className="fixed w-full bg-white max-w-[598px] z-10">
            <SidebarTrigger />
            <Separator className="my" />
            <div className="bg-gray-400 h-24 flex justify-center"></div>
            <div className="relative flex flex-col items-right -mt-14 p-4">
              <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
              <h3 className="text-xl font-bold mt-2">{fullName}</h3>
              <h3 className="text-md font-semibold mt-2">Your Posts</h3>
              <Button
                variant="ghost"
                className="absolute top-16 right-1 -translate-y-1/2 mt-4 p-2"
                onClick={() => setShowLogoutConfirm(true)}
              >
                <LogOut className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 mt-64 overflow-y-auto px-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-3 rounded-lg flex items-start border border-gray-300 shadow-sm mb-2"
              >
                <div className="flex-1">
                  <p className="font-bold text-">
                    {post.name}{" "}
                    <span className="text-gray-500 font-normal">&#x2022; {formatDate(post.createdAt)}</span>
                  </p>
                  <p className="text-gray-700 text- break-all">
                    <p className="line-clamp-2">
                      {post.text}{" "}
                    </p>
                      <button onClick= {() => handleRequest(post.id)} className="text-blue-600 font-xs">
                        ...click to edit
                      </button>

                  </p>
                </div>
              </div>
            ))}

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
