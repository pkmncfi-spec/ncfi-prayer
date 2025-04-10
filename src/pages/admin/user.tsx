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
} from "~/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { GeistSans } from "geist/font/sans";
import {
  EllipsisVertical,
  Ban,
  SquarePlus,
  SlidersHorizontal,
} from "lucide-react";
import SearchBar from "~/components/ui/searchbar";
import { useRouter } from "next/router";

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
};

const validRoles = ["member", "regional", "internasional", "guest", "banned"];

export default function SearchPage() {
  const [usersByRole, setUsersByRole] = useState<Record<string, User[]>>({});
  const [open, setOpen] = useState(false); // untuk user detail sheet
  const [settingsSheetOpen, setSettingsSheetOpen] = useState(false); // untuk slider settings sheet
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [confirmBan, setConfirmBan] = useState(false);
  const router = useRouter();

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
        };

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const roleRaw = data.role;
          const username = data.name;

          if (typeof roleRaw === "string" && typeof username === "string") {
            let role = roleRaw.toLowerCase();
            if (role === "international") role = "internasional";

            if (validRoles.includes(role)) {
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
              };

              (groupedUsers[role] ??= []).push(user);
            }
          }
        });

        setUsersByRole(groupedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  const updateUserRoleInDatabase = async (
    userId: string,
    newRole: string,
    unbanned = false
  ) => {
    try {
      const updateData: any = { role: newRole };
      updateData.unbanned = newRole === "guest" && unbanned;
      await updateDoc(doc(db, "users", userId), updateData);
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleRoleChange = async (
    user: User,
    newRole: string,
    unbanned = false
  ) => {
    await updateUserRoleInDatabase(user.id, newRole, unbanned);

    setUsersByRole((prev) => {
      const updated = { ...prev };
      for (const key of Object.keys(updated)) {
        updated[key] = updated[key].filter((u) => u.id !== user.id);
      }
      (updated[newRole] ??= []).push({ ...user, role: newRole, unbanned });
      return updated;
    });

    setActiveUser((prev) => (prev ? { ...prev, role: newRole, unbanned } : null));
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
                  <Image
                    src="/favicon.ico"
                    alt="NFCI Prayer"
                    width={25}
                    height={25}
                    className="mx-auto"
                  />
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
            {validRoles.map((role) => {
              const users = usersByRole[role] || [];
              if (users.length === 0) return null;

              const capitalizedRole =
                role === "internasional"
                  ? "International"
                  : role === "banned"
                  ? "Banned Users"
                  : role.charAt(0).toUpperCase() + role.slice(1);

              return (
                <div key={role}>
                  <h2 className="text-sm font-semibold mb-2">
                    {capitalizedRole} ({users.length})
                  </h2>
                  <ul className="space-y-1">
                    {users.map((user, idx) => (
                      <li
                        key={idx}
                        className={`flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 transition ${
                          role === "banned" ? "text-gray-500" : ""
                        }`}
                      >
                        <button
                          onClick={() => {
                            setActiveUser(user);
                            setOpen(true);
                          }}
                          className="flex items-center gap-2 text-sm text-left w-full"
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-300" />
                          <span>
                            {user.username}
                            {user.role === "guest" && user.unbanned && (
                              <span className="text-xs text-green-600 ml-1">
                                (unbanned)
                              </span>
                            )}
                          </span>

                          {role === "banned" && <Ban size={14} className="text-red-500" />}
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
              );
            })}
          </div>
        </div>
      </div>

      {/* User Detail Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className={GeistSans.className}>
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle>Users</SheetTitle>
                <SheetDescription>
                  {activeUser
                    ? `${activeUser.username} - ${activeUser.role}`
                    : "No user selected."}
                </SheetDescription>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDialogOpen(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <SquarePlus size={25} />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </SheetHeader>
          <div className="mt-4 text-sm space-y-2">
            <p><strong>Name:</strong> {activeUser?.name ?? "-"}</p>
            <p><strong>Date of Birth:</strong> {activeUser?.dateOfBirth ?? "-"}</p>
            <p><strong>Email:</strong> {activeUser?.email ?? "-"}</p>
            <p><strong>Region:</strong> {activeUser?.regional ?? "-"}</p>
            <p><strong>Gender:</strong> {activeUser?.gender ?? "-"}</p>
            <p><strong>Country:</strong> {activeUser?.country ?? "-"}</p>
            <p><strong>Role:</strong> {activeUser?.role ?? "-"}</p>
            <p><strong>Verified:</strong> {activeUser?.isVerified ? "Yes" : "No"}</p>
          </div>
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
            {["member", "regional", "internasional", "guest", "banned"].map((role) => {
              const capitalizedRole =
                role === "internasional"
                  ? "International"
                  : role.charAt(0).toUpperCase() + role.slice(1);

              const roleUsers = usersByRole[role] || [];

              return (
                <div
                  key={role}
                  className="flex items-center justify-between px-3 py-2 border rounded-xl hover:bg-gray-100 transition cursor-pointer mb-4 p-4 bg-white shadow-md"
                  onClick={() => {
                    setSettingsSheetOpen(false);
                  }}
                >
                  <span>{capitalizedRole}</span>
                  <span className="text-sm text-muted-foreground">{roleUsers.length} users</span>
                </div>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setConfirmBan(false);
        }}
      >
       <DialogContent className={GeistSans.className + " w-72 rounded-xl"}>
          <DialogHeader>
            <DialogTitle className="text-sm">
              {activeUser?.role === "banned" ? "Unban user?" : "Add roles for users"}
            </DialogTitle>
          </DialogHeader>

          {activeUser?.role === "banned" ? (
            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-700">
                Are you sure you want to unban <strong>{activeUser?.username}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleRoleChange(activeUser, "guest", true);
                    setDialogOpen(false);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Yes
                </button>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-3 text-sm">
              {["Member", "Regional", "International"].map((role) => (
                <label key={role} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activeUser?.role.toLowerCase() === role.toLowerCase()}
                    onChange={() => {
                      if (activeUser) {
                        const newRole = role.toLowerCase() === "international" ? "internasional" : role.toLowerCase();
                        handleRoleChange(activeUser, newRole);
                      }
                    }}
                    className="accent-blue-600 w-4 h-4"
                  />
                  {role}
                </label>
              ))}

              <hr className="border-t border-gray-300 my-2" />

              <button
                onClick={() => setConfirmBan(true)}
                className="w-full flex items-center gap-2 text-red-600 hover:text-red-900 text-sm px-2 py-1 rounded hover:bg-red-100 text-left"
              >
                <span><Ban size={16} /></span>
                <span>Ban account</span>
              </button>

              {confirmBan && (
                <div className="mt-4 space-y-2 bg-gray-100 p-3 rounded-md text-sm">
                  <p className="text-gray-700">
                    Are you sure you want to ban <strong>{activeUser?.username}</strong>?
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={handleBanUser}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmBan(false)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
