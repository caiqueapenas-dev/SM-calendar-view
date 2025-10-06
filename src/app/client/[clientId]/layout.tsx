"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { LayoutDashboard, Calendar, LogOut, Loader, MessageCircle } from "lucide-react";

export default function ClientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clientId: string };
}) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    clients,
    logout,
    fetchPosts,
    fetchClients,
    listenToChanges,
    isLoading,
  } = useAppStore();
  const client = clients.find((c) => c.client_id === params.clientId);

  useEffect(() => {
    fetchClients();
    fetchPosts();

    const unsubscribe = listenToChanges();
    return () => unsubscribe();
  }, [fetchClients, fetchPosts, listenToChanges]);

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
    {
      href: `/client/${params.clientId}/insights`,
      label: "Insights",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-6 md:px-8 md:py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <img
            src={
              client?.profile_picture_url ||
              `https://ui-avatars.com/api/?name=${client?.name.substring(
                0,
                2
              )}&background=random`
            }
            alt={client?.name}
            className="w-12 h-12 md:w-16 md:h-16 rounded-full"
          />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Bem-vindo, {client?.custom_name || client?.name}
            </h1>
            <p className="text-gray-400">Gerencie suas publicações.</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg self-start md:self-center flex items-center gap-2"
        >
          <LogOut size={18} /> Sair
        </button>
      </header>

      <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-shrink-0 flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 -mb-px ${
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
