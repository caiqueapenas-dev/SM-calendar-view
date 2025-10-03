import { useState, useEffect } from "react";
import { Post } from "@/lib/types";
import Modal from "./Modal";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import MediaTypeTag from "./MediaTypeTag";
import { Instagram, Facebook, ChevronLeft, ChevronRight } from "lucide-react";

dayjs.locale("pt-br");

interface PostModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PostModal({ post, isOpen, onClose }: PostModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    setCurrentSlide(0);
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

  const formattedDate = dayjs(post.timestamp).format(
    "DD [de] MMMM [de] YYYY [às] HH:mm"
  );
  const statusText =
    post.status === "published" ? "Publicado" : "Agendado para";

  return (
    <div
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
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
              slides[currentSlide].media_url ||
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
          </div>
          <p className="text-gray-400 text-sm mb-4">
            {statusText}: {formattedDate}
          </p>
          <p className="text-white whitespace-pre-wrap break-words">
            {post.caption || "Sem legenda."}
          </p>
        </div>
      </div>
    </div>
  );
}
