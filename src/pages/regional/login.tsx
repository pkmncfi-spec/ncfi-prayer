import { GoogleAuthProvider, signInWithPopup} from "firebase/auth";
import { auth } from "~/lib/firebase";
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
import { z } from "zod"

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

const formSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export default function AuthPage() {
    const [showPass, setShowPass] = useState<boolean>(false);
    const [signInWithEmailAndPassword] = useSignInWithEmailAndPassword(auth);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const { user, loading } = useAuth();

    const redirect = false;

    useEffect(() => {
        if (loading) return; // Jangan redirect saat masih loading
        if (user) void router.push("/");
    }, [user, loading, router, redirect]);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isSubmitting) return;
        setIsSubmitting(true);
    
        if (!values.email || !values.password) {
            alert("Email dan password tidak boleh kosong!");
            setIsSubmitting(false);
            return;
        }
    
        try {
            const userCredential = await signInWithEmailAndPassword(values.email, values.password);
            const user = userCredential?.user;
            
            // if (!user.emailVerified) {
            //     alert("Please verify your email before logging in.");
            //     void auth.signOut();
            //     setIsSubmitting(false);
            //     return;
            // }
    
            void router.push("/home");
        } catch (e) {
            if (e instanceof FirebaseError) {
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
                        alert("Terjadi kesalahan. Silakan coba lagi.");
                }
            } else {
                console.error(e);
                alert("Terjadi kesalahan yang tidak diketahui.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }
    
    

    const handleLoginGoogle = async () => {
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
        <main className="flex min-h-screen flex-col justify-center items-center mr-4 ml-4">
            <Card className="w-full max-w-[500px] self-center mb-4">
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
                            <div className="pt-4">
                                <Button className="w-full bg-blue-600 hover:bg-blue-800 active:bg-primary/30" type="submit">Submit</Button>
                            </div>
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
                    <FcGoogle/> Login with Google (sementara blom)
                </Button>

                <p>Dont Have Account?<Link href="/register" className="font-bold text-blue-700 ml-1">Register</Link></p>
            </CardFooter>
            </Card>
        </main>
        </>
    );
}
