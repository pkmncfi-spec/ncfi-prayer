import Head from "next/head";

import { signOut } from "firebase/auth";
import { auth } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "~/lib/firebase";

const db = getFirestore(app);

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  useEffect(() => {
    async function userRole() {
      try{
        if(!user) return;

        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data() as { role?: string };
        void router.push("/"+ userData?.role + "/home");

        if (loading) return; // Jangan redirect saat masih loading
        if (user){
          void router.push("/"+ userData?.role + "/home");
          return;
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    }
    void userRole();
  }, [user, loading, router]);

  // Tampilkan "Loading..." jika masih menunggu Firebase memuat user
  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-black shadow-md fixed top-0 left-0 w-full z-50">
        <nav className="container mx-auto flex justify-between items-center py-4 px-6">
          <div className="text-2xl font-bold text-white">SugengRahayu</div>
          <ul className="flex space-x-6 items-center">
            <li><Link href="#home" className="text-white hover:text-gray-400">Home</Link></li>
            <li><Link href="#about" className="text-white hover:text-gray-400">About</Link></li>
            <li><Link href="#services" className="text-white hover:text-gray-400">Services</Link></li>
            <li>
              <Button onClick={() => router.push("/login")} className="border border-black bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200">
                Login
              </Button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative flex items-center justify-center min-h-screen pt-16">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6">
          <div>
            <h2 className="text-5xl font-bold text-gray-900">Welcome to SugengRahayu</h2>
            <p className="text-gray-600 mt-4">A place for spiritual growth and community</p>
            <div className="flex space-x-4 mt-6">
              <Button onClick={() => router.push("/login")} className="bg-black text-white px-6 py-3">Login</Button>
              <Button onClick={() => router.push("/register")} className="border border-black text-black px-6 py-3 bg-transparent">Sign Up</Button>
            </div>
          </div>
          <div className="flex justify-center">
            <Image src="/1.png" alt="Hero Image" width={600} height={400} className="rounded-lg" />
          </div>
        </div>
      </section>

      {/* About Section */}
      
      <section id="about" className="bg-gray-300 py-16 px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-6">
        <div className="ml-auto w-full md:w-3/4 p-6 rounded-3xl">
          <h2 className="text-3xl font-bold text-gray-900">Pray together in groups</h2>
          <p className="text-black mt-4">
            Create a prayer group and start sharing prayer requests and praying for each other within your own country or region.
            Pray with your spouse, your Bible study group, or your friends. Don't wait until you see each other to share and pray together—
            SugengRahayu helps you pray for each other every day, wherever you are.
          </p>
          <p className="text-gray-800 mt-4 italic">
            Want to use prayer groups in your church?
            <Link href="/register" className="text-blue-900 font-semibold hover:underline"> Sign up to our Platform!</Link>
          </p>
        </div>
        <div className="flex justify-center -mr-auto">
          <Image src="/2.png" alt="About Image" width={400} height={500} className="rounded-lg" />
        </div>
      </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-gray-200 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Our Services</h2>
        <p className="text-gray-600 mt-4">Join our Sunday Worship, Prayer Meetings, and more.</p>
      </section>

      {/* Events Section */}
      <section id="events" className="container mx-auto py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Upcoming Events</h2>
        <p className="text-gray-600 mt-4">Stay updated with our latest events and gatherings.</p>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-4">
        <p>&copy; 2025 SugengRahayu. All rights reserved.</p>
      </footer>
    </div>
  );
};
