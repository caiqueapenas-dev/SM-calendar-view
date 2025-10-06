"use client";

import Modal from "../../components/common/Modal";
import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { PostMediaType } from "@/lib/types";
import { Database } from "@/lib/database.types";
import { Loader, Calendar } from "lucide-react";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import ImageUploader from "../../components/common/ImageUploader";
import DraggableThumbnails from "../../components/common/DraggableThumbnails";
import ImageCropperModal from "../../components/common/ImageCropperModal";
import { v4 as uuidv4 } from "uuid";

type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: Dayjs | null;
}

interface MediaFile {
  id: string;
  file: File;
  url: string;
}

export default function CreatePostModal({
  isOpen,
  onClose,
  defaultDate,
}: CreatePostModalProps) {
  const { clients, addPost } = useAppStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const activeClients = useMemo(
    () =>
      clients
        .filter((c) => c.is_active)
        .sort((a, b) => {
          const aDisplayName = `${a.custom_name || a.name} ${a.name}`;
          const bDisplayName = `${b.custom_name || b.name} ${b.name}`;
          return aDisplayName.localeCompare(bDisplayName);
        }),
    [clients]
  );

  const [clientId, setClientId] = useState("");
  const [caption, setCaption] = useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [mediaType, setMediaType] = useState<PostMediaType>("FOTO");
  const [platforms, setPlatforms] = useState<("instagram" | "facebook")[]>([]);

  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [fileToCrop, setFileToCrop] = useState<MediaFile | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (activeClients.length > 0) {
      setClientId(activeClients[0].client_id);
    }
  }, [clients, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const dateToSet = defaultDate || dayjs();
      setScheduledAt(
        dateToSet.hour(10).minute(0).second(0).format("YYYY-MM-DDTHH:mm")
      );
    } else {
      resetForm();
    }
  }, [isOpen, defaultDate]);

  useEffect(() => {
    setHasUnsavedChanges(
      caption !== "" || mediaFiles.length > 0 || platforms.length > 0
    );
  }, [caption, mediaFiles, platforms]);

  const resetForm = () => {
    setCaption("");
    setMediaFiles([]);
    setScheduledAt("");
    setPlatforms([]);
    setMediaType("FOTO");
    if (activeClients.length > 0) setClientId(activeClients[0].client_id);
    setHasUnsavedChanges(false);
  };

  const handleClose = () => {
    if (
      hasUnsavedChanges &&
      !window.confirm("Você tem alterações não salvas. Deseja descartá-las?")
    ) {
      return;
    }
    onClose();
  };

  const handleFilesAdded = (files: File[]) => {
    const newMediaFiles = files.map((file) => ({
      id: uuidv4(),
      file,
      url: URL.createObjectURL(file),
    }));
    setMediaFiles((prev) => [...prev, ...newMediaFiles]);
  };

  const removeMediaFile = (id: string) =>
    setMediaFiles((prev) => prev.filter((mf) => mf.id !== id));

  const reorderMediaFiles = (reorderedItems: { id: string; url: string }[]) => {
    setMediaFiles((prev) =>
      reorderedItems.map((item) => prev.find((mf) => mf.id === item.id)!)
    );
  };

  const openCropper = (id: string) => {
    const file = mediaFiles.find((mf) => mf.id === id);
    if (file) {
      setFileToCrop(file);
      setIsCropperOpen(true);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    if (!fileToCrop) return;
    setMediaFiles((prev) =>
      prev.map((mf) =>
        mf.id === fileToCrop.id
          ? { ...mf, file: croppedFile, url: URL.createObjectURL(croppedFile) }
          : mf
      )
    );
    setFileToCrop(null);
    setIsCropperOpen(false);
  };

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    const resourceType = file.type.startsWith("video") ? "video" : "image";
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Falha no upload para o Cloudinary.");
    const data = await response.json();
    return data.secure_url;
  };

  const handleSubmit = async () => {
    if (
      !clientId ||
      mediaFiles.length === 0 ||
      !scheduledAt ||
      platforms.length === 0
    ) {
      alert(
        "Por favor, preencha todos os campos obrigatórios (Mídia, Cliente, Data e Plataforma)."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedUrls = await Promise.all(
        mediaFiles.map((mf) => uploadFileToCloudinary(mf.file))
      );

      const postData: Omit<
        PostInsert,
        "status" | "created_by" | "edit_history"
      > = {
        client_id: clientId,
        caption,
        media_url:
          mediaType === "CARROSSEL"
            ? JSON.stringify(uploadedUrls)
            : uploadedUrls[0],
        scheduled_at: new Date(scheduledAt).toISOString(),
        media_type: mediaType,
        platforms,
      };

      const success = await addPost(postData);

      if (success) {
        setHasUnsavedChanges(false);
        alert("Post agendado com sucesso!");
        onClose();
      } else {
        alert("Ocorreu um erro ao agendar o post.");
      }
    } catch (e) {
      console.error(e);
      alert("Ocorreu um erro durante o upload das mídias.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCarousel = mediaType === "CARROSSEL";

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Agendar Nova Publicação"
      >
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
                  {c.custom_name ? `${c.custom_name} - ${c.name}` : c.name}
                </option>
              ))}
            </select>
          </div>

          {(mediaFiles.length === 0 || isCarousel) && (
            <div>
              <label className="text-sm font-medium text-gray-300">Mídia</label>
              <div className="mt-1">
                <ImageUploader
                  onFilesAdded={handleFilesAdded}
                  allowMultiple={isCarousel}
                  mediaCount={mediaFiles.length}
                />
              </div>
            </div>
          )}

          {mediaFiles.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-300">
                {isCarousel
                  ? "Ordem do Carrossel (arraste para reordenar)"
                  : "Mídia"}
              </label>
              <div className="mt-2 p-2 bg-gray-900/50 rounded-md">
                <DraggableThumbnails
                  items={mediaFiles.map((mf) => ({ id: mf.id, url: mf.url }))}
                  setItems={reorderMediaFiles}
                  onRemove={removeMediaFile}
                  onCrop={openCropper}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-300">Legenda</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={4}
              className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
            ></textarea>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-300">
                Plataformas
              </label>
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() =>
                    setPlatforms((p) =>
                      p.includes("instagram")
                        ? p.filter((i) => i !== "instagram")
                        : [...p, "instagram"]
                    )
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    platforms.includes("instagram")
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPlatforms((p) =>
                      p.includes("facebook")
                        ? p.filter((i) => i !== "facebook")
                        : [...p, "facebook"]
                    )
                  }
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                    platforms.includes("facebook")
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  }`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-300">
                Tipo de Mídia
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as PostMediaType)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white"
              >
                <option value="FOTO">📷 Foto</option>
                <option value="REELS">🎬 Reels</option>
                <option value="CARROSSEL">🎠 Carrossel</option>
                <option value="STORY">⚡ Story</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="scheduledAtInput"
              className="text-sm font-medium text-gray-300"
            >
              Data e Hora do Agendamento
            </label>
            <div className="relative">
              <input
                id="scheduledAtInput"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white cursor-pointer pr-10"
                onClick={() => setIsCalendarOpen(true)}
              />
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <Calendar size={20} />
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleClose}
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

      {isCropperOpen && fileToCrop && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={fileToCrop.url}
          onCropComplete={handleCropComplete}
        />
      )}

      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4">Selecionar Data</h3>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm text-gray-400 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const date = dayjs().startOf('month').add(i - dayjs().startOf('month').day(), 'day');
                const isCurrentMonth = date.month() === dayjs().month();
                const isToday = date.isSame(dayjs(), 'day');
                const isSelected = scheduledAt && dayjs(scheduledAt).isSame(date, 'day');
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      const currentTime = scheduledAt ? dayjs(scheduledAt) : dayjs().hour(10).minute(0);
                      const newDateTime = date.hour(currentTime.hour()).minute(currentTime.minute());
                      setScheduledAt(newDateTime.format("YYYY-MM-DDTHH:mm"));
                      setIsCalendarOpen(false);
                    }}
                    className={`p-2 text-sm rounded ${
                      isCurrentMonth
                        ? isSelected
                          ? 'bg-indigo-600 text-white'
                          : isToday
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'text-white hover:bg-gray-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {date.date()}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCalendarOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
