import React from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// CUSTOMER TRACKER — Application status view
// Direct Customer tracks progress on their apps
// ─────────────────────────────────────────────

const steps = [
  { key: "applied", label: "Applied" },
  { key: "documents", label: "Documents" },
  { key: "verification", label: "Verification" },
  { key: "decision", label: "Decision" },
  { key: "offer", label: "Offer" },
  { key: "legal", label: "Legal" },
  { key: "complete", label: "Complete" },
];

const activeStepIndex = 3; // Decision step (0-indexed) — steps 0-2 complete, step 3 active

const timeline = [
  { event: "Income verified by AI", time: "Today, 09:14", icon: "bot" },
  { event: "Documents uploaded", time: "Yesterday, 15:32", icon: "upload" },
  { event: "Application submitted", time: "12 Apr 2026", icon: "send" },
  { event: "DIP approved", time: "10 Apr 2026", icon: "check" },
  { event: "Account created", time: "8 Apr 2026", icon: "user" },
];

const documents = [
  { name: "Payslip (3 months)", done: true },
  { name: "Bank statements", done: true },
  { name: "P60", done: true },
  { name: "Proof of address", done: false },
];

const teamMembers = [
  { name: "Sarah Thompson", role: "Adviser" },
  { name: "Tom Walker", role: "Case Handler" },
];

// Pulsing keyframe via inline style trick
const pulseKeyframes = `
@keyframes customerTrackerPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(26,74,84,0.3); }
  50% { box-shadow: 0 0 0 8px rgba(26,74,84,0); }
}
`;

export default function CustomerTracker() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px", fontFamily: T.font }}>

      {/* Inject pulse animation */}
      <style>{pulseKeyframes}</style>

      {/* ── Header ── */}
      <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 28, letterSpacing: -0.3 }}>
        My Applications
      </div>

      {/* ── Active Application Card ── */}
      <Card style={{ marginBottom: 24 }}>

        {/* Top Info */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Reference
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>AFN-2026-00128</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Product
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Afin Fix 2yr 75%</div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
              Amount
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>£290,000</div>
          </div>
          <div>
            <span style={{
              display: "inline-block", padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700,
              background: T.warningBg, color: "#92400E",
            }}>
              In Progress
            </span>
          </div>
        </div>

        {/* ── Visual Stepper ── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative" }}>
            {/* Connecting line */}
            <div style={{
              position: "absolute", top: 14, left: 20, right: 20, height: 2, background: T.borderLight, zIndex: 0,
            }} />
            <div style={{
              position: "absolute", top: 14, left: 20, height: 2, zIndex: 1,
              width: `${(activeStepIndex / (steps.length - 1)) * (100 - (40 / 7))}%`,
              background: `linear-gradient(90deg, ${T.success}, ${T.primary})`,
            }} />

            {steps.map((s, i) => {
              const completed = i < activeStepIndex;
              const active = i === activeStepIndex;
              const future = i > activeStepIndex;

              return (
                <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: completed ? T.success : active ? T.primary : T.bg,
                    border: future ? `2px solid ${T.border}` : "none",
                    animation: active ? "customerTrackerPulse 2s infinite" : "none",
                    marginBottom: 8,
                  }}>
                    {completed && <span style={{ color: "#fff" }}>{Ico.check(14)}</span>}
                    {active && <div style={{ width: 8, height: 8, borderRadius: 4, background: "#fff" }} />}
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, textAlign: "center",
                    color: completed ? T.success : active ? T.primary : T.textMuted,
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estimated Completion */}
        <div style={{
          background: T.bg, borderRadius: 10, padding: "12px 16px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ color: T.primary }}>{Ico.clock(16)}</span>
          <span style={{ fontSize: 13, color: T.text }}>
            Estimated completion: <strong>3-5 working days</strong>
          </span>
        </div>

        {/* ── Your Team ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>Your Team</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {teamMembers.map((m) => (
              <div key={m.name} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
                background: T.bg, borderRadius: 10, flex: 1, minWidth: 220,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 18, background: T.primaryLight,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: T.primary,
                }}>
                  {Ico.user(18)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{m.role}</div>
                </div>
                <Btn small ghost icon="messages" onClick={() => {}} style={{ padding: "5px 10px" }}>Message</Btn>
              </div>
            ))}
          </div>
        </div>

        {/* ── What's Needed ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>What's needed from you</div>
          {documents.map((d) => (
            <div key={d.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 0", borderBottom: `1px solid ${T.borderLight}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: d.done ? T.success : T.warning }}>
                  {d.done ? Ico.check(16) : Ico.alert(16)}
                </span>
                <span style={{ fontSize: 13, color: T.text, fontWeight: d.done ? 400 : 600 }}>{d.name}</span>
              </div>
              {d.done ? (
                <span style={{ fontSize: 11, fontWeight: 600, color: T.success }}>Uploaded</span>
              ) : (
                <Btn small primary icon="upload" onClick={() => {}}>Upload</Btn>
              )}
            </div>
          ))}
        </div>

        {/* ── Timeline ── */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>Timeline</div>
          {timeline.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 12, marginBottom: i < timeline.length - 1 ? 0 : 0 }}>
              {/* Vertical line + dot */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: 4, flexShrink: 0, marginTop: 5,
                  background: i === 0 ? T.primary : T.border,
                }} />
                {i < timeline.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: T.borderLight, minHeight: 24 }} />
                )}
              </div>
              <div style={{ paddingBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: T.text }}>{t.event}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{t.time}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Previous Applications ── */}
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 14 }}>Previous Applications</div>
      <Card style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: T.successBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: T.success,
          }}>
            {Ico.dollar(20)}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Savings Account</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>2yr Fixed @ 4.85% — Completed Mar 2024</div>
          </div>
        </div>
        <span style={{
          display: "inline-block", padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700,
          background: T.successBg, color: T.success,
        }}>
          Complete
        </span>
      </Card>
    </div>
  );
}
