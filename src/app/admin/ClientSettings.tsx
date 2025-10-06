"use client";
import { useAppStore } from "@/store/appStore";
import { useState, useMemo } from "react";
import { Edit, Eye, EyeOff } from "lucide-react";
import { Database } from "@/lib/database.types";
import EditClientModal from "./EditClientModal";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default function ClientSettings() {
  const { clients, updateClient, fetchClients } = useAppStore();
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);

  const activeClients = useMemo(() => {
    return clients
      .filter((c) => c.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const inactiveClients = useMemo(() => {
    return clients
      .filter((c) => !c.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const handleToggleActive = async (client: ClientRow) => {
    await updateClient(client.id, { is_active: !client.is_active });
    // Força atualização imediata da UI
    await fetchClients();
  };

  const renderClientCard = (client: ClientRow) => (
    <li
      key={client.id}
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900 p-4 rounded-lg transition-all ${
        !client.is_active ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        <img
          src={
            client.profile_picture_url ||
            `https://ui-avatars.com/api/?name=${client.name.substring(
              0,
              2
            )}&background=random`
          }
          alt={client.name}
          className="w-12 h-12 rounded-full"
        />
        <div 
          className="w-4 h-4 rounded-full flex-shrink-0" 
          style={{ backgroundColor: client.brand_color || '#6366f1' }}
        />
        <div className="flex-grow">
          <p className="font-semibold text-white text-lg">
            {client.name}
          </p>
          <p className="text-sm text-gray-400">
            ID: {client.client_id}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-4 sm:mt-0">
        <button
          onClick={() => setEditingClient(client)}
          className="p-2 text-gray-400 hover:bg-gray-700 rounded-full transition-colors"
        >
          <Edit size={20} />
        </button>
        <button
          onClick={() => handleToggleActive(client)}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          title={
            client.is_active ? "Desativar cliente" : "Ativar cliente"
          }
        >
          {client.is_active ? (
            <Eye size={20} className="text-green-500" />
          ) : (
            <EyeOff size={20} className="text-red-500" />
          )}
        </button>
      </div>
    </li>
  );

  return (
    <>
      <div className="bg-gray-800 rounded-xl shadow-md p-6 space-y-6">
        {/* Active Clients */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-300">
            Clientes Ativos ({activeClients.length})
          </h3>
          <ul className="space-y-3">
            {activeClients.map(renderClientCard)}
          </ul>
        </div>

        {/* Inactive Clients */}
        {inactiveClients.length > 0 && (
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-500">
              Clientes Inativos ({inactiveClients.length})
            </h3>
            <ul className="space-y-3">
              {inactiveClients.map(renderClientCard)}
            </ul>
          </div>
        )}
      </div>

      {editingClient && (
        <EditClientModal
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          client={editingClient}
        />
      )}
    </>
  );
}
