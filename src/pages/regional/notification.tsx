import { useState, useEffect } from "react";
import { getFirestore, collection, query, onSnapshot, orderBy, where, Timestamp } from "firebase/firestore";
import { app } from "~/lib/firebase";
import Layout from "~/components/layout/sidebar-regional";
import { SidebarTrigger } from "~/components/ui/sidebar";
import { Separator } from "~/components/ui/separator";
import { useAuth } from "~/context/authContext";
import Image from "next/image";

const db = getFirestore(app);

interface Notification {
  id: string;
  message: string;
  uid: string;
  name: string;
  createdAt?: Date;
}

export default function NotificationPage() {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

  useEffect(() => {
    const fetchNotifications = async () => {
      if (loading) return;
      if (!user?.uid) {
        console.error("User UID is undefined. Cannot fetch notifications.");
        return; // Exit the function if user.uid is undefined
      }
  
      const q = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc") // Order notifications by creation date
      );
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notificationsData: Notification[] = snapshot.docs.map((doc) => {
          const data = doc.data() as Partial<Notification>;
          return {
            id: doc.id,
            message: data.message ?? "No content",
            uid: data.uid ?? "",
            name: data.name ?? "Unknown",
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(), // Safely convert Firestore Timestamp to Date
          };
        });
        setNotifications(notificationsData);
      });
  
      return () => unsubscribe(); // Cleanup the listener on unmount
    };
  
    fetchNotifications();
  }, [user, loading]);

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

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto mt-[80px] px-2">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500">No notifications found.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white p-2 rounded-2xl w-full text-left transition-all duration-300 hover:bg-gray-100 active:scale-95 flex items-center space-x-3 hover:cursor-pointer"
              >
                <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
                <div className="text-xs break-words w-full">
                  <p className="font-semibold text-base">{notification.message}</p>
                  <p className="text-muted-foreground text-xs">
                    {notification.createdAt ? formatDate(notification.createdAt) : "Unknown Date"}
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