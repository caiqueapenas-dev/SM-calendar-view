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
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  const activeClients = clients.filter((c) => c.is_active);
  const filteredClientIds = selectedClientIds.length > 0 ? selectedClientIds : activeClients.map((c) => c.client_id);
  const postsOfActiveClients = posts.filter((p) =>
    filteredClientIds.includes(p.client_id)
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

  const handleClientFilterChange = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClientIds(prev => [...prev, clientId]);
    } else {
      setSelectedClientIds(prev => prev.filter(id => id !== clientId));
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard Geral</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl text-lg transition-colors"
        >
          <PlusCircle size={24} />
          Agendar Post
        </button>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Filtrar por Cliente</h3>
        <div className="flex flex-wrap gap-3">
          {activeClients.map((client) => (
            <label
              key={client.client_id}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedClientIds.includes(client.client_id)}
                onChange={(e) => handleClientFilterChange(client.client_id, e.target.checked)}
                className="rounded"
              />
              <span className="text-white">
                {client.custom_name ? `${client.custom_name} - ${client.name}` : client.name}
              </span>
            </label>
          ))}
        </div>
        {selectedClientIds.length > 0 && (
          <button
            onClick={() => setSelectedClientIds([])}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
          >
            Limpar filtros
          </button>
        )}
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
