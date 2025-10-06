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

    // Registra Service Worker para PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('SW registrado:', registration.scope);
      }).catch((error) => {
        console.log('SW falhou:', error);
      });
    }

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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
      </body>
    </html>
  );
}
