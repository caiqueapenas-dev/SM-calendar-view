"use client";

import { useState, useEffect } from "react";
import { PostStatus, PostMediaType } from "@/lib/types";
import { useAppStore } from "@/store/appStore";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import Modal from "./Modal";
import MediaTypeTag from "./MediaTypeTag";
import {
  Instagram,
  Facebook,
  Pen,
  Save,
  X,
  ThumbsUp,
  ThumbsDown,
  History,
  FileText,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import * as unidiff from "unidiff";
import { Database } from "@/lib/database.types";

dayjs.locale("pt-br");

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostRow | null;
}

const DiffViewer = ({
  oldText,
  newText,
}: {
  oldText: string;
  newText: string;
}) => {
  const diff = unidiff.diffLines(oldText, newText);
  const formatted = unidiff.formatLines(diff, { context: 3 });

  const colorizeDiff = (line: string) => {
    if (line.startsWith("+")) return "text-green-400 bg-green-900/30";
    if (line.startsWith("-")) return "text-red-400 bg-red-900/30";
    return "text-gray-400";
  };

  return (
    <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-900 p-2 rounded overflow-x-auto">
      {formatted
        .split("\n")
        .slice(2)
        .map((line, i) => (
          <div key={i} className={colorizeDiff(line)}>
            {line}
          </div>
        ))}
    </pre>
  );
};

