"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { LayoutDashboard, Calendar, LogOut, Loader } from "lucide-react";

export default function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clientId: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { clients, logout, fetchPosts, listenToPostChanges, isLoading } =
    useAppStore();
  const client = clients.find((c) => c.id === params.clientId);

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
    {
      href: `/client/${params.clientId}`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: `/client/${params.clientId}/calendar`,
      label: "Calendário",
      icon: Calendar,
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Bem-vindo, {client?.customName || client?.name}
          </h1>
          <p className="text-gray-400">Gerencie suas publicações.</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg self-start md:self-center flex items-center gap-2"
        >
          <LogOut size={18} /> Sair
        </button>
      </header>

      <div className="flex border-b border-gray-700 mb-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 -mb-px ${
              pathname === item.href
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <main>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader className="animate-spin text-indigo-500" size={48} />
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
