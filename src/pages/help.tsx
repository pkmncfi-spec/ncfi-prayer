import Layout from "~/components/layout/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import * as React from "react";
import Head from "next/head";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "~/components/ui/accordion";

export default function HelpPage() {
  return (
    <Layout>
      <SidebarTrigger />
      <Head>
        <title>Help Center</title>
        <meta name="description" content="User Help Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col w-full max-w-[500px] mx-autoborder min-h-screen">
        {/* Header */}
        <div className="relative w-full h-16 bg-gray-000 flex items-center px-4 border-b border-gray-300">
          <div className="absolute left-1/2 top-1/2 w-6 h-6 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        {/* Konten FAQ */}
        <div className="flex flex-col w-full max-w-[500px] mx-auto min-h-screen">
          <Accordion type="multiple" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b border-gray-300 rounded-none">
              <AccordionTrigger className="text-lg font-semibold p-4 bg-white text-left w-full rounded-none">
                How to use?
              </AccordionTrigger>
              <AccordionContent className="text-gray-900 text-sm p-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae luctus urna.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b border-gray-300 rounded-none">
              <AccordionTrigger className="text-lg font-semibold p-4 bg-white text-left w-full rounded-none">
                How to change password?
              </AccordionTrigger>
              <AccordionContent className="text-gray-900 text-sm p-4">
                Go to your account settings, select Change Password, and follow the instructions.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b border-gray-300 rounded-none">
              <AccordionTrigger className="text-lg font-semibold p-4 bg-white text-left w-full rounded-none">
                How to post a prayer?
              </AccordionTrigger>
              <AccordionContent className="text-gray-900 text-sm p-4">
                Click on the Post a Prayer button, write your prayer, and submit it for others to see.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </Layout>
  );
}
