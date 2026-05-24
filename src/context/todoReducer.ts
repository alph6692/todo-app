import type { Todo, TodoAction, TodoFormData } from "../types/todo";
import { Priority, TaskStatus } from "../types/todo";

function createTodo(data: TodoFormData): Todo {
  return {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    category: data.category,
    priority: data.priority,
    dueDate: data.dueDate || null,
    completed: false,
    status: TaskStatus.TODO,
    createdAt: Date.now(),
  };
}

export function createInitialTodos(): Todo[] {
  return [
    {
      id: crypto.randomUUID(),
      title: "完成项目文档",
      category: "工作",
      priority: Priority.HIGH,
      dueDate: "2026-05-30",
      completed: false,
      status: TaskStatus.IN_PROGRESS,
      createdAt: Date.now() - 300000,
    },
    {
      id: crypto.randomUUID(),
      title: "学习 TypeScript 泛型",
      category: "学习",
      priority: Priority.MEDIUM,
      dueDate: null,
      completed: false,
      status: TaskStatus.TODO,
      createdAt: Date.now() - 200000,
    },
    {
      id: crypto.randomUUID(),
      title: "跑步 30 分钟",
      category: "健康",
      priority: Priority.LOW,
      dueDate: "2026-05-25",
      completed: true,
      status: TaskStatus.DONE,
      createdAt: Date.now() - 100000,
    },
  ];
}

export function todoReducer(todos: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "ADD_TODO":
      return [...todos, createTodo(action.payload)];

    case "DELETE_TODO":
      return todos.filter((t) => t.id !== action.payload.id);

    case "UPDATE_TODO":
      return todos.map((t) =>
        t.id === action.payload.id
          ? { ...t, ...action.payload.data, title: action.payload.data.title.trim(), dueDate: action.payload.data.dueDate || null }
          : t,
      );

    case "TOGGLE_COMPLETE": {
      return todos.map((t) => {
        if (t.id !== action.payload.id) return t;
        const completed = !t.completed;
        return { ...t, completed, status: completed ? TaskStatus.DONE : TaskStatus.TODO };
      });
    }

    case "CHANGE_STATUS":
      return todos.map((t) => {
        if (t.id !== action.payload.id) return t;
        const status = action.payload.status;
        return { ...t, status, completed: status === TaskStatus.DONE };
      });

    default:
      return todos;
  }
}
