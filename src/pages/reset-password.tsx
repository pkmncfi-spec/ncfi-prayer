import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";

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
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { TbMapQuestion } from "react-icons/tb";
import Spinner from "react-loading";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { PiSealCheckFill } from "react-icons/pi";



export default function ResetPasswordPage() {
  const router = useRouter();
  const { oobCode } = router.query;
  const auth = getAuth();

  const [newPassword, setNewPassword] = useState("");
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      password: "",
    },
  });
  

  useEffect(() => {
    if (!oobCode || typeof oobCode !== "string") return;

    verifyPasswordResetCode(auth, oobCode)
      .then(() => {
        setIsCodeValid(true);
      })
      .catch((error) => {
        console.error("Invalid or expired code", error);
      });
  }, [auth, oobCode]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPassword = form.getValues("password");
  
    if (!oobCode || typeof oobCode !== "string") return;
  
    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      alert("Password has been reset!");
      router.push("/login");
    } catch (error) {
      console.error(error);
      alert("Failed to reset password.");
    }
    setIsLoading(false);
  };

  if (!isCodeValid) return <p className="text-center mt-10">Checking reset link...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-blue-300 to-blue-500">
      <Card className="w-full max-w-[500px] self-center mb-4 shadow-2xl mx-4">
        <div className="px-8 pt-8 rounded-full flex items-center justify-center">
          <PiSealCheckFill color="#507fe7" size={150} />
        </div>
        <CardHeader className="items-center">
          <CardTitle className="font-bold text-2xl">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Enter your new password
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
                <form onSubmit={handleReset} className="space-y-4">
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="Enter new password" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button
                    className="w-full bg-blue-600 hover:bg-blue-800 active:bg-primary/30"
                    type="submit"
                    disabled={isLoading}
                    >
                    {isLoading ? (
                        <Spinner color="white" height={20} width={20} />
                    ) : (
                        <>Reset Password</>
                    )}
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>
    </div>
  );
}
