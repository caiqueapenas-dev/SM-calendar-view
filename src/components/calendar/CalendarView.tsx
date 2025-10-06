"use client";
import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import { Database } from "@/lib/database.types";

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
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  return (
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
  );
}
