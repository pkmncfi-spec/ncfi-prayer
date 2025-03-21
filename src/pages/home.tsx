import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, query } from "firebase/firestore";
import { app } from "~/lib/firebase"; // Pastikan ini adalah konfigurasi Firebase Anda
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import Layout from "~/components/layout/sidebar";
import { Separator } from "~/components/ui/separator";
import { Image } from "lucide-react";
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

const db = getFirestore(app);

export default function HomePage() {
    const [posts, setPosts] = useState<Array<{ id: string; text: string }>>([]);
  const [text, setText] = useState("");
  const [tab, setTab] = useState<"regional" | "international">("regional");


  useEffect(() => {
    const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const postsData: Array<{ id: string; text: string }> = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { text: string }),
    }));

    const userName: Array<{ id: string; text: string }> = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { text: string }),
    }));
    
    setPosts(postsData);
    };
      
    void fetchPosts();
}, []);

  const handlePost = async () => {
    if (!text) return;
    
    await addDoc(collection(db, "posts"), { text, createdAt: new Date() });
    alert("Post successful!");
  };

  const regionalTab = () => {
    setTab("regional");
  };

  const internationalTab = () => {
    setTab("international");
  };

  return (
        <Layout>
          <div className="flex flex-col w-full max-w-[500px] mx-autoborder min-h-screen">
            <div className="flex flex-col w-full items-center justify-center">
              <div className=" text-center mt-2">
              <SidebarTrigger />
              <img src="favicon.ico" alt="NFCI Prayer" width="25" height="25" className="mx-auto" />
                <p className="text-sm text-muted-foreground">NCFI Prayer</p>
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
            <div className="justify-center w-full inline-flex flex-col transition-all">
              {tab === "regional" ? (
                <div>
                  {posts.map((post) => (
                  <div key={post.id} className="border-b-[1px] pl-[10px] pr-[10px]" >
                      <div className="mt-4 mb-4">
                        <div className="flex items-center gap-1.5">
                          <img src="image.png" alt="NFCI Prayer" width="30" height="30" className=""/>
                          <p className="font-semibold">NCFI Prayer</p>
                        </div>
                        <div>
                          <div>

                          </div>
                          <div>

                          </div>
                          <p className="ml-9">{post.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Konten International...</p>
              )}
            </div>
          </div>
        </Layout>

      // </div>
  );
}

