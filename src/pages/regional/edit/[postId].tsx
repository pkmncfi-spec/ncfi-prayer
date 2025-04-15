import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { addDoc, collection, doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import Head from "next/head";
import Layout from "~/components/layout/sidebar-regional";
import { SidebarTrigger } from "~/components/ui/sidebar";
import Image from "next/image";
import { app } from "~/lib/firebase";
import { IoMdArrowRoundBack } from "react-icons/io";
import { HiDotsVertical } from "react-icons/hi";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogDescription, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { GeistSans } from "geist/font/sans";
import { useAuth } from "~/context/authContext";
import { FaShareFromSquare } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Textarea } from "~/components/ui/textarea";
import { set } from "zod";
import UploadImageForm from "~/components/UploadImageForm";
import axios from "axios";

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
    } | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const { user } = useAuth(); // Assuming you have a user context or auth provider
    const [userName, setUserName] = useState<string | null>(null); // State to store user role
    const [content, setContent] = useState<string>(""); // State to store content
    const [title, setTitle] = useState<string>(""); // State to store content
    const [image, setImage] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string>(""); // Separate state for image URL
    const [loadings, setLoadings] = useState(false);
    const [prayerFor, setPrayerFor] = useState("");

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
                        createdAt: data.createdAt?.toDate().toLocaleString(),
                        status: data.status,
                        uid: data.uid,
                        postFor: data.postFor
                    });
                } else {
                    console.error("Post not found");
                }
            } catch (error) {
                console.error("Error fetching post:", error);
            }
        };

        const fetchUser = async () => {
            try {
                if (!user?.uid) return; // Ensure user is logged in
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setUserName(userData.name); // Set the user name from the fetched data
                } else {
                    console.error("User not found");
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };
        setPrayerFor(post?.postFor || "");
        setImageURL(post?.imageURL || ""); // Use the new state for image URL
        setContent(post?.text || ""); // Set initial content to post text
        setTitle(post?.title || ""); // Set initial title to post title
        fetchUser();
        fetchPost();
        
    }, [router.isReady, postId, user?.uid, post?.text, post?.title, post?.imageURL, post?.postFor]);

    const handlePostPrayer = async () => {
        setLoadings(true);
    
        try {
            let uploadedImageURL = imageURL; // Use the existing imageURL if no new image is uploaded
    
            if (image) {
                // Upload image to Cloudinary
                const formData = new FormData();
                formData.append("file", image);
                formData.append("upload_preset", "unsigned_upload"); // Replace with your Cloudinary upload preset
    
                const response = await axios.post(
                    `https://api.cloudinary.com/v1_1/dn1nqplkn/image/upload`,
                    formData
                );
    
                uploadedImageURL = response.data.secure_url; // Get the uploaded image URL
                setImageURL(uploadedImageURL); // Update the state
                console.log("Uploaded Image URL:", uploadedImageURL); // Debugging
            }
    
            // Update Firestore document
            if (!user?.uid) {
                console.error("User is not logged in or UID is undefined.");
                return;
            }
    
            await updateDoc(doc(db, "posts", postId as string), {
                title: title.trim(),
                text: content.trim(),
                imageURL: uploadedImageURL, // Save the updated imageURL
            });
    
            alert("Prayer updated successfully!");
            await router.back();
        } catch (error) {
            console.error("Error updating prayer:", error);
            alert("Failed to update prayer.");
        } finally {
            setLoadings(false);
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
                    <div className="">  
                        <button onClick={() => router.back()} className="flex items-center justify-center">
                            <IoMdArrowRoundBack className="text-2xl mt-1 ml-2"/>
                        </button>
                    </div>
                    <div className="w-full items-center justify-center">
                        <p className="text-2xl text-center font-bold mb-1 pr-10">Edit Post</p>
                    </div>

                </div>
                <div className="p-4 pt-20">
                    {post ? (
                        <div className="pb-4">
                            <div className="mb-4">
                                <p className="font-bold">Title</p>
                                <Textarea
                                value={title}
                                placeholder="Type your title here."
                                onChange={(e) => setTitle(e.target.value)}
                                className="resize-none font-semibold mb-4"/>
                                <p className="font-bold">Prayer Message</p>
                                <Textarea
                                value={content}
                                placeholder="Type your message here."
                                onChange={(e) => setContent(e.target.value)}
                                className="resize-none min-h-[300px]"/>
                            </div>
                            
                            {imageURL !== "" ? (
                                <div>
                                    <div>
                                        <p className="font-bold">Current Image</p>
                                        <Image
                                            src={imageURL}
                                            alt="Post Image"
                                            width={1000}
                                            height={1000}
                                            className="rounded-lg"
                                        />
                                    </div>
                                    <Button variant={"outline"} onClick={() => setImageURL("")} className="w-full mt-1 hover:text-red-500 hover:bg-red-100"><MdDelete /></Button>
                                    <p className="font-bold">Change Image</p>
                                    <UploadImageForm onImageSelect={(file) => setImage(file)} />
                                </div>
                            ) : (
                                <div>
                                    <p className="font-bold">Upload Image</p>
                                    <UploadImageForm onImageSelect={(file) => setImage(file)} />
                                </div>
                            )}
                            
                        </div>
                    ) : (
                        <p>Loading post...</p>
                    )}
                    <Button variant={"outline"} onClick={handlePostPrayer} className="w-full border-blue-500 text-blue-500">
                        Save Changes
                    </Button>
                </div>
            </main>
        </Layout>
    );
}