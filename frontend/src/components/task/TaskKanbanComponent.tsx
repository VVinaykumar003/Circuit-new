import { DragDropContext,type DropResult } from "@hello-pangea/dnd";
import  KanbanColumn  from "./KanbanColumn";
import type { Task, TaskStatus } from "@/type/task";
import React from "react";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "pending", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "completed", title: "Completed" },
];


interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  onTaskSelect: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus, projectId?: string) => Promise<void>;
}

export function TaskKanban({
  tasks,
  setTasks,
  onTaskSelect,
  onStatusChange,
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

    const newStatus = destination.droppableId as TaskStatus;
    let movedTaskRef: Task | undefined;

    setTasks((prev) => {
      const newTasks = [...prev];
      
      // 1. Find the index of the task being dragged
      const taskIndex = newTasks.findIndex(
        (t) => String(t._id || (t as any).id) === draggableId
      );
      if (taskIndex === -1) return prev;

      // 2. Remove the task from its old position and update its status
      const [movedTask] = newTasks.splice(taskIndex, 1);
      movedTask.status = newStatus;
      movedTaskRef = movedTask;

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

    if (onStatusChange) {
      const projId = movedTaskRef?.projectId;
      onStatusChange(draggableId, newStatus, projId);
    }
  };

  // Memoize the filtered tasks for each column to prevent unnecessary re-renders
  // of KanbanColumn when the parent re-renders but the filtered data hasn't changed.
  const memoizedFilteredTasks = React.useMemo(() => {
    const filtered = {};
    COLUMNS.forEach(col => {
      filtered[col.id] = tasks.filter(t => t.status === col.id);
    });
    return filtered;
  }, [tasks]);

  const memoizedOnTaskSelect = React.useCallback((task: Task) => {
    onTaskSelect(task);
  }, [onTaskSelect]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-3 ">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            columnId={col.id}
            title={col.title}
            tasks={memoizedFilteredTasks[col.id]}
            onTaskClick={memoizedOnTaskSelect}
          />
        ))}
      </div>
    </DragDropContext>
  );
}

export default React.memo(TaskKanban);
