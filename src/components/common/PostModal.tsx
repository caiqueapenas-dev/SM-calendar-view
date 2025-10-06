import { useState, useEffect } from "react";
import { Post, PostStatus } from "@/lib/types";
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
} from "lucide-react";
import * as unidiff from "unidiff";

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
        .slice(2) // Remove header lines from unidiff
        .map((line, i) => (
          <div key={i} className={colorizeDiff(line)}>
            {line}
          </div>
        ))}
    </pre>
  );
};

export default function PostModal({ isOpen, onClose, post }: PostModalProps) {
  const { userType, updatePost, updatePostStatus } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("review");
  const [editedCaption, setEditedCaption] = useState("");

  useEffect(() => {
    if (post) {
      setEditedCaption(post.caption || "");
      setIsEditing(false);
      setActiveTab("review");
    }
  }, [post]);

  if (!post) return null;

  const handleSave = () => {
    if (!post || !userType) return;
    updatePost(post.id, { caption: editedCaption });
    setIsEditing(false);
  };

  const handleApproval = (status: PostStatus) => {
    if (post) {
      updatePostStatus(post.id, status);
    }
  };

  const formattedDate = dayjs(post.scheduledAt).format(
    "DD [de] MMMM [de] YYYY [às] HH:mm"
  );
  const dayOfWeek = dayjs(post.scheduledAt).format("dddd");

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col max-h-[90vh]">
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
                  {post.platforms.includes("instagram") && (
                    <Instagram size={18} />
                  )}
                  {post.platforms.includes("facebook") && (
                    <Facebook size={18} />
                  )}
                  <MediaTypeTag mediaType={post.mediaType} />
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
                  </div>
                )}
              </div>

              {isEditing && userType === "client" ? (
                <div>
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
                      className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedCaption(post.caption);
                      }}
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
            <div className="space-y-4">
              {post.editHistory && post.editHistory.length > 0 ? (
                post.editHistory
                  .slice()
                  .reverse()
                  .map((edit, index) => (
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
