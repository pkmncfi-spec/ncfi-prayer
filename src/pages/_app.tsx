import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import { AuthProvider } from "~/context/authContext";


import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
        <div className={GeistSans.className}>
            <Component {...pageProps} />
        </div>
    </AuthProvider>
  );
};

export default api.withTRPC(MyApp);
