"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, Plus, X, Edit, Trash2 } from "lucide-react";
import dayjs from "dayjs";

type SpecialDate = {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  date: string;
  is_recurring: boolean;
  recurrence_type?: "monthly" | "yearly";
  created_at: string;
  updated_at: string;
};

interface SpecialDatesModalProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpecialDatesModal({
  clientId,
  isOpen,
  onClose,
}: SpecialDatesModalProps) {
  const { clients } = useAppStore();
  const [specialDates, setSpecialDates] = useState<SpecialDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingDate, setEditingDate] = useState<SpecialDate | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    is_recurring: false,
    recurrence_type: "yearly" as "monthly" | "yearly",
  });

  useEffect(() => {
    if (isOpen && clientId) {
      fetchSpecialDates();
    }
  }, [isOpen, clientId]);

  const fetchSpecialDates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("special_dates")
        .select("*")
        .eq("client_id", clientId)
        .order("date", { ascending: true });

      if (error) throw error;
      setSpecialDates(data || []);
    } catch (error) {
      console.error("Error fetching special dates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) return;

    try {
      if (editingDate) {
        // Update existing date
        const { error } = await supabase
          .from("special_dates")
          .update({
            title: formData.title,
            description: formData.description,
            date: formData.date,
            is_recurring: formData.is_recurring,
            recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
          })
          .eq("id", editingDate.id);

        if (error) throw error;
      } else {
        // Create new date
        const { error } = await supabase
          .from("special_dates")
          .insert({
            client_id: clientId,
            title: formData.title,
            description: formData.description,
            date: formData.date,
            is_recurring: formData.is_recurring,
            recurrence_type: formData.is_recurring ? formData.recurrence_type : null,
          });

        if (error) throw error;
      }

      await fetchSpecialDates();
      resetForm();
    } catch (error) {
      console.error("Error saving special date:", error);
    }
  };

  const handleDelete = async (dateId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta data especial?")) return;

    try {
      const { error } = await supabase
        .from("special_dates")
        .delete()
        .eq("id", dateId);

      if (error) throw error;
      await fetchSpecialDates();
    } catch (error) {
      console.error("Error deleting special date:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      is_recurring: false,
      recurrence_type: "yearly",
    });
    setIsAdding(false);
    setEditingDate(null);
  };

  const startEditing = (date: SpecialDate) => {
    setFormData({
      title: date.title,
      description: date.description || "",
      date: date.date,
      is_recurring: date.is_recurring,
      recurrence_type: date.recurrence_type || "yearly",
    });
    setEditingDate(date);
    setIsAdding(true);
  };

  if (!isOpen) return null;

  const client = clients.find(c => c.client_id === clientId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Calendar size={24} />
            Datas Especiais - {client?.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {specialDates.map((date) => (
                <div
                  key={date.id}
                  className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">{date.title}</h3>
                    {date.description && (
                      <p className="text-gray-300 text-sm mt-1">{date.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <span>{dayjs(date.date).format("DD/MM/YYYY")}</span>
                      {date.is_recurring && (
                        <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs">
                          {date.recurrence_type === "yearly" ? "Anual" : "Mensal"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEditing(date)}
                      className="p-2 text-gray-400 hover:text-blue-400"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(date.id)}
                      className="p-2 text-gray-400 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {specialDates.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Nenhuma data especial cadastrada.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700">
          {isAdding ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-gray-300">Data recorrente</span>
                </label>
                
                {formData.is_recurring && (
                  <select
                    value={formData.recurrence_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurrence_type: e.target.value as "monthly" | "yearly" }))}
                    className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="yearly">Anual</option>
                    <option value="monthly">Mensal</option>
                  </select>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingDate ? "Atualizar" : "Adicionar"}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              <Plus size={20} />
              Adicionar Data Especial
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
