import { useState, useEffect } from "react";
import { SimulatedPost } from "@/lib/types";
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
} from "lucide-react";
import * as unidiff from "unidiff"; // ✅ Import correto

dayjs.locale("pt-br");

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: SimulatedPost | null;
}

interface DiffViewerProps {
  oldText: string;
  newText: string;
}

const DiffViewer = ({ oldText, newText }: DiffViewerProps) => {
  const diff = unidiff.diffLines(oldText, newText);
  const formatted = unidiff.formatLines(diff, { context: 3 });

  // Opcional: colorir linhas estilo GitHub
  const colorizeDiff = (line: string) => {
    if (line.startsWith("+")) return "text-green-400";
    if (line.startsWith("-")) return "text-red-400";
    return "text-gray-300";
  };

  return (
    <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-900 p-2 rounded overflow-x-auto">
      {formatted.split("\n").map((line, i) => (
        <div key={i} className={colorizeDiff(line)}>
          {line}
        </div>
      ))}
    </pre>
  );
};

export default function PostModal({ isOpen, onClose, post }: PostModalProps) {
  const {
    userType,
    updateSimulatedPostCaption,
    updatePostApprovalStatus,
    updateSimulatedPost,
  } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("review");

  // Admin editable fields
  const [editedCaption, setEditedCaption] = useState(post?.caption || "");
  const [editedMediaUrl, setEditedMediaUrl] = useState(post?.mediaUrl || "");
  const [editedMediaType, setEditedMediaType] = useState<SimulatedPost["media_type"]>(
    (post?.media_type as SimulatedPost["media_type"]) || "FOTO"
  );
  const [editedPlatforms, setEditedPlatforms] = useState<
    ("instagram" | "facebook")[]
  >(post?.platforms || []);
  const [editedScheduledAt, setEditedScheduledAt] = useState(
    post ? post.scheduledAt : ""
  );

  useEffect(() => {
    if (post) {
      setEditedCaption(post.caption || "");
      setEditedMediaUrl(post.mediaUrl || "");
      setEditedMediaType((post.media_type as SimulatedPost["media_type"]) || "FOTO");
      setEditedPlatforms(post.platforms || []);
      setEditedScheduledAt(post.scheduledAt || "");
      setIsEditing(false);
      setActiveTab("review");
    }
  }, [post]);

  if (!post) return null;

  const handleSave = () => {
    if (!post) return;
    if (userType === "client") {
      updateSimulatedPostCaption(post.id, editedCaption);
    } else if (userType === "admin") {
      updateSimulatedPost(post.id, {
        caption: editedCaption,
        mediaUrl: editedMediaUrl,
        media_type: editedMediaType,
        platforms: editedPlatforms,
        scheduledAt: editedScheduledAt,
      });
    }
    setIsEditing(false);
  };

  const handleApproval = (status: "approved" | "rejected") => {
    if (post) {
      updatePostApprovalStatus(post.id, status);
    }
  };

  const formattedDate = dayjs(post.scheduledAt).format(
    "DD [de] MMMM [de] YYYY [às] HH:mm"
  );
  const dayOfWeek = dayjs(post.scheduledAt).format("dddd");
  const lineNumbers = editedCaption.split("\n").length;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
        {/* Imagem do post */}
        <div className="relative flex-shrink-0 flex items-center justify-center bg-black rounded-t-lg overflow-hidden h-[40vh]">
          <img
            src={
              post.mediaUrl ||
              "https://placehold.co/800x600/1f2937/9ca3af?text=Sem+Imagem"
            }
            alt="Post media"
            className="w-auto h-auto max-w-full max-h-full object-contain"
          />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("review")}
              className={`py-3 px-4 font-medium text-sm border-b-2 ${
                activeTab === "review"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Revisão
            </button>
            <button
              onClick={() => setActiveTab("log")}
              className={`py-3 px-4 font-medium text-sm border-b-2 ${
                activeTab === "log"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-200"
              }`}
            >
              Log de Alterações
            </button>
          </nav>
        </div>

        {/* Conteúdo */}
        <div className="p-6 flex-grow overflow-y-auto">
          {activeTab === "review" && (
            <>
              <div className="bg-blue-900/50 text-blue-300 p-2 rounded-md text-center mb-4">
                Agendado para: {dayOfWeek}, {formattedDate}
              </div>

              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {post.platforms.includes("instagram") && (
                    <Instagram size={18} />
                  )}
                  {post.platforms.includes("facebook") && (
                    <Facebook size={18} />
                  )}
                  <MediaTypeTag mediaType={post.media_type} />
                </div>

                {userType === "client" && !isEditing && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-full bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 text-white hover:opacity-90 transition-opacity ring-2 ring-white/20"
                      title="Editar Legenda"
                    >
                      <Pen size={18} />
                    </button>
                    <button
                      onClick={() => handleApproval("approved")}
                      className="p-2 rounded-full bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-600"
                      title="Aprovar"
                      disabled={post.approvalStatus === "approved"}
                    >
                      <ThumbsUp size={18} />
                    </button>
                    <button
                      onClick={() => handleApproval("rejected")}
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:bg-gray-600"
                      title="Reprovar"
                      disabled={post.approvalStatus === "rejected"}
                    >
                      <ThumbsDown size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Editor / Formulário */}
              {isEditing ? (
                <div className="space-y-4">
                  {userType === "admin" && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-300">URL da Mídia</label>
                        <input
                          type="text"
                          value={editedMediaUrl}
                          onChange={(e) => setEditedMediaUrl(e.target.value)}
                          className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Tipo de Mídia</label>
                        <select
                          value={editedMediaType}
                          onChange={(e) => setEditedMediaType(e.target.value as SimulatedPost["media_type"])}
                          className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white"
                        >
                          <option value="FOTO">Foto</option>
                          <option value="REELS">Reels</option>
                          <option value="CARROSSEL">Carrossel</option>
                          <option value="STORY">Story</option>
                          <option value="VIDEO">Vídeo</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Plataformas</label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editedPlatforms.includes("instagram")}
                              onChange={() =>
                                setEditedPlatforms((prev) =>
                                  prev.includes("instagram")
                                    ? prev.filter((p) => p !== "instagram")
                                    : [...prev, "instagram"]
                                )
                              }
                              className="rounded"
                            />
                            Instagram
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editedPlatforms.includes("facebook")}
                              onChange={() =>
                                setEditedPlatforms((prev) =>
                                  prev.includes("facebook")
                                    ? prev.filter((p) => p !== "facebook")
                                    : [...prev, "facebook"]
                                )
                              }
                              className="rounded"
                            />
                            Facebook
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-300">Data e Hora</label>
                        <input
                          type="datetime-local"
                          value={dayjs(editedScheduledAt).format("YYYY-MM-DDTHH:mm")}
                          onChange={(e) => setEditedScheduledAt(new Date(e.target.value).toISOString())}
                          className="mt-1 block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-white"
                        />
                      </div>
                    </>
                  )}

                  {/* Caption com números de linha */}
                  <div>
                    <label className="text-sm font-medium text-gray-300">Legenda</label>
                    <div className="flex font-mono text-sm mt-1">
                      <div className="text-right pr-2 text-gray-500 select-none">
                        {Array.from({ length: editedCaption.split("\n").length || 1 }, (_, i) => (
                          <div key={i}>{i + 1}</div>
                        ))}
                      </div>
                      <textarea
                        value={editedCaption}
                        onChange={(e) => setEditedCaption(e.target.value)}
                        rows={6}
                        className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
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
            </>
          )}

          {activeTab === "log" && (
            <div>
              <h3 className="font-semibold text-lg mb-2 border-b border-gray-700 pb-1">
                Histórico de Alterações
              </h3>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {post.editHistory && post.editHistory.length > 0 ? (
                  post.editHistory
                    .slice()
                    .reverse()
                    .map((edit, index) => (
                      <div key={index} className="text-sm">
                        <p className="text-gray-500 mb-1">
                          Alterado em:{" "}
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
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
