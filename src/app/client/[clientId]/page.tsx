"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { Post } from "@/lib/types";
import { Dayjs } from "dayjs";
import PostModal from "@/components/common/PostModal";
import CalendarView from "@/components/calendar/CalendarView";
import { LogOut } from "lucide-react";

export default function ClientDashboardPage({
  params,
}: {
  params: { clientId: string };
}) {
  const { clients, logout, posts } = useAppStore();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  const client = clients.find((c) => c.id === params.clientId);
  const clientPosts = posts.filter((p) => p.clientId === params.clientId);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setModalOpen(true);
  };

  const handleDayClick = (date: Dayjs) => {
    // Could open a summary modal, but for now, we only open posts
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
          <p className="text-gray-400">
            Aqui estão suas publicações agendadas.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg self-start md:self-center flex items-center gap-2"
        >
          <LogOut size={18} /> Sair
        </button>
      </header>

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
    </div>
  );
}
