import { useState } from "react";
import type { Todo } from "../types/todo";
import { PRIORITY_LABEL } from "../types/todo";
import { useTodoContext } from "../context/TodoContext";
import ConfirmDialog from "./ConfirmDialog";
import "./TodoItem.css";

interface Props {
  todo: Todo;
}

export default function TodoItem({ todo }: Props) {
  const { dispatch, setEditingId, editingId } = useTodoContext();
  const [showConfirm, setShowConfirm] = useState(false);

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  return (
    <li className={`todo-item ${todo.completed ? "todo-item--done" : ""}`}>
      <input
        type="checkbox"
        className="todo-item__checkbox"
        checked={todo.completed}
        onChange={() => dispatch({ type: "TOGGLE_COMPLETE", payload: { id: todo.id } })}
      />

      <div className="todo-item__body">
        <span className="todo-item__title">{todo.title}</span>
        <div className="todo-item__meta">
          <span className="todo-item__category">{todo.category}</span>
          <span className={`todo-item__priority todo-item__priority--${todo.priority}`}>
            {PRIORITY_LABEL[todo.priority]}
          </span>
          <span className={`todo-item__date ${isOverdue ? "todo-item__date--overdue" : ""}`}>
            {todo.dueDate || "无截止日期"}
          </span>
        </div>
      </div>

      <div className="todo-item__actions">
        <button
          className="todo-item__btn"
          onClick={() => setEditingId(editingId === todo.id ? null : todo.id)}
        >
          编辑
        </button>
        <button className="todo-item__btn" onClick={() => setShowConfirm(true)}>
          删除
        </button>
      </div>

      {showConfirm && (
        <ConfirmDialog
          message={`确认删除「${todo.title}」？`}
          onConfirm={() => {
            if (editingId === todo.id) setEditingId(null);
            dispatch({ type: "DELETE_TODO", payload: { id: todo.id } });
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </li>
  );
}
