// Este componente precisaria de mais lógica para upload de arquivos,
// mas para este protótipo, usaremos um campo de URL para a mídia.
"use client";

import Modal from "../common/Modal";
import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { SimulatedPost } from "@/lib/types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreatePostModal({
  isOpen,
  onClose,
}: CreatePostModalProps) {
  const { clients, addSimulatedPost } = useAppStore();
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mediaType, setMediaType] =
    useState<SimulatedPost["media_type"]>("FOTO");

  const handleSubmit = () => {
    if (!clientId || !mediaUrl || !scheduledAt) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const newPost: SimulatedPost = {
      id: `sim_${Date.now()}`,
      clientId,
      caption,
      mediaUrl,
      scheduledAt: new Date(scheduledAt).toISOString(),
      status: "scheduled",
      media_type: mediaType,
    };

    addSimulatedPost(newPost);
    onClose();
    // Reset form
    setCaption("");
    setMediaUrl("");
    setScheduledAt("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Agendar Publicação Simulada"
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300">Cliente</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          >
            {clients
              .filter((c) => c.isVisible)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customName || c.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            URL da Mídia
          </label>
          <input
            type="text"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">Legenda</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={4}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          ></textarea>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Tipo de Mídia
          </label>
          <select
            value={mediaType}
            onChange={(e) =>
              setMediaType(e.target.value as SimulatedPost["media_type"])
            }
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          >
            <option value="FOTO">Foto</option>
            <option value="REELS">Reels</option>
            <option value="CARROSSEL">Carrossel</option>
            <option value="STORY">Story</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Data e Hora do Agendamento
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Agendar
          </button>
        </div>
      </div>
    </Modal>
  );
}
