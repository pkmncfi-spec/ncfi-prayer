import Layout from "~/components/layout/sidebar"
import { SidebarTrigger } from "~/components/ui/sidebar"
import * as React from "react";

export default function RequestPage() {
  return (
    <Layout>
      <SidebarTrigger />
      <main className="flex flex-col w-full max-w-[500px] mx-autoborder min-h-screen">
        {/* Header */}
        <div className="flex flex-col w-full items-center justify-center">
          <div className="relative w-full h-16 bg-gray-000 flex items-center px-4 border-b border-gray-300">
              <div className="absolute left-1/2 top-1/2 w-6 h-6 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          </div>

          {/* Konten Post Request yang dilakukan */}
          <div className="flex flex-col w-full max-w-[500px] mx-autoborder min-h-screen">
            
          </div>
        </div>
      </main>
    </Layout>
  )
}
