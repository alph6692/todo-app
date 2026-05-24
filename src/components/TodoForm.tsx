import { useState, useEffect } from "react";
import { Priority } from "../types/todo";
import type { TodoFormData } from "../types/todo";
import { useTodoContext } from "../context/TodoContext";
import { CATEGORIES } from "../constants/categories";
import "./TodoForm.css";

const EMPTY_FORM: TodoFormData = {
  title: "",
  category: "工作",
  priority: Priority.MEDIUM,
  dueDate: "",
};

export default function TodoForm() {
  const { dispatch, editingId, setEditingId, todos } = useTodoContext();
  const [form, setForm] = useState<TodoFormData>(EMPTY_FORM);
  const [error, setError] = useState("");

  const isEditing = editingId !== null;

  // 编辑模式：预填表单
  useEffect(() => {
    if (isEditing) {
      const todo = todos.find((t) => t.id === editingId);
      if (todo) {
        setForm({
          title: todo.title,
          category: todo.category,
          priority: todo.priority,
          dueDate: todo.dueDate || "",
        });
      }
    }
  }, [editingId, isEditing, todos]);

  function handleSubmit() {
    const trimmed = form.title.trim();
    if (!trimmed) {
      setError("标题不能为空");
      return;
    }
    setError("");

    if (isEditing) {
      dispatch({ type: "UPDATE_TODO", payload: { id: editingId, data: { ...form, title: trimmed } } });
      setEditingId(null);
    } else {
      dispatch({ type: "ADD_TODO", payload: { ...form, title: trimmed } });
    }
    setForm(EMPTY_FORM);
  }

  function handleCancel() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  return (
    <div className="todo-form">
      <div className="todo-form__row">
        <input
          className={`todo-form__input ${error ? "todo-form__input--error" : ""}`}
          type="text"
          placeholder="添加新任务..."
          value={form.title}
          onChange={(e) => { setForm((prev) => ({ ...prev, title: e.target.value })); setError(""); }}
          onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
        />
        <button className="todo-form__submit" onClick={handleSubmit}>
          {isEditing ? "保存" : "添加"}
        </button>
        {isEditing && (
          <button className="todo-form__cancel" onClick={handleCancel}>取消</button>
        )}
      </div>

      {error && <p className="todo-form__error">{error}</p>}

      <div className="todo-form__options">
        <select
          className="todo-form__select"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
        >
          {CATEGORIES.filter((c) => c.value !== "全部").map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          className="todo-form__select"
          value={form.priority}
          onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value as Priority }))}
        >
          <option value={Priority.HIGH}>高优先级</option>
          <option value={Priority.MEDIUM}>中优先级</option>
          <option value={Priority.LOW}>低优先级</option>
        </select>

        <input
          className="todo-form__date"
          type="date"
          value={form.dueDate}
          onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
        />
      </div>
    </div>
  );
}
