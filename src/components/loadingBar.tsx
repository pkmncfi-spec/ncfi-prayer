import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";

const LoadingBar = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-full h-1 bg-blue-500 z-50"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: loading ? 1 : 0 }}
      transition={{ duration: loading ? 0.8 : 0.0, ease: "easeOut" }}
      style={{ transformOrigin: "left" }}
    />
  );
};

export default LoadingBar;