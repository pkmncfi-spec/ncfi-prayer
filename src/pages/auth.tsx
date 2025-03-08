import { GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import { auth } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import { Button } from "~/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

export default function AuthPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      void router.push("/");
    }
  }, [user, router]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <>
      <Head>
        <title>NCFI Prayer</title>
        <meta name="description" content="Prayer app for NCFI" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-[calc(100vh-144px)] w-full flex-col justify-center">
        <Card className="w-full max-w-[400px] self-center">
          <CardHeader className="items-center">
            <CardTitle className="font-bold text-2xl">Create Account</CardTitle> 
            <CardDescription className="">NCFI Prayer</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full place-items-center mt-10 " variant={"outline"} onClick={handleLogin}>Login with .....</Button>
            <Button className="w-full place-items-center mt-4" variant={"outline"} onClick={handleLogin}>Login with .....</Button>
            <Button className="w-full place-items-center mt-4 mb-10" variant={"outline"} onClick={handleLogin}><FcGoogle/> Login with Google</Button>
          </CardContent>
          <CardFooter className="items-center">
            <p>Dont Have Account ?<Link href="/registerPage" className="font-bold text-purple-700">Register</Link></p>
          </CardFooter>
        </Card>
      </main>
    </>
  );
}
