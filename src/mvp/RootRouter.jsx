import { useState } from "react";
import App from "../App.jsx";
import MVPApp from "./MVPApp.jsx";

const MODE_KEY = "nova_mode";

function ModeToggle({ mode, onSwitch }) {
  return (
    <div style={{
      position: "fixed", top: 10, right: 14, zIndex: 99999,
      display: "flex", alignItems: "center",
      background: "rgba(10,17,24,0.88)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
      padding: 3, gap: 2, userSelect: "none",
    }}>
      {["prototype", "mvp"].map(m => (
        <button
          key={m}
          onClick={() => onSwitch(m)}
          style={{
            padding: "5px 13px", borderRadius: 7, border: "none", cursor: "pointer",
            fontSize: 11, fontWeight: mode === m ? 700 : 500, letterSpacing: 0.4,
            fontFamily: "'DM Sans','SF Pro Display',-apple-system,sans-serif",
            background: mode === m ? "rgba(255,255,255,0.13)" : "transparent",
            color: mode === m ? "#fff" : "rgba(255,255,255,0.38)",
            transition: "all 0.15s",
            textTransform: "uppercase",
          }}
        >
          {m === "prototype" ? "Prototype" : "MVP"}
        </button>
      ))}
    </div>
  );
}

export default function RootRouter() {
  const [mode, setMode] = useState(
    () => localStorage.getItem(MODE_KEY) || "prototype"
  );

  const handleSwitch = (m) => {
    localStorage.setItem(MODE_KEY, m);
    setMode(m);
  };

  return (
    <>
      {mode === "prototype" ? <App /> : <MVPApp />}
      <ModeToggle mode={mode} onSwitch={handleSwitch} />
    </>
  );
}
