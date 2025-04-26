import { useRouter } from "next/router";
import { useEffect } from "react";

export default function FirebaseActionPage() {
  const router = useRouter();
  const { apiKey, mode, oobCode, continueUrl } = router.query;

  useEffect(() => {
    if (!mode || !oobCode) return;

    // Handle different modes
    switch (mode) {
      case "resetPassword":
        router.replace(`/reset-password?apiKey=${apiKey}&mode=${mode}&oobCode=${oobCode}&continueUrl=${continueUrl}&lang=en`);
        break;
      case "verifyEmail":
        router.replace(`/verify-email?mode=${mode}&oobCode=${oobCode}&apiKey=${apiKey}&lang=en`);
        break;
      default:
        router.replace("/");
        break;
    }
  }, [mode, oobCode, continueUrl, router, apiKey]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Processing request...</p>
    </div>
  );
}
