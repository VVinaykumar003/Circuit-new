export default function TaskKanban({ onOpenTask }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map(col => (
        <div key={col.id} className="bg-base-200 rounded-lg p-3">
          <h4 className="font-semibold mb-2">{col.title}</h4>

          {tasks
            .filter(t => t.status === col.id)
            .map(task => (
              <div
                key={task.id}
                className="bg-base-100 p-3 rounded-lg mb-2 cursor-pointer"
                onClick={() => onOpenTask(task)}
              >
                {task.title}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
