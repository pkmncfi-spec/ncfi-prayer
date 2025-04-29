import axios from "axios";
import { addDoc, collection, doc, getDoc, getFirestore, onSnapshot, orderBy, query, Timestamp } from "firebase/firestore";
import { GeistSans } from "geist/font/sans";
import { Plus } from "lucide-react";
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from "react";
import Layout from "~/components/layout/sidebar-admin";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Textarea } from "~/components/ui/textarea";
import UploadImageForm from "~/components/UploadImageForm";
import { useAuth } from "~/context/authContext";
import { app } from "~/lib/firebase";

const db = getFirestore(app);

export default function HomePage() {
  const [devotions, setDevotions] = useState<Array<{ id: string; title: string; text: string; postedAt: Date;}>>([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const { user, loading } = useAuth();
  const [image, setImage] = useState<File | null>(null);
  const [loadings, setLoadings] = useState(false);
  const paragraphRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const router = useRouter();
    const [isMobile, setIsMobile] = useState(false)
  
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
      if (!user?.uid) return;

      try {
        // Query the bookmarks collection for the current user's bookmarks
        const devotionQuery = query(
          collection(db, "devotions"),
          orderBy("postedAt", "desc"),
          // where("postedAt", ">=", new Date()),
        );

        const unsubscribe = onSnapshot(devotionQuery, (querySnapshot) => {
          const fetchPost = async () => {
            if (!querySnapshot || !querySnapshot.docs) {
              console.error("Query snapshot is undefined or invalid.");
              return;
            }
        
            const devotionIds: string[] = querySnapshot.docs.map((doc) => {
              const devotionId = doc.id;
              return devotionId as string;
            }).filter((id) => id !== null) as string[]; // Filter out null values
        
            console.log("Devotion IDs:", devotionIds); // Debugging
        
            const devotions = await Promise.all(
              devotionIds.map(async (devotionId) => {
                try {
                  const postDoc = await getDoc(doc(db, "devotions", devotionId));
                  if (postDoc.exists()) {
                    const postData = postDoc.data() as { text: string; postedAt: any; title: string; };
                    return {
                      id: devotionId,
                      title: postData.title,
                      text: postData.text,
                      postedAt: postData.postedAt instanceof Timestamp ? postData.postedAt.toDate() : new Date(),
                    };
                  } else {
                    console.warn("Post document does not exist for devotion ID:", devotionId);
                  }
                } catch (error) {
                  console.error("Error fetching post document for devotion ID:", devotionId, error);
                }
                return null;
              })
            );
        
            setDevotions(devotions.filter((post) => post !== null) as Array<{ id: string; title: string; text: string; postedAt: Date; }>);
          };
        
          void fetchPost();
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching bookmarked posts:", error);
      }
    };

    void fetchPosts();
  }, [user, loading]);

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  const handlePostPrayer = async () => {
    if (!title.trim() || !text.trim()) {
      alert("Please fill in the title and description.");
      return;
    }

    setLoadings(true);

    let imageURL = "";
    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "unsigned_upload");

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

    try {
      if (!user?.uid) return;
      const currentUser = await getDoc(doc(db, "users", user.uid));

      const devotionRef = await addDoc(collection(db, "devotions"), {
        title: title.trim(),
        text: text.trim(),
        postedAt: new Date(),
        imageURL: imageURL
      });

      await addDoc(collection(db, "notifications"), {
        title: "Today's devotion",
        message: " has been posted",
        createdAt: new Date(),
        type: "devotion",
        forAll: true,
        uid: ""
      });

      await addDoc(collection(db, "logs"), {
        title: "Admin",
        message: " posted today's devotion",
        createdAt: new Date(),
        type: "devotion",
        forAll: true,
        uid: "",
        postId: devotionRef.id
      });

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

  const navigateToPost = useCallback((devotionId: string) => {
    router.push("/admin/devotion/" + devotionId);
  }, [router]);
  

  return (
    <Layout>
      <div className="flex justify-center w-full">
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        <div className="fixed w-full bg-white max-w-[598px] top-0">
          <div className="flex flex-cols mt-3 mb-2">
            <div>
            {isMobile ? (<div className="ml-2 mt-1.5">
              <SidebarTrigger />
            </div>): (<div className="ml-9 mt-1.5"></div>)}
            </div>
            <div className="w-full items-center justify-center pr-12">
              <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
              <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
            </div>
          </div>
          <Separator className="mb-6 w-full" />
          <h1 className="ml-6 text-2xl font-bold">Today's Devotion</h1>
          <Sheet>
            <div className="flex-1 flex justify-center items-center mt-6"> 
              <SheetTrigger className="bg-blue-500 text-white font-extrabold p-2 rounded-xl shadow-md hover:bg-blue-800 flex items-center justify-center">
                <Plus size={24} strokeWidth={3} />
              </SheetTrigger>
            </div>
            <SheetContent className={`w-full ${GeistSans.className} overflow-y-scroll`}>  
              <SheetHeader>
                <SheetTitle>Post Devotion</SheetTitle>
              </SheetHeader>
              <SheetDescription>
                <div className="items-start">
                  <div>
                    <Textarea
                      value={title}
                      placeholder="Devotion Title"
                      onChange={(t) => setTitle(t.target.value)}
                      className="resize-none max-h-[20px] font-bold"/>
                    <Textarea
                      value={text}
                      placeholder="Devotion Description"
                      onChange={(e) => setText(e.target.value)}
                      className="resize-none min-h-[250px] max-h-screen mt-2 mb-2"/>
                    <UploadImageForm onImageSelect={setImage} />
                  </div>
                  <SheetClose className="fixed items-center mt-2 mb-2">
                    <div className="fixed items-center mt-2 mb-2">
                      <Button className="fixed right-4 bg-blue-600 hover:bg-blue-800 active:bg-primary/30" onClick={handlePostPrayer}>Post Devotion</Button>
                    </div>
                  </SheetClose>
                </div>
              </SheetDescription>
            </SheetContent>
          </Sheet>            
        </div>
        <div className="justify-center pt-52 w-full flex flex-col transition-all">
          <div className="space-y-4 p-4">
          {devotions.map((post) => (
              <div 
                key={post.id} 
                className="border rounded-lg overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => navigateToPost(post.id)}
              >
                <div className="p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-500 text-sm">
                          {post.postedAt ? formatDate(new Date(post.postedAt)) : "Unknown Date"}
                        </span>
                      </div>
                      <h3 className="text-gray-800 mt-1">
                        <b>Today's Devotion</b> has been posted
                        {/* {post.title || "No Title"} */}
                      </h3>
                      <p
                        ref={(el) => { paragraphRefs.current[post.id] = el; }}
                        className="text-gray-600 text-sm line-clamp-3"
                      >
                        {/* {post.text} */}
                      </p>
                    </div>
                
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
}