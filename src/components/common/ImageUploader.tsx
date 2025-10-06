"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";

interface ImageUploaderProps {
  onFilesAdded: (files: File[]) => void;
  allowMultiple: boolean;
  mediaCount: number;
}

export default function ImageUploader({
  onFilesAdded,
  allowMultiple,
  mediaCount,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const filesArray = Array.from(selectedFiles);
    setError(null);

    // Validação de arquivos
    for (const file of filesArray) {
      if (file.size > 10 * 1024 * 1024) {
        // Limite de 10MB
        setError(`O arquivo ${file.name} é muito grande (máx 10MB).`);
        return;
      }
    }

    onFilesAdded(filesArray);
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

  if (!allowMultiple && mediaCount > 0) {
    return null;
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
        onChange={(e) => handleFileSelection(e.target.files)}
        multiple={allowMultiple}
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center justify-center">
          <UploadCloud className="mx-auto h-12 w-12 text-gray-500" />
          <p className="mt-2 text-sm text-gray-400">
            <span className="font-semibold text-indigo-400">
              Clique para enviar
            </span>{" "}
            ou arraste e solte
          </p>
          <p className="text-xs text-gray-500">
            {allowMultiple
              ? "Imagens ou Vídeos até 10MB"
              : "Imagem ou Vídeo até 10MB"}
          </p>
        </div>
      </label>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
}
