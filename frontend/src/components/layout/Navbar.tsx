import  { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/use-theme";
import {
  MdNotifications,
  MdMenu,
  MdSearch,
  MdClose,
  MdLightMode,
  MdDarkMode,
  MdPerson,
  MdSettings,
  MdLogout,
} from "react-icons/md";
import { useAuth } from "@/auth/useAuth";
import { useNotifications } from "@/hooks/useNotification";
import type { OrganizationMember } from "@/type/User";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const { auth, logout } = useAuth();
  const user = auth?.user as OrganizationMember | undefined;
  const currentUserId = user?.userId || user?._id || (user as any)?.id || "";
  const location = useLocation();
  const navigate = useNavigate();

  const {
    visibleNotifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    getNotificationLink,
  } = useNotifications({ authSlug: auth?.slug || null, currentUserId });

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isDark = theme === "dark";

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleTheme = () => {
    setTheme(isDark ? "corporate" : "dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/login");
  };

  const isSales = location.pathname.startsWith("/sales");

  return (
    <>
      <header className="bg-primary/95 backdrop-blur-md border-b border-base-300 px-3 py-1.5 sticky top-0 z-40 flex items-center justify-between text-primary-content">
        {/* ── Left: Mobile Menu Trigger ── */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onMenuClick}
            className="btn btn-ghost btn-circle btn-xs lg:hidden text-primary-content hover:bg-black/10 dark:hover:bg-white/10"
            aria-label="Open menu"
          >
            <MdMenu size={18} />
          </button>
        </div>

        {/* ── Center: Search Bar Trigger (⌘K) ── */}
        <div className="flex-1 flex items-center justify-center sm:justify-start px-2 sm:px-4">
          <div
            className="w-full max-w-xs sm:max-w-sm relative cursor-text group"
            onClick={() => setSearchOpen(true)}
          >
            <MdSearch
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary-content/60 group-hover:text-primary-content transition-colors"
              size={15}
            />
            <div className="w-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 border border-transparent group-hover:border-primary-content/20 text-primary-content rounded-lg pl-8 pr-2.5 py-1 text-xs flex items-center justify-between transition-all shadow-inner">
              <span className="truncate opacity-80">Search projects, tasks, employees...</span>
              <span className="hidden sm:inline-flex items-center justify-center text-[9px] bg-black/20 dark:bg-white/20 px-1.5 py-0.5 rounded font-mono text-primary-content font-medium">
                ⌘ K
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: Actions (Notifications, Theme, Profile) ── */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notifications Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle btn-xs relative text-primary-content hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <MdNotifications size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 min-w-[13px] h-[13px] px-0.5 flex items-center justify-center text-[8px] font-bold text-white bg-red-500 rounded-full shadow-sm ring-1 ring-primary animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </label>

            <div
              tabIndex={0}
              className="dropdown-content z-50 mt-2 w-[88vw] sm:w-72 bg-base-100 shadow-2xl rounded-xl border border-base-300 p-2.5 space-y-1.5 max-h-80 overflow-y-auto text-base-content"
            >
              <div className="flex justify-between items-center px-1 pb-1.5 border-b border-base-200">
                <span className="font-bold text-xs">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {visibleNotifications.length === 0 ? (
                <p className="text-xs text-base-content/60 p-3 text-center">
                  No notifications
                </p>
              ) : (
                visibleNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      handleMarkAsRead(n.id);
                      navigate(getNotificationLink(n));
                      (document.activeElement as HTMLElement)?.blur();
                    }}
                    className={`p-2 rounded-lg border border-base-200 cursor-pointer transition-all hover:border-primary/40 ${
                      n.readBy?.includes(currentUserId)
                        ? "bg-base-100"
                        : "bg-primary/5 border-primary/20"
                    }`}
                  >
                    <p className="font-bold text-xs truncate text-base-content">{n.title}</p>
                    <p className="text-[11px] text-base-content/70 line-clamp-2 leading-relaxed mt-0.5">
                      {n.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-xs text-primary-content hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            onClick={toggleTheme}
            title={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? <MdLightMode size={16} /> : <MdDarkMode size={16} />}
          </button>

          {/* Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle btn-xs avatar hover:ring-1 hover:ring-primary-content/40 transition-all"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-primary-content/20 shadow-xs">
                <img
                  src={user?.imageUrl || "https://i.pravatar.cc/100?img=12"}
                  alt={user?.name || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              </div>
            </label>

            <ul
              tabIndex={0}
              className="menu menu-xs dropdown-content z-50 mt-2 p-1.5 shadow-2xl bg-base-100 rounded-xl w-44 border border-base-300 text-base-content font-medium"
            >
              <li className="menu-title px-2 py-0.5">
                <div className="flex flex-col">
                  <span className="font-bold text-xs text-base-content truncate">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[9px] text-base-content/50 capitalize font-medium">
                    {user?.role || "Member"} • {user?.department || "General"}
                  </span>
                </div>
              </li>
              <div className="divider my-0.5"></div>
              <li>
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      isSales
                          ? `/sales/profile/${user?.userId || ""}`
                        : `/profile/${user?.userId || ""}`
                    )
                  }
                  className="gap-2 text-[11px] py-1.5"
                >
                  <MdPerson size={14} /> My Profile
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigate("/settings")}
                  className="gap-2 text-[11px] py-1.5"
                >
                  <MdSettings size={14} /> Settings
                </button>
              </li>
              <div className="divider my-0.5"></div>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="gap-2 text-[11px] py-1.5 text-error hover:bg-error/10"
                >
                  <MdLogout size={14} /> Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* Global Command Palette Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-[10vh] p-4 animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-base-100 w-full max-w-lg rounded-2xl shadow-2xl border border-base-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-base-200 flex items-center gap-3">
              <MdSearch size={22} className="text-base-content/40 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search across organization..."
                className="w-full bg-transparent outline-none text-sm text-base-content placeholder:text-base-content/40 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim()) {
                    setSearchOpen(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery("");
                  } else if (e.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content"
                onClick={() => setSearchOpen(false)}
              >
                <MdClose size={18} />
              </button>
            </div>
            <div className="p-3 max-h-64 overflow-y-auto text-xs text-base-content/60">
              {searchQuery ? (
                <div
                  className="p-3 text-center cursor-pointer hover:bg-base-200 rounded-xl transition-colors"
                  onClick={() => {
                    if (searchQuery.trim()) {
                      setSearchOpen(false);
                      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                      setSearchQuery("");
                    }
                  }}
                >
                  Press Enter to search for <strong className="text-base-content">"{searchQuery}"</strong>
                </div>
              ) : (
                <div className="p-2 text-center text-[11px] uppercase tracking-wider font-semibold opacity-50">
                  Type to start searching
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
