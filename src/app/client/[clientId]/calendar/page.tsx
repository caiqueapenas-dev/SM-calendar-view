"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { Dayjs } from "dayjs";
import CalendarView from "@/components/calendar/CalendarView";
import PostModal from "@/components/common/PostModal";
import { Database } from "@/lib/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export default function ClientCalendarPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { posts } = useAppStore();
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const clientPosts = posts.filter((p) => p.client_id === params.clientId);

  const handlePostClick = (post: PostRow) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const handleDayClick = (date: Dayjs) => {
    // Ação ao clicar no dia pode ser implementada aqui se necessário
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
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
      />
    </>
  );
}
