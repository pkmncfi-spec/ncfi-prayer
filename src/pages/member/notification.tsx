"use client";

import { useState, useEffect } from "react";
import { getFirestore, collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { app } from "~/lib/firebase";
import Layout from "~/components/layout/sidebar-member";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { useAuth } from "~/context/authContext";
import Image from "next/image";

const db = getFirestore(app);

interface Notification {
  id: string;
  text: string;
  uid: string;
  name: string;
  status: string;
  createdAt?: Date;
}

export default function NotificationPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.uid) {
        console.error("User UID is undefined. Cannot fetch notifications.");
        return; // Exit the function if user.uid is undefined
      }
  
      const q = query(
        collection(db, "notifications"),
        where("uid", "==", user.uid), // Fetch notifications for the logged-in user
        orderBy("createdAt", "desc") // Order notifications by creation date
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData: Notification[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Partial<Notification>;
          return {
            id: doc.id,
            text: data.text ?? "No content",
            uid: data.uid ?? "",
            name: data.name ?? "Unknown",
            status: data.status ?? "",
            createdAt: data.createdAt?.toDate() || new Date(), // Convert Firestore Timestamp to Date
          };
        });
        setNotifications(notificationsData);
      });
  
      return () => unsubscribe(); // Cleanup the listener on unmount
    };
  
    void fetchNotifications();
  }, [user]);

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    }).format(date);
  }

  return (
    <Layout>
      <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
        {/* Fixed Header */}
        <div className="fixed w-full bg-white max-w-[598px]">
          <div>
              <div className="flex flex-cols mt-2 mb-2">
                <div className="">
                <SidebarTrigger />
                </div>
                <div className="w-full items-center justify-center pr-7">
                  <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto" />
                  <p className="text-sm text-center text-muted-foreground">NCFI Prayer</p>
                </div>
            </div>
          </div>
          <Separator className="my-0" />
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto mt-[80px] px-2">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500">No notifications found.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white p-4 rounded-2xl w-full text-left transition-all duration-300 hover:bg-gray-100 active:scale-95 flex items-center space-x-3 mb-2"
              >
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                <div className="text-xs break-words w-full">
                  <p className="font-semibold text-base">{notification.name}</p>
                  <p>{notification.text}</p>
                  <p className="text-muted-foreground text-xs">
                    &#x2022; {notification.createdAt ? formatDate(notification.createdAt) : "Unknown Date"}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}