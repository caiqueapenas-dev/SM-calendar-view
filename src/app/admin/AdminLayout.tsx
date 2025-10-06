"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { LayoutDashboard, Settings, LogOut } from "lucide-react";

import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { logout } = useAppStore();

  const router = useRouter();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
  ];

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
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="mt-auto flex items-center gap-4 px-6 py-4 rounded-xl text-xl text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-colors"
        >
          <LogOut size={24} />
          <span>Sair</span>
        </button>
      </aside>
      <main className="flex-1 p-12 overflow-auto">{children}</main>
    </div>
  );
}
