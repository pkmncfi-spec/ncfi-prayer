import { GoogleAuthProvider, signInWithPopup, sendEmailVerification, type User} from "firebase/auth";
import { app, auth } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";
import { Button } from "~/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { set, z } from "zod"
import { browserLocalPersistence, browserSessionPersistence, setPersistence } from "firebase/auth"; 

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "~/components/ui/card"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form"

import { Input } from "~/components/ui/input"
import { useState } from "react";

import { useSignInWithEmailAndPassword } from "react-firebase-hooks/auth"
import { FirebaseError } from "firebase/app";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import Spinner from "react-loading";

const db = getFirestore(app);

const formSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export default function AuthPage() {
    const [showPass, setShowPass] = useState<boolean>(false);
    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);
    const [isLoading, setIsLoading] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [rememberMe, setRememberMe] = useState(false);

    const router = useRouter();
    const { user, loading } = useAuth();

    const redirect = false;

    useEffect(() => {
        if (loading) return; // Jangan redirect saat masih loading
        async function fetchUser(){
            try {
                if (!user?.uid) {
                    throw new Error("User UID is undefined.");
                }
                const userDoc = await getDoc(doc(db, "users", user.uid));
                const userData = userDoc.data() as { role?: string };
    
                if (!user?.emailVerified) {
                    await router.push("/verify/" + user.uid);
                    return;
                }
                
                await router.push("/" + userData?.role + "/home");
            } catch (error) {
            }
        }
        
        if (user) {
            void fetchUser();
        } else {
            return;
        }
    }, [user, loading, router, redirect]);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isSubmitting || isLoading) return;
        setIsLoading(true);
        setIsSubmitting(true);
    
        if (!values.email || !values.password) {
            alert("Email dan password tidak boleh kosong!");
            setIsSubmitting(false);
            return;
        }
    
        try {
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    
            const userCredential = await signInWithEmailAndPassword(values.email, values.password);
            console.log("User Credential:", userCredential);
    
            const user = userCredential?.user;
    
            if (!user || !user.uid) {
                throw new Error("User UID is undefined.");
            }
    
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data() as { role?: string };
    
            if (!user.emailVerified) {
                alert("Please verify your email before logging in.");
                void router.push("/verify/" + user.uid);
                setIsSubmitting(false);
                return;
            }
    
            void router.push("/" + userData?.role + "/home");
        } catch (e) {
            if (e instanceof FirebaseError) {
                console.log("Error Code:", e.code);
                switch (e.code) {
                    case "auth/user-not-found":
                        alert("Email belum terdaftar. Silakan daftar terlebih dahulu.");
                        break;
                    case "auth/wrong-password":
                        alert("Password salah. Silakan coba lagi.");
                        break;
                    case "auth/invalid-email":
                        alert("Format email tidak valid.");
                        break;
                    case "auth/user-disabled":
                        alert("Akun ini telah dinonaktifkan.");
                        break;
                    case "auth/too-many-requests":
                        alert("Terlalu banyak percobaan login. Silakan coba lagi nanti.");
                        break;
                    default:
                        alert(`Terjadi kesalahan. Kode error: ${e.code}. Silakan coba lagi.`);
                }
            } else {
                console.error("Unknown error:" + e);
                alert("Terjadi kesalahan yang tidak diketahui.");
            }
        } finally {
            setIsSubmitting(false);
            setIsLoading(false);
        }
    }
    const handleLoginGoogle = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    return (
        <div className="bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
        <Head>
            <title>NCFI Prayer</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="flex min-h-screen flex-col justify-center items-center mr-4 ml-4">
            <Card className="w-full max-w-[500px] self-center mb-4 shadow-2xl">
            <CardHeader className="items-center">
                <CardTitle className="font-bold text-2xl">Sign In</CardTitle>
                <CardDescription className="">NCFI Prayer</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-2">
                            <FormField
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="example@mail.com" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />

                            <FormField
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type={showPass ? "text" : "password"} placeholder="•••••••••••••••" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <div className="flex items-center">
                                <Checkbox id="showpass" 
                                    checked={showPass}
                                    onCheckedChange={(checked) => setShowPass(!!checked)}/>
                                <label
                                    htmlFor="showpass"
                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2">
                                    Show Password
                                </label>
                            </div>
                            <div className="flex items-center">
                                <Checkbox id="rememberMe" 
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(!!checked)}/>
                                <label
                                    htmlFor="rememberMe"
                                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2">
                                    Remember Me
                                </label>
                            </div>
                            <div className="pt-4">
                                <Button className="w-full bg-blue-600 hover:bg-blue-800 active:bg-primary/30" type="submit">
                                {isLoading ? (
                                        <Spinner data-testid="loading-spinner" color="white" height={20} width={20}/>
                                    ) : (
                                        <>Submit</>
                                    )}
                                </Button>
                            </div>
                            <p className="justify-center items-center flex">Forgot Password?<Link href="/forgot-password" className="font-bold text-blue-700 ml-1">Reset</Link></p>
                        </form>
                        </Form>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col">
                <div className="flex w-full items-center justify-between gap-x-4">
                    <div className="h-[2px] w-full border-t-2" />
                    <p className="flex-1 text-nowrap text-sm text-muted-foreground">
                    Or Continue With
                    </p>
                    <div className="h-[2px] w-full border-t-2" />
                </div>

                <Button className="w-full mt-8 mb-10 hover:bg-primary/10" variant={"outline"}>
                    <FcGoogle/> Login with Google (currently not available)
                </Button>

                <p>Dont Have Account?<Link href="/register" className="font-bold text-blue-700 ml-1">Register</Link></p>
            </CardFooter>
            </Card>
        </div>
        </div>
    );
}
