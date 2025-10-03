import { Post, Client } from "@/lib/types";
import { Dayjs } from "dayjs";
import MediaTypeTag from "../common/MediaTypeTag";

interface CalendarDayProps {
  date: Dayjs;
  posts: Post[];
  isCurrentMonth: boolean;
  onDayClick: () => void;
  onPostClick: (post: Post) => void;
  isAdminView: boolean;
  clients: Client[];
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
    const clientId = post.clientId || "unknown";
    if (!acc[clientId]) {
      acc[clientId] = [];
    }
    acc[clientId].push(post);
    return acc;
  }, {} as Record<string, Post[]>);

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
            const client = clients.find((c) => c.id === clientId);
            if (!client) return null;
            return (
              <div key={clientId} className="relative">
                <img
                  src={
                    client.profile_picture_url ||
                    `https://ui-avatars.com/api/?name=${client.name.substring(
                      0,
                      2
                    )}&background=random`
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
              className="flex items-center text-xs p-1 rounded hover:bg-gray-700 cursor-pointer gap-1.5 truncate"
            >
              <MediaTypeTag
                mediaType={post.media_type}
                className="flex-shrink-0"
              />
              <span className="truncate text-gray-400">
                {post.caption ? post.caption : "Post"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
