"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import CalendarView from "@/components/calendar/CalendarView";
import PostModal from "@/components/common/PostModal";
import DayPostsModal from "./DayPostsModal";
import dayjs, { Dayjs } from "dayjs";
import { PlusCircle, Filter, ChevronDown, ChevronUp } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import { Database } from "@/lib/database.types";
import BulkActions from "@/components/bulk/BulkActions";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

export default function AdminDashboardPage() {
  const { clients, posts, specialDates } = useAppStore();

  const [selectedPost, setSelectedPost] = useState<PostRow | null>(null);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isDayModalOpen, setDayModalOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [defaultCreateDate, setDefaultCreateDate] = useState<Dayjs | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);

  const activeClients = useMemo(() => 
    clients.filter((c) => c.is_active).sort((a, b) => a.name.localeCompare(b.name)),
    [clients]
  );
  
  const inactiveClients = useMemo(() =>
    clients.filter((c) => !c.is_active).sort((a, b) => a.name.localeCompare(b.name)),
    [clients]
  );

  const filteredClientIds = selectedClientIds.length > 0 
    ? selectedClientIds 
    : activeClients.map((c) => c.client_id);
  
  const postsOfFilteredClients = posts.filter((p) =>
    filteredClientIds.includes(p.client_id)
  );

  // Filtrar special dates também
  const filteredSpecialDates = specialDates.filter((sd) =>
    filteredClientIds.includes(sd.client_id)
  );

  const handlePostClick = (post: PostRow) => {
    setDayModalOpen(false);
    setSelectedPost(post);
    setPostModalOpen(true);
  };

  const handleDayClick = (date: Dayjs) => {
    setSelectedDate(date);
    setDayModalOpen(true);
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

  const stats = useMemo(() => ({
    pending: posts.filter(p => p.status === "aguardando_aprovacao").length,
    approved: posts.filter(p => p.status === "agendado").length,
    rejected: posts.filter(p => p.status === "negado").length,
    total: posts.length,
  }), [posts]);

  return (
    <div className="space-y-6">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Dashboard Geral
          </h1>
          <p className="text-gray-400 mt-1">Gerencie todos os seus clientes e publicações</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PlusCircle size={24} />
          Agendar Post
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-xl p-6">
          <p className="text-yellow-300 text-sm font-medium mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-white">{stats.pending}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6">
          <p className="text-green-300 text-sm font-medium mb-1">Aprovados</p>
          <p className="text-3xl font-bold text-white">{stats.approved}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30 rounded-xl p-6">
          <p className="text-red-300 text-sm font-medium mb-1">Rejeitados</p>
          <p className="text-3xl font-bold text-white">{stats.rejected}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border border-indigo-500/30 rounded-xl p-6">
          <p className="text-indigo-300 text-sm font-medium mb-1">Total</p>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
      </div>

      {/* Collapsible Client Filter */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Filter className="text-indigo-400" size={20} />
            <h3 className="text-lg font-semibold text-white">
              Filtrar por Cliente
            </h3>
            {selectedClientIds.length > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                {selectedClientIds.length} selecionado{selectedClientIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {isFilterOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isFilterOpen && (
          <div className="p-4 border-t border-gray-700 space-y-4">
            {/* Active Clients */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-3">Clientes Ativos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {activeClients.map((client) => (
                  <label
                    key={client.client_id}
                    className="flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClientIds.includes(client.client_id)}
                      onChange={(e) => handleClientFilterChange(client.client_id, e.target.checked)}
                      className="rounded"
                    />
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: client.brand_color || '#6366f1' }}
                    />
                    <span className="text-white text-sm flex-1">
                      {client.custom_name || client.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Inactive Clients */}
            {inactiveClients.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-3">Clientes Inativos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {inactiveClients.map((client) => (
                    <label
                      key={client.client_id}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-800/50 rounded-lg opacity-60 cursor-not-allowed"
                    >
                      <input
                        type="checkbox"
                        checked={false}
                        disabled
                        className="rounded"
                      />
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: client.brand_color || '#6366f1' }}
                      />
                      <span className="text-gray-500 text-sm flex-1">
                        {client.custom_name || client.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {selectedClientIds.length > 0 && (
              <button
                onClick={() => setSelectedClientIds([])}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedPostIds.length > 0 && (
        <BulkActions
          posts={postsOfFilteredClients}
          selectedIds={selectedPostIds}
          onSelectionChange={setSelectedPostIds}
          onActionComplete={() => {
            setSelectedPostIds([]);
          }}
        />
      )}

      {/* Calendar */}
      <CalendarView
        posts={postsOfFilteredClients}
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
            selectedDate && dayjs(p.scheduled_at).isSame(selectedDate, "day") &&
            filteredClientIds.includes(p.client_id)
        )}
        specialDates={filteredSpecialDates.filter(
          (sd) => selectedDate && dayjs(sd.date).isSame(selectedDate, "day")
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
    </div>
  );
}

