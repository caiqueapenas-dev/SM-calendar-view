import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { Instagram, Facebook } from "lucide-react";
import MediaTypeTag from "./MediaTypeTag";
import { Database } from "@/lib/database.types";
import { PostMediaType } from "@/lib/types"; // Adicionada esta importação

dayjs.locale("pt-br");

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

interface PostCardProps {
  post: PostRow;
  onClick: () => void;
  isAdminView?: boolean;
}

const statusStyles = {
  aguardando_aprovacao: {
    label: "Aguardando Aprovação",
    classes: "bg-yellow-500 text-yellow-900",
  },
  agendado: {
    label: "Agendado",
    classes: "bg-green-500 text-green-900",
  },
  negado: {
    label: "Reprovado",
    classes: "bg-red-500 text-red-900",
  },
};

export default function PostCard({
  post,
  onClick,
  isAdminView = false,
}: PostCardProps) {
  const formattedDate = dayjs(post.scheduled_at).format(
    "DD/MM/YYYY [às] HH:mm"
  );
  const statusInfo = statusStyles[post.status as keyof typeof statusStyles];

  const getPlatformIcons = () => {
    const platforms = Array.isArray(post.platforms) ? post.platforms : [];
    return platforms.map((platform) => {
      if (platform === "instagram") {
        return (
          <Instagram key="instagram" size={16} className="text-gray-400" />
        );
      }
      return <Facebook key="facebook" size={16} className="text-gray-400" />;
    });
  };

  const placeholderUrl =
    "https://placehold.co/600x400/1f2937/9ca3af?text=Sem+Imagem";

  return (
    <div
      onClick={onClick}
      className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all duration-200 relative ${
        post.status === "negado" ? "opacity-75" : ""
      }`}
    >
      <div className="relative w-full h-48">
        <img
          src={post.media_url || placeholderUrl}
          alt="Post media"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = placeholderUrl;
          }}
        />
        {post.status === "negado" && (
          <div className="absolute inset-0 bg-red-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
              ❌ REPROVADO
            </span>
          </div>
        )}
        {statusInfo && post.status !== "negado" && (
          <div
            className={`absolute top-2 right-2 text-xs font-bold px-2 py-1 rounded-full ${statusInfo.classes}`}
          >
            {statusInfo.label}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-gray-400 text-xs mb-2 flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${
              statusStyles[
                post.status as keyof typeof statusStyles
              ]?.classes.split(" ")[0]
            }`}
          ></span>
          {formattedDate}
        </p>
        <div className="flex-grow">
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {post.caption || <i>Sem legenda.</i>}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700/50">
          <div className="flex items-center gap-2">{getPlatformIcons()}</div>
          <MediaTypeTag mediaType={post.media_type as PostMediaType} />
        </div>
      </div>
    </div>
  );
}
