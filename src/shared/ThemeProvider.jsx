import React, { useState, useEffect, createContext, useContext } from "react";

// ─────────────────────────────────────────────
// DARK TOKEN SET
// ─────────────────────────────────────────────
export const DARK_TOKENS = {
  bg: "#0F1419", card: "#1A2028", border: "#2A3440", borderLight: "#232D38",
  primary: "#31B897", primaryDark: "#0C2D3B", primaryLight: "rgba(49,184,151,0.12)",
  primaryGlow: "rgba(49,184,151,0.25)",
  accent: "#31B897",
  success: "#31B897", successBg: "rgba(49,184,151,0.15)", successBorder: "rgba(49,184,151,0.3)",
  warning: "#FFBF00", warningBg: "rgba(255,191,0,0.12)", warningBorder: "rgba(255,191,0,0.3)",
  danger: "#FF6B61", dangerBg: "rgba(255,107,97,0.12)", dangerBorder: "rgba(255,107,97,0.3)",
  text: "#E2E8F0", textSecondary: "#94A3B8", textMuted: "#64748B",
  navy: "#0C2D3B", font: "'DM Sans','SF Pro Display',-apple-system,sans-serif",
};

// ─────────────────────────────────────────────
// DARK MODE CSS (filter-based instant dark mode)
// ─────────────────────────────────────────────
const DARK_STYLE_ID = "nova-dark-mode";

const DARK_CSS = `
  html {
    filter: invert(0.88) hue-rotate(180deg);
    background: #0F1419;
  }
  img, svg, video, [data-preserve-color] {
    filter: invert(1) hue-rotate(180deg);
  }
`;

// ─────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────
export const ThemeContext = createContext({ dark: false, toggle: () => {} });

export const useTheme = () => useContext(ThemeContext);

// ─────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────
export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    try {
      return localStorage.getItem("nova_theme") === "dark";
    } catch {
      return false;
    }
  });

  const toggle = () => setDark(prev => !prev);

  // Persist preference
  useEffect(() => {
    try {
      localStorage.setItem("nova_theme", dark ? "dark" : "light");
    } catch {
      // localStorage unavailable
    }
  }, [dark]);

  // Inject / remove dark mode style tag
  useEffect(() => {
    let styleEl = document.getElementById(DARK_STYLE_ID);

    if (dark) {
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = DARK_STYLE_ID;
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = DARK_CSS;
    } else {
      if (styleEl) {
        styleEl.remove();
      }
    }

    return () => {
      // Cleanup on unmount
      const el = document.getElementById(DARK_STYLE_ID);
      if (el) el.remove();
    };
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
