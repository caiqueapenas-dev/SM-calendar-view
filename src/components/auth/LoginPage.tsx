"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, clients } = useAppStore();
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleClientLogin = () => {
    if (!clientId) {
      setError("Por favor, insira um ID de cliente.");
      return;
    }
    const user = clients.find((c) => c.id === clientId);
    if (user) {
      setError("");
      login(user, "client");
      router.push(`/client/${user.id}`);
    } else {
      setError("ID do cliente não encontrado.");
    }
  };

  const handleAdminLogin = () => {
    login({ id: "admin", name: "Admin" }, "admin");
    router.push("/admin");
  };

  return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-xl shadow-md overflow-hidden p-8 mt-16">
      <h1 className="text-2xl font-bold text-center text-white mb-2">
        Meta Post Viewer
      </h1>
      <p className="text-center text-gray-400 mb-8">
        Acesse como Cliente ou Admin
      </p>

      {error && (
        <p className="text-red-400 text-sm text-center mb-4">{error}</p>
      )}

      <div id="client-login-form">
        <label
          htmlFor="client-id"
          className="block text-sm font-medium text-gray-300"
        >
          ID da Página do Cliente
        </label>
        <input
          type="text"
          id="client-id"
          placeholder="Ex: 401347113060769"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <button
          onClick={handleClientLogin}
          className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
        >
          Entrar como Cliente
        </button>
      </div>

      <div className="my-6 flex items-center justify-center">
        <span className="border-b border-gray-600 w-1/4"></span>
        <span className="px-2 text-xs text-gray-500 uppercase">ou</span>
        <span className="border-b border-gray-600 w-1/4"></span>
      </div>

      <button
        onClick={handleAdminLogin}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition duration-300"
      >
        Entrar como Admin
      </button>

      <div className="mt-6 p-3 bg-yellow-900/50 border border-yellow-700 text-yellow-300 text-xs rounded-lg">
        <strong>Atenção:</strong> Este app é um protótipo. Os tokens de acesso
        estão no código-fonte para demonstração e não devem ser usados em
        produção.
      </div>
    </div>
  );
}
