import { useState } from "react";
import { TodoProvider } from "./context/TodoContext";
import Header from "./components/Header";
import TaskProgress from "./components/TaskProgress";
import TodoForm from "./components/TodoForm";
import FilterBar from "./components/FilterBar";
import TodoList from "./components/TodoList";
import PomodoroTimer from "./components/PomodoroTimer";
import KanbanBoard from "./components/KanbanBoard";
import "./App.css";

type ViewMode = "list" | "kanban" | "pomodoro";

function AppContent() {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="app">
      <Header />

      {/* 视图切换 */}
      <div className="app__toolbar">
        <div className="app__view-toggle">
          {([
            ["list", "列表"],
            ["kanban", "看板"],
            ["pomodoro", "番茄钟"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              className={`app__view-btn ${view === key ? "app__view-btn--active" : ""}`}
              onClick={() => setView(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === "pomodoro" ? (
        <PomodoroTimer />
      ) : (
        <>
          <TaskProgress />
          <TodoForm />
          {view === "list" ? (
            <>
              <FilterBar />
              <TodoList />
            </>
          ) : (
            <KanbanBoard />
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  );
}
