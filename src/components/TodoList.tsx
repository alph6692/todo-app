import { useFilteredTodos } from "../hooks/useFilteredTodos";
import { useTodoContext } from "../context/TodoContext";
import { TodoStatus } from "../types/todo";
import TodoItem from "./TodoItem";
import "./TodoList.css";

const EMPTY_MESSAGES: Record<TodoStatus, string> = {
  [TodoStatus.ALL]: "暂无任务",
  [TodoStatus.ACTIVE]: "没有进行中的任务",
  [TodoStatus.COMPLETED]: "没有已完成的任务",
};

export default function TodoList() {
  const filteredTodos = useFilteredTodos();
  const { filter } = useTodoContext();

  if (filteredTodos.length === 0) {
    const msg = filter.searchQuery
      ? "未找到匹配的任务"
      : EMPTY_MESSAGES[filter.status];
    return <p className="todo-list__empty">{msg}</p>;
  }

  return (
    <ul className="todo-list">
      {filteredTodos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
