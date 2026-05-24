import { useTodoContext } from "../context/TodoContext";
import { KANBAN_COLUMNS } from "../types/todo";
import type { TaskStatus } from "../types/todo";
import KanbanCard from "./KanbanCard";
import "./KanbanBoard.css";

export default function KanbanBoard() {
  const { todos, dispatch } = useTodoContext();

  function handleDrop(id: string, status: TaskStatus) {
    dispatch({ type: "CHANGE_STATUS", payload: { id, status } });
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
