"use client";

import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

type ModalType = "success" | "error" | "warning" | "info" | "confirm";

interface ConfirmModalProps {
  isOpen: boolean;
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={48} />;
      case "error":
        return <AlertCircle className="text-red-500" size={48} />;
      case "warning":
        return <AlertTriangle className="text-yellow-500" size={48} />;
      case "info":
        return <Info className="text-blue-500" size={48} />;
      case "confirm":
        return <AlertCircle className="text-indigo-500" size={48} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "border-green-500/50 bg-green-900/20";
      case "error":
        return "border-red-500/50 bg-red-900/20";
      case "warning":
        return "border-yellow-500/50 bg-yellow-900/20";
      case "info":
        return "border-blue-500/50 bg-blue-900/20";
      case "confirm":
        return "border-indigo-500/50 bg-indigo-900/20";
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onCancel}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border-2 ${getColors()} transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-4 animate-scale-in">
            {getIcon()}
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-white mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-300 mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              {cancelText}
            </button>
            {type === "confirm" && onConfirm && (
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                {confirmText}
              </button>
            )}
            {type !== "confirm" && (
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para usar modals facilmente
export function useConfirmModal() {
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: ModalType;
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  const showModal = (
    type: ModalType,
    title: string,
    message: string,
    onConfirm?: () => void
  ) => {
    setModal({ isOpen: true, type, title, message, onConfirm });
  };

  const hideModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  return { modal, showModal, hideModal };
}

