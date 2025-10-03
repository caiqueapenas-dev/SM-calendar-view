"use client";
import React, { useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/pt-br";
import { Post } from "@/lib/types";
import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";

dayjs.locale("pt-br");

interface CalendarViewProps {
  posts: Post[];
  onDayClick: (date: Dayjs) => void;
  onPostClick: (post: Post) => void;
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
