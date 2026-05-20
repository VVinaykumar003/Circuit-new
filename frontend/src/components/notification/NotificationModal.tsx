import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { MdClose } from "react-icons/md";
import type { Notification } from "@/type/notification";

interface Props {
  open: boolean;
  onClose: () => void;
  onSend: (notification: Notification) => void;
  members: { id: string; name: string }[];
}

export default function SendNotificationModal({
  open,
  onClose,
  onSend,
  members,
}: Props) {
  if (!open) return null;

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] =
    useState<"low" | "normal" | "urgent">("normal");
  const [target, setTarget] = useState("all");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-base-100 w-full max-w-lg rounded-2xl p-6 border border-base-300 shadow-xl space-y-4">

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            Send Notification
          </h3>
          <button onClick={onClose}>
            <MdClose size={20} />
          </button>
        </div>

        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="textarea textarea-bordered w-full"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value as any)
          }
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="urgent">Urgent</option>
        </Select>

        <Select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        >
          <option value="all">All Employees</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Select>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            variant="primary"
            disabled={!title || !message}
            onClick={() => {
              onSend({
                id: crypto.randomUUID(),
                title,
                message,
                priority,
                targetUserIds:
                  target === "all" ? [] : [target],
                createdBy: "admin",
                createdAt: new Date().toISOString(),
                readBy: [],
              });

              onClose();
            }}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
