import { useState, useEffect } from "react";
import { APP_CONFIG } from "@/config/constants";

export const useSidebarStore = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return saved ? JSON.parse(saved) : false;
  });

  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem(
      APP_CONFIG.STORAGE_KEYS.SIDEBAR_COLLAPSED,
      JSON.stringify(collapsed)
    );
  }, [collapsed]);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);
  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
    mobileOpen,
    setMobileOpen,
    toggleMobile,
    closeMobile,
  };
};
