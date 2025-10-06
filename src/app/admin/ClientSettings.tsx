"use client";
import { useAppStore } from "@/store/appStore";
import { useState } from "react";
import { Save, Edit, X } from "lucide-react";
import { Database } from "@/lib/database.types";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export default function ClientSettings() {
  const { clients, updateClient } = useAppStore();
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const handleStartEditing = (client: ClientRow) => {
    setEditingClientId(client.id);
    setNewName(client.custom_name || client.name);
  };

  const handleSave = async (clientId: string) => {
    await updateClient(clientId, { custom_name: newName });
    setEditingClientId(null);
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">Gerenciar Clientes</h2>
      <ul className="space-y-4">
        {clients.map((client) => (
          <li
            key={client.id}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900 p-4 rounded-lg"
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
                {editingClientId === client.id ? (
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                ) : (
                  <p className="font-semibold text-white text-lg">
                    {client.custom_name || client.name}
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  {client.name} (ID: {client.client_id})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              {editingClientId === client.id ? (
                <>
                  <button
                    onClick={() => handleSave(client.id)}
                    className="p-2 text-green-400 hover:bg-gray-700 rounded-full"
                  >
                    <Save size={20} />
                  </button>
                  <button
                    onClick={() => setEditingClientId(null)}
                    className="p-2 text-red-400 hover:bg-gray-700 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStartEditing(client)}
                  className="p-2 text-gray-400 hover:bg-gray-700 rounded-full"
                >
                  <Edit size={20} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
