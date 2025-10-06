"use client";

import { useState, useEffect } from "react";
import Modal from "../../components/common/Modal";
import { useAppStore } from "@/store/appStore";
import { Database } from "@/lib/database.types";
import { Loader } from "lucide-react";
import ImageUploader from "../../components/common/ImageUploader";

type ClientRow = Database["public"]["Tables"]["clients"]["Row"];
type ClientUpdate = Database["public"]["Tables"]["clients"]["Update"];

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientRow;
}

export default function EditClientModal({
  isOpen,
  onClose,
  client,
}: EditClientModalProps) {
  const { updateClient } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(client.name);
  const [customName, setCustomName] = useState(client.custom_name || "");
  const [category, setCategory] = useState(client.category || "");
  const [instagram, setInstagram] = useState(client.instagram_handle || "");
  const [pfpUrl, setPfpUrl] = useState(client.profile_picture_url || "");

  useEffect(() => {
    setName(client.name);
    setCustomName(client.custom_name || "");
    setCategory(client.category || "");
    setInstagram(client.instagram_handle || "");
    setPfpUrl(client.profile_picture_url || "");
  }, [client]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: ClientUpdate = {
        name,
        custom_name: customName,
        category,
        instagram_handle: instagram,
        profile_picture_url: pfpUrl,
      };
      await updateClient(client.id, updates);
      alert("Cliente atualizado com sucesso!");
      onClose();
    } catch (e) {
      alert("Falha ao atualizar o cliente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar ${client.name}`}>
      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300">
            Foto de Perfil
          </label>
          <div className="mt-1">
            <ImageUploader mediaUrl={pfpUrl} onUploadSuccess={setPfpUrl} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Nome Oficial
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Nome Personalizado
          </label>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">Categoria</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Instagram (@)
          </label>
          <input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center w-28"
          >
            {isSaving ? <Loader className="animate-spin" /> : "Salvar"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
