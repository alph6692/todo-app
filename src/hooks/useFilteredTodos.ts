import { useMemo } from "react";
import type { Todo } from "../types/todo";
import { TodoStatus, SortBy, Priority } from "../types/todo";
import { useTodoContext } from "../context/TodoContext";

const PRIORITY_ORDER: Record<Priority, number> = {
  [Priority.HIGH]: 0,
  [Priority.MEDIUM]: 1,
  [Priority.LOW]: 2,
};

export function useFilteredTodos(): Todo[] {
  const { todos, filter } = useTodoContext();

  return useMemo(() => {
    let result = todos;

    // 状态筛选
    if (filter.status === TodoStatus.ACTIVE) {
      result = result.filter((t) => !t.completed);
    } else if (filter.status === TodoStatus.COMPLETED) {
      result = result.filter((t) => t.completed);
    }

    // 分类筛选
    if (filter.category !== "全部") {
      result = result.filter((t) => t.category === filter.category);
    }

    // 搜索
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    // 排序
    if (filter.sortBy === SortBy.PRIORITY) {
      result = [...result].sort(
        (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.createdAt - a.createdAt,
      );
    } else {
      result = [...result].sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }, [todos, filter]);
}
