'use client';

import Layout from "~/components/layout/sidebar-admin";
import { SidebarTrigger } from "~/components/ui/sidebar";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Separator } from "~/components/ui/separator";
import { db } from "~/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "~/components/ui/sheet";
import {Dialog, DialogContent,DialogHeader,DialogTitle } from "~/components/ui/dialog";
import { GeistSans } from "geist/font/sans";
import { EllipsisVertical, Ban, SquarePlus, SlidersHorizontal, X, Search } from "lucide-react";
import { useRouter } from "next/router";
import { useSearchParams } from 'next/navigation';

type User = {
  id: string;
  username: string;
  role: string;
  name?: string;
  dateOfBirth?: string;
  email?: string;
  gender?: string;
  country?: string;
  isVerified?: boolean;
  regional: string;
  unbanned?: boolean;
  isNew?: boolean; 
};

const validRoles = ["member", "regional", "international", "guest", "banned", "rejected"];

export default function SearchPage() {
  const [usersByRole, setUsersByRole] = useState<Record<string, User[]>>({});
  const [filteredUsers, setFilteredUsers] = useState<Record<string, User[]>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [confirmBan, setConfirmBan] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRole = searchParams.get("role");
  const validCurrentRole = currentRole && validRoles.includes(currentRole) ? currentRole : "all";
  const [confirmRoleDialogOpen, setConfirmRoleDialogOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: User;
    newRole: string;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false)

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
    const fetchAllUsers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "users"));
        const groupedUsers: Record<string, User[]> = {
          member: [],
          regional: [],
          international: [],
          guest: [],
          banned: [],
          rejected: [],
        };

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data();
          let role = data.role?.toLowerCase();

          if (role === "international") role = "international";

          const username = data.username ?? data.name ?? "Unknown";

          if (typeof role === "string" && validRoles.includes(role)) {
            const user: User = {
              id: docSnap.id,
              username,
              role,
              name: data.name,
              dateOfBirth: data.dateOfBirth,
              email: data.email,
              gender: data.gender,
              regional: data.regional,
              country: data.country,
              isVerified: data.isVerified ?? false,
              unbanned: data.unbanned ?? false,
              isNew: data.isNew ?? false,
            };

            (groupedUsers[role] ??= []).push(user);

            const updates: Partial<User> = {};

            if (role !== "guest" && data.isNew === true) {
              updates.isNew = false;
            }

            if (role !== "guest" && data.unbanned === true) {
              updates.unbanned = false;
            }

            if (Object.keys(updates).length > 0) {
              await updateDoc(doc(db, "users", docSnap.id), updates);
            }
          }
        }

        setUsersByRole(groupedUsers);
        setFilteredUsers(groupedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(usersByRole);
    } else {
      const filtered: Record<string, User[]> = {};
      const query = searchQuery.toLowerCase();

      Object.keys(usersByRole).forEach((role) => {
        filtered[role] = usersByRole[role]?.filter(
          (user) =>
            user.username.toLowerCase().includes(query) ||
            (user.name && user.name.toLowerCase().includes(query))
        ) || [];
      });

      setFilteredUsers(filtered);
    }
  }, [searchQuery, usersByRole]);

  const updateUserRoleInDatabase = async (
    userId: string,
    newRole: string
  ) => {
    try {
      const updateData: Partial<User> = { role: newRole };

      if (newRole === "member") {
        updateData.isNew = true;
        updateData.unbanned = false;
      } else {
        updateData.isNew = false;
        updateData.unbanned = false;
      }

      await updateDoc(doc(db, "users", userId), updateData);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleConfirmRoleChange = async () => {
    if (pendingRoleChange) {
      await handleRoleChange(pendingRoleChange.user, pendingRoleChange.newRole);
      setConfirmRoleDialogOpen(false);
      setPendingRoleChange(null);
    }
  };
  
  const handleRoleChange = async (
    user: User,
    newRole: string,
    unbanned = false
  ) => {
    const targetRole = user.role === "banned" && unbanned ? "member" : newRole;
  
    await updateUserRoleInDatabase(user.id, targetRole);
  
    setUsersByRole((prev) => {
      const updated = { ...prev };
  
      for (const key of Object.keys(updated)) {
        updated[key] = (updated[key] ?? []).filter((u) => u.id !== user.id);
      }
  
      const updatedUser: User = {
        ...user,
        role: targetRole,
        unbanned: false,
        isNew: targetRole === "member",
      };
  
      (updated[targetRole] ??= []).push(updatedUser);
      return updated;
    });

    if(targetRole === "regional"){
      await updateDoc(doc(db, "users", user.id), {
        regional: user.regional,
        originalName: user.name,
        name: user.country,
      });
    } else if(targetRole === "international"){
      await updateDoc(doc(db, "users", user.id), {
        regional: user.regional,
        originalName: user.name,
        name: "International",
      });
    }
    
    setActiveUser((prev) =>
      prev
        ? {
            ...prev,
            role: targetRole,
            unbanned: false,
            isNew: targetRole === "member",
          }
        : null
    );
  };

  const handleBanUser = async () => {
    if (activeUser) {
      await updateUserRoleInDatabase(activeUser.id, "banned");

      setUsersByRole((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(updated)) {
          updated[key] = (updated[key] ?? []).filter((u) => u.id !== activeUser.id);
        }
        (updated.banned ??= []).push({ ...activeUser, role: "banned" });
        return updated;
      });

      setActiveUser((prev) => (prev ? { ...prev, role: "banned" } : null));
      setConfirmBan(false);
      setDialogOpen(false);
    }
  };

  const handleRoleFilter = (role: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (role === "all") {
      newParams.delete("role");
    } else {
      newParams.set("role", role);
    }
    router.push(`?${newParams.toString()}`);
  };

  const getTotalUsers = () => {
    return Object.values(usersByRole).reduce((acc, users) => acc + users.length, 0);
  };

  return (
    <Layout>
      <div className="flex justify-center w-full">
        <div className="flex flex-col w-full max-w-[600px] border min-h-screen">
          <div className="fixed w-full bg-white max-w-[598px] top-0">
            <div className="flex flex-col w-full items-center justify-center">
              <div className="sticky top-0 bg-white w-full z-10  border-b pb-2">
                <div className="flex items-center justify-between ml-2 mt-2 ">
                {isMobile ? (<div>
                    <SidebarTrigger />
                  </div>): (<div className="ml-7 mt-1.5"></div>)}
                  <div className="flex flex-col items-center justify-center pr-2 w-full">
                    <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto mt-1"/>
                    <p className="text-sm text-center text-muted-foreground">PrayerLink</p>
                  </div>
                  <button onClick={() => setSettingsSheetOpen(true)}>
                    <SlidersHorizontal className="mr-2 h-5 w-5 text-gray-600 rounded-md hover:bg-gray-100 transition" />
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Search Bar */}
            <div className="relative px-4 py-2">
              <div className="absolute inset-y-0 left-6 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Separator className="my-2" />

            {/* Horizontal Role Filter Buttons */}
            <div className="px-4 py-2 flex gap-2 overflow-x-auto scrollbar border-b">
              <button
                onClick={() => handleRoleFilter("all")}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition ${
                  validCurrentRole === "all" 
                    ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleRoleFilter("member")}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition ${
                  validCurrentRole === "member"
                    ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                Member
              </button>
              <button
                onClick={() => handleRoleFilter("regional")}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition ${
                  validCurrentRole === "regional"
                    ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                Regional
              </button>
              <button
                onClick={() => handleRoleFilter("international")}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition ${
                  validCurrentRole === "international"
                    ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                International
              </button>
              <button
                onClick={() => handleRoleFilter("guest")}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition ${
                  validCurrentRole === "guest"
                    ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                Guest
              </button>
              <button
                onClick={() => handleRoleFilter("banned")}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition ${
                  validCurrentRole === "banned"
                    ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                Banned
              </button>
              <button
                onClick={() => handleRoleFilter("rejected")}
                className={`whitespace-nowrap px-4 py-2 rounded-full border text-sm transition ${
                  validCurrentRole === "rejected"
                    ? "bg-blue-500 text-white border-blue-500" 
                      : "bg-white border-gray-300 text-gray-900 hover:bg-gray-100"
                }`}
              >
                Rejected
              </button>
            </div>
          </div>
          

          {/* Scrollable Content */}
          <div className="mt-52 pt-2 pb-20 px-4">
            {validCurrentRole === "all" ? (
              validRoles.map((role) => {
                const users = filteredUsers[role] || [];
                if (users.length === 0 && searchQuery) return null;

                const capitalizedRole =
                  role === "international"
                    ? "International"
                    : role === "banned"
                    ? "Banned Users"
                    : role === "rejected"
                    ? "Rejected Users"
                    : role.charAt(0).toUpperCase() + role.slice(1);            

                return (
                  <div key={role} className="mb-6">
                    <h2 className="text-sm font-semibold mb-2">
                      {capitalizedRole} ({users.length})
                    </h2>
                    <ul className="space-y-1">
                      {users.length > 0 ? (
                        users.map((user) => (
                          <li
                            key={user.id}
                            className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 transition"
                          >
                            <button
                              onClick={() => {
                                setActiveUser(user);
                                setOpen(true);
                              }}
                              className="flex items-center gap-2 text-sm text-left w-full"
                            >
                              <div className="w-6 h-6 rounded-full bg-gray-300" />
                              <span className="flex items-center">
                                {user.username}
                                {user.isVerified && (
                                  <span className="text-green-600 font-bold ml-1">(new)</span>
                                )}
                              </span>
                            </button>

                            {user.role !== "rejected" && (
                              <button
                                onClick={() => {
                                  setActiveUser(user);
                                  setDialogOpen(true);
                                  setConfirmBan(false);
                                }}
                                className="p-1 text-gray-500 hover:text-gray-700"
                              >
                                <EllipsisVertical size={16} />
                              </button>
                            )}
                          </li>
                        ))
                      ) : (
                        !searchQuery && <p className="text-sm text-gray-500 text-center py-4">No users in this category</p>
                      )}
                    </ul>
                  </div>
                );
              })
            ) : (
              <div className="mb-6">
                <h2 className="text-sm font-semibold mb-2">
                  {validCurrentRole === "international" 
                    ? "International" 
                    : validCurrentRole.charAt(0).toUpperCase() + validCurrentRole.slice(1)} (
                  {(filteredUsers[validCurrentRole]?.length || 0)})
                </h2>
                <ul className="space-y-1">
                  {(filteredUsers[validCurrentRole] ?? []).length > 0 ? (
                    filteredUsers[validCurrentRole]?.map((user) => (
                      <li
                        key={user.id || user.username}
                        className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 transition"
                      >
                        <button
                          onClick={() => {
                            setActiveUser(user);
                            setOpen(true);
                          }}
                          className="flex items-center gap-2 text-sm text-left w-full"
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-300" />
                          <span className="flex items-center">
                            {user.username}
                            {user.isVerified && (
                              <span className="text-green-600 font-bold ml-1">(new)</span>
                            )}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveUser(user);
                            setDialogOpen(true);
                            setConfirmBan(false);
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <EllipsisVertical size={16} />
                        </button>
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Detail Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          hideCloseButton
          side="right"
          className={`flex flex-col h-full ${GeistSans.className}`}
        >
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Users</SheetTitle>
                <SheetDescription>
                  {activeUser ? `${activeUser.username} - ${activeUser.role}` : "No user selected."}
                </SheetDescription>
              </div>
              <div className="flex items-center gap-4">
              {activeUser?.role !== "rejected" && (
                <button
                  onClick={() => setDialogOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Add user"
                >
                  <SquarePlus size={25} />
                </button>
              )}
                <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 font-bold">
                  <X size={25} />
                </button>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-4 text-sm space-y-2 overflow-y-auto flex-1">
            <p><strong>Name:</strong> {activeUser?.name ?? "-"}</p>
            <p><strong>Date of Birth:</strong> {activeUser?.dateOfBirth ?? "-"}</p>
            <p><strong>Email:</strong> {activeUser?.email ?? "-"}</p>
            <p><strong>Region:</strong> {activeUser?.regional ?? "-"}</p>
            <p><strong>Gender:</strong> {activeUser?.gender ?? "-"}</p>
            <p><strong>Country:</strong> {activeUser?.country ?? "-"}</p>
            <p><strong>Verified:</strong> {activeUser?.isVerified ? "Yes" : "No"}</p>
          </div>

          <SheetFooter className="bg-white border-t pt-4 pb-2 px-6">
            {activeUser?.role === "guest" && (
              <div className="w-full flex justify-between items-center">
                <button
                  onClick={() => {
                    setPendingRoleChange({ user: activeUser!, newRole: "member" });
                    setConfirmRoleDialogOpen(true);
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition"
                >
                  Accept as Member
                </button>

                <button
                  onClick={() => {
                    setPendingRoleChange({ user: activeUser!, newRole: "rejected" });
                    setConfirmRoleDialogOpen(true);
                  }}
                  className="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 transition"
                >
                  Reject
                </button>
              </div>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet open={settingsSheetOpen} onOpenChange={setSettingsSheetOpen}>
        <SheetContent side="right" className={GeistSans.className}>
          <SheetHeader>
            <SheetTitle>Users</SheetTitle>
            <div className="my-2 h-px bg-gray-300" />
          </SheetHeader>

          <div className="mt-4 space-y-3">
            {/* All Button */}
            <div
              className={`flex items-center justify-between px-3 py-2 border rounded-xl transition cursor-pointer mb-4 p-4 shadow-md ${
                !currentRole ? "bg-blue-100" : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => {
                setSettingsSheetOpen(false);
                handleRoleFilter("all");
              }}
            >
              <span>All</span>
              <span className="text-sm text-muted-foreground">
                {getTotalUsers()} users
              </span>
            </div>

            {/* Role Buttons */}
            {validRoles.map((role) => {
              const capitalizedRole =
                role === "international"
                  ? "International"
                  : role.charAt(0).toUpperCase() + role.slice(1);

              const roleUsers = usersByRole[role] || [];

              return (
                <div
                  key={role}
                  className={`flex items-center justify-between px-3 py-2 border rounded-xl transition cursor-pointer mb-4 p-4 shadow-md ${
                    currentRole === role ? "bg-blue-100" : "bg-white hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setSettingsSheetOpen(false);
                    handleRoleFilter(role);
                  }}
                >
                  <span>{capitalizedRole}</span>
                  <span className="text-sm text-muted-foreground">
                    {roleUsers.length} users
                  </span>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmRoleDialogOpen} onOpenChange={setConfirmRoleDialogOpen}>
        <DialogContent className={GeistSans.className + " bg-white p-6 rounded-lg shadow-lg text-center w-80"}>
          <DialogHeader>
            <DialogTitle className="text-base font-medium mb-4 text-center">
              Are you sure?
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleConfirmRoleChange}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmRoleDialogOpen(false)}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300"
            >
              No
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            if (confirmBan) {
              setConfirmBan(false); 
            } else {
              setDialogOpen(false); 
            }
          } else {
            setDialogOpen(true); 
          }
        }}
      >
        <DialogContent className={GeistSans.className + " w-72 rounded-xl"}>
          {confirmBan ? (
            <div className="bg-white p-4 rounded-lg shadow-lg text-center w-full">
              <p className="text-gray-900 mb-4 text-lg">
                Are you sure you want to ban <strong>{activeUser?.username}</strong>?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleBanUser}
                  className="w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300"
                >
                  Yes
                </button>
                <button
                  onClick={() => {
                    setConfirmBan(false);
                  }}
                  className="w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300"
                >
                  No
                </button>
              </div>
            </div>
          ) : activeUser?.role === "banned" ? (
            <div className="bg-white p-4 rounded-lg shadow-lg text-center w-full">
              <p className="text-gray-900 mb-4 text-lg">
                Are you sure you want to unban <strong>{activeUser?.username}</strong>?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    handleRoleChange(activeUser, "guest", true);
                    setDialogOpen(false);
                  }}
                  className="w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300"
                >
                  Yes
                </button>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="w-full py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-300"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-3 text-sm">
              {["Member", "Regional", "International"].map((role) => {
              const normalizedRole = role.toLowerCase() === "international" ? "international" : role.toLowerCase();

              return (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeUser?.role?.toLowerCase() === normalizedRole}
                    onChange={() => {
                      if (activeUser) {
                        handleRoleChange(activeUser, normalizedRole);
                      }
                    }}
                    className="accent-blue-600 w-4 h-4"
                  />
                  {role}
                </label>
              );
            })}

              <hr className="border-t border-gray-300 my-2" />

              <button
                onClick={() => {
                  setConfirmBan(true);
                  setDialogOpen(true);
                }}
                className="w-full flex items-center gap-2 text-red-600 hover:text-red-900 text-sm px-2 py-1 rounded hover:bg-red-100 text-left"
              >
                <Ban size={16} />
                <span>Ban account</span>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}