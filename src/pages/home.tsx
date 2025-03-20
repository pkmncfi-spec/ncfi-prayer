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
      // <div className="max-w-xl mx-auto p-4">
        /* <h1 className="text-2xl font-bold ">NCFI Prayer</h1>
        <Textarea
          value={text}
          placeholder="Type your message here."
          onChange={(e) => setText(e.target.value)}
          className="mb-2 resize-none h-[100px]"/>
        <Button onClick={handlePost}>Send message</Button>

        
        <div className="mt-4">
          {posts.map((post) => (
            <div key={post.id} className="border p-2 mb-4" >
              <p className="mt-2">{post.text}</p>
            </div>
          ))}
        </div> */
        <div className="flex flex-col w-full max-w-[500px]">
          <div className="flex flex-col w-full items-center justify-center">
            <div className=" text-center mt-2">
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
              <SheetContent className="w-full">
                <SheetHeader>
                  <SheetTitle>asdasdasdjhsdfsdf</SheetTitle>
                  <SheetDescription>
                    asdausdihausdh
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>            
          </div>
          <Separator className="my-4 w-full" />
          <div className="p-4 items-center justify-center w-full flex flex-col">
            {tab === "regional" ? (
              <div>
                {posts.map((post) => (
                  <div key={post.id} className="border-b-[1px] mt-4" >
                    <div>
                      <img src="favicon.ico" alt="NFCI Prayer" width="25" height="25" className="" />
                    </div>
                    <div>
                      <p className="mt-2">{post.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>Konten International...</p>
            )}
          </div>
        </div>

      // </div>
  );
}

