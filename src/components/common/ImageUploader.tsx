"use client";

import { useState } from "react";
import { UploadCloud, X, Loader } from "lucide-react";
import ImageCropperModal from "./ImageCropperModal";

interface ImageUploaderProps {
  onFilesAdded?: (files: File[]) => void;
  onFileSelected?: (file: File) => void;
  onFileRemoved?: () => void;
  previewUrl?: string | null;
  allowMultiple: boolean;
  mediaCount: number;
}

export default function ImageUploader({
  onFilesAdded,
  onFileSelected,
  onFileRemoved,
  previewUrl,
  allowMultiple,
  mediaCount,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setError(null);
    const filesArray = Array.from(selectedFiles);

    if (allowMultiple) {
      // Cenário de Carrossel (CreatePostModal)
      onFilesAdded?.(filesArray);
    } else {
      // Cenário de arquivo único (CreatePostModal ou EditClientModal)
      const file = filesArray[0];
      if (file.type.startsWith("video/")) {
        if (file.size > 50 * 1024 * 1024) {
          setError(`O vídeo é muito grande (máx 50MB).`);
          return;
        }
        onFileSelected ? onFileSelected(file) : onFilesAdded?.([file]);
      } else if (file.type.startsWith("image/")) {
        if (file.size > 10 * 1024 * 1024) {
          setError(`A imagem é muito grande (máx 10MB).`);
          return;
        }
        setImageToCrop(URL.createObjectURL(file));
        setIsCropperOpen(true);
      } else {
        setError("Formato de arquivo não suportado.");
      }
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    onFileSelected
      ? onFileSelected(croppedFile)
      : onFilesAdded?.([croppedFile]);
    setImageToCrop(null);
    setIsCropperOpen(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelection(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (previewUrl && onFileRemoved) {
    return (
      <div className="relative w-full h-40">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-contain rounded-md bg-gray-900"
        />
        <button
          onClick={onFileRemoved}
          className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-red-500"
          title="Remover imagem"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  if (!allowMultiple && mediaCount > 0) {
    return null;
  }

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition-colors"
      >
        <input
          type="file"
          id={`file-upload-${allowMultiple ? "multi" : "single"}`}
          className="hidden"
          accept="image/png, image/jpeg, image/gif, image/webp, video/mp4, video/quicktime"
          onChange={(e) => handleFileSelection(e.target.files)}
          multiple={allowMultiple}
        />
        <label
          htmlFor={`file-upload-${allowMultiple ? "multi" : "single"}`}
          className="cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center">
            <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
            <p className="mt-2 text-sm text-gray-400">
              <span className="font-semibold text-indigo-400">
                Clique para enviar
              </span>{" "}
              ou arraste e solte
            </p>
            <p className="text-xs text-gray-500">
              {allowMultiple ? "Imagens ou Vídeos" : "Imagem ou Vídeo"}
            </p>
          </div>
        </label>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
      {isCropperOpen && imageToCrop && (
        <ImageCropperModal
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
