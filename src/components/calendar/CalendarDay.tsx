import { PostMediaType } from "@/lib/types";
import { Dayjs } from "dayjs";
import MediaTypeTag from "../common/MediaTypeTag";
import dayjs from "dayjs";
import { Database } from "@/lib/database.types";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useAppStore } from "@/store/appStore";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

// Novo componente para o post arrastável
const DraggablePost = ({
  post,
  clients,
}: {
  post: PostRow;
  clients: ClientRow[];
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: post.id });
  const client = clients.find((c) => c.client_id === post.client_id);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get thumbnail or first media URL
  const getThumbnailUrl = () => {
    if (post.thumbnail_url) {
      return post.thumbnail_url;
    }
    
    if (post.media_type === "CARROSSEL") {
      try {
        const mediaUrls = JSON.parse(post.media_url);
        return Array.isArray(mediaUrls) ? mediaUrls[0] : post.media_url;
      } catch {
        return post.media_url;
      }
    }
    
    return post.media_url;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative cursor-grab active:cursor-grabbing"
    >
      <img
        src={getThumbnailUrl()}
        alt={`Post de ${client?.name}`}
        className="w-8 h-8 rounded object-cover"
      />
    </div>
  );
};

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
  const { specialDates } = useAppStore();
  const { isOver, setNodeRef } = useDroppable({
    id: date.toISOString(), // A data se torna o ID da área de soltar
  });
  const isToday = date.isSame(dayjs(), "day");

  // Get special dates for this day
  const daySpecialDates = specialDates.filter(sd => {
    const specialDate = dayjs(sd.date);
    if (sd.is_recurring) {
      if (sd.recurrence_type === "yearly") {
        return specialDate.month() === date.month() && specialDate.date() === date.date();
      } else if (sd.recurrence_type === "monthly") {
        return specialDate.date() === date.date();
      }
    }
    return specialDate.isSame(date, "day");
  });

  return (
    <div
      ref={setNodeRef} // Define esta div como uma área de soltar
      onClick={onDayClick}
      className={`min-h-[120px] border border-gray-700/50 p-2 flex flex-col rounded-md 
        ${isCurrentMonth ? "bg-gray-800" : "bg-gray-900/50"}
        ${isAdminView ? "cursor-pointer hover:bg-gray-700" : ""}
        ${isOver ? "ring-2 ring-indigo-500" : ""}
      `}
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

      <div className="flex flex-wrap gap-1">
        {isAdminView ? (
          <>
            {posts.slice(0, 2).map((post) => (
              <DraggablePost key={post.id} post={post} clients={clients} />
            ))}
            {posts.length > 2 && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onDayClick();
                }}
                className="px-2 py-1 bg-gray-600 text-xs text-gray-300 rounded hover:bg-gray-500 cursor-pointer"
              >
                ver mais {posts.length - 2}
              </div>
            )}
          </>
        ) : (
          /* Client view - show single dot/badge for posts */
          posts.length > 0 && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onDayClick();
              }}
              className="flex items-center gap-1 cursor-pointer"
            >
              <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-xs text-gray-400">{posts.length}</span>
            </div>
          )
        )}
        
        {/* Special dates badges */}
        {daySpecialDates.length > 0 && (
          <div className="mt-1 space-y-1">
            {daySpecialDates.slice(0, 2).map((specialDate) => {
              const client = clients.find(c => c.client_id === specialDate.client_id);
              return (
                <div
                  key={specialDate.id}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded-full truncate"
                  title={`${specialDate.title} - ${client?.name || 'Cliente'}`}
                >
                  🎉 {specialDate.title}
                </div>
              );
            })}
            {daySpecialDates.length > 2 && (
              <div className="px-2 py-1 bg-green-700 text-white text-xs rounded-full">
                +{daySpecialDates.length - 2} eventos
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
