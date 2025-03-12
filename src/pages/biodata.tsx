import Head from "next/head";
import { Button } from "~/components/ui/button"

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

import { Input } from "~/components/ui/input"
import { useState } from "react";

import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth"
import { auth } from "~/lib/firebase";

const formSchema = z.object({
    fullName: z.string(),
    dateOfBirth: z.string().date(),
    nurseID: z.string()
});

export default function RegisterPage() {
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            dateOfBirth: "",
            nurseID: ""
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>){
        try{

        } catch(e){
            console.error(e);
        }
    }

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
                <CardTitle className="font-bold text-2xl">Biodata</CardTitle> 
                <CardDescription className="">NCFI Prayer</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mb-2">
                        <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="Your Full Name" {...field} />
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
                                <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="nurseID"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nurse ID</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="nurseID"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Nurse ID</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button className="w-full bg-blue-600 hover:bg-blue-800 active:bg-primary/30" type="submit">Submit</Button>
                    </form>
                    </Form>
                </div>
            </CardContent>
            <CardFooter>
            </CardFooter>
            </Card>
        </main>
        </>
    );
}
