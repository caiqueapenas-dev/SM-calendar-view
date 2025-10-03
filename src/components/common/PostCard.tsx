import { Post } from "@/lib/types";
import dayjs from "dayjs";
import { Instagram, Facebook } from "lucide-react";
import MediaTypeTag from "./MediaTypeTag";

interface PostCardProps {
  post: Post;
  onClick: () => void;
  clientProfilePicture?: string;
}

export default function PostCard({
  post,
  onClick,
  clientProfilePicture,
}: PostCardProps) {
  const formattedDate = dayjs(post.timestamp).format("DD/MM/YYYY [às] HH:mm");

  return (
    <div
      onClick={onClick}
      className="post-card bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-shadow"
    >
      <div className="relative w-full h-48">
        <img
          src={
            post.media_type === "VIDEO"
              ? post.thumbnail_url
              : post.media_url ||
                "https://placehold.co/600x400/1f2937/9ca3af?text=Sem+Imagem"
          }
          alt="Post media"
          className="w-full h-full object-cover"
        />
        {clientProfilePicture && (
          <img
            src={clientProfilePicture}
            alt="Client"
            className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-2 border-gray-800"
          />
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <p className="text-gray-400 text-xs mb-2 flex items-center">
          {formattedDate}
        </p>
        <div className="flex-grow">
          <p className="text-gray-300 text-sm mb-4 break-words">
            {post.caption ? (
              `${post.caption.substring(0, 80)}${
                post.caption.length > 80 ? "..." : ""
              }`
            ) : (
              <i>Sem legenda.</i>
            )}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-700/50">
          <MediaTypeTag mediaType={post.media_type} />
          {post.platform === "instagram" ? (
            <Instagram size={16} className="text-gray-400" />
          ) : (
            <Facebook size={16} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
}
