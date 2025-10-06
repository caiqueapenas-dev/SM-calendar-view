"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { Post } from "@/lib/types";
import dayjs from "dayjs";
import PostCard from "@/components/common/PostCard";
import PostModal from "@/components/common/PostModal";

export default function ClientDashboardPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { posts } = useAppStore();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [visiblePublishedCount, setVisiblePublishedCount] = useState(5);

  const clientPosts = useMemo(() => {
    return posts.filter((p) => p.clientId === params.clientId);
  }, [posts, params.clientId]);

  const postsForReview = useMemo(() => {
    return clientPosts
      .filter((p) => p.status === "aguardando_aprovacao")
      .sort(
        (a, b) =>
          new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
  }, [clientPosts]);

  const activeStories = useMemo(() => {
    const now = dayjs();
    return clientPosts.filter(
      (p) =>
        p.mediaType === "STORY" &&
        p.status === "agendado" &&
        now.isAfter(dayjs(p.scheduledAt)) &&
        now.diff(dayjs(p.scheduledAt), "hour") <= 24
    );
  }, [clientPosts]);

  const publishedPosts = useMemo(() => {
    return clientPosts
      .filter(
        (p) =>
          p.status === "agendado" &&
          dayjs().isAfter(dayjs(p.scheduledAt)) &&
          p.mediaType !== "STORY"
      )
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
  }, [clientPosts]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  return (
    <div>
      {/* Seção 1: Para Revisão */}
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

      {/* Seção 2: Stories Ativos */}
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

      {/* Seção 3: Publicações */}
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
    </div>
  );
}
