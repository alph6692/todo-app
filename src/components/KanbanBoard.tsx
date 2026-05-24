import { useTodoContext } from "../context/TodoContext";
import { KANBAN_COLUMNS, TaskStatus } from "../types/todo";
import KanbanCard from "./KanbanCard";
import "./KanbanBoard.css";

function cheer() {
  const ctx = new AudioContext();
  [523, 659, 784].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.03);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

export default function KanbanBoard() {
  const { todos, dispatch } = useTodoContext();

  function handleDrop(id: string, status: TaskStatus) {
    dispatch({ type: "CHANGE_STATUS", payload: { id, status } });
    if (status === TaskStatus.DONE) cheer();
  }

  return (
    <div className="kanban">
      {KANBAN_COLUMNS.map((col) => {
        const colTodos = todos.filter((t) => t.status === col.status);
        return (
          <div
            key={col.status}
            className="kanban__col"
            style={{ borderTopColor: col.color }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const id = e.dataTransfer.getData("todoId");
              if (id) handleDrop(id, col.status);
            }}
          >
            <div className="kanban__col-header">
              <span
                className="kanban__col-dot"
                style={{ background: col.color }}
              />
              <span className="kanban__col-label">{col.label}</span>
              <span className="kanban__col-count">{colTodos.length}</span>
            </div>
            <div className="kanban__col-body">
              {colTodos.length === 0 && (
                <p className="kanban__col-empty">拖拽任务到这里</p>
              )}
              {colTodos.map((todo) => (
                <KanbanCard key={todo.id} todo={todo} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
