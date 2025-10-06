"use client";

import { useState, useEffect } from "react";
import Modal from "./Modal";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
}

const ASPECT_RATIOS = {
  "Quadrado (1:1)": 1 / 1,
  "Vertical (4:5)": 4 / 5,
  "Story (9:16)": 9 / 16,
};

function getCroppedImg(
  image: HTMLImageElement,
  crop: PixelCrop
): Promise<File> {
  const canvas = document.createElement("canvas");
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx)
    return Promise.reject(new Error("Falha ao obter o contexto do canvas."));

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("A criação do Blob falhou."));
        return;
      }
      resolve(new File([blob], "cropped.jpeg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
}

export default function ImageCropperModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(1 / 1);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null
  );

  // Função para centralizar o crop
  function centerAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number
  ) {
    return centerCrop(
      makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
      mediaWidth,
      mediaHeight
    );
  }

  // Efeito para resetar o crop quando o aspect ratio muda
  useEffect(() => {
    if (imageElement) {
      const { width, height } = imageElement;
      const newCrop = centerAspectCrop(width, height, aspect || 1 / 1);
      setCrop(newCrop);
    }
  }, [aspect, imageElement]);

  const handleCrop = async () => {
    if (imageElement && completedCrop?.width && completedCrop?.height) {
      try {
        const croppedFile = await getCroppedImg(imageElement, completedCrop);
        onCropComplete(croppedFile);
        onClose();
      } catch (e) {
        console.error(e);
        alert("Não foi possível cortar a imagem.");
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cortar Imagem">
      <div className="p-4 sm:p-6 bg-gray-800">
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {(
            Object.keys(ASPECT_RATIOS) as Array<keyof typeof ASPECT_RATIOS>
          ).map((key) => (
            <button
              key={key}
              onClick={() => setAspect(ASPECT_RATIOS[key])}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                aspect === ASPECT_RATIOS[key]
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        <div className="flex justify-center bg-black max-h-[50vh]">
          {imageSrc && (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
              className="max-h-[50vh]"
            >
              <img
                src={imageSrc}
                alt="Crop preview"
                onLoad={(e) => setImageElement(e.currentTarget)}
              />
            </ReactCrop>
          )}
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-700 mt-4">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleCrop}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Cortar e Usar
          </button>
        </div>
      </div>
    </Modal>
  );
}
