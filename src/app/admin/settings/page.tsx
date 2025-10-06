"use client";

import { useState } from "react";
import ClientSettings from "../ClientSettings";
import AdminProfile from "@/components/admin/AdminProfile";
import InsightsPanel from "@/components/insights/InsightsPanel";
import SpecialDatesModal from "@/components/special-dates/SpecialDatesModal";
import { MessageCircle, Calendar } from "lucide-react";
import { useAppStore } from "@/store/appStore";

export default function SettingsPage() {
  const { clients } = useAppStore();
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [isSpecialDatesOpen, setIsSpecialDatesOpen] = useState(false);

  const activeClients = clients.filter((c) => c.is_active);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Configurações</h1>

      {/* Admin Profile Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Meu Perfil</h2>
        <AdminProfile />
      </div>

      {/* Client Management Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Gerenciar Clientes</h2>
        {activeClients.length > 0 && (
          <div className="flex items-center gap-4">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Selecionar cliente para insights</option>
              {activeClients.map((client) => (
                <option key={client.client_id} value={client.client_id}>
                  {client.custom_name ? `${client.custom_name} - ${client.name}` : client.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => selectedClientId && setIsInsightsOpen(true)}
              disabled={!selectedClientId}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <MessageCircle size={20} />
              Insights & Ideias
            </button>
            <button
              onClick={() => selectedClientId && setIsSpecialDatesOpen(true)}
              disabled={!selectedClientId}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              <Calendar size={20} />
              Datas Especiais
            </button>
          </div>
        )}
        </div>
      </div>
        <ClientSettings />

      {selectedClientId && (
        <>
          <InsightsPanel
            clientId={selectedClientId}
            isOpen={isInsightsOpen}
            onClose={() => setIsInsightsOpen(false)}
          />
          <SpecialDatesModal
            clientId={selectedClientId}
            isOpen={isSpecialDatesOpen}
            onClose={() => setIsSpecialDatesOpen(false)}
          />
        </>
      )}
    </div>
  );
}
