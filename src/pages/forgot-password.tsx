import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { TbMapQuestion } from "react-icons/tb";
import Spinner from "react-loading";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email(),
});

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, data.email, {
        url: "https://prayerlink.vercel.app/login",
        handleCodeInApp: true,
      });
      setMessage("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      setMessage(error.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
      <Card className="w-full max-w-[500px] self-center mb-4 shadow-2xl mx-4">
        <div className="px-8 pt-8 rounded-full flex items-center justify-center">
            <TbMapQuestion color="black" size={150} />
        </div>
        <CardHeader className="items-center">
          <CardTitle className="font-bold text-2xl">Forgot Password</CardTitle>
          <CardDescription className="text-center">
            Please enter your email to receive a confirmation message to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button className="w-full bg-blue-600 hover:bg-blue-800 active:bg-primary/30" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Spinner color="white" height={20} width={20} />
                ) : (
                  <>Submit</>
                )}
              </Button>
              <p><Link href="/login" className="flex justify-center font-bold text-blue-700 ">Go Back</Link></p>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
            {message && <p className="text-black">{message}</p>}
        </CardFooter>
      </Card>
    </div>
  );
}
