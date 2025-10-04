import { useState, useEffect } from "react";
import { Post, EditHistoryItem } from "@/lib/types";
import { useAppStore } from "@/store/appStore";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import Modal from "./Modal";
import MediaTypeTag from "./MediaTypeTag";
import {
  Instagram,
  Facebook,
  Pen,
  Check,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

dayjs.locale("pt-br");

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

const DiffViewer = ({
  oldText,
  newText,
}: {
  oldText: string;
  newText: string;
}) => {
  const oldLines = oldText.split("\n");
  const newLines = newText.split("\n");
  const maxLines = Math.max(oldLines.length, newLines.length);
  const diffLines = [];

  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      diffLines.push(
        <div key={`same-${i}`} className="text-gray-400">
          <span className="w-6 inline-block"> </span>
          {newLine}
        </div>
      );
    } else if (oldLine !== undefined && newLine === undefined) {
      diffLines.push(
        <div key={`del-${i}`} className="bg-red-900/30 text-red-400">
          <span className="w-6 inline-block text-center">-</span>
          {oldLine}
        </div>
      );
    } else if (oldLine === undefined && newLine !== undefined) {
      diffLines.push(
        <div key={`add-${i}`} className="bg-green-900/30 text-green-400">
          <span className="w-6 inline-block text-center">+</span>
          {newLine}
        </div>
      );
    } else {
      diffLines.push(
        <div key={`mod-del-${i}`} className="bg-red-900/30 text-red-400">
          <span className="w-6 inline-block text-center">-</span>
          {oldLine}
        </div>
      );
      diffLines.push(
        <div key={`mod-add-${i}`} className="bg-green-900/30 text-green-400">
          <span className="w-6 inline-block text-center">+</span>
          {newLine}
        </div>
      );
    }
  }

  return (
    <pre className="whitespace-pre-wrap font-mono text-sm">{diffLines}</pre>
  );
};

export default function PostModal({ isOpen, onClose, post }: PostModalProps) {
  const { userType, updateSimulatedPostCaption, approveSimulatedPost } =
    useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(post?.caption || "");
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (post) {
      setEditedCaption(post.caption || "");
      setIsEditing(false);
      setCurrentSlide(0);
    }
  }, [post]);

  if (!post) return null;

  const slides =
    post.media_type === "CARROSSEL"
      ? post.children || [{ id: post.id, media_url: post.media_url }]
      : [{ id: post.id, media_url: post.media_url }];
  const isCarousel = slides.length > 1;

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const isClient = userType === "client";
  const isScheduled = post.status === "scheduled";

  const handleSave = () => {
    if (post) {
      updateSimulatedPostCaption(post.id, editedCaption);
      setIsEditing(false);
    }
  };

  const handleApprove = () => {
    if (post) {
      approveSimulatedPost(post.id);
    }
  };

  const formattedDate = dayjs(post.timestamp).format(
    "DD [de] MMMM [de] YYYY [às] HH:mm"
  );
  const dayOfWeek = dayjs(post.timestamp).format("dddd");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <div className="relative flex-shrink-0 flex items-center justify-center bg-black rounded-t-lg overflow-hidden h-[40vh]">
          {isCarousel && (
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full z-10 hover:bg-black/80"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <img
            src={
              slides[currentSlide]?.media_url ||
              "https://placehold.co/800x600/1f2937/9ca3af?text=Sem+Imagem"
            }
            alt="Post media"
            className="w-auto h-auto max-w-full max-h-full object-contain"
          />

          {isCarousel && (
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-1 rounded-full z-10 hover:bg-black/80"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
          {isScheduled && (
            <div className="bg-red-900/50 text-red-300 p-2 rounded-md text-center mb-4">
              Agendado para: {dayOfWeek}, {formattedDate}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              {post.platform === "instagram" ? (
                <Instagram size={18} />
              ) : (
                <Facebook size={18} />
              )}
              <MediaTypeTag mediaType={post.media_type} />
            </div>
            {isCarousel && (
              <span className="text-xs text-gray-400">
                {currentSlide + 1} / {slides.length}
              </span>
            )}
            {isClient && isScheduled && !isEditing && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-white"
                  title="Editar Legenda"
                >
                  <Pen size={18} />
                </button>
                <button
                  onClick={handleApprove}
                  className="text-green-400 hover:text-green-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                  title="Aprovar Post"
                  disabled={post.isApproved}
                >
                  <Check size={22} />
                </button>
              </div>
            )}
          </div>

          {!isScheduled && (
            <p className="text-gray-400 text-sm mb-3">
              Publicado em: {formattedDate}
            </p>
          )}

          {isEditing ? (
            <div>
              <textarea
                value={editedCaption}
                onChange={(e) => setEditedCaption(e.target.value)}
                className="w-full h-32 p-2 bg-gray-900 rounded-md text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded-md"
                >
                  <X size={16} /> Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1 px-3 rounded-md"
                >
                  <Save size={16} /> Salvar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-white whitespace-pre-wrap">
              {post.caption || "Sem legenda."}
            </p>
          )}

          {post.editHistory && post.editHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2 border-b border-gray-700 pb-1">
                Histórico de Alterações
              </h3>
              <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                {post.editHistory
                  .slice()
                  .reverse()
                  .map((edit, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-gray-500 mb-1">
                        Alterado em:{" "}
                        {dayjs(edit.timestamp).format("DD/MM/YYYY HH:mm")}
                      </p>
                      <div className="bg-gray-900/70 p-2 rounded-md">
                        <DiffViewer
                          oldText={edit.oldCaption}
                          newText={edit.newCaption}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
