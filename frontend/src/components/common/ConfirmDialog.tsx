import React, { type ReactNode } from "react";
import Modal from "./Modal";
import Button from "./Button";
import { MdWarning, MdInfo, MdErrorOutline } from "react-icons/md";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  message: ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "error" | "warning" | "info" | "primary";
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "error",
  loading = false,
}: ConfirmDialogProps) {
  const iconMap = {
    error: <MdErrorOutline className="text-error" size={32} />,
    warning: <MdWarning className="text-warning" size={32} />,
    info: <MdInfo className="text-info" size={32} />,
    primary: <MdInfo className="text-primary" size={32} />,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOutsideClick={!loading}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === "error" ? "error" : variant === "warning" ? "warning" : "primary"}
            size="sm"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 p-2.5 rounded-2xl bg-base-200 border border-base-300">
          {iconMap[variant]}
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-base text-base-content mb-1">{title}</h4>
          <div className="text-sm text-base-content/70">{message}</div>
        </div>
      </div>
    </Modal>
  );
}
