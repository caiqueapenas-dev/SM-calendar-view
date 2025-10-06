import { PostMediaType } from "@/lib/types";
import { Dayjs } from "dayjs";
import MediaTypeTag from "../common/MediaTypeTag";
import dayjs from "dayjs";
import { Database } from "@/lib/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

interface CalendarDayProps {
  date: Dayjs;
  posts: PostRow[];
  isCurrentMonth: boolean;
  onDayClick: () => void;
  onPostClick: (post: PostRow) => void;
  isAdminView: boolean;
  clients: ClientRow[];
}

export default function CalendarDay({
  date,
  posts,
  isCurrentMonth,
  onDayClick,
  onPostClick,
  isAdminView,
  clients,
}: CalendarDayProps) {
  const isToday = date.isSame(dayjs(), "day");

  const postsByClient = posts.reduce((acc, post) => {
    const clientId = post.client_id || "unknown";
    if (!(acc as any)[clientId]) {
      (acc as any)[clientId] = [];
    }
    (acc as any)[clientId].push(post);
    return acc;
  }, {} as Record<string, PostRow[]>);

  return (
    <div
      onClick={onDayClick}
      className={`min-h-[120px] border border-gray-700/50 p-2 flex flex-col rounded-md 
        ${isCurrentMonth ? "bg-gray-800" : "bg-gray-900/50"}
        ${
          isAdminView && posts.length > 0
            ? "cursor-pointer hover:bg-gray-700"
            : ""
        }`}
    >
      <span
        className={`font-semibold text-sm w-7 h-7 flex items-center justify-center rounded-full mb-2
          ${
            isToday
              ? "bg-indigo-600 text-white"
              : isCurrentMonth
              ? "text-gray-300"
              : "text-gray-500"
          }`}
      >
        {date.date()}
      </span>

      {isAdminView ? (
        <div className="flex flex-wrap gap-1">
          {Object.entries(postsByClient).map(([clientId, clientPosts]) => {
            const client = clients.find((c) => c.client_id === clientId);
            if (!client) return null;
            return (
              <div key={client.id} className="relative">
                <img
                  src={
                    client.profile_picture_url ||
                    `https://ui-avatars.com/api/?name=${
                      client.custom_name || client.name
                    }&background=random`
                  }
                  alt={client.name}
                  className="w-8 h-8 rounded-full"
                />
                {clientPosts.length > 1 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {clientPosts.length}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1 overflow-y-auto flex-grow">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={(e) => {
                e.stopPropagation();
                onPostClick(post);
              }}
              className="p-1 rounded hover:bg-gray-700 cursor-pointer"
            >
              <MediaTypeTag mediaType={post.media_type as PostMediaType} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
