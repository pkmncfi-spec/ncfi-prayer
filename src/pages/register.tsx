import Head from "next/head";
import { Button } from "~/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox"
import { GoogleAuthProvider, sendEmailVerification, signInWithPopup} from "firebase/auth";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
 
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "~/components/ui/select"

import { Input } from "~/components/ui/input"
import { useState } from "react";

import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth"
import { auth } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";
import { useEffect } from "react";
import { db } from "~/lib/firebase";
import { doc, setDoc} from "firebase/firestore";
import { GeistSans } from "geist/font/sans";


const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    country: z.string().min(2, { message: "Country is required" }),
    dateOfBirth: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, { message: "Date format must be MM-DD-YYYY" }),
    gender: z.string().min(1, { message: "..." }),
    role: z.string().min(1, { message: "..." }),
    isverified: z.boolean().default(false),
  });

export default function RegisterPage() {
    const router = useRouter();
    const [showPass, setShowPass] = useState<boolean>(false);
    const [createUserWithEmailAndPassword] = useCreateUserWithEmailAndPassword(auth);
    const { user, loading } = useAuth();

    useEffect(() => {
        if (loading) return; // Jangan redirect saat masih loading
        if (user) return;
    }, [user, loading, router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            country: "",
            dateOfBirth: "",
            email: "",
            password: "",
            gender: "male",
            role: "guest"
        },
    })
    async function onSubmit(values: z.infer<typeof formSchema>){
        try{
            const userCredential = await createUserWithEmailAndPassword(values.email, values.password);
            if(userCredential){
                const users = userCredential.user;
                await sendEmailVerification(users);

                await setDoc(doc(db, "users", users.uid), {
                    name: values.name,
                    uid: users.uid,
                    email: users.email,
                    country: values.country,
                    dateOfBirth: values.dateOfBirth,
                    isVerified: false,
                    gender: values.gender,
                    role: "guest"
                });
                
                alert("Register successful!");
                form.reset();

                router.push("/login");
            } else {
                console.error('Failed to create user credential');
            }
        } catch(e){
            console.error(e);
        }
    }

    const handleGoogleRegist = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.push("/login");
    };

    return (
        <>
        <Head>
            <title>NCFI Prayer</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="flex min-h-screen flex-col justify-center items-center">
            <Card className="w-full max-w-[500px] self-center mt-4 mb-4">
            <CardHeader className="items-center">
                <CardTitle className="font-bold text-2xl">Create Account</CardTitle> 
                <CardDescription className="">NCFI Prayer</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1 mb-2">
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Joko Armando Setiabudi" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="gender"
                        render={({ }) => (
                            <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <Select>
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent className={GeistSans.className}>
                                        <SelectGroup>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="MM-DD-YYYY" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Indonesia" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
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
                        control={form.control}
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
                        <div className="flex items-center mb-4 pt-2">
                            <Checkbox id="showpass" 
                                checked={showPass}
                                onCheckedChange={(checked) => setShowPass(!!checked)}/>
                            <label
                                htmlFor="showpass"
                                className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2">
                                Show Password
                            </label>
                        </div>
                        <div className="pt-7">
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
                    <FcGoogle/> Register with Google (sementara blom)
                </Button>

                <p>Already Have an Account?<Link href="/login" className="font-bold text-blue-700 ml-1">Login</Link></p>
            </CardFooter>
            </Card>
        </main>
        </>
    );
}
