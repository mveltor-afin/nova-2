import React, { useEffect, useState } from "react";
import { T } from "./tokens";

function GoalTracker({ persona, current = 0, target = 100, label, sub }) {
  const [animated, setAnimated] = useState(0);

  const pct = target > 0 ? (current / target) * 100 : 0;

  // Color logic
  let color = T.primary;
  let gradientEnd = T.accent;
  if (pct > 100) {
    color = "#D4A017"; // gold
    gradientEnd = "#F5C842";
  } else if (pct > 80) {
    color = T.success;
    gradientEnd = T.accent;
  } else if (pct >= 50) {
    color = T.primary;
    gradientEnd = T.accent;
  } else {
    color = T.warning;
    gradientEnd = "#FFD966";
  }

  // Animate fill on mount
  useEffect(() => {
    const start = performance.now();
    const duration = 800;
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimated(eased * current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current]);

  // SVG geometry
  const size = 60;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const animatedPct = target > 0 ? Math.min(animated / target, 1) : 0;
  const clamped = Math.min(animatedPct, 1);
  const dashOffset = circ * (1 - clamped);

  const gradId = `goalGrad-${String(label || "x").replace(/\W/g, "")}`;

  const formatValue = (v) => {
    const rounded = Math.round(v);
    if (rounded >= 1000) return `${(rounded / 1000).toFixed(1)}k`;
    return rounded.toString();
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: T.font,
        padding: 8,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={gradientEnd} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={T.borderLight}
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.1s linear" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>
            {formatValue(animated)}
          </div>
          <div style={{ fontSize: 8, color: T.textMuted, marginTop: 2, fontWeight: 600 }}>
            / {formatValue(target)}
          </div>
        </div>
      </div>
      {label && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.text,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
      {sub && (
        <div
          style={{
            fontSize: 10,
            color: T.textMuted,
            marginTop: 2,
            textAlign: "center",
          }}
        >
          {sub}
        </div>
      )}
      {pct > 100 && (
        <div
          style={{
            fontSize: 9,
            fontWeight: 800,
            color: "#D4A017",
            marginTop: 4,
            letterSpacing: 0.5,
            textTransform: "uppercase",
          }}
        >
          ★ Goal smashed
        </div>
      )}
    </div>
  );
}

export default GoalTracker;
