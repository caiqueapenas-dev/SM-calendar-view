"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { LayoutDashboard, Settings, LogOut, Loader, Bell } from "lucide-react";
import NotificationPanel from "./NotificationPanel";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    logout,
    fetchPosts,
    fetchClients,
    listenToChanges,
    isLoading,
    generateNotifications,
    notifications,
  } = useAppStore();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchPosts().then(() => {
      generateNotifications();
    });

    const unsubscribe = listenToChanges();

    const interval = setInterval(generateNotifications, 60000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchClients, fetchPosts, listenToChanges, generateNotifications]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-10 text-white">Painel Admin</h1>
        <nav className="flex flex-col space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-lg transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-3 px-4 py-2 rounded-lg text-lg text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto relative">
        <div className="absolute top-8 right-8">
          <button
            onClick={() => setIsPanelOpen((prev) => !prev)}
            className="relative p-2 rounded-full hover:bg-gray-700"
          >
            <Bell />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 block h-5 w-5 rounded-full bg-red-600 text-xs text-white flex items-center justify-center border-2 border-gray-800">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationPanel
            isOpen={isPanelOpen}
            onClose={() => setIsPanelOpen(false)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="animate-spin text-indigo-500" size={48} />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
