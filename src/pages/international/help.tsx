import Layout from "~/components/layout/sidebar-international";
import { SidebarTrigger } from "~/components/ui/sidebar";
import * as React from "react";
import Head from "next/head";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "~/components/ui/accordion";
import Image from 'next/image';

import { useEffect, useState } from "react";

export default function HelpPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
          // Detect if the screen width is mobile
      const handleResize = () => {
          setIsMobile(window.matchMedia("(max-width: 768px)").matches);
      };

      handleResize(); // Check on initial render
      window.addEventListener("resize", handleResize); // Listen for window resize

      return () => {
          window.removeEventListener("resize", handleResize); // Cleanup listener
      };
  }, []);
  return (
    <Layout>
      <Head>
        <title>Help Center</title>
        <meta name="description" content="User Help Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    
      
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        {/* Header */}
        <div className="fixed w-full bg-white max-w-[598px] flex flex-cols top-0 pt-3 pb-2 border-b">
        {isMobile ? (
          <div className="ml-2 mt-1.5">
            <SidebarTrigger />
          </div>
        ) : (
          <div className="ml-8 mt-1.5"></div>
        )}
          <div className="w-full items-center justify-center pr-9">
            <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
            <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
          </div>
        </div>

        {/* Accordion Section */}
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="item-1" className="border-b border-gray-300">
            <AccordionTrigger className="text-lg font-semibold p-4 bg-white text-left w-full">
              How to use?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 text-sm p-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae luctus urna.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-2" className="border-b border-gray-300">
            <AccordionTrigger className="text-lg font-semibold p-4 bg-white text-left w-full">
              How to change password?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 text-sm p-4">
              Go to your account settings, select Change Password, and follow the instructions.
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="item-3" className="border-b border-gray-300">
            <AccordionTrigger className="text-lg font-semibold p-4 bg-white text-left w-full">
              How to post a prayer?
            </AccordionTrigger>
            <AccordionContent className="text-gray-900 text-sm p-4">
              Click on the Post a Prayer button, write your prayer, and submit it for others to see.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Layout>
  );
}
