"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import LoginPage from "@/components/auth/LoginPage";

export default function Home() {
  const router = useRouter();
  // CORREÇÃO: Usando 'session' e 'userRole' em vez de 'user' e 'userType'
  const { session, userRole } = useAppStore();

  useEffect(() => {
    // Adiciona a lógica de redirecionamento, similar à página de login
    if (session) {
      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "client" && session.user.email) {
        // Esta lógica assume que a associação email -> clientId está em LoginPage
        // ou que será implementada em um local central no futuro.
        // Por agora, redireciona para a página de login que contém a lógica.
        // Se o usuário já estiver logado, a LoginPage o redirecionará corretamente.
      }
    }
  }, [session, userRole, router]);

  // Se não houver sessão, renderiza a página de login
  if (!session) {
    return (
      <main className="container mx-auto p-4 md:p-8">
        <LoginPage />
      </main>
    );
  }

  // Mostra uma mensagem de carregamento enquanto o redirecionamento acontece
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      Carregando...
    </div>
  );
}
