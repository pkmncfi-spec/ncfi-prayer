import { useState, useEffect, useRef } from "react";
import { getFirestore, collection, addDoc, query, onSnapshot, getDoc, doc, orderBy, where, deleteDoc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { app } from "~/lib/firebase";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import Layout from "~/components/layout/sidebar-international";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { GeistSans } from "geist/font/sans";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";
import Image from 'next/image';
import Head from "next/head";
import UploadImageForm from "~/components/UploadImageForm";
import axios from "axios";
import router from "next/router";

const db = getFirestore(app);

export default function HomePage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; title: string; name: string; createdAt?: string; imageURL?: string }>>([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tab, setTab] = useState<"regional" | "international">("regional");
  const { user, loading } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [isOverflowing, setIsOverflowing] = useState<Record<string, boolean>>({});
  const [imageURL, setImageURL] = useState<string>("");
  const paragraphRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [image, setImage] = useState<File | null>(null);
  const [loadings, setLoadings] = useState(false);

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
            ? query(collection(db, "posts"), orderBy("createdAt", "desc"), where("status", "==", "posted"), where("regional", "==", regional), where("postFor", "==", "regional")) ||
            query(collection(db, "posts"), orderBy("createdAt", "desc"), where("status", "==", "requested"), where("regional", "==", regional), where("postFor", "==", "international"))
            : query(collection(db, "posts"), orderBy("createdAt", "desc"), where("status", "==", "posted"), where("postFor", "==", "international"));

            const unsubscribe = onSnapshot(queryCondition, (querySnapshot) => {
              const postsData = querySnapshot.docs.map((doc) => {
                const data = doc.data() as { text: string; title: string; uid: string; createdAt?: unknown; imageURL?: string };
                return {
                  id: doc.id,
                  title: data.title,
                  text: data.text,
                  uid: data.uid,
                  createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : null,
                  imageURL: data.imageURL,
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
                    createdAt: post.createdAt ? post.createdAt.toISOString() : undefined, // Convert Date to string
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

    const fetchBookmarkedPosts = async () => {
      if(user?.uid === undefined) return;

      const bookmarksQuery = query(
        collection(db, "bookmarks"),
        where("uid", "==", user.uid)
      );

      const unsubscribe = onSnapshot(bookmarksQuery, (querySnapshot) => {
        const bookmarkedIds = querySnapshot.docs.map((doc) => (doc.data() as { postId: string }).postId);
        setBookmarkedPosts(bookmarkedIds); // Update the state with bookmarked post IDs
      });

      return unsubscribe;
    };

    const checkOverflow = () => {
      const newOverflowState: Record<string, boolean> = {};
      Object.entries(paragraphRefs.current).forEach(([postId, element]) => {
        if (element) {
          const isOverflow = element.scrollHeight > element.clientHeight;
          newOverflowState[postId] = isOverflow;
        }
      });
      setIsOverflowing(newOverflowState);
    };

    checkOverflow();
    void fetchBookmarkedPosts();
    void fetchPosts();
  }, [user, loading, tab, posts]);

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);

  }

  const regionalTab = () => setTab("regional");
  const internationalTab = () => setTab("international");

  const handlePostPrayer = async () => {
    if (!title.trim() || !text.trim()) {
      alert("Please fill in the title and description.");
      return;
    }

    setLoadings(true);

    let imageURL = "";
    if (image) {
      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "unsigned_upload"); // Replace with your Cloudinary upload preset

      try {
        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/dn1nqplkn/image/upload`,
          formData
        );
        imageURL = response.data.secure_url;
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image.");
        setLoadings(false);
        return;
      }
    }

    // Submit prayer to Firestore
    try {
      if (!user?.uid) {
        console.error("User is not logged in or UID is undefined.");
        return;
      }

      const currentUser = await getDoc(doc(db, "users", user.uid));

      await addDoc(collection(db, "posts"), {
        title: title.trim(),
        text: text.trim(),
        uid: user?.uid,
        createdAt: new Date(),
        status: "posted",
        regional: (currentUser.data() as { regional?: string })?.regional,
        postFor: "international",
        country: (currentUser.data() as { country?: string })?.country,
        imageURL: imageURL
      });

      alert("Prayer posted successfully!");
      setTitle("");
      setText("");
      setImage(null);
    } catch (error) {
      console.error("Error posting prayer:", error);
      alert("Failed to post prayer.");
    } finally {
      setLoadings(false);
    }
  };

  const handleSeeMore = async (postId: string) => {
    await router.push("/international/post/" + postId);
  }

  return (
        <Layout>
          <Head>
            <title>PrayerLink</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
            <div className="fixed w-full bg-white max-w-[598px] top-0">
              <div>
                <div className="flex flex-cols mt-3 mb-2">
                  <div className="">
                  <SidebarTrigger />
                  </div>
                  <div className="w-full items-center justify-center pr-7">
                    <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
                    <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
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
                  <SheetContent className={`w-full ${GeistSans.className} overflow-y-scroll`}>  
                    <SheetHeader>
                      <SheetTitle>Post Prayer</SheetTitle>
                      </SheetHeader>
                      <SheetDescription>
                        <div className="tems-start">

                          <div>
                            <Textarea
                              value={title}
                              placeholder="Prayer Title"
                              onChange={(t) => setTitle(t.target.value)}
                              className="resize-none max-h-[20px] font-bold"/>
                              <Textarea
                              value={text}
                              placeholder="Prayer Description"
                              onChange={(e) => setText(e.target.value)}
                              className="resize-none min-h-[250px] max-h-screen mt-2 mb-2"/>
                            <UploadImageForm onImageSelect={setImage} />
                          </div>
                          <SheetClose className="fixed items-center mt-2 mb-2">
                            <div className="fixed items-center mt-2 mb-2">
                              <Button className="fixed right-4 bg-blue-600 hover:bg-blue-800 active:bg-primary/30" onClick={handlePostPrayer}>Post Prayer</Button>
                            </div>
                          </SheetClose>
                        </div>
                      </SheetDescription>
                  </SheetContent>
                </Sheet>            
              </div>
              <Separator className="mt-4 w-full" />
            </div>
            <div className="justify-center pt-40 w-full flex flex-col transition-all">
        <div>
          {posts.map((post) => (
                        
                            <div key={post.id} className="grid grid-cols-[40px_1fr] items-start border-b pb-2 pt-2">
                              <div>
                              <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                              </div>
                              <button onClick={() => handleSeeMore(post.id)} className="hover:cursor-pointer">
                              <div className="pl-4">
                                <div className="flex gap-1 items-center">
                                  <p className="font-bold text-lg">{post.name}</p>
                                  <p className="flex pr-10 text-muted-foreground">
                                    &#x2022; {post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown Date"}
                                  </p>
                                </div>
                                <p className="text-left font-semibold text-gray-700 whitespace-normal break-all pr-10">
                                  {post.title ? post.title : "No Title"}
                                </p>
                                <p
                                  ref={(el) => {
                                    paragraphRefs.current[post.id] = el;
                                  }}
                                  className="text-left  whitespace-normal break-all overflow-hidden pr-10 line-clamp-3"
                                >
                                  {post.text}
                                </p>
                                
                                {isOverflowing[post.id] && <p className="text-left  text-blue-500 hover:underline hover:cursor-pointer">...see more</p>}
          
                                {post.imageURL ? (
                                  <div className="w-full mt-2 pr-10">
                                    <Image
                                      src={post.imageURL}
                                      alt="Post Image"
                                      width={500}
                                      height={300}
                                      className="text-left rounded-lg object-cover max-h-[200px] mb-2"
                                    />
                                  </div>
                                ):(<></>)}
                              </div>
                              
                              </button>
                              
                            </div>
                    ))}
        </div>
      </div>
      </div>
    </Layout>
  );
}

