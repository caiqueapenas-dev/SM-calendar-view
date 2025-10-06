"use client";

import { useState } from "react";
import { UploadCloud, X, Loader } from "lucide-react";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  mediaUrl: string;
}

export default function ImageUploader({
  onUploadSuccess,
  mediaUrl,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      // Limite de 5MB
      setError("O arquivo é muito grande (máx 5MB).");
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Falha no upload.");

      const data = await response.json();
      onUploadSuccess(data.secure_url);
    } catch (err) {
      setError("Não foi possível fazer o upload da imagem.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    handleFileChange(file || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (mediaUrl) {
    return (
      <div className="relative w-full h-40">
        <img
          src={mediaUrl}
          alt="Preview"
          className="w-full h-full object-contain rounded-md bg-gray-900"
        />
        <button
          onClick={() => onUploadSuccess("")}
          className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500"
          title="Remover imagem"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        accept="image/png, image/jpeg, image/gif, image/webp, video/mp4, video/quicktime"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        disabled={isUploading}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        {isUploading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader className="animate-spin text-indigo-400" size={32} />
            <p className="mt-2 text-sm text-gray-400">Enviando...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">
              <span className="font-semibold text-indigo-400">
                Clique para enviar
              </span>{" "}
              ou arraste e solte
            </p>
            <p className="text-xs text-gray-500">Imagem ou Vídeo até 5MB</p>
          </div>
        )}
      </label>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
