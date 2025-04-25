import { Dialog } from "@radix-ui/react-dialog";
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from "firebase/firestore";
import { GeistSans } from "geist/font/sans";
import { Bookmark, BookmarkCheck } from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { FaShareFromSquare } from "react-icons/fa6";
import { HiDotsVertical } from "react-icons/hi";
import { IoMdArrowRoundBack } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import Layout from "~/components/layout/sidebar-regional";
import { Button } from "~/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogTrigger } from "~/components/ui/dialog";
import { useAuth } from "~/context/authContext";
import { app } from "~/lib/firebase";

const db = getFirestore(app);

export default function PostPage() {
    const router = useRouter();
    const  postId  = "koet5C8rEWAJwBk7ibIj"; // Get postId from the URL
    const [post, setPost] = useState<{
        title: string;
        text: string;
        imageURL?: string;
        createdAt?: string;
        status?: string;
        uid?: string;
        postFor?: string;
        forInternational?: boolean
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

    useEffect(() => {
        if (!router.isReady || !postId) return; // Wait until the router is ready
        const fetchPost = async () => {
            try {
                const postDoc = await getDoc(doc(db, "devotions", postId as string));
                if (postDoc.exists()) {
                    const data = postDoc.data();
                    setPost({
                        title: data.title,
                        text: data.text,
                        imageURL: data.imageURL,
                        createdAt: data.createdAt?.toDate().toISOString(),
                        status: data.status,
                        uid: data.uid,
                        postFor: data.postFor,
                        forInternational: data.forInternational
                    });
                } else {
                    console.error("Post not found");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            }

            fetchPostUserName();
        };


        const fetchBookmarkedPosts = async () => {
            try {
                if (!user?.uid || !postId) {
                    console.warn("User UID or Post ID is undefined. Skipping fetchBookmarkedPosts.");
                    return;
                }
        
                const q = query(
                    collection(db, "bookmarks"),
                    where("uid", "==", user.uid),
                    where("postId", "==", postId)
                );
        
                const querySnapshot = await getDocs(q);
        
                if (!querySnapshot.empty) {
                    setIsBookmarked(true);
                } else {
                    setIsBookmarked(false);
                }
            } catch (error) {
                console.error("Error fetching bookmarked posts:", error);
            }
        };

        const fetchPostUserName = async () => {
            if (!post?.uid) {
                return;
            }
            try {
                const postDoc = await getDoc(doc(db, "users", post.uid as string));
                if (postDoc.exists()) {
                    setUserName(postDoc.data().name);
                } else {
                    console.error("Post not found");
                }
            } catch (error) {
                console.error("Error fetching post name:", error);
            }
        }
        
        fetchBookmarkedPosts();
        setPrayerFor(post?.forInternational || false);
        fetchPost();
    }, [router.isReady, postId, user?.uid, post?.postFor, post?.forInternational, post?.uid]);

    function formatDate(date: Date): string {
        return new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "2-digit",
            year: "numeric",
        }).format(date);
    }

    const shareForInternational = async (postId: string) => {
        try {
          // Update the prayer request status to "posted"
          await updateDoc(doc(db, "posts", postId), { forInternational: true });
          alert("Prayer request shared for international!");
          console.log("Prayer request accepted!");
        } catch (error) {
          console.error("Error accepting prayer request:", error);
        }
    };

    const editPost = async (postId: string) => {
        await router.push("/regional/edit/" + postId);
    }

    const deletePost = async (postId: string) => {
        try {
            await updateDoc(doc(db, "posts", postId), { status: "deleted" });
            router.back();
            console.log("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };

    const toggleBookmark = async () => {
        if (!user?.uid || !postId) {
            console.warn("User UID or Post ID is undefined. Skipping toggleBookmark.");
            return;
        }
    
        try {
            const bookmarksQuery = query(
                collection(db, "bookmarks"),
                where("uid", "==", user.uid),
                where("postId", "==", postId)
            );
    
            const querySnapshot = await getDocs(bookmarksQuery);
    
            if (!querySnapshot.empty) {
                // If the post is already bookmarked, remove it
                const bookmarkDocId = querySnapshot.docs[0]?.id; // Get the document ID of the bookmark
                if (bookmarkDocId) {
                    await deleteDoc(doc(db, "bookmarks", bookmarkDocId));
                    setIsBookmarked(false); // Update the state
                    console.log("Bookmark removed successfully.");
                }
            } else {
                // If the post is not bookmarked, add it
                await addDoc(collection(db, "bookmarks"), {
                    uid: user.uid,
                    postId: postId,
                    createdAt: new Date(),
                });
                setIsBookmarked(true); // Update the state
                console.log("Bookmark added successfully.");
            }
        } catch (error) {
            console.error("Error toggling bookmark:", error);
        }
    };

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
                            <p className="text-gray-600 mt-2">April 25, 2025</p>                        
                        </div>
                    ) : (
                        <p>Loading post...</p>
                    )}
                </div>
            </main>
        </Layout>
    );
}