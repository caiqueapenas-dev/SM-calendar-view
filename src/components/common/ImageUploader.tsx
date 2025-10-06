"use client";

import { useState } from "react";
import { UploadCloud, X, Loader } from "lucide-react";
import ImageCropperModal from "./ImageCropperModal";

interface ImageUploaderProps {
  // Para lidar com novos arquivos selecionados (um ou mais)
  onFilesAdded: (files: File[]) => void;
  // Para lidar com a remoção de uma imagem existente (no modo de edição)
  onFileRemoved?: () => void;
  // Para mostrar uma imagem que já existe (URL do banco de dados)
  previewUrl?: string | null;
  // Permite a seleção de múltiplos arquivos
  allowMultiple: boolean;
  // Controla a visibilidade (ex: não mostrar se já houver uma imagem no modo single-file)
  mediaCount: number;
}

export default function ImageUploader({
  onFilesAdded,
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

    // Para o modo de arquivo único, pegamos apenas o primeiro
    const file = filesArray[0];

    if (file.type.startsWith("video/")) {
      if (file.size > 50 * 1024 * 1024) {
        // 50MB
        setError(`O vídeo é muito grande (máx 50MB).`);
        return;
      }
      onFilesAdded(filesArray);
    } else if (file.type.startsWith("image/")) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB
        setError(`A imagem é muito grande (máx 10MB).`);
        return;
      }
      // Abre o cropper para a primeira imagem selecionada
      setImageToCrop(URL.createObjectURL(file));
      setIsCropperOpen(true);
    } else {
      setError("Formato de arquivo não suportado.");
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    onFilesAdded([croppedFile]);
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

  // Se uma URL de preview foi fornecida (modo de edição), mostra a imagem existente
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

  // Não mostra a caixa de upload se não for múltiplo e já tiver um arquivo
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
