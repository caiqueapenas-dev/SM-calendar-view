"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import PostCard from "@/components/common/PostCard";
import PostModal from "@/components/common/PostModal";
import InsightsPanel from "@/components/insights/InsightsPanel";
import dayjs from "dayjs";
import { Database } from "@/lib/database.types";
import { MessageCircle } from "lucide-react";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export default function ClientDashboardPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { posts } = useAppStore();
  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [visiblePublishedCount, setVisiblePublishedCount] = useState(5);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);

  const clientPosts = useMemo(() => {
    return posts.filter((p) => p.client_id === params.clientId);
  }, [posts, params.clientId]);

  const postsForReview = useMemo(() => {
    return clientPosts
      .filter((p) => p.status === "aguardando_aprovacao")
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime()
      );
  }, [clientPosts]);

  const upcomingPosts = useMemo(() => {
    return clientPosts
      .filter(
        (p) =>
          p.status === "agendado" && dayjs().isBefore(dayjs(p.scheduled_at))
      )
      .sort(
        (a, b) =>
          new Date(a.scheduled_at).getTime() -
          new Date(b.scheduled_at).getTime()
      );
  }, [clientPosts]);

  const activeStories = useMemo(() => {
    const now = dayjs();
    return clientPosts.filter(
      (p) =>
        p.media_type === "STORY" &&
        p.status === "agendado" &&
        now.isAfter(dayjs(p.scheduled_at)) &&
        now.diff(dayjs(p.scheduled_at), "hour") <= 24
    );
  }, [clientPosts]);

  const publishedPosts = useMemo(() => {
    return clientPosts
      .filter(
        (p) =>
          p.status === "agendado" &&
          dayjs().isAfter(dayjs(p.scheduled_at)) &&
          p.media_type !== "STORY"
      )
      .sort(
        (a, b) =>
          new Date(b.scheduled_at).getTime() -
          new Date(a.scheduled_at).getTime()
      );
  }, [clientPosts]);

  const handlePostClick = (post: PostRow) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard do Cliente</h1>
        <button
          onClick={() => setIsInsightsOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          <MessageCircle size={20} />
          Insights & Ideias
        </button>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Para Revisão</h2>
        {postsForReview.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {postsForReview.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onClick={() => handlePostClick(p)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Nenhum post para revisar no momento.</p>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Próximos Posts (Aprovados)
        </h2>
        {upcomingPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {upcomingPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onClick={() => handlePostClick(p)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">
            Nenhum post aprovado agendado para o futuro.
          </p>
        )}
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          Stories Ativos (Últimas 24h)
        </h2>
        {activeStories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeStories.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onClick={() => handlePostClick(p)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Sem story ativo.</p>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Últimas Publicações</h2>
        {publishedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {publishedPosts.slice(0, visiblePublishedCount).map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onClick={() => handlePostClick(p)}
                />
              ))}
            </div>
            {visiblePublishedCount < publishedPosts.length && (
              <div className="text-center mt-8">
                <button
                  onClick={() => setVisiblePublishedCount((prev) => prev + 5)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  Carregar Mais
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-gray-400">Nenhum post publicado ainda.</p>
        )}
      </section>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
      />

      <InsightsPanel
        clientId={params.clientId}
        isOpen={isInsightsOpen}
        onClose={() => setIsInsightsOpen(false)}
      />
    </div>
  );
}
