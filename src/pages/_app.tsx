import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import { AuthProvider } from "~/context/authContext";
import { AppSidebar } from "~/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "~/components/ui/sidebar"


import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <AuthProvider>
        <div className={GeistSans.className}>
          <SidebarProvider>
            <AppSidebar/>
            <SidebarTrigger/>
            <Component {...pageProps} />
          </SidebarProvider>
        </div>
    </AuthProvider>
  );
};

export default api.withTRPC(MyApp);
