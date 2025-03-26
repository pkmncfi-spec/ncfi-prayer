"use client";

import Layout from "~/components/layout/sidebar";
import { SidebarTrigger } from "~/components/ui/sidebar";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog";

export default function Notification() {
  return (
    <Layout>
      <SidebarTrigger />
      <main className="flex flex-col w-full max-w-[500px] mx-autoborder min-h-screen">
        {/* Header */}
        <div className="flex flex-col w-full items-center justify-center bg-white py-4 border-b border-gray-300">
          <img src="favicon.ico" alt="NFCI Prayer" width="25" height="25" className="mx-auto" />
          <p className="text-sm text-gray-500">NCFI Prayer</p>
        </div>

        {/* Notification Section */}
        <div className="px-4 py-2">
          {/* Today Section */}
          <h2 className="text-lg font-semibold mb-2">Today</h2>

          <Dialog>
          <DialogTrigger asChild>
            <button className="bg-gray-000 p-3 rounded-2xl w-full text-left transition-all duration-300 hover:bg-gray-300 active:scale-95 border border-gray-300">
              <p className="text-sm font-semibold">Today's devotion has been posted</p>
              <span className="text-blue-500 text-xs underline">Click to see more..</span>
            </button>
          </DialogTrigger>
          <DialogContent className="flex flex-col w-full max-w-[500px] mx-autoborder min-h-screen">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <DialogHeader>
                  <DialogTitle>Today's Devotion</DialogTitle>
                    <DialogDescription>
                      "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight." (Proverbs 3:5-6)
                    </DialogDescription>
                </DialogHeader>
              </div>
            </DialogContent>
          </Dialog>

          {/* Today's notifications */}
          <div className="space-y-3 mt-3">
            {["Malaysia", "Malaysia"].map((country, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold">{country}</p>
                  <p className="text-xs text-gray-500">Posted a new prayer</p>
                  <p className="text-xs text-gray-400">Jan 30</p>
                </div>
              </div>
            ))}
          </div>

          {/* This Week Section */}
          <h2 className="text-lg font-semibold mt-4 mb-2">This Week</h2>
          <div className="space-y-3">
            {["Australia", "Australia", "Australia"].map((country, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="text-sm font-semibold">{country}</p>
                  <p className="text-xs text-gray-500">Posted a prayer</p>
                  <p className="text-xs text-gray-400">Jan 30</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
