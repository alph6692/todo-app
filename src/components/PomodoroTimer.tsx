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

// ========== 白噪音生成器 ==========

function createNoise(type: NoiseType): (() => void) {
  const ctx = new AudioContext();
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.3;
  masterGain.connect(ctx.destination);

  const cleanupFns: (() => void)[] = [];

  if (type === "rain") {
    // 褐噪声 + 低通滤波器模拟雨声
    const bufferSize = 4096;
    const node = ctx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0;
    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        output[i] = lastOut * 1.5;
      }
    };
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    node.connect(filter);
    filter.connect(masterGain);
    cleanupFns.push(() => { node.disconnect(); filter.disconnect(); });
  }

  if (type === "cafe") {
    // 低频嗡嗡 + 稀疏高频
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = 60;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.15;
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start();
    cleanupFns.push(() => { osc.stop(); osc.disconnect(); oscGain.disconnect(); });

    // 间歇性杯碟碰撞
    let running = true;
    function clink() {
      if (!running) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 2000 + Math.random() * 3000;
      g.gain.setValueAtTime(0.1, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.connect(g);
      g.connect(masterGain);
      o.start(t);
      o.stop(t + 0.2);
      setTimeout(clink, 2000 + Math.random() * 4000);
    }
    clink();
    cleanupFns.push(() => { running = false; });
  }

  if (type === "forest") {
    // 粉红噪声 + 鸟鸣
    const bufferSize = 4096;
    const node = ctx.createScriptProcessor(bufferSize, 1, 1);
    let b0 = 0, b1 = 0, b2 = 0;
    node.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.969 * b2 + white * 0.153852;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
      }
    };
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1500;
    filter.Q.value = 0.5;
    node.connect(filter);
    filter.connect(masterGain);
    cleanupFns.push(() => { node.disconnect(); filter.disconnect(); });

    // 间歇鸟鸣
    let running = true;
    function chirp() {
      if (!running) return;
      const t = ctx.currentTime;
      const freq = 2500 + Math.random() * 2000;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(freq, t);
      o.frequency.linearRampToValueAtTime(freq * 1.3, t + 0.08);
      o.frequency.linearRampToValueAtTime(freq * 0.9, t + 0.16);
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      o.connect(g);
      g.connect(masterGain);
      o.start(t);
      o.stop(t + 0.25);
      setTimeout(chirp, 3000 + Math.random() * 6000);
    }
    chirp();
    cleanupFns.push(() => { running = false; });
  }

  return () => {
    cleanupFns.forEach((fn) => fn());
    masterGain.disconnect();
    ctx.close();
  };
}

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
  const noiseCleanupRef = useRef<(() => void) | null>(null);

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
    if (noiseCleanupRef.current) {
      noiseCleanupRef.current();
      noiseCleanupRef.current = null;
    }
    if (activeNoise === type) {
      setActiveNoise(null);
    } else {
      setActiveNoise(type);
      noiseCleanupRef.current = createNoise(type);
    }
  }

  // 清理白噪音
  useEffect(() => {
    return () => {
      if (noiseCleanupRef.current) noiseCleanupRef.current();
    };
  }, []);

  const noiseOptions: { type: NoiseType; label: string; emoji: string }[] = [
    { type: "rain", label: "雨声", emoji: "🌧" },
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
