"use client";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import { Database } from "@/lib/database.types";
import {
  DndContext,
  DragEndEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useAppStore } from "@/store/appStore";

dayjs.locale("pt-br");

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

interface CalendarViewProps {
  posts: PostRow[];
  onDayClick: (date: Dayjs) => void;
  onPostClick: (post: PostRow) => void;
  isAdminView?: boolean;
}

export default function CalendarView({
  posts,
  onDayClick,
  onPostClick,
  isAdminView = false,
}: CalendarViewProps) {
  const { updatePost } = useAppStore();
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // O mouse precisa se mover 8px para iniciar o arrasto
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (isAdminView && over && active.id !== over.id) {
      const postId = active.id as string;
      const targetDateStr = over.id as string;

      const originalPost = posts.find((p) => p.id === postId);
      if (!originalPost) return;

      // Mantém a hora e o minuto originais, mas muda o dia
      const newDate = dayjs(targetDateStr)
        .hour(dayjs(originalPost.scheduled_at).hour())
        .minute(dayjs(originalPost.scheduled_at).minute());

      updatePost(postId, { scheduled_at: newDate.toISOString() });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-gray-800 rounded-xl shadow-md p-6">
        <CalendarHeader
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <CalendarGrid
          posts={posts}
          currentDate={currentDate}
          onDayClick={onDayClick}
          onPostClick={onPostClick}
          viewMode={viewMode}
          isAdminView={isAdminView}
        />
      </div>
    </DndContext>
  );
}
