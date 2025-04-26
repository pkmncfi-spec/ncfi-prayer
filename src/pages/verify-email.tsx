import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuth, applyActionCode } from "firebase/auth";
import Spinner from "react-loading";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { oobCode} = router.query;
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!router.isReady) return; // WAIT until the query is ready
  
    const verifyEmail = async () => {
      if (!oobCode || typeof oobCode !== "string") return;
  
      const auth = getAuth();
      try {
        await applyActionCode(auth, oobCode);
        setStatus("success");
        await auth.currentUser?.reload();
      } catch (error: any) {
        console.error(error);
        setErrorMessage(error.message || "The verification link is invalid or expired.");
        setStatus("error");
      }
    };
  
    verifyEmail();
  }, [router.isReady, oobCode]);

  const handleContinue = async () => {
    const auth = getAuth();
    await auth.signOut();
    setTimeout(() => {
        router.push("/login");
    }, 300);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner color="#507fe7" height={50} width={50} />
        <p className="ml-4">Verifying your email...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold text-black">Email Verification Failed</h1>
        <p className="mt-2">{errorMessage}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-800"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-3xl font-bold text-black">Email Verified Successfully!</h1>
      <p className="mt-4">Thank you! Your email has been verified.</p>
      <button
        onClick={handleContinue}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-800"
      >
        Continue
      </button>
    </div>
  );
}
