export enum Priority {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export const PRIORITY_LABEL: Record<Priority, string> = {
  [Priority.HIGH]: "高",
  [Priority.MEDIUM]: "中",
  [Priority.LOW]: "低",
};

export enum TodoStatus {
  ALL = "all",
  ACTIVE = "active",
  COMPLETED = "completed",
}

export enum SortBy {
  DATE = "date",
  PRIORITY = "priority",
}

// 看板任务状态
export enum TaskStatus {
  TODO = "todo",
  IN_PROGRESS = "in-progress",
  DONE = "done",
}

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "待办",
  [TaskStatus.IN_PROGRESS]: "进行中",
  [TaskStatus.DONE]: "已完成",
};

export const KANBAN_COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: TaskStatus.TODO, label: "待办", color: "#ff8e53" },
  { status: TaskStatus.IN_PROGRESS, label: "进行中", color: "#ff6b6b" },
  { status: TaskStatus.DONE, label: "已完成", color: "#6bcb77" },
];

export interface Todo {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  dueDate: string | null;
  completed: boolean;
  status: TaskStatus;
  createdAt: number;
}

export interface TodoFormData {
  title: string;
  category: string;
  priority: Priority;
  dueDate: string;
}

export interface FilterState {
  status: TodoStatus;
  category: string;
  searchQuery: string;
  sortBy: SortBy;
}

export type TodoAction =
  | { type: "ADD_TODO"; payload: TodoFormData }
  | { type: "DELETE_TODO"; payload: { id: string } }
  | { type: "UPDATE_TODO"; payload: { id: string; data: TodoFormData } }
  | { type: "TOGGLE_COMPLETE"; payload: { id: string } }
  | { type: "CHANGE_STATUS"; payload: { id: string; status: TaskStatus } };

export interface TodoContextValue {
  todos: Todo[];
  dispatch: React.Dispatch<TodoAction>;
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  editingId: string | null;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
}
