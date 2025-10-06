"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "auto";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Carrega tema salvo
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme("auto");
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === "auto") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        const isDark = e.matches;
        setResolvedTheme(isDark ? "dark" : "light");
        root.classList.toggle("dark", isDark);
        root.classList.toggle("light", !isDark);
      };
      
      updateTheme(mediaQuery);
      mediaQuery.addEventListener("change", updateTheme);
      
      return () => mediaQuery.removeEventListener("change", updateTheme);
    } else {
      const isDark = theme === "dark";
      setResolvedTheme(isDark ? "dark" : "light");
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    }
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return { theme, resolvedTheme, changeTheme };
}

