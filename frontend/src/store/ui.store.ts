import { useState, useEffect } from "react";
import { APP_CONFIG } from "@/config/constants";

export const useUIStore = () => {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.THEME);
    return (saved as "light" | "dark") || "light";
  });

  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return {
    theme,
    setTheme,
    toggleTheme,
    searchModalOpen,
    setSearchModalOpen,
  };
};
