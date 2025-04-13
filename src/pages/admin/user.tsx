'use client';

import Layout from "~/components/layout/sidebar-regional";
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
import { EllipsisVertical, Ban, SquarePlus, SlidersHorizontal, X } from "lucide-react";
import SearchBar from "~/components/ui/searchbar";
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

const validRoles = ["member", "regional", "internasional", "guest", "banned", "rejected"];

export default function SearchPage() {
  const [usersByRole, setUsersByRole] = useState<Record<string, User[]>>({});
  const [open, setOpen] = useState(false); // untuk user detail sheet
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false); // untuk slider settings sheet
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [confirmBan, setConfirmBan] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRole = searchParams.get("role");
  const validCurrentRole = currentRole && validRoles.includes(currentRole) ? currentRole : null;
  const [confirmRoleDialogOpen, setConfirmRoleDialogOpen] = useState(false);
  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: User;
    newRole: string;
  } | null>(null);

useEffect(() => {
  const fetchAllUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const groupedUsers: Record<string, User[]> = {
        member: [],
        regional: [],
        internasional: [],
        guest: [],
        banned: [],
        rejected: [],
      };

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        let role = data.role?.toLowerCase();

        // Konversi 'international' jadi 'internasional'
        if (role === "international") role = "internasional";

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

          groupedUsers[role].push(user);

          // Perbarui status isNew dan unbanned jika perlu
          const updates: any = {};

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
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  fetchAllUsers();
}, []);

  const updateUserRoleInDatabase = async (
    userId: string,
    newRole: string
  ) => {
    try {
      const updateData: any = { role: newRole };

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
    // Jika role sebelumnya banned dan sekarang di-unban, langsung jadikan member
    const targetRole = user.role === "banned" && unbanned ? "guest" : newRole;
  
    await updateUserRoleInDatabase(user.id, targetRole, unbanned);
  
    setUsersByRole((prev) => {
      const updated = { ...prev };
  
      for (const key of Object.keys(updated)) {
        updated[key] = updated[key].filter((u) => u.id !== user.id);
      }
  
      const updatedUser: User = {
        ...user,
        role: targetRole,
        unbanned: false, // sudah tidak perlu status unbanned
        isNew: targetRole === "member",
      };
  
      (updated[targetRole] ??= []).push(updatedUser);
      return updated;
    });
  
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
          updated[key] = updated[key].filter((u) => u.id !== activeUser.id);
        }
        updated.banned.push({ ...activeUser, role: "banned" });
        return updated;
      });

      setActiveUser((prev) => (prev ? { ...prev, role: "banned" } : null));
      setConfirmBan(false);
      setDialogOpen(false);
    }
  };

  return (
    <Layout>
      <div
        className={`${GeistSans.className} flex flex-col w-full max-w-[600px] border min-h-screen`}
      >
        <div className="fixed w-full bg-white max-w-[598px]">
          <div className="flex flex-col w-full items-center justify-center">
            <div className="sticky top-3 bg-white w-full z-10 py-3">
              <div className="flex items-center justify-between px-4">
                <SidebarTrigger />
                <div className="flex flex-col items-center justify-center pr-7 w-full">
                  <Image src="/favicon.ico" alt="NFCI Prayer" width={25} height={25} className="mx-auto"/>
                  <p className="text-sm text-center text-muted-foreground">NCFI Prayer</p>
                </div>
                <button onClick={() => setSettingsSheetOpen(true)}>
                  <SlidersHorizontal className="mr-2 h-5 w-5 text-gray-600  rounded-md hover:bg-gray-100 transition" />
                </button>
              </div>
              <div className="w-full h-4 border-b border-gray-300"></div>
            </div>
          </div>

          <SearchBar />
          <Separator className="my-2" />

          <div className="p-4">
          {validCurrentRole ? (
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-2">
                {validCurrentRole.charAt(0).toUpperCase() + validCurrentRole.slice(1)} (
                {(usersByRole[validCurrentRole]?.length || 0)})
              </h2>
              <ul className="space-y-1">
              {usersByRole[validCurrentRole]?.map((user) => (
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
              ))}
              </ul>
            </div>
          ) : (
            validRoles.map((role) => {
              const users = usersByRole[role] || [];
              if (users.length === 0) return null;

              const capitalizedRole =
              role === "internasional"
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
                  {users.map((user) => (
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

                      {/* Hanya tampilkan tombol ellipsis jika role bukan "rejected" */}
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
                  ))}
                  </ul>
                </div>
              );
            })
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
                    setPendingRoleChange({ user: activeUser!, newRole: "member" }); // <-- diperbaiki di sini
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
            {/* Tombol All */}
            <div
              className={`flex items-center justify-between px-3 py-2 border rounded-xl transition cursor-pointer mb-4 p-4 shadow-md ${
                !currentRole ? "bg-blue-100" : "bg-white hover:bg-gray-100"
              }`}
              onClick={() => {
                setSettingsSheetOpen(false);
                const newParams = new URLSearchParams(searchParams);
                newParams.delete("role");
                router.push(`?${newParams.toString()}`);
              }}
            >
              <span>All</span>
              <span className="text-sm text-muted-foreground">
                {
                  Object.values(usersByRole).reduce((acc, users) => acc + users.length, 0)
                }{" "}
                users
              </span>
            </div>

            {/* Daftar Role */}
            {["member", "regional", "internasional", "guest", "banned", "rejected"].map((role) => {
              const capitalizedRole =
                role === "internasional"
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
                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("role", role);
                    router.push(`?${newParams.toString()}`);
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
                    setConfirmBan(false); // kembali ke pilihan role
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
              const normalizedRole = role.toLowerCase() === "international" ? "internasional" : role.toLowerCase();

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
