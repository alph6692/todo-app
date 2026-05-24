import { useState, useRef } from "react";
import type { Todo } from "../types/todo";
import { PRIORITY_LABEL } from "../types/todo";
import { useTodoContext } from "../context/TodoContext";
import ConfirmDialog from "./ConfirmDialog";
import Confetti from "./Confetti";
import "./TodoItem.css";

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

interface Props {
  todo: Todo;
}

export default function TodoItem({ todo }: Props) {
  const { dispatch, setEditingId, editingId } = useTodoContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompleted = useRef(todo.completed);

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed;

  function handleToggle() {
    dispatch({ type: "TOGGLE_COMPLETE", payload: { id: todo.id } });
    if (!todo.completed) {
      // 即将完成
      setShowConfetti(true);
      cheer();
    }
  }

  // 同步 ref（父级可能通过看板拖拽改变状态）
  if (todo.completed && !prevCompleted.current) {
    prevCompleted.current = true;
    // 由看板拖拽触发
    if (!showConfetti) {
      setTimeout(() => { setShowConfetti(true); cheer(); }, 50);
    }
  }
  if (!todo.completed) {
    prevCompleted.current = false;
  }

  return (
    <li className={`todo-item ${todo.completed ? "todo-item--done" : ""}`}>
      <Confetti active={showConfetti} onDone={() => setShowConfetti(false)} />

      <input
        type="checkbox"
        className="todo-item__checkbox"
        checked={todo.completed}
        onChange={handleToggle}
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
