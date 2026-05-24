import { useTodoContext } from "../context/TodoContext";
import "./TaskProgress.css";

export default function TaskProgress() {
  const { todos } = useTodoContext();

  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const active = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  // SVG 环形进度参数
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="progress">
      <div className="progress__ring-container">
        <svg className="progress__ring" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b6b" />
              <stop offset="100%" stopColor="#ffd93d" />
            </linearGradient>
          </defs>
          <circle
            className="progress__ring-bg"
            cx="60" cy="60" r={radius}
            fill="none" stroke="#fce4e4" strokeWidth="8"
          />
          <circle
            className="progress__ring-fill"
            cx="60" cy="60" r={radius}
            fill="none" stroke="url(#ringGradient)" strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="progress__ring-text">
          <span className="progress__ring-percent">{percent}%</span>
          <span className="progress__ring-label">完成率</span>
        </div>
      </div>

      <div className="progress__stats">
        <div className="progress__stat">
          <span className="progress__stat-num">{total}</span>
          <span className="progress__stat-label">全部</span>
        </div>
        <div className="progress__stat">
          <span className="progress__stat-num progress__stat-num--active">{active}</span>
          <span className="progress__stat-label">进行中</span>
        </div>
        <div className="progress__stat">
          <span className="progress__stat-num progress__stat-num--done">{completed}</span>
          <span className="progress__stat-label">已完成</span>
        </div>
      </div>

      <div className="progress__bar-track">
        <div
          className="progress__bar-fill"
          style={{ width: `${percent}%`, transition: "width 0.5s ease" }}
        />
      </div>
    </div>
  );
}
