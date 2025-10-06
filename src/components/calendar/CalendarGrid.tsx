import dayjs, { Dayjs } from "dayjs";
import CalendarDay from "./CalendarDay";
import { useAppStore } from "@/store/appStore";
import { Database } from "@/lib/database.types";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

interface CalendarGridProps {
  currentDate: Dayjs;
  posts: PostRow[];
  onDayClick: (date: Dayjs) => void;
  onPostClick: (post: PostRow) => void;
  viewMode: "month" | "week";
  isAdminView: boolean;
}

export default function CalendarGrid({
  currentDate,
  posts,
  onDayClick,
  onPostClick,
  viewMode,
  isAdminView,
}: CalendarGridProps) {
  const clients = useAppStore((state) => state.clients);

  const generateDates = () => {
    const start = currentDate.startOf(viewMode).startOf("week");
    const end = currentDate.endOf(viewMode).endOf("week");
    let current = start;
    const dates = [];
    while (current.isBefore(end) || current.isSame(end, "day")) {
      dates.push(current);
      current = current.add(1, "day");
    }
    return dates;
  };

  const calendarDates = generateDates();
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const postIds = posts.map((p) => p.id);

  return (
    <SortableContext items={postIds} strategy={verticalListSortingStrategy}>
      <div className="grid grid-cols-7 gap-px text-xs font-semibold text-center text-gray-400 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-px">
        {calendarDates.map((date) => {
          const postsForDay = posts.filter((p) =>
            dayjs(p.scheduled_at).isSame(date, "day")
          );
          return (
            <CalendarDay
              key={date.toString()}
              date={date}
              posts={postsForDay}
              isCurrentMonth={date.isSame(currentDate, "month")}
              onDayClick={() => onDayClick(date)}
              onPostClick={onPostClick}
              isAdminView={isAdminView}
              clients={clients}
            />
          );
        })}
      </div>
    </SortableContext>
  );
}
