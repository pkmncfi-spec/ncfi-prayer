import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { app } from "~/lib/firebase";

const db = getFirestore(app);

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    async function userRole() {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data() as { role?: string };
          if (userData?.role) {
            void router.push(`/${userData.role}/home`);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
    }
    void userRole();
  }, [user, router]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      {/* Header */}
      <header className="bg-white shadow-md fixed top-0 left-0 w-full z-50">
        <nav className="container mx-auto flex justify-between items-center py-4 px-4 md:px-6">
          <div className="text-xl md:text-2xl font-bold text-blue-900">PrayerLink</div>
          <ul className="flex space-x-4 md:space-x-6 items-center">
            <li><Link href="#home" className="text-gray-800 hover:text-blue-900">Home</Link></li>
            <li><Link href="#about" className="text-gray-800 hover:text-blue-900">About</Link></li>
            <li><Link href="#services" className="text-gray-800 hover:text-blue-900">Services</Link></li>
            <li><Link href="#events" className="text-gray-800 hover:text-blue-900">Events</Link></li>
            <li>
              <Button 
                onClick={() => router.push("/login")} 
                className="bg-white text-gray-800 hover:text-blue-100 px-6 py-3 rounded-full shadow-none"
              >
                Log In
              </Button>
            </li>
            <li>
              <Button 
                onClick={() => router.push("/register")} 
                className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700 transition-all"
              >
                Try PrayerLink
              </Button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative flex items-center justify-center min-h-screen pt-20 px-4 md:px-6">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('/LandingPage1.jpg')" }}
        ></div>
        <div className="relative z-10 text-center text-white px-6 py-20 bg-white bg-opacity-80 rounded-lg shadow-lg w-full max-w-full mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Welcome to PrayerLink</h2>
          <p className="text-gray-700 mt-4">Connecting people through prayer</p>
          <div className="flex flex-wrap justify-center space-x-4 mt-6">
            <Button 
              onClick={() => router.push("/register")} 
              className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-md hover:bg-blue-700 transition-all"
            >
              Try PrayerLink
            </Button>
            <Button 
              onClick={() => router.push("/login")} 
              className="border border-gray-800 text-gray-800 px-6 py-3 rounded-full bg-white hover:bg-gray-100 transition-all"
            >
              Already have an account?
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-950 text-white text-center py-4 px-4">
        <p>&copy; 2025 PrayerLink. All rights reserved.</p>
      </footer>
    </div>
  );
}