"use client";

import Layout from "~/components/layout/sidebar-member";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { LogOut } from "lucide-react";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { signOut } from "firebase/auth";
import { auth } from "~/lib/firebase";
import { Button } from "~/components/ui/button";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("Indonesia");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
    <Layout>
      <SidebarTrigger />
      <Head>
        <title>{fullName} - Profile</title>
        <meta name="description" content="User Profile Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-full max-w-[500px] mx-autoborder min-h-screen">
        <div className="bg-gray-400 h-24 flex justify-center"></div>
        <div className="relative flex flex-col items-right -mt-12 p-4">
          <div className="w-20 h-20 bg-gray-300 rounded-full"></div>
          <h3 className="text-lg font-bold mt-2">{fullName}</h3>
          <Button
            variant="ghost"
            className="absolute top-16 right-1 -translate-y-1/2 p-2"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        {showLogoutConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center w-80">
              <p className="text-sm font-bold">Do you want to log out now?</p>
              <div className="flex flex-col gap-2 mt-4">
                <Button variant="outline" onClick={handleLogout} className="w-full">
                  Yes
                </Button>
                <Button variant="outline" onClick={() => setShowLogoutConfirm(false)} className="w-full">
                  No
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <h3 className="text-sm font-bold mb-2">Your Posts</h3>
          {posts.map((post) => (
            <div key={post.id} className="bg-white p-3 rounded-lg flex items-start border border-gray-300 shadow-sm mb-2">
              <div className="flex-1">
                <p className="font-bold text-sm">{post.author} <span className="text-gray-500 font-normal">· {post.date}</span></p>
                <p className="text-gray-700 text-xs">{post.content} <a href="#" className="text-blue-600 font-medium">...click to see more</a></p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
