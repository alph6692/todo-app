import { useState, useRef, useEffect } from "react";
import type { Todo } from "../types/todo";
import { PRIORITY_LABEL } from "../types/todo";
import Confetti from "./Confetti";
import "./KanbanCard.css";

interface Props {
  todo: Todo;
}

export default function KanbanCard({ todo }: Props) {
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompleted = useRef(todo.completed);

  useEffect(() => {
    if (todo.completed && !prevCompleted.current) {
      setShowConfetti(true);
    }
    prevCompleted.current = todo.completed;
  }, [todo.completed]);

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <div
      className={`kanban-card ${todo.completed ? "kanban-card--done" : ""}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("todoId", todo.id);
        e.currentTarget.classList.add("kanban-card--dragging");
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove("kanban-card--dragging");
      }}
    >
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      <p className="kanban-card__title">{todo.title}</p>
      <div className="kanban-card__meta">
        <span className="kanban-card__category">{todo.category}</span>
        <span className={`kanban-card__priority kanban-card__priority--${todo.priority}`}>
          {PRIORITY_LABEL[todo.priority]}
        </span>
        {todo.dueDate && (
          <span className={`kanban-card__date ${isOverdue ? "kanban-card__date--overdue" : ""}`}>
            {todo.dueDate}
          </span>
        )}
      </div>
    </div>
  );
}
