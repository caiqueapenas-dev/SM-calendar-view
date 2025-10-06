"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { SimulatedPost } from "@/lib/types";
import dayjs from "dayjs";
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

  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<SimulatedPost | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const client = clients.find((c) => c.id === params.clientId);

  useEffect(() => {
    updateSimulatedPostsStatus();
    setLoading(false);
  }, [updateSimulatedPostsStatus]);

  const clientPosts = useMemo(() => {
    return simulatedPosts
      .filter((p) => p.clientId === params.clientId)
      .sort(
        (a, b) =>
          new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime()
      );
  }, [simulatedPosts, params.clientId]);

  const handlePostClick = (post: SimulatedPost) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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

      <div>
        <h2 className="text-2xl font-semibold mb-4">Posts Agendados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {clientPosts.length > 0 ? (
            clientPosts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onClick={() => handlePostClick(p)}
              />
            ))
          ) : (
            <p className="text-gray-400 col-span-full">Nenhum post agendado.</p>
          )}
        </div>
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        post={selectedPost}
      />
    </div>
  );
}
