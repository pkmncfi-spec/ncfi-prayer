import { Dialog } from "@radix-ui/react-dialog";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import Layout from "~/components/layout/sidebar-admin";
import { useAuth } from "~/context/authContext";
import { app } from "~/lib/firebase";

const db = getFirestore(app);

export default function PostPage() {
    const router = useRouter();
    const { devotionId } = router.query; // Get postId from the URL
    const [post, setPost] = useState<{
        title: string;
        text: string;
        imageURL?: string;
        postedAt?: string;
    } | null>(null);
    const { user } = useAuth(); // Assuming you have a user context or auth provider
    const [userRole, setUserRole] = useState<string | null>(null); // State to store user role

    useEffect(() => {
        if (!router.isReady || !devotionId) {
            console.warn("Router is not ready or devotionId is undefined.");
            return;
        }
    
        const fetchUserId = async () => {
            try {
                if (!user?.uid) {
                    console.warn("User UID is undefined.");
                    return;
                }
    
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    console.log("User Data:", userData); // Debugging
                    setUserRole(userData.role || "guest"); // Fallback to "guest" if role is undefined
                } else {
                    console.error("User document not found.");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
    
        const fetchPost = async () => {
            try {
                const postDoc = await getDoc(doc(db, "devotions", devotionId as string));
                if (postDoc.exists()) {
                    const data = postDoc.data();
                    console.log("Post Data:", data); // Debugging
                    setPost({
                        title: data.title || "Untitled", // Fallback to "Untitled" if title is undefined
                        text: data.text || "No content available.", // Fallback to default text
                        imageURL: data.imageURL || null,
                        postedAt: formatDate(data.postedAt?.toDate()),
                    });
                } else {
                    console.error("Post document not found.");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            }
        };
    
        fetchPost();
        fetchUserId();
    }, [router.isReady, devotionId, user?.uid]);
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

    const editPost = useCallback((devotionId: string) => {
        console.log("Editing post with ID:", devotionId);
        router.push("/admin/edit/" + devotionId);
    }, [router]);

    return (
        <Layout>
            <Head>
                <title>Today's Devotion</title>
                <meta name="description" content="User Post Page" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="border min-h-screen overflow-y-auto max-w-[600px]">
                
                <div className="fixed top-0 flex flex-cols pt-4 mb-2 border-b bg-white max-w-[598px] w-full z-10 py-3  ">
                <Dialog>
                    <div className="">  
                        <button onClick={() => router.push("/admin/devotion")} className="flex items-center justify-center">
                            <IoMdArrowRoundBack className="text-2xl mt-1 ml-2"/>
                        </button>
                    </div>
                    <div className="w-full items-center justify-center">
                        <p className="text-2xl text-center font-bold mb-1">Devotion</p>
                    </div>
                    {userRole === "admin" ? (
                        <button onClick={() => editPost(devotionId as string)} className="border-gray-500 text-xl mr-3 ">
                            <FaEdit className="mb-2"/>
                        </button>
                    ): (
                        <div className="mr-4"></div>
                    )}
                </Dialog>
                </div>
                <div className="p-4">
                    {post ? (
                        <div className="pb-4 mt-16">
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
                            <p className="text-gray-600 mt-2">{post.postedAt ? formatDate(new Date(post.postedAt)) : "Unknown date"}</p>
                        </div>
                    ) : (
                        <p>Loading devotion...</p>
                    )}
                </div>
            </main>
        </Layout>
    );
}