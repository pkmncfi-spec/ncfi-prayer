import { Dialog } from "@radix-ui/react-dialog";
import { collection, getDocs, getFirestore, query, Timestamp, where } from "firebase/firestore";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IoMdArrowRoundBack } from "react-icons/io";
import Layout from "~/components/layout/sidebar-international";
import { useAuth } from "~/context/authContext";
import { app } from "~/lib/firebase";


const db = getFirestore(app);

export default function PostPage() {
    const router = useRouter();
    const [postId, setPostId]  = useState<string | null>(null); // Get postId from the URL
    const [post, setPost] = useState<{
        title: string;
        text: string;
        imageURL?: string;
        createdAt?: string;
    } | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { user } = useAuth(); // Assuming you have a user context or auth provider
    const [userName, setUserName] = useState<string | null>(null); // State to store user role
    const [prayerFor, setPrayerFor] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);

    useEffect(() => {
        // Detect if the screen width is mobile
        const handleResize = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        };

        handleResize(); // Check on initial render
        window.addEventListener("resize", handleResize); // Listen for window resize

        return () => {
            window.removeEventListener("resize", handleResize); // Cleanup listener
        };
    }, []);

    function formatDate(date: Date): string {
        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
        }).format(date);
    }

    useEffect(() => {
        const fetchPost = async () => {
            try {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
          
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
          
              const postsQuery = query(
                collection(db, "devotions"),
                where("postedAt", ">=", Timestamp.fromDate(today))
              );
          
              const querySnapshot = await getDocs(postsQuery);
          
              querySnapshot.forEach((doc) => {
                const data = doc.data();
                setPost({
                  title: data.title,
                  text: data.text,
                  imageURL: data.imageURL,
                  createdAt: data.postedAt?.toDate().toISOString(), // optional
                });
              });
            } catch (error) {
              console.error("Error fetching today's posts:", error);
            }
          };
        
        fetchPost();
    }, [router.isReady, postId, user?.uid]);

    return (
        <Layout>
            <Head>
                <title>{post ? post.title : "Loading..."}</title>
                <meta name="description" content="User Post Page" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="border min-h-screen overflow-y-auto max-w-[600px]">
                
                <div className="fixed top-0 flex flex-cols pt-4 mb-2 border-b bg-white max-w-[598px] w-full z-10 py-3">
                <Dialog>
                    <div className="">  
                        <button onClick={() => router.back()} className="flex items-center justify-center">
                            <IoMdArrowRoundBack className="text-2xl mt-1 ml-2"/>
                        </button>
                    </div>
                    <div className="w-full items-center justify-center">
                        <p className="text-2xl text-center font-bold mb-1 mr-6">Today's Devotion</p>
                    </div>
                    
                </Dialog>
                </div>
                <div className="p-4">
                    <div className="flex items-center mb-4 mt-8 pb-4">
                    </div>
                    {post ? (
                        <div className="pb-4">
                            <h1 className="text-2xl font-bold">{post.title}</h1>
                            <p className="mt-2 whitespace-normal break-all">{post.text}</p>
                            {post.imageURL && (
                                <Image
                                    src={post.imageURL}
                                    alt="Post Image"
                                    width={1000}
                                    height={1000}
                                    className="mt-4 rounded-lg object-cover max-w-full"
                                />
                            )}
                            <p className="text-gray-600 mt-2">{post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown date"}</p>                        
                        </div>
                    ) : (
                        <p>Today's devotion not been posted yet</p>
                    )}
                </div>
            </main>
        </Layout>
    );
}