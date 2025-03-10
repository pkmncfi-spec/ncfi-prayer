import Head from "next/head";
import { Button } from "~/components/ui/button"
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { Checkbox } from "~/components/ui/checkbox"


import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"

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

import { Input } from "~/components/ui/input"
import { useState } from "react";

const formSchema = z.object({
    email: z.string().email( {
        message: "Invalid email address",
    }),
    password: z.string()
        .min(8, { message: "Password must be at least 8 characters long." })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
        .regex(/[0-9]/, { message: "Password must contain at least one number." })
        .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character." })
});


export default function RegisterPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password: ""
        },
      })

    function onSubmit(values: z.infer<typeof formSchema>) {
        alert("testing")
    }

    const [showPass, setShowPass] = useState<boolean>(false);

    return (
        <>
        <Head>
            <title>NCFI Prayer</title>
            <meta name="description" content="Prayer app for NCFI" />
            <link rel="icon" href="/favicon.ico" />
        </Head>
        <main className="flex min-h-screen flex-col justify-center items-center">
            <Card className="w-full max-w-[350px] self-center">
            <CardHeader className="items-center">
                <CardTitle className="font-bold text-2xl">Create Account</CardTitle> 
                <CardDescription className="">NCFI Prayer</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-3">
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
                    </form>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-1">
                        <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type={showPass ? "text" : "password"} placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </form>
                    <div className="flex items-center mb-5">
                        <Checkbox id="showpass" 
                            checked={showPass}
                            onCheckedChange={(checked) => setShowPass(!!checked)}/>
                        <label
                            htmlFor="showpass"
                            className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2">
                            Show Password
                        </label>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-800 active:bg-primary/30" type="submit">Submit</Button>
                    </Form>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col">
                <div className="flex w-full items-center justify-between gap-x-4">
                    <div className="h-[2px] w-full border-t-2" />
                    <p className="flex-1 text-nowrap text-sm text-muted-foreground">
                    Atau lanjut dengan
                    </p>
                    <div className="h-[2px] w-full border-t-2" />
                </div>

                <Button className="w-full mt-6 mb-10 hover:bg-primary/10" variant={"outline"}>
                    <FcGoogle/> Login with Google
                </Button>

                <p>Already Have Account?<Link href="/auth" className="font-bold text-purple-700 ml-2">Login</Link></p>
            </CardFooter>
            </Card>
        </main>
        </>
    );
}
