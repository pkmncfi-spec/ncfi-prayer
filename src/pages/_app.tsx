import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import { AuthProvider } from "~/context/authContext";
import { useEffect } from "react";
import { getAuth, type User } from "firebase/auth";
import Cookies from "js-cookie";

import "~/styles/globals.css";
import LoadingBar from "~/components/loadingBar";

const MyApp: AppType = ({ Component, pageProps }) => {
    useEffect(() => {
        const auth = getAuth();
      
        const handleAuthStateChange = (user: User | null) => {
          if (user) {
            user.getIdToken()
              .then((token) => {
                Cookies.set("auth-token", token, { expires: 1 });
                console.log("Saved auth-token:", token); // Debugging
              })
              .catch((error) => {
                console.error("Error getting token:", error);
              });
          } else {
            Cookies.remove("auth-token");
          }
        };
      
        auth.onAuthStateChanged(handleAuthStateChange);
    }, []);
      

  return (
      <AuthProvider>
          <LoadingBar/>
          <div className={GeistSans.className}>
              <Component {...pageProps} />
          </div>
      </AuthProvider>
  );
};

export default api.withTRPC(MyApp);
