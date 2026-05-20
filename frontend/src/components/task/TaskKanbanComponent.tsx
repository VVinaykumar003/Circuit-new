import { DragDropContext,type DropResult } from "@hello-pangea/dnd";
import  KanbanColumn  from "./KanbanColumn";
import type { Task, TaskStatus } from "@/type/task";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "pending", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];


interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskSelect: (task: Task) => void;
}

export default function TaskKanban({
  tasks,
  setTasks,
  onTaskSelect,
}: Props) {
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // same column + same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    setTasks((prev) => {
      const newTasks = [...prev];
      
      // 1. Find the index of the task being dragged
      const taskIndex = newTasks.findIndex(
        (t) => String(t._id || t.id) === draggableId
      );
      if (taskIndex === -1) return prev;

      // 2. Remove the task from its old position and update its status
      const [movedTask] = newTasks.splice(taskIndex, 1);
      movedTask.status = destination.droppableId as TaskStatus;

      // 3. Find the exact insertion point inside the destination column
      const destTasks = newTasks.filter((t) => t.status === destination.droppableId);
      if (destination.index < destTasks.length) {
        const targetTask = destTasks[destination.index];
        const targetAbsoluteIndex = newTasks.findIndex((t) => t === targetTask);
        newTasks.splice(targetAbsoluteIndex, 0, movedTask);
      } else {
        newTasks.push(movedTask);
      }

      return newTasks;
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 ">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            columnId={col.id}
            title={col.title}
            tasks={tasks.filter((t) => t.status === col.id)}
            onTaskClick={onTaskSelect}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
