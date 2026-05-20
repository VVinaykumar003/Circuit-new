import { Draggable } from "@hello-pangea/dnd";
import StatusBadge from "../ui/StatusBadge";
import { FaCalendar } from "react-icons/fa";

interface Props {
  task: Task;
  index: number;
  onClick: () => void;
}

export function KanbanTaskCard({ task, index, onClick }: Props) {
  const draggableId = String(task._id || task.id);
  return (
    <Draggable draggableId={draggableId} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className="bg-base-100 border border-base-300 rounded-lg p-3 
                     cursor-pointer hover:shadow transition"
        >
          <h4 className="text-sm font-medium">{task.title}</h4>

          <div className="flex justify-between items-center mt-2 text-xs">
            <span>{task.assignee}</span>
            <StatusBadge
              status={
                task.status === "completed" ? "approved" : "pending"
              }
            />
          </div>

          <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
           <FaCalendar/>  {task.dueDate}
          </p>
        </div>
      )}
    </Draggable>
  );
}
