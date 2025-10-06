"use client";

import { useState } from "react";
import { Check, Trash2, Calendar, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

interface BulkActionsProps {
  posts: PostRow[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onActionComplete: () => void;
}

export default function BulkActions({
  posts,
  selectedIds,
  onSelectionChange,
  onActionComplete,
}: BulkActionsProps) {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const selectedPosts = posts.filter((p) => selectedIds.includes(p.id));
  const allSelected = posts.length > 0 && selectedIds.length === posts.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(posts.map((p) => p.id));
    }
  };

  const handleBulkApprove = async () => {
    if (!window.confirm(`Aprovar ${selectedIds.length} posts?`)) return;

    const { error } = await supabase
      .from("posts")
      .update({ status: "agendado" })
      .in("id", selectedIds);

    if (!error) {
      onActionComplete();
      onSelectionChange([]);
      alert("Posts aprovados com sucesso!");
    }
  };

  const handleBulkReject = async () => {
    if (!window.confirm(`Reprovar ${selectedIds.length} posts?`)) return;

    const { error } = await supabase
      .from("posts")
      .update({ status: "negado" })
      .in("id", selectedIds);

    if (!error) {
      onActionComplete();
      onSelectionChange([]);
      alert("Posts reprovados!");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`EXCLUIR ${selectedIds.length} posts? Esta ação não pode ser desfeita!`)) {
      return;
    }

    const { error } = await supabase
      .from("posts")
      .delete()
      .in("id", selectedIds);

    if (!error) {
      onActionComplete();
      onSelectionChange([]);
      alert("Posts excluídos!");
    }
  };

  const handleBulkReschedule = async () => {
    if (!newDate || !newTime) {
      alert("Selecione data e hora");
      return;
    }

    const scheduledAt = dayjs(`${newDate} ${newTime}`).toISOString();

    const { error } = await supabase
      .from("posts")
      .update({ scheduled_at: scheduledAt })
      .in("id", selectedIds);

    if (!error) {
      onActionComplete();
      onSelectionChange([]);
      setIsRescheduling(false);
      setNewDate("");
      setNewTime("");
      alert("Posts reagendados!");
    }
  };

  if (selectedIds.length === 0) {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm">Selecionar todos</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm font-medium">
            {selectedIds.length} selecionado{selectedIds.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleBulkApprove}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            title="Aprovar selecionados"
          >
            <ThumbsUp size={16} />
            Aprovar
          </button>

          <button
            onClick={handleBulkReject}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            title="Reprovar selecionados"
          >
            <ThumbsDown size={16} />
            Reprovar
          </button>

          <button
            onClick={() => setIsRescheduling(!isRescheduling)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            title="Reagendar selecionados"
          >
            <Calendar size={16} />
            Reagendar
          </button>

          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 bg-gray-700 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            title="Excluir selecionados"
          >
            <Trash2 size={16} />
          </button>

          <button
            onClick={() => onSelectionChange([])}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors"
            title="Cancelar seleção"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Reschedule Form */}
      {isRescheduling && (
        <div className="mt-4 pt-4 border-t border-gray-700 flex items-end gap-3">
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-1 block">Nova Data</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-400 mb-1 block">Novo Horário</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
            />
          </div>
          <button
            onClick={handleBulkReschedule}
            disabled={!newDate || !newTime}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors"
          >
            <Check size={20} />
          </button>
        </div>
      )}
    </div>
  );
}

