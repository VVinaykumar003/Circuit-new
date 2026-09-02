import React, { useEffect, type ReactNode } from "react";
import { MdClose } from "react-icons/md";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  closeOnOutsideClick?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl w-full",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  size = "md",
  children,
  footer,
  className = "",
  closeOnOutsideClick = true,
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />
      <div
        className={`relative w-full ${sizeClasses[size]} bg-base-100 rounded-2xl shadow-2xl border border-base-300 overflow-hidden flex flex-col z-10 my-auto ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between p-5 border-b border-base-200 bg-base-200/30">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-base-content tracking-tight">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-base-content/60 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-circle text-base-content/60 hover:text-base-content"
            >
              <MdClose size={18} />
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)]">{children}</div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-4 border-t border-base-200 bg-base-200/20">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
