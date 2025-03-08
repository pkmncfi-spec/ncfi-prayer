import Head from "next/head";
import Link from "next/link";

import { signOut } from "firebase/auth";
import { auth } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";



export default function Home() {
  const router = useRouter();

  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return; // Jangan redirect saat masih loading
    if (!user) router.push("/auth");
  }, [user, loading, router]);

  // Tampilkan "Loading..." jika masih menunggu Firebase memuat user
  if (loading) return <p>Loading...</p>;
  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <Head>
        <title>NCFI Prayer</title>
        <meta name="description" content="Prayer app for NCFI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <h1 className="text-5xl">Ini nanti homepage, Welcome, {user.displayName}</h1>
        <h2><button onClick={handleLogout}>Logout</button></h2>
      </main>
    </>
  );
};
