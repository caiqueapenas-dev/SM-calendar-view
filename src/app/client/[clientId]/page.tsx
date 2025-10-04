"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { fetchAllClientData } from "@/lib/api";
import { Post, Client, SimulatedPost } from "@/lib/types";
import dayjs from "dayjs";
import CalendarView from "@/components/calendar/CalendarView";
import PostCard from "@/components/common/PostCard";
import PostModal from "@/components/common/PostModal";
import { LogOut } from "lucide-react";

export default function ClientDashboardPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { clients, logout, simulatedPosts, updateSimulatedPostsStatus } =
    useAppStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");

  const [visiblePublished, setVisiblePublished] = useState(3);
  const [visibleStories, setVisibleStories] = useState(3);

  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const router = useRouter();

  const client = clients.find((c) => c.id === params.clientId);

  useEffect(() => {
    if (client) {
      setLoading(true);
      updateSimulatedPostsStatus();
      fetchAllClientData(client).then((data) => {
        setPosts(data);
        setLoading(false);
      });
    }
  }, [client]);

  const combinedPosts = useMemo(() => {
    const clientSimulatedPosts: Post[] = simulatedPosts
      .filter((p) => p.clientId === params.clientId)
      .map((p) => ({
        id: p.id,
        platform: "instagram",
        caption: p.caption,
        timestamp: p.scheduledAt,
        media_url: p.mediaUrl,
        status: p.status,
        media_type: p.media_type,
        clientId: p.clientId,
      }));

    return [...posts, ...clientSimulatedPosts].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [posts, simulatedPosts, params.clientId]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const stories24h = combinedPosts.filter(
    (p) =>
      p.media_type === "STORY" && dayjs().diff(dayjs(p.timestamp), "hour") <= 24
  );
  const archivedStories = combinedPosts.filter(
    (p) =>
      p.media_type === "STORY" && dayjs().diff(dayjs(p.timestamp), "hour") > 24
  );
  const publishedPosts = combinedPosts.filter(
    (p) => p.status === "published" && p.media_type !== "STORY"
  );
  const scheduledPosts = combinedPosts.filter((p) => p.status === "scheduled");

  if (loading)
    return (
      <div className="text-center mt-20">Carregando posts do cliente...</div>
    );
  if (!client)
    return (
      <div className="text-center mt-20 text-red-500">
        Cliente não encontrado.{" "}
        <button onClick={handleLogout} className="underline">
          Voltar
        </button>
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Bem-vindo, {client.customName || client.name}
          </h1>
          <p className="text-gray-400">Aqui estão suas publicações.</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg self-start md:self-center flex items-center gap-2"
        >
          <LogOut size={18} /> Sair
        </button>
      </header>

      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-gray-900 rounded-lg p-1 space-x-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              viewMode === "calendar"
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-700"
            }`}
          >
            Calendário
          </button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Agendados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {scheduledPosts.length > 0 ? (
                scheduledPosts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    onClick={() => handlePostClick(p)}
                  />
                ))
              ) : (
                <p className="text-gray-400 col-span-full">
                  Nenhum post agendado.
                </p>
              )}
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">
              Stories Ativos (24h)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {stories24h.length > 0 ? (
                stories24h
                  .slice(0, visibleStories)
                  .map((p) => (
                    <PostCard
                      key={p.id}
                      post={p}
                      onClick={() => handlePostClick(p)}
                    />
                  ))
              ) : (
                <p className="text-gray-400 col-span-full">
                  Nenhum story ativo.
                </p>
              )}
            </div>
            {stories24h.length > visibleStories && (
              <button
                onClick={() => setVisibleStories((v) => v + 5)}
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              >
                Ver mais
              </button>
            )}
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Publicados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {publishedPosts.length > 0 ? (
                publishedPosts
                  .slice(0, visiblePublished)
                  .map((p) => (
                    <PostCard
                      key={p.id}
                      post={p}
                      onClick={() => handlePostClick(p)}
                    />
                  ))
              ) : (
                <p className="text-gray-400 col-span-full">
                  Nenhum post publicado.
                </p>
              )}
            </div>
            {publishedPosts.length > visiblePublished && (
              <button
                onClick={() => setVisiblePublished((v) => v + 5)}
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
              >
                Ver mais
              </button>
            )}
          </div>
        </div>
      ) : (
        <CalendarView
          posts={[
            ...archivedStories,
            ...publishedPosts,
            ...scheduledPosts,
            ...stories24h,
          ]}
          onPostClick={handlePostClick}
          onDayClick={() => {}}
        />
      )}

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
      />
    </div>
  );
}
