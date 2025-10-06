import { PostMediaType } from "@/lib/types";
import { Dayjs } from "dayjs";
import MediaTypeTag from "../common/MediaTypeTag";
import dayjs from "dayjs";
import { Database } from "@/lib/database.types";
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative cursor-grab active:cursor-grabbing"
    >
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
  const { isOver, setNodeRef } = useDroppable({
    id: date.toISOString(), // A data se torna o ID da área de soltar
  });
  const isToday = date.isSame(dayjs(), "day");

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
        {posts.map((post) =>
          isAdminView ? (
            <DraggablePost key={post.id} post={post} clients={clients} />
          ) : (
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
          )
        )}
      </div>
    </div>
  );
}
