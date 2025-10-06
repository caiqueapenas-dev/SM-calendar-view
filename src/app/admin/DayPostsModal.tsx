import dayjs, { Dayjs } from "dayjs";
import Modal from "../../components/common/Modal";
import MediaTypeTag from "../../components/common/MediaTypeTag";
import { Database } from "@/lib/database.types";
import { PostMediaType } from "@/lib/types";
import { CirclePlus } from "lucide-react";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

type SpecialDateRow = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  date: string;
  is_recurring: boolean;
  recurrence_type: "monthly" | "yearly" | null;
};

interface DayPostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Dayjs | null;
  posts: PostRow[];
  specialDates?: SpecialDateRow[];
  clients: ClientRow[];
  onPostSelect: (post: PostRow) => void;
  onCreatePost: (date: Dayjs) => void;
}

export default function DayPostsModal({
  isOpen,
  onClose,
  date,
  posts,
  specialDates = [],
  clients,
  onPostSelect,
  onCreatePost,
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
        <div className="flex justify-end mb-4">
          <button
            onClick={() => onCreatePost(date)}
            className="flex items-center gap-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1 px-3 rounded-lg"
          >
            <CirclePlus size={16} />
            Criar post nesta data
          </button>
        </div>

        {/* Special Dates Section */}
        {specialDates.length > 0 && (
          <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2">
              🎉 Datas Especiais
            </h3>
            <div className="space-y-2">
              {specialDates.map((sd) => {
                const client = clients.find(c => c.client_id === sd.client_id);
                return (
                  <div key={sd.id} className="bg-gray-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: client?.brand_color || '#6366f1' }}
                      />
                      <div className="flex-1">
                        <p className="text-white font-medium">{sd.title}</p>
                        <p className="text-sm text-gray-400">
                          {client?.name} {sd.is_recurring && `(${sd.recurrence_type === 'yearly' ? 'Todo ano' : 'Todo mês'})`}
                        </p>
                        {sd.description && (
                          <p className="text-xs text-gray-500 mt-1">{sd.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Posts Section */}
        {Object.entries(postsByClient).map(([clientId, clientPosts]) => {
          const client = clients.find((c) => c.client_id === clientId);
          return (
            <div key={clientId} className="mb-6 last:mb-0">
              <div className="flex items-center gap-3 mb-3 border-b border-gray-700 pb-2">
                <img
                  src={
                    client?.profile_picture_url ||
                    `https://ui-avatars.com/api/?name=${client?.name}&background=random`
                  }
                  alt={client?.name}
                  className="w-8 h-8 rounded-full"
                />
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: client?.brand_color || '#6366f1' }}
                />
                <h3 className="font-semibold text-lg">
                  {client?.name}
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
