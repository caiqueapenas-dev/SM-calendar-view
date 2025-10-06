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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [category, setCategory] = useState("");
  const [instagram, setInstagram] = useState("");
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);
  const [newPfpFile, setNewPfpFile] = useState<File | null>(null);

  const initialData = {
    name: client.name,
    customName: client.custom_name || "",
    category: client.category || "",
    instagram: client.instagram_handle || "",
    pfpUrl: client.profile_picture_url || null,
  };

  useEffect(() => {
    if (isOpen) {
      setName(initialData.name);
      setCustomName(initialData.customName);
      setCategory(initialData.category);
      setInstagram(initialData.instagram);
      setPfpUrl(initialData.pfpUrl);
      setNewPfpFile(null);
      setHasUnsavedChanges(false);
    }
  }, [client, isOpen]);

  useEffect(() => {
    const hasChanged =
      name !== initialData.name ||
      customName !== initialData.customName ||
      category !== initialData.category ||
      instagram !== initialData.instagram ||
      pfpUrl !== initialData.pfpUrl;
    setHasUnsavedChanges(hasChanged);
  }, [name, customName, category, instagram, pfpUrl, initialData]);

  const handleClose = () => {
    if (
      hasUnsavedChanges &&
      !window.confirm("Você tem alterações não salvas. Deseja descartá-las?")
    ) {
      return;
    }
    onClose();
  };

  const uploadFileToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    if (!response.ok) throw new Error("Falha no upload da foto de perfil.");
    const data = await response.json();
    return data.secure_url;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalPfpUrl = pfpUrl;

      if (newPfpFile) {
        finalPfpUrl = await uploadFileToCloudinary(newPfpFile);
      }

      const updates: ClientUpdate = {
        name,
        custom_name: customName,
        category,
        instagram_handle: instagram,
        profile_picture_url: finalPfpUrl,
      };
      await updateClient(client.id, updates);
      alert("Cliente atualizado com sucesso!");
      onClose();
    } catch (e) {
      console.error(e);
      alert("Falha ao atualizar o cliente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelected = (files: File[]) => {
    const file = files[0];
    if (file) {
      setNewPfpFile(file);
      setPfpUrl(URL.createObjectURL(file));
    }
  };

  const handleFileRemoved = () => {
    setNewPfpFile(null);
    setPfpUrl("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Editar ${client.name}`}
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300">
            Foto de Perfil
          </label>
          <div className="mt-1">
            <ImageUploader
              previewUrl={pfpUrl}
              onFilesAdded={handleFileSelected}
              onFileRemoved={handleFileRemoved}
              allowMultiple={false}
              mediaCount={pfpUrl ? 1 : 0}
            />
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
            onClick={handleClose}
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
