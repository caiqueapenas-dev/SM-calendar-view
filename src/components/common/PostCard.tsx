import { Post } from "@/lib/types";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import {
  Instagram,
  Facebook,
  FileImage,
  Video,
  Layers,
  RectangleEllipsis,
} from "lucide-react";
import MediaTypeTag from "./MediaTypeTag";

dayjs.locale("pt-br");

interface PostCardProps {
  post: Post;
  onClick: () => void;
  isAdminView?: boolean;
}

export default function PostCard({
  post,
  onClick,
  isAdminView = false,
}: PostCardProps) {
  const formattedDate = dayjs(post.timestamp).format("DD/MM/YYYY [às] HH:mm");
  const isScheduled = post.status === "scheduled";

  const getPlatformIcon = () => {
    if (post.platform === "instagram") {
      return <Instagram size={16} className="text-gray-400" />;
    }
    return <Facebook size={16} className="text-gray-400" />;
  };

  const placeholderUrl =
    "https://placehold.co/600x400/1f2937/9ca3af?text=Sem+Imagem";

  return (
    <div
      onClick={onClick}
      className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all duration-200"
    >
      <div className="relative w-full h-48">
        <img
          src={post.media_url || post.thumbnail_url || placeholderUrl}
          alt="Post media"
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = placeholderUrl;
          }}
        />
        {post.isApproved && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Aprovado
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-gray-400 text-xs mb-2 flex items-center">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${
              isScheduled ? "bg-yellow-400" : "bg-green-400"
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
          <div className="flex items-center gap-2">
            {getPlatformIcon()}
            <MediaTypeTag mediaType={post.media_type} />
          </div>
        </div>
      </div>
    </div>
  );
}
