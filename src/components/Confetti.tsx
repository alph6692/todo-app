import { useEffect, useState, useRef } from "react";
import "./Confetti.css";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  angle: number;
  distance: number;
  size: number;
  rotation: number;
  delay: number;
}

interface Props {
  active: boolean;
  fullScreen?: boolean;
  onDone?: () => void;
}

const COLORS = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff8e53", "#ff6bcb", "#845ef7", "#20c997"];
const PARTICLE_COUNT = 40;

export default function Confetti({ active, fullScreen, onDone }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const items: Particle[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      items.push({
        id: idRef.current++,
        x: fullScreen ? Math.random() * 100 : 50,
        y: fullScreen ? Math.random() * 40 : 50,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        angle: Math.random() * 360,
        distance: 60 + Math.random() * 120,
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 720 - 360,
        delay: Math.random() * 0.3,
      });
    }
    setParticles(items);

    const timer = setTimeout(() => {
      setParticles([]);
      onDone?.();
    }, 2000);
    return () => clearTimeout(timer);
  }, [active, fullScreen, onDone]);

  if (particles.length === 0) return null;

  return (
    <div className={`confetti ${fullScreen ? "confetti--full" : ""}`}>
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti__particle"
          style={{
            left: `${p.x}%`,
            top: fullScreen ? `${p.y}%` : "50%",
            width: p.size,
            height: p.size * (0.4 + Math.random() * 0.6),
            background: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            "--angle": `${p.angle}deg`,
            "--distance": `${p.distance}px`,
            "--rotation": `${p.rotation}deg`,
            animationDelay: `${p.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
