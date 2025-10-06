"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { useAppStore } from "@/store/appStore";

type Template = {
  id: string;
  client_id: string;
  name: string;
  content: string;
  created_at: string;
};

interface CaptionTemplatesProps {
  clientId: string;
  onSelectTemplate: (content: string) => void;
}

export default function CaptionTemplates({ clientId, onSelectTemplate }: CaptionTemplatesProps) {
  const { userRole } = useAppStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [clientId]);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("caption_templates")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (data) setTemplates(data);
  };

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) return;

    const { error } = await supabase.from("caption_templates").insert({
      client_id: clientId,
      name: newTemplateName,
      content: newTemplateContent,
    });

    if (!error) {
      setNewTemplateName("");
      setNewTemplateContent("");
      setIsAdding(false);
      fetchTemplates();
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm("Excluir este template?")) return;

    const { error } = await supabase
      .from("caption_templates")
      .delete()
      .eq("id", id);

    if (!error) {
      fetchTemplates();
    }
  };

  const handleCopyTemplate = (content: string, id: string) => {
    onSelectTemplate(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Templates de Legenda</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm"
        >
          <Plus size={16} />
          Novo Template
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-800 p-4 rounded-lg space-y-3">
          <input
            type="text"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="Nome do template"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
          />
          <textarea
            value={newTemplateContent}
            onChange={(e) => setNewTemplateContent(e.target.value)}
            placeholder="Conteúdo da legenda&#10;&#10;Use variáveis:&#10;{cliente} - Nome do cliente&#10;{data} - Data atual&#10;{hora} - Hora atual"
            rows={4}
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddTemplate}
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

      <div className="space-y-2">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-gray-800 p-3 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{template.name}</h4>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {template.content}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyTemplate(template.content, template.id)}
                  className={`p-2 rounded transition-colors ${
                    copiedId === template.id
                      ? "bg-green-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                  title="Usar template"
                >
                  {copiedId === template.id ? <Check size={16} /> : <Copy size={16} />}
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="p-2 bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white rounded transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {templates.length === 0 && !isAdding && (
          <p className="text-center text-gray-500 py-8">
            Nenhum template criado ainda
          </p>
        )}
      </div>
    </div>
  );
}

