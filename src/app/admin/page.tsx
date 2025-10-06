"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import CalendarView from "@/components/calendar/CalendarView";
import PostModal from "@/components/common/PostModal";
import DayPostsModal from "./DayPostsModal";
import dayjs, { Dayjs } from "dayjs";
import { PlusCircle } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import { Database } from "@/lib/database.types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export default function AdminDashboardPage() {
  const { clients, posts } = useAppStore();

  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isDayModalOpen, setDayModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [defaultCreateDate, setDefaultCreateDate] = useState<Dayjs | null>(
    null
  );

  const activeClients = clients.filter((c) => c.is_active);
  const activeClientIds = activeClients.map((c) => c.client_id);
  const postsOfActiveClients = posts.filter((p) =>
    activeClientIds.includes(p.client_id)
  );

  const handlePostClick = (post: PostRow) => {
    setDayModalOpen(false);
    setSelectedPost(post);
    setPostModalOpen(true);
  };

  const handleDayClick = (date: Dayjs) => {
    const postsOnDay = postsOfActiveClients.filter((p) =>
      dayjs(p.scheduled_at).isSame(date, "day")
    );

    if (postsOnDay.length === 0) {
      setDefaultCreateDate(date);
      setCreateModalOpen(true);
    } else {
      setSelectedDate(date);
      setDayModalOpen(true);
    }
  };

  const openCreateModal = () => {
    setDefaultCreateDate(null);
    setCreateModalOpen(true);
  };

  const handleCreatePostOnDate = (date: Dayjs) => {
    setDayModalOpen(false);
    setDefaultCreateDate(date);
    setCreateModalOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Geral</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          <PlusCircle size={20} />
          Agendar Post
        </button>
      </div>

      <CalendarView
        posts={postsOfActiveClients}
        onPostClick={handlePostClick}
        onDayClick={handleDayClick}
        isAdminView={true}
      />

      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        post={selectedPost}
      />

      <DayPostsModal
        isOpen={isDayModalOpen}
        onClose={() => setDayModalOpen(false)}
        date={selectedDate}
        posts={posts.filter(
          (p) =>
            selectedDate && dayjs(p.scheduled_at).isSame(selectedDate, "day")
        )}
        clients={clients}
        onPostSelect={handlePostClick}
        onCreatePost={handleCreatePostOnDate}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultDate={defaultCreateDate}
      />
    </>
  );
}
