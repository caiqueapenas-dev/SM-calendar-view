"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabaseClient";
import { Send, MessageCircle } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import ImageUploader from "../common/ImageUploader";

dayjs.locale("pt-br");

type InsightRow = {
  id: string;
  client_id: string;
  content: string;
  author_id: string;
  author_role: "admin" | "client";
  created_at: string;
  updated_at: string;
};

interface InsightsPanelProps {
  clientId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InsightsPanel({
  clientId,
  isOpen,
  onClose,
}: InsightsPanelProps) {
  const { user, userRole, clients } = useAppStore();
  const [insights, setInsights] = useState<InsightRow[]>([]);
  const [newInsight, setNewInsight] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userPhotos, setUserPhotos] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && clientId) {
      fetchInsights();
    }
  }, [isOpen, clientId]);

  const getUserPhoto = (authorId: string, authorRole: string) => {
    if (userPhotos[authorId]) {
      return userPhotos[authorId];
    }
    
    if (authorRole === "client") {
      const client = clients.find(c => c.client_id === authorId);
      return client?.profile_picture_url || `https://ui-avatars.com/api/?name=${client?.name.substring(0, 2)}&background=random`;
    }
    
    // For admin, use a default admin avatar or stored photo
    return `https://ui-avatars.com/api/?name=A&background=indigo&color=white`;
  };

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error("Error fetching insights:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsight.trim() || !user || !userRole) return;

    try {
      const { data, error } = await supabase
        .from("insights")
        .insert({
          client_id: clientId,
          content: newInsight.trim(),
          author_id: user.id,
          author_role: userRole,
        })
        .select()
        .single();

      if (error) throw error;

      setInsights([data, ...insights]);
      setNewInsight("");
    } catch (error) {
      console.error("Error creating insight:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <MessageCircle size={24} />
            Insights & Ideias
          </h2>
          <div className="flex items-center gap-3">
            {userRole === "admin" && (
              <div className="text-sm text-gray-400">
                <ImageUploader
                  onFilesAdded={(files) => {
                    if (files.length > 0 && user) {
                      // Here you would upload the photo and update the user's profile
                      // For now, we'll just show a placeholder
                      console.log("Upload admin photo:", files[0]);
                    }
                  }}
                  allowMultiple={false}
                  mediaCount={0}
                />
              </div>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhuma ideia compartilhada ainda.</p>
              <p className="text-sm">Seja o primeiro a compartilhar uma ideia!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`p-4 rounded-lg ${
                    insight.author_role === "admin"
                      ? "bg-indigo-900/30 border-l-4 border-indigo-500"
                      : "bg-gray-700 border-l-4 border-gray-500"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={getUserPhoto(insight.author_id, insight.author_role)}
                      alt={insight.author_role === "admin" ? "Admin" : "Cliente"}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-300">
                          {insight.author_role === "admin" ? "Admin" : "Cliente"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {dayjs(insight.created_at).format("DD/MM/YYYY HH:mm")}
                        </span>
                      </div>
                      <p className="text-gray-200 whitespace-pre-wrap">
                        {insight.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitInsight} className="p-6 border-t border-gray-700">
          <div className="flex gap-3">
            <textarea
              value={newInsight}
              onChange={(e) => setNewInsight(e.target.value)}
              placeholder="Compartilhe uma ideia ou insight..."
              className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={!newInsight.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
