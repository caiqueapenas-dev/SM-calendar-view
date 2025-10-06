"use client";

import Modal from "../../components/common/Modal";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { PostMediaType } from "@/lib/types";
import { Database } from "@/lib/database.types";
import { Loader } from "lucide-react";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import ImageUploader from "../../components/common/ImageUploader";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Dayjs | null;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  defaultDate,
}: CreatePostModalProps) {
  const { clients, addPost } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeClients = clients.filter((c) => c.is_active);
  const [clientId, setClientId] = useState(
    activeClients.length > 0 ? activeClients[0].client_id : ""
  );
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mediaType, setMediaType] = useState<PostMediaType>("FOTO");
  const [platforms, setPlatforms] = useState<("instagram" | "facebook")[]>([]);

  useEffect(() => {
    if (isOpen) {
      const dateToSet = defaultDate || dayjs();
      const formattedDate = dateToSet
        .hour(10)
        .minute(0)
        .second(0)
        .format("YYYY-MM-DDTHH:mm");
      setScheduledAt(formattedDate);
    } else {
      resetForm();
    }
  }, [isOpen, defaultDate]);

  // Atualiza o cliente selecionado se a lista de clientes mudar
  useEffect(() => {
    const activeClients = clients.filter((c) => c.is_active);
    if (
      activeClients.length > 0 &&
      !activeClients.find((c) => c.client_id === clientId)
    ) {
      setClientId(activeClients[0].client_id);
    }
  }, [clients]);

  const resetForm = () => {
    setCaption("");
    setMediaUrl("");
    setScheduledAt("");
    setPlatforms([]);
    setMediaType("FOTO");
    const activeClients = clients.filter((c) => c.is_active);
    if (activeClients.length > 0) {
      setClientId(activeClients[0].client_id);
    }
  };

  const handlePlatformChange = (platform: "instagram" | "facebook") => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = async () => {
    if (!clientId || !mediaUrl || !scheduledAt || platforms.length === 0) {
      alert(
        "Por favor, preencha todos os campos obrigatórios (Mídia, Cliente, Data e Plataforma)."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const postData: Omit<
        PostInsert,
        "status" | "created_by" | "edit_history"
      > = {
        client_id: clientId,
        caption,
        media_url: mediaUrl,
        scheduled_at: new Date(scheduledAt).toISOString(),
        media_type: mediaType,
        platforms,
      };

      const success = await addPost(postData);

      if (success) {
        alert("Post agendado com sucesso!");
        onClose();
      } else {
        alert("Ocorreu um erro ao agendar o post.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Agendar Nova Publicação">
      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300">Cliente</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          >
            {activeClients.map((c) => (
              <option key={c.id} value={c.client_id}>
                {c.custom_name || c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300">Mídia</label>
          <div className="mt-1">
            <ImageUploader
              mediaUrl={mediaUrl}
              onUploadSuccess={(url) => setMediaUrl(url)}
            />
          </div>
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
            Plataformas
          </label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={platforms.includes("instagram")}
                onChange={() => handlePlatformChange("instagram")}
                className="rounded"
              />
              Instagram
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={platforms.includes("facebook")}
                onChange={() => handlePlatformChange("facebook")}
                className="rounded"
              />
              Facebook
            </label>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300">
            Tipo de Mídia
          </label>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as PostMediaType)}
            className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
          >
            <option value="FOTO">Foto</option>
            <option value="REELS">Reels</option>
            <option value="CARROSSEL">Carrossel</option>
            <option value="STORY">Story</option>
            <option value="VIDEO">Vídeo</option>
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
            disabled={isSubmitting}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center w-32 disabled:bg-indigo-800"
          >
            {isSubmitting ? (
              <Loader className="animate-spin" size={20} />
            ) : (
              "Agendar"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