export default function PostModal({
  isOpen,
  onClose,
  post: initialPost,
}: PostModalProps) {
  const { userRole, updatePost, updatePostStatus, posts } = useAppStore();
  const post = isOpen
    ? posts.find((p) => p.id === initialPost?.id) || initialPost
    : initialPost;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const [editedCaption, setEditedCaption] = useState("");
  const [editedMediaUrl, setEditedMediaUrl] = useState("");
  const [editedMediaType, setEditedMediaType] = useState<PostMediaType>("FOTO");
  const [editedPlatforms, setEditedPlatforms] = useState<
    ("instagram" | "facebook")[]
  >([]);
  const [editedScheduledAt, setEditedScheduledAt] = useState("");

  useEffect(() => {
    if (post) {
      // Verificação de nulo aqui
      setEditedCaption(post.caption || "");
      setEditedMediaUrl(post.media_url || "");
      setEditedMediaType((post.media_type as PostMediaType) || "FOTO");
      setEditedPlatforms(
        (Array.isArray(post.platforms) ? post.platforms : []) as any
      );
      setEditedScheduledAt(post.scheduled_at || "");
      setHasUnsavedChanges(false);

      if (
        post.media_type === "CARROSSEL" &&
        typeof post.media_url === "string"
      ) {
        try {
          const urls = JSON.parse(post.media_url);
          setCarouselImages(Array.isArray(urls) ? urls : [post.media_url]);
        } catch (e) {
          setCarouselImages(post.media_url ? [post.media_url] : []);
        }
      } else {
        setCarouselImages(post.media_url ? [post.media_url] : []);
      }
      setCurrentSlide(0);

      if (!isSaving) setIsEditing(false);
    }
  }, [post, isOpen, isSaving]);

  useEffect(() => {
    if (isEditing && post) {
      // Verificação de nulo aqui também
      const hasChanged = (post.caption || "") !== editedCaption;
      setHasUnsavedChanges(hasChanged);
    }
  }, [editedCaption, isEditing, post]);

  const handleClose = () => {
    if (
      isEditing &&
      hasUnsavedChanges &&
      !window.confirm("Você tem alterações não salvas. Deseja descartá-las?")
    ) {
      return;
    }
    onClose();
  };

  const handleSave = async () => {
    if (!post || !userRole) return;

    setIsSaving(true);
    try {
      let updates: Partial<PostRow> = { caption: editedCaption };

      if (userRole === "admin") {
        updates = {
          ...updates,
          media_url: editedMediaUrl,
          media_type: editedMediaType,
          platforms: editedPlatforms,
          scheduled_at: new Date(editedScheduledAt).toISOString(),
        };
      }

      await updatePost(post.id, updates);
      alert("Post atualizado com sucesso!");
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch (error) {
      alert("Falha ao atualizar o post.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!post) return;
    setEditedCaption(post.caption || "");
    setEditedMediaUrl(post.media_url || "");
    setEditedMediaType(post.media_type as PostMediaType);
    setEditedPlatforms(
      Array.isArray(post.platforms) ? (post.platforms as any) : []
    );
    setEditedScheduledAt(post.scheduled_at);
    setIsEditing(false);
  };

  const handleApproval = async (status: PostStatus) => {
    if (!post) return;
    setIsSaving(true);
    try {
      await updatePostStatus(post.id, status);
      alert(
        `Post ${status === "agendado" ? "aprovado" : "reprovado"} com sucesso!`
      );
      onClose();
    } catch (error) {
      alert("Falha ao atualizar o status do post.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlatformChange = (platform: "instagram" | "facebook") => {
    setEditedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const nextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () =>
    setCurrentSlide(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length
    );

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (!post) return null; // A guarda principal que já existia

  const formattedDate = dayjs(post.scheduled_at).format(
    "DD [de] MMMM [de] YYYY [às] HH:mm"
  );
  const dayOfWeek = dayjs(post.scheduled_at).format("dddd");

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col max-h-[90vh] h-[90vh]">
        <div 
          className="relative w-full h-[40vh] flex-shrink-0 bg-black rounded-t-lg group"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {carouselImages.length > 0 ? (
            <img
              src={carouselImages[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              className="w-full h-full object-contain select-none"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              Sem Mídia
            </div>
          )}
          {carouselImages.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 p-1 rounded-full text-white opacity-0 md:group-hover:opacity-100 transition-opacity md:opacity-0 opacity-30"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 p-1 rounded-full text-white opacity-0 md:group-hover:opacity-100 transition-opacity md:opacity-0 opacity-30"
              >
                <ChevronRight size={24} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {carouselImages.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      currentSlide === idx ? "bg-white" : "bg-white/50"
                    }`}
                  ></div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="border-b border-gray-700">
          <nav className="flex -mb-px px-4">
            <button
              onClick={() => setActiveTab("review")}
              className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 ${
                activeTab === "review"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <FileText size={16} /> Revisão
            </button>
            <button
              onClick={() => setActiveTab("log")}
              className={`flex items-center gap-2 py-3 px-4 font-medium text-sm border-b-2 ${
                activeTab === "log"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              <History size={16} /> Log de Alterações
            </button>
          </nav>
        </div>

        <div className="p-6 flex-grow overflow-y-auto overscroll-contain">
          {activeTab === "review" && (
            <>
              <div className="bg-blue-900/50 text-blue-300 p-2 rounded-md text-center mb-4 text-sm">
                Agendado para: {dayOfWeek}, {formattedDate}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2">
                  {Array.isArray(post.platforms) &&
                    post.platforms.includes("instagram") && (
                      <Instagram size={18} />
                    )}
                  {Array.isArray(post.platforms) &&
                    post.platforms.includes("facebook") && (
                      <Facebook size={18} />
                    )}
                  <MediaTypeTag mediaType={post.media_type as PostMediaType} />
                </div>
              </div>

              {!isEditing ? (
                <p className="text-white whitespace-pre-wrap mb-20">
                  {post.caption || "Sem legenda."}
                </p>
              ) : (
                <div className="space-y-4 mb-20">
                  {userRole === "admin" && (
                    <>{/* Campos de edição do Admin */}</>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Legenda
                    </label>
                    <div className="flex font-mono text-sm mt-1">
                      <div className="text-right pr-2 text-gray-500 select-none pt-2">
                        {Array.from(
                          { length: editedCaption.split("\n").length || 1 },
                          (_, i) => (
                            <div key={i}>{i + 1}</div>
                          )
                        )}
                      </div>
                      <textarea
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        rows={8}
                        className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-700 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          {activeTab === "log" && (
            <div className="space-y-4 pb-20 max-h-full overflow-y-auto">
              {Array.isArray(post.edit_history) &&
              post.edit_history.length > 0 ? (
                post.edit_history
                  .slice()
                  .reverse()
                  .map((edit: any, index) => (
                    <div key={index} className="text-sm">
                      <p className="text-gray-500 mb-1 capitalize">
                        Alterado por {edit.author} em:{" "}
                        {dayjs(edit.timestamp).format("DD/MM/YYYY HH:mm")}
                      </p>
                      <DiffViewer
                        oldText={edit.oldCaption}
                        newText={edit.newCaption}
                      />
                    </div>
                  ))
              ) : (
                <p className="text-gray-400">Nenhuma alteração registrada.</p>
              )}
            </div>
          )}
        </div>

        {/* Fixed action buttons at bottom */}
        {!isEditing && userRole === "client" && (
          <div className="border-t border-gray-700 p-4 bg-gray-800 flex justify-center gap-3">
            {isSaving ? (
              <Loader className="animate-spin" />
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-3 rounded-full bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity"
                  title="Editar Legenda"
                >
                  <Pen size={20} />
                </button>
                <button
                  onClick={() => handleApproval("agendado")}
                  className="p-3 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-600"
                  title="Aprovar"
                  disabled={post.status === "agendado"}
                >
                  <ThumbsUp size={20} />
                </button>
                <button
                  onClick={() => handleApproval("negado")}
                  className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-600"
                  title="Reprovar"
                  disabled={post.status === "negado"}
                >
                  <ThumbsDown size={20} />
                </button>
              </>
            )}
          </div>
        )}
        {!isEditing && userRole === "admin" && (
          <div className="border-t border-gray-700 p-4 bg-gray-800 flex justify-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="p-3 rounded-full bg-gray-600 text-white hover:bg-gray-500"
              title="Editar Post"
            >
              <Pen size={20} />
            </button>
          </div>
        )}
        {isEditing && (
          <div className="border-t border-gray-700 p-4 bg-gray-800 flex justify-center gap-3">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded-md"
            >
              <X size={18} /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 px-4 rounded-md min-w-[120px]"
            >
              {isSaving ? (
                <Loader className="animate-spin" />
              ) : (
                <>
                  <Save size={18} /> Salvar
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
