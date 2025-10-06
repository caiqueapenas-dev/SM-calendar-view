"use client";

import { useState } from "react";
import { useAppStore } from "@/store/appStore";
import { Post } from "@/lib/types";
import CalendarView from "@/components/calendar/CalendarView";
import PostModal from "@/components/common/PostModal";
import DayPostsModal from "./DayPostsModal";
import dayjs, { Dayjs } from "dayjs";
import { CirclePlus as PlusCircle } from "lucide-react";
import CreatePostModal from "./CreatePostModal";

export default function AdminDashboardPage() {
  const { clients, posts } = useAppStore();

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isDayModalOpen, setDayModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setPostModalOpen(true);
  };

  const handleDayClick = (date: Dayjs) => {
    const postsOnDay = posts.filter((p) =>
      dayjs(p.scheduledAt).isSame(date, "day")
    );
    if (postsOnDay.length > 0) {
      setSelectedDate(date);
      setDayModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard Geral</h1>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          <PlusCircle size={20} />
          Agendar Post
        </button>
      </div>

      <CalendarView
        posts={posts}
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
            selectedDate && dayjs(p.scheduledAt).isSame(selectedDate, "day")
        )}
        clients={clients}
        onPostSelect={(post) => {
          setDayModalOpen(false);
          setTimeout(() => handlePostClick(post), 300);
        }}
      />

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </>
  );
}
