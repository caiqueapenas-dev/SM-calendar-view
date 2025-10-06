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
    fetchSpecialDates,
    listenToChanges,
    isLoading,
    generateNotifications,
    notifications,
  } = useAppStore();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    fetchClients();
    fetchSpecialDates();
    fetchPosts().then(() => {
      generateNotifications();
    });

    const unsubscribe = listenToChanges();

    const interval = setInterval(() => generateNotifications(), 60000);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [fetchClients, fetchSpecialDates, fetchPosts, listenToChanges, generateNotifications]);

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
      <aside className="w-80 bg-gray-900 p-8 flex flex-col">
        <h1 className="text-3xl font-bold mb-12 text-white">Painel Admin</h1>
        <nav className="flex flex-col space-y-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl text-xl transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon size={24} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 px-6 py-4 rounded-xl text-xl text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors"
        >
          <LogOut size={24} />
          <span>Sair</span>
        </button>
      </aside>
      <main className="flex-1 p-12 overflow-auto relative">
        <div className="absolute top-12 right-12">
          <button
            onClick={() => setIsPanelOpen((prev) => !prev)}
            className="relative p-3 rounded-full hover:bg-gray-700 transition-colors"
          >
            <Bell size={24} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 block h-6 w-6 rounded-full bg-red-600 text-sm text-white flex items-center justify-center border-2 border-gray-800">
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
