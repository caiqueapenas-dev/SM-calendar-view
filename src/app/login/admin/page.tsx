"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Shield, Mail, Lock, ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Login no Supabase
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      console.log('🔵 Login bem-sucedido!', data.user.email);

      // Verificar se é admin (primeiro tenta users table, depois fallback)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      console.log('🔵 UserData:', userData, 'Error:', userError);

      if (userError) {
        // Fallback: verificar se existe na tabela clients
        const { data: clientData } = await supabase
          .from("clients")
          .select("email")
          .eq("email", email)
          .single();

        if (clientData) {
          await supabase.auth.signOut();
          throw new Error("Este email é de cliente. Use o login de cliente.");
        }

        // Se não é cliente, assume que é admin (para compatibilidade)
        // Cria entrada na users table automaticamente (tenta, mas não falha)
        await supabase.from("users").insert({
          id: data.user.id,
          email: data.user.email!,
          role: "admin",
        }).then(result => {
          if (result.error) {
            console.log('Users table insert falhou, mas prosseguindo:', result.error.message);
          }
        });

        router.push("/admin");
        return;
      }

      if (userData.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Acesso negado. Esta área é exclusiva para administradores.");
      }

      console.log('🔵 Role confirmado: admin. Redirecionando...');
      
      // Aguardar um momento para o state atualizar
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirecionar para admin
      router.push("/admin");
      console.log('🔵 router.push(/admin) executado!');
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link href="/">
          <button className="flex items-center gap-2 text-white/80 hover:text-white mb-8 transition-colors">
            <ArrowLeft size={20} />
            Voltar
          </button>
        </Link>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl animate-scale-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4">
              <Shield className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Login Admin
            </h1>
            <p className="text-gray-300">
              Acesso exclusivo para administradores
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

