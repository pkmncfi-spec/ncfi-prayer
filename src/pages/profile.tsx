import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { signOut } from "firebase/auth";
import { auth } from "~/lib/firebase";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("Indonesia");

  useEffect(() => {
    if (user?.displayName) {
      setFullName(user.displayName);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      await router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const posts = [
    { id: 1, author: fullName, date: "1 Jan 30", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    { id: 2, author: fullName, date: "1 Jan 30", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
    { id: 3, author: fullName, date: "1 Jan 30", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
  ];

  return (
    <>
      <Head>
        <title>{fullName} - Profile</title>
        <meta name="description" content="User Profile Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
        <div className="w-full max-w-xs bg-white rounded-lg shadow-md overflow-hidden">
          {/* Layer 1 */}
          <div className="relative w-full h-16 bg-white flex items-center px-4 border-b border-gray-300">
            <button>
              <span className="text-black text-lg font-bold">&#9776;</span>
            </button>
            <div className="absolute left-1/2 top-1/2 w-6 h-6 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Header */}
          <div className="bg-gray-400 h-24 relative flex justify-center">
            <div className="absolute top-4 right-4">
            </div>
          </div>
          

          {/* Profile Section */}
          <div className="relative flex flex-col items -mt-14 p-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
            <h3 className="text-lg font-bold mt-2">{fullName}</h3>
          </div>

          {/* Posts Section */}
          <div className="p-4">
            <h3 className="text-sm font-bold mb-2">Your Post</h3>
            {posts.map((post) => (
              <div key={post.id} className="bg-white p-3 rounded-lg flex items-start border border-gray-300 shadow-sm mb-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="font-bold text-sm">{post.author} <span className="text-gray-500 font-normal">· {post.date}</span></p>
                  <p className="text-gray-700 text-xs">{post.content} <a href="#" className="text-blue-600 font-medium">...click to see more</a></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}