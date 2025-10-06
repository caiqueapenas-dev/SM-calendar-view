"use client";
import { useAppStore } from "@/store/appStore";
import { useState, useMemo } from "react";
import { Edit, Eye, EyeOff } from "lucide-react";
import { Database } from "@/lib/database.types";
import EditClientModal from "./EditClientModal";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default function ClientSettings() {
  const { clients, updateClient } = useAppStore();
  const [editingClient, setEditingClient] = useState<ClientRow | null>(null);

  const sortedClients = useMemo(() => {
    return [...clients].sort((a, b) => a.name.localeCompare(b.name));
  }, [clients]);

  const handleToggleActive = async (client: ClientRow) => {
    await updateClient(client.id, { is_active: !client.is_active });
  };

  return (
    <>
      <div className="bg-gray-800 rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-6">Gerenciar Clientes</h2>
        <ul className="space-y-4">
          {sortedClients.map((client) => (
            <li
              key={client.id}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900 p-4 rounded-lg transition-opacity ${
                !client.is_active ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-4">
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
                <div className="flex-grow">
                  <p className="font-semibold text-white text-lg">
                    {client.custom_name || client.name}
                  </p>
                  <p className="text-sm text-gray-400">
                    {client.name} (ID: {client.client_id})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <button
                  onClick={() => setEditingClient(client)}
                  className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleToggleActive(client)}
                  className="p-2 hover:bg-gray-700 rounded-full"
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
          ))}
        </ul>
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
