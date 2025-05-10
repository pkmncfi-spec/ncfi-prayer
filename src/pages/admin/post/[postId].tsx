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
import Layout from "~/components/layout/sidebar-admin";
import { Button } from "~/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogTrigger } from "~/components/ui/dialog";
import { useAuth } from "~/context/authContext";
import { app } from "~/lib/firebase";

const db = getFirestore(app);

export default function PostPage() {
    const router = useRouter();
    const { postId } = router.query; // Get postId from the URL
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
                const postDoc = await getDoc(doc(db, "posts", postId as string));
                if (postDoc.exists()) {
                    const data = postDoc.data();
                    setPost({
                        title: data.title,
                        text: data.text,
                        imageURL: data.imageURL,
                        createdAt: formatDate(data.createdAt?.toDate()),
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
        if (!(date instanceof Date) || isNaN(date.getTime())) {
          return 'Invalid date';
        }
        return new Intl.DateTimeFormat("en-US", {
          month: "long",
          day: "2-digit",
          year: "numeric",
        }).format(date);
      }

    const deletePost = async (postId: string) => {
        try {
            await updateDoc(doc(db, "posts", postId), { status: "deleted" });

            await addDoc(collection(db, "logs"), {
                title: "Admin",
                message: " has deleted a post",
                createdAt: new Date(),
                type: "post",
                forAll: true,
                uid: "",
                postId: postId
            });

            await addDoc(collection(db, "notifications"), {
                title: "Admin",
                message: " has deleted your post",
                createdAt: new Date(),
                type: "post",
                forAll: false,
                uid: post?.uid,
                postId: postId
            });

            router.back();
            console.log("Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting post:", error);
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
                        <p className="text-2xl text-center font-bold mb-1">Post</p>
                    </div>
                        <DialogTrigger>
                            <HiDotsVertical className="text-2xl mb-1 mr-2 flex items-center justify-center" />
                        </DialogTrigger>
                    <DialogContent className={`${GeistSans.className} max-w-[350px]`}>
                        <DialogDescription className="mt-6">
                            <DialogClose className="w-full">
                                    <Button variant={"outline"} onClick={() => deletePost(postId as string)} className="h-14 border-gray-500 text-xl w-full mb-6 hover:bg-gray-200 active:bg-primary/30">
                                        <MdDelete /> Delete
                                    </Button>
                            </DialogClose>
                        </DialogDescription>
                    </DialogContent>
                </Dialog>
                </div>
                <div className="p-4">
                    <div className="flex items-center mb-4 mt-16 border-b-[3px] pb-4">
                        <div>
                            <Image src="/image.png" alt="NFCI Prayer" width="34" height="34" className="rounded-full mt-1" />
                        </div>
                        <div className="flex w-full">
                            <p className="ml-2 text-lg mr-1 font-bold">{userName}</p>
                        </div>
                    </div>
                    {post ? (
                        <div className="border-b-[3px] pb-4">
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
                            {post && (
                                <p className="text-gray-600 mt-2">
                                    {post.createdAt ? formatDate(new Date(post.createdAt)) : "Unknown date"}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p>Loading post...</p>
                    )}
                </div>
            </main>
        </Layout>
    );
}