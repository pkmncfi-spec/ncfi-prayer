import { useState, useEffect, useRef } from "react";
import { getFirestore, collection, addDoc, query, onSnapshot, getDoc, doc, orderBy, where, deleteDoc, getDocs, Timestamp, updateDoc } from "firebase/firestore";
import { app, auth } from "~/lib/firebase";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import Layout from "~/components/layout/sidebar-guest";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { GeistSans } from "geist/font/sans";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { useAuth } from "~/context/authContext";
import Image from 'next/image';
import Head from "next/head";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import { Bookmark, BookmarkCheck, ImageDown } from "lucide-react";
import UploadImageForm from "~/components/UploadImageForm";
import axios from "axios";
import router from "next/router";
import { signOut } from "firebase/auth";

const db = getFirestore(app);

export default function HomePage() {
  const [posts, setPosts] = useState<Array<{ id: string; text: string; title: string; name: string; createdAt?: string; imageURL?: string }>>([]);
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [tab, setTab] = useState<"regional" | "international">("regional");
  const { user, loading } = useAuth();
  const [bookmarkedPosts, setBookmarkedPosts] = useState<string[]>([]);
  const [isOverflowing, setIsOverflowing] = useState<Record<string, boolean>>({});
  const [imageURL, setImageURL] = useState<string>("");
  const paragraphRefs = useRef<Record<string, HTMLParagraphElement | null>>({});
  const [image, setImage] = useState<File | null>(null);
  const [loadings, setLoadings] = useState(false);
  const [imageURLState, setImageURLState] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);

  useEffect(() => {
    const checkEmail = async () => {
      if(!user?.emailVerified){
        await signOut(auth);
      }
    }
    const setRoles = async () => {
      try {
        if (!user?.uid) return; // Ensure user ID is defined
        const userDoc = await getDoc(doc(db, "users", user.uid));

        const userData = userDoc.data() as { isVerified?: boolean };
        if (userData?.isVerified) {
          setIsVerified(userData.isVerified);
        }
      } catch {

      }
    }
    checkEmail();
    setRoles();
  })

  return (
        <Layout>
          <Head>
            <title>PrayerLink</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
          </Head>
          <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
            <div className="fixed w-full bg-white max-w-[598px] top-0">
              <div>
                <div className="flex flex-cols mt-3 mb-2">
                  <div className="">
                  <SidebarTrigger />
                  </div>
                  <div className="w-full items-center justify-center pr-7">
                    <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
                    <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
                  </div>
                </div>
                <Separator className="mb-4 w-full" />
              </div>
              <div className="min-h-screen">
                {!isVerified ? (
                  <p className="text-center text-lg ml-16 mr-16">
                    Please wait for the confirmation process for a moment, after that you can access the web page
                  </p>
                ):(
                  <p>
                    You have been rejected
                  </p>
                )}

              </div>

      </div>
      </div>
    </Layout>
  );
}

