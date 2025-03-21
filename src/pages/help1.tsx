"use client";

import * as React from "react";
import Head from "next/head";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "~/components/ui/accordion";
import { Card, CardContent } from "~/components/ui/card";

const HelpPage = () => {
  return (
    <>
      <Head>
        <title>Help Center</title>
        <meta name="description" content="User Help Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center bg-gray-100 p-4">
        <Card className="w-full max-w-xs bg-white rounded-lg shadow-lg overflow-hidden relative h-auto min-h-screen">
          {/* Header */}
          <div className="relative w-full h-16 bg-gray-000 flex items-center px-4 border-b border-gray-300">
            <button>
              <span className="text-black text-lg font-bold">&#9776;</span>
              <div className="absolute left-1/2 top-1/2 w-6 h-6 bg-gray-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </button>
          </div>

          {/* Konten FAQ */}
          <div className="flex-col">
            <Card className="w-full rounded-none">
              <CardContent className="p-0">
                <Accordion type="multiple" collapsible className="w-full">
                  <AccordionItem value="item-1" className="border-b border-gray-300 rounded-none">
                    <AccordionTrigger className="text-base font-semibold p-4 bg-white text-left w-full rounded-none">
                      How to use?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-900 text-xs p-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vitae luctus urna.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2" className="border-b border-gray-300 rounded-none">
                    <AccordionTrigger className="text-base font-semibold p-4 bg-white text-left w-full rounded-none">
                      How to change password?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-900 text-xs p-4">
                      Go to your account settings, select Change Password, and follow the instructions.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-3" className="border-b border-gray-300 rounded-none">
                    <AccordionTrigger className="text-base font-semibold p-4 bg-white text-left w-full rounded-none">
                      How to post a prayer?
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-900 text-xs p-4">
                      Click on the Post a Prayer button, write your prayer, and submit it for others to see.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </Card>
      </main>
    </>
  );
};

export default HelpPage;
