import { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import Button from "@/components/ui/Button";

interface Props {
  open: boolean;
  date: string;
  holiday?: { _id?: string; date: string; title: string; description?: string } | null;
  onClose: () => void;
  onSubmit: (data: { date: string; title: string; description: string }) => void;
  onDelete?: (id: string) => void;
}

export default function AddHolidayDrawer({ open, date, holiday, onClose, onSubmit, onDelete }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(holiday?.title || "");
      setDescription(holiday?.description || "");
    }
  }, [open, holiday]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="w-full max-w-md bg-base-100 h-full shadow-xl p-6 overflow-y-auto text-base-content">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">
            {holiday?._id ? "Edit Holiday" : "Publish Holiday"}
          </h3>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            <MdClose size={18} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs text-base-content/80 block mb-1">Date</label>
            <input
              type="text"
              value={date}
              disabled
              className="input  w-full  cursor-not-allowed placeholder:text-base-content/70"
            />
          </div>

          <div>
            <label className="text-xs text-base-content/80 block mb-1">Holiday Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Diwali, New Year"
              className="input border-2 focus:outline-none focus:ring-0 focus:ring-primary w-full placeholder:text-base-content/40"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-base-content/80 block mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details..."
              className="textarea w-full border-2 focus:outline-none focus:ring-0 focus:ring-primary placeholder:text-base-content/40"
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            {holiday?._id && onDelete && (
              <Button
                variant="error"
                className="flex-1"
                onClick={() => onDelete(holiday._id!)}
              >
                Delete
              </Button>
            )}
            <Button
              variant="primary"
              className="flex-1"
              disabled={!title.trim()}
              onClick={() => onSubmit({ date, title, description })}
            >
              {holiday?._id ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}