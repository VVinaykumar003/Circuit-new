import type { ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function ProjectDrawer({
  open,
  onClose,
  children,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="
          absolute right-0 top-0
          h-full w-full sm:w-105
          bg-base-100
          shadow-xl
          p-6
          overflow-y-auto
          animate-slideIn
        "
      >
        {children}
      </div>
    </div>
  );
}
