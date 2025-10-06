import dayjs, { Dayjs } from "dayjs";
import Modal from "@/components/common/Modal";
import MediaTypeTag from "@/components/common/MediaTypeTag";
import { Database } from "@/lib/database.types";
import { PostMediaType } from "@/lib/types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

interface ClientDayPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Dayjs | null;
  posts: PostRow[];
  onPostSelect: (post: PostRow) => void;
}

export default function ClientDayPostsModal({
  isOpen,
  onClose,
  date,
  posts,
  onPostSelect,
}: ClientDayPostsModalProps) {
  if (!date) return null;

  const placeholderUrl = (text: string) =>
    `https://placehold.co/100x100/1f2937/9ca3af?text=${text}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Posts de ${date.format("dddd, D [de] MMMM [de] YYYY")}`}
    >
      <div className="p-6 overflow-y-auto max-h-[70vh]">
        <ul className="space-y-3">
          {posts.map((post) => (
            <li
              key={post.id}
              onClick={() => onPostSelect(post)}
              className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-700 cursor-pointer"
            >
              <img
                src={post.thumbnail_url || post.media_url}
                alt="thumbnail"
                className="w-12 h-12 object-cover rounded-md flex-shrink-0 bg-gray-900"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = placeholderUrl("Thumb");
                }}
              />
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-400">
                    {dayjs(post.scheduled_at).format("HH:mm")}
                  </span>
                </div>
                <MediaTypeTag
                  mediaType={post.media_type as PostMediaType}
                  className="mt-1"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}
