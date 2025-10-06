import dayjs, { Dayjs } from "dayjs";
import { Client, Post, PostMediaType } from "@/lib/types";
import Modal from "../../components/common/Modal";
import MediaTypeTag from "../../components/common/MediaTypeTag";
import { Database } from "@/lib/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

interface DayPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Dayjs | null;
  posts: PostRow[];
  clients: Client[];
  onPostSelect: (post: PostRow) => void;
}

export default function DayPostsModal({
  isOpen,
  onClose,
  date,
  posts,
  clients,
  onPostSelect,
}: DayPostsModalProps) {
  if (!date) return null;

  const postsByClient = posts.reduce((acc, post) => {
    const clientId = post.client_id || "unknown";
    if (!(acc as any)[clientId]) {
      (acc as any)[clientId] = [];
    }
    (acc as any)[clientId].push(post);
    return acc;
  }, {} as Record<string, PostRow[]>);

  const placeholderUrl = (text: string) =>
    `https://placehold.co/100x100/1f2937/9ca3af?text=${text}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Posts de ${date.format("dddd, D [de] MMMM [de] YYYY")}`}
    >
      <div className="p-6 overflow-y-auto max-h-[70vh]">
        {Object.entries(postsByClient).map(([clientId, clientPosts]) => {
          const client = clients.find((c) => c.id === clientId);
          return (
            <div key={clientId} className="mb-6 last:mb-0">
              <div className="flex items-center gap-3 mb-3 border-b border-gray-700 pb-2">
                <img
                  src={
                    client?.profile_picture_url ||
                    `https://ui-avatars.com/api/?name=${
                      client?.customName || client?.name
                    }&background=random`
                  }
                  alt={client?.name}
                  className="w-8 h-8 rounded-full"
                />
                <h3 className="font-semibold text-lg">
                  {client?.customName || client?.name}
                </h3>
              </div>
              <ul className="space-y-3">
                {clientPosts.map((post) => (
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
          );
        })}
      </div>
    </Modal>
  );
}
