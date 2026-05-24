import { createContext, useContext, useReducer, useState, type ReactNode } from "react";
import type { TodoContextValue, FilterState } from "../types/todo";
import { TodoStatus, SortBy } from "../types/todo";
import { todoReducer, createInitialTodos } from "./todoReducer";

const TodoContext = createContext<TodoContextValue | null>(null);

const initialFilter: FilterState = {
  status: TodoStatus.ALL,
  category: "全部",
  searchQuery: "",
  sortBy: SortBy.DATE,
};

export function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todoReducer, null, createInitialTodos);
  const [filter, setFilter] = useState<FilterState>(initialFilter);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <TodoContext.Provider value={{ todos, dispatch, filter, setFilter, editingId, setEditingId }}>
      {children}
    </TodoContext.Provider>
  );
}

export function useTodoContext(): TodoContextValue {
  const ctx = useContext(TodoContext);
  if (!ctx) throw new Error("useTodoContext 必须在 TodoProvider 内部使用");
  return ctx;
}
