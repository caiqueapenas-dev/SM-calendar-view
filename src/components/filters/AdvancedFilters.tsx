"use client";

import { useState } from "react";
import { Filter, X, Search } from "lucide-react";
import { PostStatus, PostMediaType } from "@/lib/types";

export interface FilterOptions {
  search: string;
  platforms: ("instagram" | "facebook")[];
  mediaTypes: PostMediaType[];
  statuses: PostStatus[];
  dateRange: {
    start: string;
    end: string;
  } | null;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

export default function AdvancedFilters({
  onFilterChange,
  initialFilters = {},
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    search: initialFilters.search || "",
    platforms: initialFilters.platforms || [],
    mediaTypes: initialFilters.mediaTypes || [],
    statuses: initialFilters.statuses || [],
    dateRange: initialFilters.dateRange || null,
  });

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleArrayFilter = <T,>(key: keyof FilterOptions, value: T) => {
    const currentArray = filters[key] as T[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];
    handleFilterChange(key, newArray);
  };

  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      search: "",
      platforms: [],
      mediaTypes: [],
      statuses: [],
      dateRange: null,
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    filters.platforms.length +
    filters.mediaTypes.length +
    filters.statuses.length +
    (filters.dateRange ? 1 : 0);

  return (
    <div className="relative">
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors relative"
      >
        <Filter size={20} />
        Filtros
        {activeFiltersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 bg-gray-800 rounded-lg shadow-xl p-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Filtros Avançados</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Search */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Buscar na legenda
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                placeholder="Digite para buscar..."
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              />
            </div>
          </div>

          {/* Platforms */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Plataformas
            </label>
            <div className="flex gap-2">
              {(["instagram", "facebook"] as const).map((platform) => (
                <button
                  key={platform}
                  onClick={() => toggleArrayFilter("platforms", platform)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    filters.platforms.includes(platform)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {platform === "instagram" ? "Instagram" : "Facebook"}
                </button>
              ))}
            </div>
          </div>

          {/* Media Types */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Tipo de Mídia
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["FOTO", "CARROSSEL", "REELS", "STORY"] as PostMediaType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => toggleArrayFilter("mediaTypes", type)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    filters.mediaTypes.includes(type)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["aguardando_aprovacao", "agendado", "negado"] as PostStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => toggleArrayFilter("statuses", status)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                    filters.statuses.includes(status)
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {status === "aguardando_aprovacao"
                    ? "Aguardando"
                    : status === "agendado"
                    ? "Aprovado"
                    : "Negado"}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Período
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateRange?.start || ""}
                onChange={(e) =>
                  handleFilterChange("dateRange", {
                    start: e.target.value,
                    end: filters.dateRange?.end || "",
                  })
                }
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />
              <input
                type="date"
                value={filters.dateRange?.end || ""}
                onChange={(e) =>
                  handleFilterChange("dateRange", {
                    start: filters.dateRange?.start || "",
                    end: e.target.value,
                  })
                }
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors"
            >
              Limpar
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

