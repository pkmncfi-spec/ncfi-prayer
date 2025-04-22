import { sendEmailVerification } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { Mail, MoveRight } from "lucide-react"
import { useRouter } from "next/router";
import { use, useEffect, useState } from "react";
import { set } from "zod";
import { Button } from "~/components/ui/button";
import { app } from "~/lib/firebase";
import { auth } from "~/lib/firebase"; // make sure this is imported
import Spinner from "react-loading";

const db = getFirestore(app);

export default function VerifyPage() {
    const router = useRouter();
    const { verifyId } = router.query;
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (verifyId) {
            try{
                const docRef = doc(db, "users", verifyId as string);
                getDoc(docRef).then((doc) => {
                    if (doc.exists()) {
                        setEmail(doc.data().email);
                    } else {
                        console.log("No such document!");
                    }
                });
            } catch (error) {
                console.log(error);
            }
        }
    }, [verifyId]);

    const handleResend = async () => {
        setLoading(true);
        try {
            const currentUser = auth.currentUser;

            if (!currentUser) {
                alert("You must be logged in to resend the verification email.");
                return;
            }

            await sendEmailVerification(currentUser);
            alert("Verification email has been resent.");
        } catch (error) {
            console.log("Resend email error:", error);
            alert("Failed to resend verification email.");
        } finally {
            setLoading(false);
        }
    }

    const handleReturn = async () => {
        await auth.signOut();
        router.push("/register");
    }

    return (
        <div className="text-center self-center w-screen justify-center flex-col flex min-h-screen items-center">
            <div className="bg-blue-500 p-8 rounded-full mb-2">
                <Mail className="mx-auto " color="white" width={100} height={100}/>
            </div>
            <div>
                <h1 className="text-5xl font-bold mb-8">Verify your email address</h1>
            </div>
            <div className="text-xl mb-4">
                <h2 className="mb-4">We have sent you a verification link to <span><u>{email}</u></span></h2>
                <h2>Click on the link to complete the verification process.</h2>
                <h2>You might need to <b>check your spam folder.</b> </h2>
            </div>
            <div className="mt-4">
                <Button className="w-100 text-xl bg-blue-500 hover:bg-blue-600 py-6 px-8 mr-4 font-semibold" onClick={handleResend}>
                {loading ? (
                        <Spinner color="white" height={20} width={20}/>
                    ) : (
                        <>Resend Email</>
                    )}
                </Button>
                <Button className="text-xl py-6 px-8 font-semibold" onClick={handleReturn} variant={"outline"}>Return <MoveRight /></Button>
            </div>
        </div>
    )
}