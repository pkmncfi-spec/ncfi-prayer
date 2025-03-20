import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { app } from "~/lib/firebase"; // Pastikan ini adalah konfigurasi Firebase Anda
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";

const db = getFirestore(app);

export default function HomePage() {
    const [posts, setPosts] = useState<Array<{ id: string; text: string }>>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const postsData: Array<{ id: string; text: string }> = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { text: string }),
    }));
    
    setPosts(postsData);
    };
      
  void fetchPosts(); // Immediately invoke the function
}, []);

  const handlePost = async () => {
    if (!text) return;
    
    await addDoc(collection(db, "posts"), { text, createdAt: new Date() });
    alert("Post successful!");
  };

  return (
    <div className="max-w-xl mx-auto p-4 w-[]">
      <h1 className="text-2xl font-bold ">NCFI Prayer</h1>
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
      </div>
    </div>
  );
}

