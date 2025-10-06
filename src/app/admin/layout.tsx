"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { LayoutDashboard, Settings, LogOut, Loader } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, fetchPosts, listenToPostChanges, isLoading } = useAppStore();

  useEffect(() => {
    fetchPosts();
    const unsubscribe = listenToPostChanges();
    return () => unsubscribe();
  }, [fetchPosts, listenToPostChanges]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ];

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
      <main className="flex-1 p-8 overflow-auto">
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
