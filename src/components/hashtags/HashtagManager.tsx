"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Hash, Plus, Trash2, Copy, Check } from "lucide-react";

type HashtagGroup = {
  id: string;
  client_id: string;
  name: string;
  hashtags: string[];
  created_at: string;
};

interface HashtagManagerProps {
  clientId: string;
  onInsertHashtags: (hashtags: string) => void;
}

export default function HashtagManager({ clientId, onInsertHashtags }: HashtagManagerProps) {
  const [groups, setGroups] = useState<HashtagGroup[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newHashtags, setNewHashtags] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
    fetchSuggestions();
  }, [clientId]);

  const fetchGroups = async () => {
    const { data } = await supabase
      .from("hashtag_groups")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (data) setGroups(data);
  };

  const fetchSuggestions = async () => {
    // Get hashtags from recent posts
    const { data: posts } = await supabase
      .from("posts")
      .select("caption")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (posts) {
      const allHashtags = posts
        .map((p) => p.caption?.match(/#\w+/g) || [])
        .flat()
        .filter((tag, index, self) => self.indexOf(tag) === index);

      setSuggestions(allHashtags);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim() || !newHashtags.trim()) return;

    const hashtags = newHashtags
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter((tag) => tag.startsWith("#"))
      .map((tag) => tag.toLowerCase());

    const { error } = await supabase.from("hashtag_groups").insert({
      client_id: clientId,
      name: newGroupName,
      hashtags,
    });

    if (!error) {
      setNewGroupName("");
      setNewHashtags("");
      setIsAdding(false);
      fetchGroups();
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!window.confirm("Excluir este grupo de hashtags?")) return;

    const { error } = await supabase
      .from("hashtag_groups")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchGroups();
    }
  };

  const handleCopyGroup = (hashtags: string[], id: string) => {
    const hashtagString = hashtags.join(" ");
    onInsertHashtags(hashtagString);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySuggestion = (hashtag: string) => {
    onInsertHashtags(hashtag);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Hash className="text-indigo-500" size={20} />
          Hashtags
        </h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm"
        >
          <Plus size={16} />
          Novo Grupo
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-800 p-4 rounded-lg space-y-3">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Nome do grupo (ex: Fitness, Tecnologia)"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          />
          <textarea
            value={newHashtags}
            onChange={(e) => setNewHashtags(e.target.value)}
            placeholder="Digite as hashtags separadas por espaço ou vírgula&#10;Ex: #fitness #treino #saude #bemestar"
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddGroup}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Salvar
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Hashtag Groups */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">Grupos Salvos</h4>
        {groups.map((group) => (
          <div
            key={group.id}
            className="bg-gray-800 p-3 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-2">{group.name}</h4>
                <div className="flex flex-wrap gap-1">
                  {group.hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs bg-indigo-600/30 text-indigo-300 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {group.hashtags.length} hashtags
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyGroup(group.hashtags, group.id)}
                  className={`p-2 rounded transition-colors ${
                    copiedId === group.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  title="Inserir hashtags"
                >
                  {copiedId === group.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="p-2 bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white rounded transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {groups.length === 0 && !isAdding && (
          <p className="text-center text-gray-500 py-4 text-sm">
            Nenhum grupo de hashtags criado
          </p>
        )}
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-400">
            Usadas Recentemente
          </h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 15).map((tag, i) => (
              <button
                key={i}
                onClick={() => handleCopySuggestion(tag)}
                className="text-xs bg-gray-700 hover:bg-indigo-600 text-gray-300 hover:text-white px-2 py-1 rounded transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

