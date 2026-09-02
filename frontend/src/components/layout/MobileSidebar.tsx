import React from "react";
import Sidebar from "./Sidebar";
import { MdClose } from "react-icons/md";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex-1 flex flex-col max-w-[240px] w-full bg-base-100 shadow-2xl z-10 animate-slide-in-left">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 z-50 btn btn-ghost btn-xs btn-circle bg-base-200"
          aria-label="Close sidebar"
        >
          <MdClose size={15} />
        </button>
        <Sidebar collapsed={false} onCloseMobile={onClose} />
      </div>
    </div>
  );
}
