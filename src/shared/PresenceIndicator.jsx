import { useState, useEffect } from "react";
import { T } from "./tokens";

// ─────────────────────────────────────────────
// PRESENCE INDICATOR — Shows other viewers
// ─────────────────────────────────────────────

const MOCK_USERS = [
  { name: "Sarah Chen", role: "Ops Manager", initials: "SC", color: "#6366F1" },
  { name: "James Mitchell", role: "Underwriter", initials: "JM", color: "#0EA5E9" },
  { name: "Amir Hassan", role: "Senior Ops", initials: "AH", color: "#F59E0B" },
  { name: "Tom Walker", role: "Ops Analyst", initials: "TW", color: "#10B981" },
  { name: "Priya Patel", role: "Risk Analyst", initials: "PP", color: "#EC4899" },
];

// Deterministic-ish selection based on screenId
function getViewers(screenId, currentUser) {
  if (!screenId) return [];
  // Simple hash from screenId to decide who's viewing
  let hash = 0;
  for (let i = 0; i < screenId.length; i++) {
    hash = ((hash << 5) - hash + screenId.charCodeAt(i)) | 0;
  }
  const abs = Math.abs(hash);
  const count = abs % 5; // 0-4, but we cap at 2
  if (count > 3) return []; // ~40% chance nobody is viewing

  const viewers = [];
  const shuffled = [...MOCK_USERS].sort((a, b) => {
    const ha = Math.abs(((abs + a.name.charCodeAt(0)) * 31) | 0);
    const hb = Math.abs(((abs + b.name.charCodeAt(0)) * 31) | 0);
    return ha - hb;
  });

  for (const u of shuffled) {
    if (viewers.length >= Math.min(count, 2)) break;
    if (currentUser && u.name.toLowerCase() === currentUser.toLowerCase()) continue;
    viewers.push(u);
  }

  return viewers;
}

function PresenceIndicator({ screenId, currentUser }) {
  const [viewers, setViewers] = useState([]);
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const v = getViewers(screenId, currentUser);
    setViewers(v);
    setMounted(false);
    // Trigger slide-in animation
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [screenId, currentUser]);

  if (viewers.length === 0) return null;

  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "6px 14px", borderRadius: 20,
      background: "rgba(26,74,84,0.06)", border: `1px solid ${T.borderLight}`,
      fontFamily: T.font, fontSize: 12, color: T.textMuted,
      transition: "all 0.3s ease",
      opacity: mounted ? 1 : 0,
      transform: mounted ? "translateY(0)" : "translateY(-8px)",
    }}>
      <style>{`
        @keyframes presenceSlideIn {
          from { opacity: 0; transform: translateX(-10px) scale(0.8); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>

      {/* Stacked avatars */}
      <div style={{ display: "flex", marginRight: -2 }}>
        {viewers.map((v, i) => (
          <div
            key={v.name}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(-1)}
            style={{
              position: "relative",
              width: 28, height: 28, borderRadius: "50%",
              background: v.color, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, letterSpacing: -0.3,
              border: `2px solid ${T.card}`,
              marginLeft: i > 0 ? -8 : 0,
              zIndex: viewers.length - i,
              cursor: "default",
              animation: `presenceSlideIn 0.3s ease ${i * 0.1}s both`,
            }}
          >
            {v.initials}

            {/* Green online dot */}
            <div style={{
              position: "absolute", bottom: -1, right: -1,
              width: 8, height: 8, borderRadius: "50%",
              background: T.success, border: `2px solid ${T.card}`,
            }} />

            {/* Tooltip */}
            {hoveredIdx === i && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: "50%",
                transform: "translateX(-50%)", whiteSpace: "nowrap",
                background: T.primaryDark, color: "#fff",
                padding: "6px 12px", borderRadius: 8, fontSize: 11,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
                zIndex: 100, pointerEvents: "none",
              }}>
                <div style={{ fontWeight: 600 }}>{v.name}</div>
                <div style={{ opacity: 0.7, fontSize: 10, marginTop: 2 }}>{v.role}</div>
                <div style={{
                  position: "absolute", top: -4, left: "50%",
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 8, height: 8, background: T.primaryDark,
                }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Text */}
      <span>
        {viewers.length === 1
          ? <><b style={{ color: T.text, fontWeight: 600 }}>{viewers[0].name}</b> is also viewing</>
          : <><b style={{ color: T.text, fontWeight: 600 }}>{viewers[0].name}</b> and {viewers.length - 1} other{viewers.length - 1 > 1 ? "s" : ""} also viewing</>
        }
      </span>
    </div>
  );
}

export default PresenceIndicator;
