"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Mapeamento temporário de email para ID do cliente.
// Em um sistema de produção, isso viria de um banco de dados (tabela "profiles").
const emailToClientIdMap: { [email: string]: string } = {
  "clinicagama@cliente.com": "401347113060769",
  "bressanbonfim@cliente.com": "301561133034232",
  "drbressan@cliente.com": "140860502443681",
  "cleanesplanada@cliente.com": "338921743423931",
  "cleanrioreal@cliente.com": "511600935380953",
  // Adicione outros emails e IDs de clientes aqui
};

export default function LoginPage() {
  const router = useRouter();
  const { session, userRole } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redireciona o usuário se ele já estiver logado
  useEffect(() => {
    if (session && userRole) {
      if (userRole === "admin") {
        router.push("/admin");
      } else if (userRole === "client" && session.user.email) {
        const clientId = emailToClientIdMap[session.user.email];
        if (clientId) {
          router.push(`/client/${clientId}`);
        } else {
          // Se o cliente logado não estiver no mapa, exibe um erro ou redireciona para uma página de erro.
          console.error(
            `Cliente com email ${session.user.email} não encontrado no mapeamento.`
          );
          setError("Configuração de cliente não encontrada para este usuário.");
        }
      }
    }
  }, [session, userRole, router]);

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Falha no login: " + error.message);
    }
    // O useEffect cuidará do redirecionamento após o estado da sessão ser atualizado.
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden p-8 mt-16">
      <h1 className="text-2xl font-bold text-center text-white mb-8">
        Acessar Painel
      </h1>

      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300"
          >
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300 disabled:bg-gray-500"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </div>
  );
}
