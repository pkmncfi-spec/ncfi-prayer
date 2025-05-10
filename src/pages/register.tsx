import Head from "next/head";
import { Button } from "~/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox"
import { GoogleAuthProvider, sendEmailVerification, signInWithPopup, signOut} from "firebase/auth";
import {DatePicker} from "@heroui/date-picker";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

import Spinner from "react-loading";
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
    SelectTrigger,
    SelectValue,
  } from "~/components/ui/select"

import { Input } from "~/components/ui/input"
import { use, useState } from "react";

import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth"
import { auth } from "~/lib/firebase";
import { useAuth } from "~/context/authContext";
import { useEffect } from "react";
import { db } from "~/lib/firebase";
import { doc, setDoc} from "firebase/firestore";
import { GeistSans } from "geist/font/sans";

const countries = [
    "Argentina", "Australia", "Bangladesh", "Canada", "Chile", "Colombia", "Cuba", "Denmark", 
    "Ecuador", "Fiji", "Finland", "Ghana", "Hong Kong", "India", "Indonesia", "Japan", 
    "Malaysia", "Mongolia", "Nepal", "New Zealand", "Nigeria", "Norway", "Pakistan", 
    "Papua New Guinea", "Philippines", "Sierra Leone", "Singapore", "South Korea", 
    "Spain", "Taiwan", "USA", "United Kingdom & Ireland", "Zambia"
];

const formSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
    dateOfBirth: z.string().regex(/^\d{2}-\d{2}-\d{4}$/, { message: "Date format must be MM-DD-YYYY" }),
    gender: z.string().min(1, { message: "..." }),
    country: z.string().min(1, { message: "..." }),
    role: z.string().min(1, { message: "..." }),
    isverified: z.boolean().default(false),
  });

  const sortedCountries = countries.sort();

export default function RegisterPage() {
    const router = useRouter();
    const [showPass, setShowPass] = useState<boolean>(false);
    const [
        createUserWithEmailAndPassword,
        userCredential,
        loadingCreate,
        errorCreate
      ] = useCreateUserWithEmailAndPassword(auth);      
    const { user, loading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    

    useEffect(() => {
        if (loading) return; // Jangan redirect saat masih loading
        if (user) void router.push("/member/home");
    }, [user, loading, router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            dateOfBirth: "",
            email: "",
            password: "",
            gender: "",
            country: "",
            role: "guest"
        },
    })
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
      
        await createUserWithEmailAndPassword(values.email, values.password);
      
        if (errorCreate) {
          if (errorCreate.code === "auth/email-already-in-use") {
            alert("This email is already registered. Please use a different email.");
          } else {
            alert("Registration failed: " + errorCreate.message);
          }
          setIsLoading(false);
          return;
        }
      
        if (!userCredential || !userCredential.user) {
          alert("Failed to create user.");
          setIsLoading(false);
          return;
        }
      
        const users = userCredential.user;
      
        try {
          await sendEmailVerification(users);
      
          // Determine region
          let regionals = "";
      
          if (["Ghana", "Nigeria", "Sierra Leone", "Zambia"].includes(values.country)) {
            regionals = "africa";
          } else if (["Canada", "Haiti", "USA"].includes(values.country)) {
            regionals = "cana";
          } else if (["Denmark", "United Kingdom & Ireland", "Finland", "Norway", "Spain"].includes(values.country)) {
            regionals = "europe";
          } else if (["Argentina", "Colombia", "Chile", "Cuba", "Ecuador"].includes(values.country)) {
            regionals = "latin america";
          } else if (
            [
              "Australia", "Fiji", "Hong Kong", "Indonesia", "Japan", "New Zealand",
              "Mongolia", "Papua New Guinea", "Philippines", "Singapore", "Malaysia",
              "South Korea", "Taiwan"
            ].includes(values.country)
          ) {
            regionals = "pacea";
          } else if (["Bangladesh", "India", "Nepal", "Pakistan"].includes(values.country)) {
            regionals = "same";
          }
      
          await setDoc(doc(db, "users", users.uid), {
            name: values.name,
            uid: users.uid,
            email: users.email,
            country: values.country,
            dateOfBirth: values.dateOfBirth,
            isVerified: false,
            gender: values.gender,
            role: "guest",
            regional: regionals,
          });
      
          alert("Register successful!");
          form.reset();
          router.push("/verify/" + users.uid);
        } catch (e) {
          console.error(e);
          alert("An error occurred while saving your data.");
        } finally {
          setIsLoading(false);
        }
      }
      

    const handleGoogleRegist = async () => {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        router.push("/login");
    };

    return (
        <div className="bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
        <Head>
            <title>NCFI Prayer</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="flex min-h-screen flex-col justify-center items-center mr-4 ml-4">
            <Card className="w-full max-w-[500px] self-center mt-4 mb-4 shadow-2xl">
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
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <FormControl>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Select Country" />
                                    </SelectTrigger>
                                    <SelectContent className={GeistSans.className}>
                                        <SelectGroup>
                                            {sortedCountries.map((country) => (
                                                <SelectItem key={country} value={country}>
                                                    {country}
                                                </SelectItem>
                                            ))}
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
                            <Button className="w-full bg-blue-600 hover:bg-blue-800 active:bg-primary/30" type="submit">
                            {isLoading ? (
                                    <Spinner data-testid="loading-spinner" color="white" height={20} width={20}/>
                                ) : (
                                    <>Submit</>
                                )}
                            </Button>
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
                    <FcGoogle/> Register with Google (currently not available)
                </Button>

                <p>Already Have an Account?<Link href="/login" className="font-bold text-blue-700 ml-1">Login</Link></p>
            </CardFooter>
            </Card>
        </main>
        </div>
    );
}