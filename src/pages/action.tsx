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
        router.replace(`/reset-password?apiKey=${apiKey}&mode=${mode}&oobCode=${oobCode}&continueUrl=${continueUrl}&lang=en`);
        break;
      case "recoverEmail":
        router.replace(`/reset-password?apiKey=${apiKey}&mode=${mode}&oobCode=${oobCode}&continueUrl=${continueUrl}&lang=en`);
        break;
      default:
        // Unknown mode - maybe redirect to home
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
