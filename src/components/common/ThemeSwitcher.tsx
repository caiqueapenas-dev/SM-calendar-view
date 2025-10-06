"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function ThemeSwitcher() {
  const { theme, changeTheme } = useTheme();

  const themes = [
    { value: "light" as const, icon: Sun, label: "Claro" },
    { value: "dark" as const, icon: Moon, label: "Escuro" },
    { value: "auto" as const, icon: Monitor, label: "Auto" },
  ];

  return (
    <div className="flex items-center gap-1 bg-gray-800 dark:bg-gray-900 rounded-lg p-1">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => changeTheme(value)}
          className={`p-2 rounded-md transition-colors ${
            theme === value
              ? "bg-indigo-600 text-white"
              : "text-gray-400 hover:text-gray-200"
          }`}
          title={label}
        >
          <Icon size={18} />
        </button>
      ))}
    </div>
  );
}

