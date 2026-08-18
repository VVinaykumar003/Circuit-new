import { Droppable } from "@hello-pangea/dnd";
import { KanbanTaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "@/type/task";
import React from "react";

interface Props {
  columnId: TaskStatus;
  title: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

 function KanbanColumn({
  columnId,
  title,
  tasks,
  onTaskClick,
}: Props) {
  return (
    <div className="bg-base-200 rounded-lg p-2.5 w-full min-w-70 text-base-content">
      <h3 className="text-xs font-semibold mb-3">
        {title} · {tasks.length}
      </h3>

      <Droppable droppableId={columnId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 min-h-50"
          >
            {tasks.map((task, index) => (
              <KanbanTaskCard
                key={task._id || task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default React.memo(KanbanColumn);