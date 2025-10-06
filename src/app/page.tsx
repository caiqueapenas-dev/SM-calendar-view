"use client";

import { Shield, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Social Media Planner
          </h1>
          <p className="text-xl text-gray-300">
            Gerencie suas publicações de forma profissional
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-6 animate-scale-in">
          {/* Admin Login */}
          <Link href="/login/admin">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-500 transition-colors">
                  <Shield className="text-white" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Área do Administrador
                </h2>
                <p className="text-gray-300 mb-6">
                  Gerencie clientes, crie posts e acompanhe aprovações
                </p>
                <div className="px-6 py-3 bg-indigo-600 rounded-lg text-white font-semibold group-hover:bg-indigo-500 transition-colors">
                  Entrar como Admin
                </div>
              </div>
            </div>
          </Link>

          {/* Client Login */}
          <Link href="/login/client">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer transform hover:scale-105 group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-colors">
                  <Users className="text-white" size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Área do Cliente
                </h2>
                <p className="text-gray-300 mb-6">
                  Visualize, aprove e acompanhe suas publicações
                </p>
                <div className="px-6 py-3 bg-purple-600 rounded-lg text-white font-semibold group-hover:bg-purple-500 transition-colors">
                  Entrar como Cliente
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm animate-fade-in">
          <p>© 2025 Social Media Planner. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
