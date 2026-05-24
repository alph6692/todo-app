import { useState, useEffect, useRef, useCallback } from "react";
import "./PomodoroTimer.css";

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
const WORK_SECS = WORK_MINUTES * 60;
const BREAK_SECS = BREAK_MINUTES * 60;

type Phase = "work" | "break";
type NoiseType = "rain" | "cafe" | "forest" | null;

interface SessionRecord {
  id: string;
  date: string;
  duration: number;
  phase: Phase;
}

const NOISE_FILES: Record<string, string> = {
  rain: "/sounds/rain.wav",
  cafe: "/sounds/cafe.wav",
  forest: "/sounds/forest.wav",
};

// ========== 响铃 ==========

function beep() {
  const ctx = new AudioContext();
  [880, 1100].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.2;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
    gain.gain.linearRampToValueAtTime(0, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

// ========== 组件 ==========

export default function PomodoroTimer() {
  const [phase, setPhase] = useState<Phase>("work");
  const [secondsLeft, setSecondsLeft] = useState(WORK_SECS);
  const [running, setRunning] = useState(false);
  const [activeNoise, setActiveNoise] = useState<NoiseType>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = phase === "work" ? WORK_SECS : BREAK_SECS;
  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = 1 - secondsLeft / totalSeconds;
  const offset = circumference * (1 - progress);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // 记录完成
  const recordSession = useCallback((completedPhase: Phase, duration: number) => {
    const record: SessionRecord = {
      id: crypto.randomUUID(),
      date: new Date().toLocaleString("zh-CN"),
      duration,
      phase: completedPhase,
    };
    setSessions((prev) => [record, ...prev]);
  }, []);

  const tick = useCallback(() => {
    setSecondsLeft((prev) => {
      if (prev <= 1) {
        beep();
        clearTimer();
        setRunning(false);
        if (phase === "work") {
          recordSession("work", WORK_SECS);
          setPhase("break");
          return BREAK_SECS;
        } else {
          recordSession("break", BREAK_SECS);
          setPhase("work");
          return WORK_SECS;
        }
      }
      return prev - 1;
    });
  }, [phase, clearTimer, recordSession]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [running, tick, clearTimer]);

  // 白噪音切换
  function toggleNoise(type: NoiseType) {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (activeNoise === type) {
      setActiveNoise(null);
    } else {
      setActiveNoise(type);
      const audio = new Audio(NOISE_FILES[type]);
      audio.loop = true;
      audio.volume = 0.4;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
  }

  // 清理
  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  const noiseOptions: { type: NoiseType; label: string; emoji: string }[] = [
    { type: "rain", label: "雨声", emoji: "��" },
    { type: "cafe", label: "咖啡馆", emoji: "☕" },
    { type: "forest", label: "森林", emoji: "🌲" },
  ];

  const todaySessions = sessions.filter(
    (s) => s.date.slice(0, 10) === new Date().toLocaleString("zh-CN").slice(0, 10)
  );
  const todayMinutes = Math.round(
    todaySessions.reduce((sum, s) => sum + s.duration, 0) / 60
  );
  const todayPomodoros = todaySessions.filter((s) => s.phase === "work").length;

  return (
    <div className="pomodoro-page">
      {/* 定时器 */}
      <div className={`pomodoro ${phase === "break" ? "pomodoro--break" : ""}`}>
        <h3 className="pomodoro__title">
          {phase === "work" ? "专注时间" : "休息时间"}
        </h3>

        <div className="pomodoro__ring-container">
          <svg className="pomodoro__ring" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="#fce4e4" strokeWidth="6" />
            <circle
              cx="90" cy="90" r={radius}
              fill="none"
              stroke={phase === "work" ? "#ff6b6b" : "#6bcb77"}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 90 90)"
            />
          </svg>
          <div className="pomodoro__time">
            <span className="pomodoro__digits">
              {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
            <span className="pomodoro__phase-label">
              {phase === "work" ? `${WORK_MINUTES} 分钟专注` : `${BREAK_MINUTES} 分钟休息`}
            </span>
          </div>
        </div>

        <div className="pomodoro__buttons">
          <button className="pomodoro__btn pomodoro__btn--primary" onClick={() => setRunning((v) => !v)}>
            {running ? "暂停" : "开始"}
          </button>
          <button className="pomodoro__btn" onClick={() => {
            clearTimer();
            setRunning(false);
            setPhase("work");
            setSecondsLeft(WORK_SECS);
          }}>重置</button>
        </div>
      </div>

      {/* 白噪音 */}
      <div className="noise-panel">
        <h4 className="noise-panel__title">背景白噪音</h4>
        <div className="noise-panel__buttons">
          {noiseOptions.map(({ type, label, emoji }) => (
            <button
              key={type}
              className={`noise-btn ${activeNoise === type ? "noise-btn--active" : ""}`}
              onClick={() => toggleNoise(type)}
            >
              <span className="noise-btn__emoji">{emoji}</span>
              <span className="noise-btn__label">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 今日统计 */}
      <div className="diary">
        <h4 className="diary__title">今日专注</h4>
        <div className="diary__summary">
          <div className="diary__stat">
            <span className="diary__stat-num">{todayPomodoros}</span>
            <span className="diary__stat-label">个番茄</span>
          </div>
          <div className="diary__stat">
            <span className="diary__stat-num">{todayMinutes}</span>
            <span className="diary__stat-label">分钟</span>
          </div>
        </div>

        {todaySessions.length === 0 ? (
          <p className="diary__empty">完成一个番茄后这里会有记录</p>
        ) : (
          <ul className="diary__list">
            {todaySessions.map((s) => (
              <li key={s.id} className="diary__item">
                <span className={`diary__dot ${s.phase === "work" ? "diary__dot--work" : "diary__dot--break"}`} />
                <span className="diary__item-phase">
                  {s.phase === "work" ? "专注" : "休息"}
                </span>
                <span className="diary__item-duration">
                  {Math.round(s.duration / 60)} 分钟
                </span>
                <span className="diary__item-time">
                  {s.date.slice(11)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
