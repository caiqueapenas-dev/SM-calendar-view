"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { supabase } from "@/lib/supabaseClient";
import "./globals.css";

// Este componente gerencia a sessão de autenticação do Supabase
function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const { setSession } = useAppStore();

  useEffect(() => {
    // Pega a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Ouve mudanças no estado de autenticação (login, logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Limpa a inscrição quando o componente é desmontado
    return () => subscription.unsubscribe();
  }, [setSession]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
      </body>
    </html>
  );
}
