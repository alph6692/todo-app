import { useState, useEffect } from "react";
import { useTodoContext } from "../context/TodoContext";
import { TodoStatus, SortBy } from "../types/todo";
import { CATEGORIES } from "../constants/categories";
import { useFilteredTodos } from "../hooks/useFilteredTodos";
import "./FilterBar.css";

export default function FilterBar() {
  const { filter, setFilter } = useTodoContext();
  const filteredTodos = useFilteredTodos();
  const [searchInput, setSearchInput] = useState(filter.searchQuery);

  // 搜索防抖 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter((prev) => ({ ...prev, searchQuery: searchInput }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, setFilter]);

  return (
    <div className="filter-bar">
      <div className="filter-bar__row">
        <div className="filter-bar__status">
          {[
            { key: TodoStatus.ALL, label: "全部" },
            { key: TodoStatus.ACTIVE, label: "进行中" },
            { key: TodoStatus.COMPLETED, label: "已完成" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`filter-bar__status-btn ${filter.status === key ? "filter-bar__status-btn--active" : ""}`}
              onClick={() => setFilter((prev) => ({ ...prev, status: key }))}
            >
              {label}
            </button>
          ))}
        </div>

        <span className="filter-bar__count">
          共 {filteredTodos.length} 项
        </span>
      </div>

      <div className="filter-bar__row">
        <select
          className="filter-bar__select"
          value={filter.category}
          onChange={(e) => setFilter((prev) => ({ ...prev, category: e.target.value }))}
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <input
          className="filter-bar__search"
          type="text"
          placeholder="搜索..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />

        <select
          className="filter-bar__select"
          value={filter.sortBy}
          onChange={(e) => setFilter((prev) => ({ ...prev, sortBy: e.target.value as SortBy }))}
        >
          <option value={SortBy.DATE}>按日期</option>
          <option value={SortBy.PRIORITY}>按优先级</option>
        </select>
      </div>
    </div>
  );
}
