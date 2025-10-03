"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { fetchAllClientData, getClientProfilePicture } from "@/lib/api";
import { Post, Client, SimulatedPost } from "@/lib/types";
import CalendarView from "@/components/calendar/CalendarView";
import PostModal from "@/components/common/PostModal";
import DayPostsModal from "@/components/admin/DayPostsModal";
import { Dayjs } from "dayjs";
import { PlusCircle } from "lucide-react";
import CreatePostModal from "@/components/admin/CreatePostModal";

export default function AdminDashboardPage() {
  const { clients, simulatedPosts, updateClient, updateSimulatedPostsStatus } =
    useAppStore();
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isPostModalOpen, setPostModalOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isDayModalOpen, setDayModalOpen] = useState(false);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // Atualiza status de posts simulados
      updateSimulatedPostsStatus();

      const visibleClients = clients.filter((c) => c.isVisible);

      const promises = visibleClients.map((client) =>
        fetchAllClientData(client)
      );
      const profilePicPromises = visibleClients.map((client) => {
        if (!client.profile_picture_url) {
          // busca foto se ainda não tiver
          return getClientProfilePicture(client.id, client.access_token);
        }
        return Promise.resolve(client.profile_picture_url);
      });

      const results = await Promise.all(promises);
      const picResults = await Promise.all(profilePicPromises);

      picResults.forEach((url, index) => {
        const client = visibleClients[index];
        if (url && !client.profile_picture_url) {
          updateClient(client.id, { profile_picture_url: url });
        }
      });

      const flattenedPosts = results.flat();
      setAllPosts(flattenedPosts);
      setLoading(false);
    }
    fetchData();
  }, [clients]);

  const combinedPosts = useMemo(() => {
    const transformedSimulatedPosts: Post[] = simulatedPosts.map((p) => ({
      id: p.id,
      platform: "instagram", // Default platform for simulated
      caption: p.caption,
      timestamp: p.scheduledAt,
      media_url: p.mediaUrl,
      thumbnail_url: p.mediaUrl,
      status: p.status,
      media_type: p.media_type,
      clientId: p.clientId,
    }));
    return [...allPosts, ...transformedSimulatedPosts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [allPosts, simulatedPosts]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setPostModalOpen(true);
  };

  const handleDayClick = (date: Dayjs) => {
    const postsOnDay = combinedPosts.filter((p) =>
      dayjs(p.timestamp).isSame(date, "day")
    );
    if (postsOnDay.length > 0) {
      setSelectedDate(date);
      setDayModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-20">Carregando dashboard do admin...</div>
    );
  }

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
        posts={combinedPosts}
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
        posts={combinedPosts.filter(
          (p) => selectedDate && dayjs(p.timestamp).isSame(selectedDate, "day")
        )}
        clients={clients}
        onPostSelect={(post) => {
          setDayModalOpen(false);
          // Pequeno delay para garantir que o primeiro modal fechou antes de abrir o segundo
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
