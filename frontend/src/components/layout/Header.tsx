import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/use-theme";
import { MdNotifications, MdMenu, MdSearch, MdClose, MdLightMode, MdDarkMode } from "react-icons/md";
import { useAuth } from "../../auth/AuthContext";
import { toast } from "react-toastify"; // Keep toast for avatar upload
import { uploadImage } from "@/services/uploadService";
import {type OrganizationMember} from '@/type/User';
import { useNotifications } from "@/hooks/useNotification"; // Corrected import path and plural

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { auth, logout } = useAuth();
  const user = auth?.user as OrganizationMember | undefined;
  const currentUserId = user?.userId  || ""; // Define currentUserId before calling the hook
  const {
    visibleNotifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllAsRead,
    getNotificationLink,
  } = useNotifications({ authSlug: auth?.slug || null, currentUserId }); // Call the hook with props
  // console.log("Header user:", user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

 const location = useLocation();

const isSales =
  location.pathname.startsWith("/sales");
 const navigate=useNavigate();
  const isDark = theme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "corporate" : "dark");
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
    <header className=" bg-primary/95 backdrop-blur-md border-b border-base-300 px-1.5 py-2 sticky top-0 z-40 flex items-center justify-between ">

      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-3 min-w-0 shrink-0 lg:hidden">
        {/* Hamburger - Mobile Only */}
            <button
              onClick={onMenuClick}
              className="btn btn-ghost btn-circle lg:hidden text-primary-content hover:bg-black/10 dark:hover:bg-white/10"
            >
              <MdMenu size={22} />
            </button>

      
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
              <span className="font-semibold text-base">Notifications</span>
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
                <p className="font-semibold text-sm truncate">
                  {n.title}
                </p>
                <p className="text-xs text-base-content/60 line-clamp-2 leading-tight">
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
                src={user?.imageUrl 
                   || "https://i.pravatar.cc/100?img=12"}
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
              <span className="text-base">Admin</span>
            </li>
            <li onClick={() =>
    navigate(
      isSales
        ? `/sales/profile/${user?.userId}`
        : `/profile/${user?.userId}`
    )
  } className="text-sm">
              <a className="text-sm">Profile</a>
            </li>
            {/* <li onClick={() => fileInputRef.current?.click()}>
              <a>{isUploading ? "Uploading..." : "Change Avatar"}</a>
            </li> */}
            {/* <li onClick={()=>navigate("/settings")}>
              <a>Settings</a>
            </li> */}
            <li className="text-sm" onClick={()=>{
              handleLogout()
            }}>
              <a className="text-sm text-error">Logout</a>
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
              className="w-full bg-transparent outline-none text-base text-base-content placeholder:text-base-content/40"
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
