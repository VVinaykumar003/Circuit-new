import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/use-theme";
import { MdNotifications, MdMenu, MdSearch, MdClose, MdLightMode, MdDarkMode } from "react-icons/md";
import type { Notification } from "@/type/notification";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "react-toastify";
import { uploadImage } from "@/services/uploadService";
import { getNotifications , markAsRead, markAllAsRead } from "@/services/notificationService";
import { socket } from "@/socket";
import api from "@/services/api";


interface HeaderProps {
  onMenuClick: () => void;
}

const getNotificationLink = (notification: any) => {
  const combined = `${notification.title || ""} ${notification.message || ""}`.toLowerCase();
  if (combined.includes("leave")) return "/leaves";
  if (combined.includes("task")) return "/tasks";
  if (combined.includes("project")) return "/projects";
  if (combined.includes("member") || combined.includes("user")) return "/members";
  if (combined.includes("attendance")) return "/attendance";
  return "/notifications"; // Fallback to main notifications page
};

export default function Header({ onMenuClick }: HeaderProps)  {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] =
    useState<Notification[]>([]);
  const { auth, logout } = useAuth();
  const user = auth?.user;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    const audio = new Audio("/notification.mp3");
    audioRef.current = audio;

    // 🟢 Unlock audio context on first user interaction to prevent Autoplay blocks
    const unlockAudio = () => {
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
      }).catch(() => {}); // Ignore silent failure
      
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };

    document.addEventListener("click", unlockAudio);
    document.addEventListener("keydown", unlockAudio);

    return () => {
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentUserId = user?.userId || user?._id || "1";
 
 const navigate=useNavigate();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "corporate" : "dark");
  };

  // Fetch initial notifications & listen for real-time updates
  useEffect(() => {
    if (!auth?.slug) return;
    
    // 1. Emit the join room event as soon as the header mounts (user logs in)
    socket.emit("joinUserRoom", currentUserId);

    const fetchNotifs = async () => {
      try {
        const res = await getNotifications(auth.slug);
        const formatted = (res.data?.data || []).map((n: any) => ({
          id: n._id,
          title: n.title,
          message: n.message,
          priority: n.priority,
          targetUserIds: n.recipients || [],
          createdBy: n.createdBy?._id,
          createdAt: n.createdAt,
          readBy: n.readBy?.map((r: any) => typeof r === 'string' ? r : (r.user?._id || r.user || r.userId || r._id)) || [],
          attachments: n.attachments || [],
          sendTo: n.sendTo,
        }));

        // console.log("formatted : ",formatted)
     
        setNotifications(formatted);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifs();

    const handleNewNotification = (data: any) => {
      // Play the notification sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {
          // 🔇 Silently ignore if autoplay is still blocked
        });
      }

      // Support both Task Assigned emits and standard Notification emits
      const newNotif: Notification = {
        id: data._id || Math.random().toString(),
        title: data.title || data.action || "New Notification",
        message: data.message,
        priority: data.priority || "normal",
        targetUserIds: data.recipients || [],
        createdBy: data.createdBy?._id || "system",
        createdAt: data.createdAt || new Date().toISOString(),
        readBy: data.readBy?.map((r: any) => typeof r === 'string' ? r : (r.user?._id || r.user || r.userId || r._id)) || [],
        attachments: data.attachments || [],
        sendTo: data.sendTo || "all",
      };

      console.log("newNotif : ",newNotif)
      
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on("new_notification", handleNewNotification);

    return () => {
      socket.off("new_notification", handleNewNotification);
    };
  }, [auth?.slug]);

  const visibleNotifications = notifications.filter(
    (n) => (n.sendTo === "all" || 
         (n.targetUserIds && n.targetUserIds.includes(currentUserId))) &&
         !n.readBy.includes(currentUserId)
  );

  const unreadCount = visibleNotifications.length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update for instant feedback
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id && !n.readBy.includes(currentUserId)
          ? {
              ...n,
              readBy: [...n.readBy, currentUserId],
            }
          : n
      )
    );

    // Backend call to persist the read status
    try {
      if (auth?.slug) {
        await markAsRead(auth.slug, id);
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = visibleNotifications
      .filter((n) => !n.readBy.includes(currentUserId))
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    // Optimistically mark as read in the UI instead of clearing to match backend state on refresh
    setNotifications((prev) =>
      prev.map((n) =>
        !n.readBy.includes(currentUserId)
          ? { ...n, readBy: [...n.readBy, currentUserId] }
          : n
      )
    );

    try {
      if (auth?.slug) {
        // Fallback to individual markAsRead calls to guarantee the backend updates properly
        await Promise.all(unreadIds.map((id) => markAsRead(auth.slug, id)));
        try { await markAllAsRead(auth.slug); } catch (e) {}
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imgUrl = await uploadImage(file);

      toast.success("Avatar uploaded successfully!");
      // TODO: Here you can update your auth context or user profile with data.imageUrl
    } catch (error) {
      console.error("Avatar upload failed", error);
      toast.error("Failed to upload avatar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  

  const handleLogout=()=>{
    localStorage.removeItem("theme");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout();
    navigate("/login");
  }
  return (
    <>
    {/* <header className="navbar bg-primary/95 backdrop-blur-md border-b border-base-300 px-4 sm:px-6 lg:pr-8 py-2 sm:py-3 sticky top-0 z-40 transition-colors"> */}
    <header className="navbar bg-primary/95 backdrop-blur-md border-b border-base-300 
px-3 sm:px-5 lg:px-8 py-2 sticky top-0 z-40 flex items-center justify-between">

      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-3 min-w-0 shrink-0 lg:hidden">
        {/* Hamburger - Mobile Only */}
            <button
              onClick={onMenuClick}
              className="btn btn-ghost btn-circle lg:hidden text-primary-content hover:bg-black/10 dark:hover:bg-white/10"
            >
              <MdMenu size={22} />
            </button>

        {/* Logo */}
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-base-100 text-primary flex items-center justify-center font-bold shrink-0 shadow-sm">
          C
        </div>

        {/* Hide text on very small screens */}
        <span className="hidden sm:block text-lg font-semibold truncate text-primary-content tracking-tight">
          Circuit 
        </span>
      </div>

      {/* ================= MIDDLE (SEARCH) ================= */}
      {/* <div className="flex-1 flex items-center justify-center sm:justify-start px-3 sm:px-8">
        <div 
          className="w-full max-w-lg relative cursor-text group"
          onClick={() => setSearchOpen(true)}
        >
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60 group-hover:text-primary-content transition-colors" size={20} />
          <div className="w-full bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 border border-transparent group-hover:border-primary-content/20 text-primary-content rounded-xl pl-10 pr-3 py-2 text-sm flex items-center justify-between transition-all shadow-inner">
            <span className="truncate opacity-80">Search projects, tasks, employees...</span>
            <span className="hidden sm:inline-flex items-center justify-center text-[10px] bg-black/20 dark:bg-white/20 px-2 py-0.5 rounded-md font-mono border border-transparent text-primary-content/90 font-medium">⌘ K</span>
          </div>
        </div>
      </div> */}

      <div className="flex-1 flex items-center px-2 sm:px-6 min-w-0">
  {/* <div 
    className="w-full max-w-lg relative cursor-text group min-w-0"
    onClick={() => setSearchOpen(true)}
  >
    <MdSearch 
      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-content/60" 
      size={18} 
    />

    <div className="
      w-full 
      bg-black/10 dark:bg-white/10 
      border border-transparent 
      text-primary-content 
      rounded-xl 
      pl-9 pr-2 py-1.5 sm:py-2
      text-xs sm:text-sm
      truncate
      flex items-center justify-between
    ">
      <span className="truncate opacity-80">
        Search...
      </span>

   
      <span className="hidden sm:inline-flex text-[10px] bg-black/20 px-2 py-0.5 rounded-md">
        ⌘ K
      </span>
    </div>
  </div> */}
</div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-1 sm:gap-3">

        {/* ========== NOTIFICATIONS ========== */}
        <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn btn-ghost btn-circle relative text-primary-content hover:bg-black/10 dark:hover:bg-white/10 transition-colors">

    {/* ICON */}
    <MdNotifications size={24} />

    {/* BADGE */}
    {unreadCount > 0 && (
      <span
        className="
          absolute top-1.5 right-1.5
          min-w-[18px] h-[18px]
          px-1
          flex items-center justify-center
          text-[10px] font-bold
          text-white bg-red-500
          rounded-full
          shadow-sm
          ring-2 ring-primary
          animate-pulse
        "
      >
        {unreadCount > 99 ? "99+" : unreadCount}
      </span>
    )}
  </label>

          <div 
            tabIndex={0}
            className="
            dropdown-content 
            z-50
            mt-3 
            w-[90vw] sm:w-80
            bg-base-100 
            shadow-xl 
            rounded-xl 
            border border-base-300 
            p-3 
            space-y-2 
            max-h-96 
            overflow-y-auto
            text-base-content
          ">
            <div className="flex justify-between items-center px-1 pb-2 border-b border-base-200">
              <span className="font-semibold text-sm">Notifications</span>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead} 
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {visibleNotifications.length === 0 && (
              <p className="text-xs text-base-content/60 p-2 text-center pt-4">
                No notifications
              </p>
            )}

            {visibleNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  
                  handleMarkAsRead(n.id);
                  navigate(getNotificationLink(n));
                  (document.activeElement as HTMLElement)?.blur(); // Closes the DaisyUI dropdown
                }}
                className={`p-3 rounded-lg border cursor-pointer transition
                  ${
                    n.readBy.includes(currentUserId)
                      ? "bg-base-100"
                      : "bg-base-200"
                  }`}
              >
                <p className="text-sm font-semibold truncate">
                  {n.title}
                </p>
                <p className="text-xs text-base-content/60 line-clamp-2">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        </div> 

 

        {/* ========== THEME TOGGLE ========== */}
        <button 
          className="hidden sm:flex btn btn-ghost btn-circle text-primary-content hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          onClick={toggleTheme}
          title="Toggle Theme"
        >
          {isDark ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
        </button>

        {/* ========== PROFILE ========== */}
        <div className="dropdown dropdown-end ml-1 sm:ml-2">
          <label
            tabIndex={0}
            className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-primary-content/50 transition-all"
          >
            <div className="w-8 md:w-9 rounded-full">
              <img
                src={user?.imageUrl || "https://i.pravatar.cc/100?img=12"}
                alt="User avatar"
                className={isUploading ? "opacity-50" : ""}
              />
            </div>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarUpload}
          />

          <ul
            tabIndex={0}
            className="
              menu menu-sm 
              dropdown-content 
              z-50
              mt-3 p-2 
              shadow-lg 
              bg-base-100 
              rounded-xl 
              w-48 md:w-52
              text-base-content
            "
          >
            <li className="menu-title">
              <span>Admin</span>
            </li>
            <li onClick={()=>navigate(`/profile/${user?.userId}`)}>
              <a>Profile</a>
            </li>
            {/* <li onClick={() => fileInputRef.current?.click()}>
              <a>{isUploading ? "Uploading..." : "Change Avatar"}</a>
            </li> */}
            {/* <li onClick={()=>navigate("/settings")}>
              <a>Settings</a>
            </li> */}
            <li onClick={()=>{
              handleLogout()
            }}>
              <a className="text-error">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </header>

    {/* COMMAND PALETTE MODAL */}
    {searchOpen && (
      <div className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[10vh]" onClick={() => setSearchOpen(false)}>
        <div 
          className="bg-base-100 w-full max-w-xl rounded-2xl shadow-2xl border border-base-300 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 border-b border-base-200 flex items-center gap-3">
            <MdSearch 
              size={22} 
              className={`text-base-content/50 ${searchQuery.trim() ? "cursor-pointer hover:text-primary transition-colors" : ""}`}
              onClick={() => {
                if (searchQuery.trim()) {
                  setSearchOpen(false);
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchQuery("");
                }
              }}
            />
            <input 
              autoFocus
              type="text"
              placeholder="Search employees, tasks, projects..."
              className="w-full bg-transparent outline-none text-lg text-base-content placeholder:text-base-content/40"
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
            <button className="btn btn-ghost btn-sm btn-square" onClick={() => setSearchOpen(false)}>
              <MdClose size={20} />
            </button>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {searchQuery ? (
              <div 
                className="px-3 py-4 text-sm text-base-content/60 text-center cursor-pointer hover:bg-base-200 transition-colors rounded-lg"
                onClick={() => {
                  if (searchQuery.trim()) {
                    setSearchOpen(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                    setSearchQuery("");
                  }
                }}
              >
                Press Enter or click here to search for <span className="font-semibold text-base-content">"{searchQuery}"</span> across the organization.
              </div>
            ) : (
              <div className="px-3 py-2 text-xs font-semibold text-base-content/50 uppercase">
                Recent Searches
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    </>
  );
}
