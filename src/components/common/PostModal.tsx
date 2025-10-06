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

  // O post "vivo" que reflete as atualizações do store em tempo real
  const post = isOpen
    ? posts.find((p) => p.id === initialPost?.id) || initialPost
    : initialPost;

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [isSaving, setIsSaving] = useState(false);

  const [editedCaption, setEditedCaption] = useState("");
  const [editedMediaUrl, setEditedMediaUrl] = useState("");
  const [editedMediaType, setEditedMediaType] = useState<PostMediaType>("FOTO");
  const [editedPlatforms, setEditedPlatforms] = useState<
    ("instagram" | "facebook")[]
  >([]);
  const [editedScheduledAt, setEditedScheduledAt] = useState("");

  useEffect(() => {
    if (post) {
      setEditedCaption(post.caption || "");
      setEditedMediaUrl(post.media_url || "");
      setEditedMediaType((post.media_type as PostMediaType) || "FOTO");
      setEditedPlatforms(
        (Array.isArray(post.platforms) ? post.platforms : []) as any
      );
      setEditedScheduledAt(post.scheduled_at || "");
      // Não resetar o modo de edição se o post for atualizado em tempo real
      if (!isSaving) {
        setIsEditing(false);
      }
      setActiveTab("review");
    }
  }, [post, isOpen]); // Roda o efeito quando o post do store muda

  if (!post) return null;

  const handleSave = async () => {
    if (!userRole) return;
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
      setIsEditing(false); // Apenas volta para o modo de visualização
    } catch (error) {
      alert("Falha ao atualizar o post.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
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
    setIsSaving(true);
    try {
      await updatePostStatus(post.id, status);
      alert(
        `Post ${status === "agendado" ? "aprovado" : "reprovado"} com sucesso!`
      );
      onClose(); // Aprovando/reprovando ainda fecha o modal, pois é uma ação final
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

  const formattedDate = dayjs(post.scheduled_at).format(
    "DD [de] MMMM [de] YYYY [às] HH:mm"
  );
  const dayOfWeek = dayjs(post.scheduled_at).format("dddd");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        <div className="relative w-full h-[40vh] flex-shrink-0 bg-black rounded-t-lg">
          <img
            src={
              (isEditing && userRole === "admin"
                ? editedMediaUrl
                : post.media_url) ||
              "https://placehold.co/800x600/1f2937/9ca3af?text=Sem+Imagem"
            }
            alt="Post media"
            className="w-full h-full object-contain"
          />
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

        <div className="p-6 flex-grow overflow-y-auto">
          {activeTab === "review" && (
            <>
              <div className="bg-blue-900/50 text-blue-300 p-2 rounded-md text-center mb-4 text-sm">
                Agendado para: {dayOfWeek}, {formattedDate}
              </div>
              <div className="flex items-center justify-between gap-2 mb-4">
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
                {!isEditing && (
                  <div className="flex items-center gap-3">
                    {isSaving ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <>
                        {userRole === "client" && (
                          <>
                            <button
                              onClick={() => setIsEditing(true)}
                              className="p-2 rounded-full bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity"
                              title="Editar Legenda"
                            >
                              <Pen size={18} />
                            </button>
                            <button
                              onClick={() => handleApproval("agendado")}
                              className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-600"
                              title="Aprovar"
                              disabled={post.status === "agendado"}
                            >
                              <ThumbsUp size={18} />
                            </button>
                            <button
                              onClick={() => handleApproval("negado")}
                              className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-600"
                              title="Reprovar"
                              disabled={post.status === "negado"}
                            >
                              <ThumbsDown size={18} />
                            </button>
                          </>
                        )}
                        {userRole === "admin" && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-500"
                            title="Editar Post"
                          >
                            <Pen size={18} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {!isEditing && (
                <p className="text-white whitespace-pre-wrap">
                  {post.caption || "Sem legenda."}
                </p>
              )}

              {isEditing && (
                <div className="space-y-4">
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
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex items-center gap-1 bg-gray-600 hover:bg-gray-500 text-white py-1 px-3 rounded-md"
                    >
                      <X size={16} /> Cancelar
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white py-1 px-3 rounded-md w-28"
                    >
                      {isSaving ? (
                        <Loader className="animate-spin" />
                      ) : (
                        <>
                          <Save size={16} /> Salvar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {activeTab === "log" && (
            <div className="space-y-4">
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
      </div>
    </Modal>
  );
}
