import dayjs, { Dayjs } from "dayjs";
import { Post, Client } from "@/lib/types";
import Modal from "../common/Modal";
import MediaTypeTag from "../common/MediaTypeTag";

interface DayPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Dayjs | null;
  posts: Post[];
  clients: Client[];
  onPostSelect: (post: Post) => void;
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
    const clientId = post.clientId || "unknown";
    if (!acc[clientId]) {
      acc[clientId] = [];
    }
    acc[clientId].push(post);
    return acc;
  }, {} as Record<string, Post[]>);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Posts de ${date.format("dddd, D [de] MMMM [de] YYYY")}`}
    >
      <div className="p-6 overflow-y-auto">
        {Object.entries(postsByClient).map(([clientId, clientPosts]) => {
          const client = clients.find((c) => c.id === clientId);
          return (
            <div key={clientId} className="mb-6 last:mb-0">
              <div className="flex items-center gap-3 mb-3 border-b border-gray-700 pb-2">
                <img
                  src={
                    client?.profile_picture_url ||
                    `https://ui-avatars.com/api/?name=${client?.name.substring(
                      0,
                      2
                    )}&background=random`
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
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <MediaTypeTag mediaType={post.media_type} />
                        <span className="text-xs text-gray-400">
                          {dayjs(post.timestamp).format("HH:mm")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 truncate mt-1">
                        {post.caption || "Sem legenda"}
                      </p>
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
