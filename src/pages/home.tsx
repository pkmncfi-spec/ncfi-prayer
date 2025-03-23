import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, query, onSnapshot, getDoc, doc } from "firebase/firestore";
import { app } from "~/lib/firebase"; // Pastikan ini adalah konfigurasi Firebase Anda
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import Layout from "~/components/layout/sidebar";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { GeistSans } from "geist/font/sans";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";

const db = getFirestore(app);

export default function HomePage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; name: string }>>([]);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"regional" | "international">("regional");
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if(!user) return void router.push("/register");;
    const unsubscribe = onSnapshot(query(collection(db, "posts")), (querySnapshot) => {
      const postsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { text: string; uid: string }),
      }));
  
      // Ambil nama user hanya jika diperlukan
      const usersMap: Record<string, string> = {};
      Promise.all(
        postsData.map(async (post) => {
          if (!usersMap[post.uid]) {
            const userDoc = await getDoc(doc(db, "users", post.uid));
            usersMap[post.uid] = userDoc.exists() ? (userDoc.data() as { name: string }).name : "Unknown";
          }
        })
      ).then(() => {
        const enrichedPosts = postsData.map((post) => ({
          ...post,
          name: usersMap[post.uid] ?? "Unknown",
        }));
      
        setPosts(enrichedPosts);
      }).catch((error) => {
        console.error("Error fetching user data:", error);
      });
    });
  
    return () => unsubscribe();
  }, []);


  const handlePost = async () => {
    console.log("User:", user); // Debugging
    if (!text.trim() || !user?.uid) return; // Pastikan tidak post kosong dan user login

    await addDoc(collection(db, "posts"), {
      text: text.trim(),
      uid: user.uid,
      createdAt: new Date(),
    });

    setText(""); // Reset input setelah post
    alert("Post successful!");
  };

  const regionalTab = () => setTab("regional");
  const internationalTab = () => setTab("international");

  return (
        <Layout>
          <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
            <div className="fixed w-full bg-white max-w-[598px]">
              <div>
                <div className="flex flex-cols-2 mt-4">
                  <div className="">
                  <SidebarTrigger />
                  </div>
                  <div className="w-full items-center justify-center pr-7">
                    <img src="favicon.ico" alt="NFCI Prayer" width="25" height="25" className="mx-auto" />
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
                  <Separator orientation="vertical" className="h-5 w-[1px] bg-gray-300" />
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
                  <SheetTrigger className="w-full text-gray-500">Post Message Here ......</SheetTrigger>
                  <SheetContent className={`w-full ${GeistSans.className}`}>
                    <SheetHeader>
                      <SheetTitle>asdasdasdjhsdfsdf</SheetTitle>
                      <SheetDescription>
                        <Textarea
                          value={text}
                          placeholder="Type your message here."
                          onChange={(e) => setText(e.target.value)}
                          className="mb-2 resize-none h-[100px]"/>
                        <Button onClick={handlePost}>Send message</Button>
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>            
              </div>
              <Separator className="mt-4 w-full" />
            </div>
            <div className="justify-center pt-40 w-full flex flex-col transition-all">
              {tab === "regional" ? (
                <div>
                  {posts.map((post) => (
                    <div key={post.id} className="border-b-[1px] py-2">
                      <div className="grid grid-cols-[40px_1fr] items-start">
                        <img src="image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                        <div className="pl-4">
                          <p className="font-semibold">{post.name}</p>
                          <p className="whitespace-normal break-all overflow-hidden pr-10">{post.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {posts.map((post) => (
                    <div key={post.id} className="border-b-[1px] py-2">
                      <div className="grid grid-cols-[40px_1fr] items-start">
                        <img src="image.png" alt="NFCI Prayer" width="30" height="30" className="rounded-full ml-5 mt-1" />
                        <div className="pl-4">
                          <p className="font-semibold">{post.name}</p>
                          <p className="whitespace-normal break-all overflow-hidden pr-10">{post.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Layout>

      // </div>
  );
}

