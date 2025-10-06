"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import dayjs, { Dayjs } from "dayjs";
import CalendarView from "@/components/calendar/CalendarView";
import PostModal from "@/components/common/PostModal";
import ClientDayPostsModal from "../ClientDayPostsModal";
import { Database } from "@/lib/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export default function ClientCalendarPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { posts } = useAppStore();
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isDayModalOpen, setDayModalOpen] = useState(false);

  const clientPosts = posts.filter((p) => p.client_id === params.clientId);

  const handlePostClick = (post: PostRow) => {
    setDayModalOpen(false);
    setSelectedPost(post);
    setPostModalOpen(true);
  };

  const handleDayClick = (date: Dayjs) => {
    const postsOnDay = clientPosts.filter((p) =>
      dayjs(p.scheduled_at).isSame(date, "day")
    );
    if (postsOnDay.length > 0) {
      setSelectedDate(date);
      setDayModalOpen(true);
    }
  };

  return (
    <>
      <CalendarView
        posts={clientPosts}
        onPostClick={handlePostClick}
        onDayClick={handleDayClick}
        isAdminView={false}
      />

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        post={selectedPost}
      />

      <ClientDayPostsModal
        isOpen={isDayModalOpen}
        onClose={() => setDayModalOpen(false)}
        date={selectedDate}
        posts={clientPosts.filter(
          (p) =>
            selectedDate && dayjs(p.scheduled_at).isSame(selectedDate, "day")
        )}
        onPostSelect={handlePostClick}
      />
    </>
  );
}
