
import { useEffect,useRef,  useState, type ReactNode } from "react";
import Header from "./Header";
import ERPSidebar from "./Sidebar";
import { useLocation } from "react-router-dom";


interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

 useEffect(() => {
    scrollRef.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden">
      
      {/* Sidebar */}
      <ERPSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}