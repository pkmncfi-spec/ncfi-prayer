import { useState, useEffect, useRef } from "react";
import { getFirestore, collection, addDoc, query, onSnapshot, getDoc, doc, orderBy, where, deleteDoc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { app } from "~/lib/firebase";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import Layout from "~/components/layout/sidebar-regional";
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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Bookmark, BookmarkCheck, ImageDown } from "lucide-react";
import UploadImageForm from "~/components/UploadImageForm";
import axios from "axios";

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
  const [imageURLState, setImageURLState] = useState<string>("");

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

  const shareInternational = async (id: string) => {
    try {
      await updateDoc(doc(db, "posts", id), { postFor: "international", status: "requested"});
      console.log("Prayer request accepted!");
    } catch (error) {
      console.error("Error accepting prayer request:", error);
    }
  }

  const handlePost = async () => {
    console.log("User:", user)
    if (!text.trim() || !user?.uid) return; // Pastikan tidak post kosong dan user login

    if (!user?.uid) {
      console.error("User is not logged in or UID is undefined.");
      return;
    }
    const currentUser = await getDoc(doc(db, "users", user.uid));

    await addDoc(collection(db, "posts"), {
      title: title.trim(),
      text: text.trim(),
      uid: user.uid,
      createdAt: new Date(),
      status: "posted",
      regional: (currentUser.data() as { regional?: string })?.regional,
      postFor: "regional",
      country: (currentUser.data() as { country?: string })?.country,
      imageURL: imageURL
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

  const toggleBookmark = async (postId: string) => {
    if (!user?.uid) return;

    try {
      const bookmarksQuery = query(
        collection(db, "bookmarks"),
        where("uid", "==", user.uid),
        where("postId", "==", postId)
      );

      const querySnapshot = await getDocs(bookmarksQuery);

      if (!querySnapshot.empty) {
        // If the post is already bookmarked, remove it
        const bookmarkDocId = querySnapshot.docs[0]?.id ?? "";
        await deleteDoc(doc(db, "bookmarks", bookmarkDocId));
        setBookmarkedPosts((prev) => prev.filter((id) => id !== postId)); // Update state
      } else {
        // If the post is not bookmarked, add it
        await addDoc(collection(db, "bookmarks"), {
          uid: user.uid,
          postId: postId,
          createdAt: new Date(),
          imageURL: imageURL,
        });
        setBookmarkedPosts((prev) => [...prev, postId]); // Update state
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

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
        postFor: "regional",
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
            <Dialog key={post.id}>
              
                  <div className="grid grid-cols-[40px_1fr] items-start border-b pb-2 pt-2">
                    <Image src="/image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                    <DialogTrigger asChild className="hover:cursor-pointer">
                    <div className="pl-4">
                      <div className="flex gap-1 items-center">
                        <p className="font-bold text-lg">{post.name}</p>
                        <p className="flex pr-10 text-muted-foreground">
                          &#x2022; {post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown Date"}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-700 whitespace-normal break-all pr-10">
                        {post.title ? post.title : "No Title"}
                      </p>
                      <p
                        ref={(el) => {
                          paragraphRefs.current[post.id] = el;
                        }}
                        className="whitespace-normal break-all overflow-hidden pr-10 line-clamp-3"
                      >
                        {post.text}
                      </p>
                      
                      {isOverflowing[post.id] && <p className="text-blue-500 hover:underline hover:cursor-pointer">...see more</p>}

                      {post.imageURL ? (
                        <div className="w-full mt-2">
                          <Image
                            src={post.imageURL}
                            alt="Post Image"
                            width={500}
                            height={300}
                            className="rounded-lg object-cover max-h-[200px] mb-2"
                          />
                        </div>
                      ):(<></>)}
                    </div>
                    
                    </DialogTrigger>
                    
                  </div>
              <DialogContent className={`flex flex-col ${GeistSans.className}`}>
                <div className="rounded-lg p-8 flex flex-col">
                  <DialogHeader className="flex justify-between items-center w-full">
                    <div className="flex items-center space-x-2 w-full justify-between">
                      <DialogTitle className="text-lg">{post.name}&#39;s Prayer</DialogTitle>
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
                      <p className="font-semibold">{post.title ? post.title : "No Title"}</p>
                      <p>{post.text}</p>
                      {post.imageURL ? (
                        <div className="w-full mt-2">
                          <Image
                            src={post.imageURL}
                            alt="Post Image"
                            width={500}
                            height={300}
                            className="rounded-lg object-cover mb-2"
                          />
                        </div>
                      ):(<></>)}
                    </DialogDescription>
                  </div>
                  <DialogFooter className="pt-6">
                    <Button className="bg-blue-600 hover:bg-blue-800 active:bg-primary/30" onClick={() => shareInternational(post.id)}>Share to International</Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
      </div>
    </Layout>
  );
}

