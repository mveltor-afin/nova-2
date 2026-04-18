import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// PROFILE SCREEN
// Customer profile, settings, and app info
// ─────────────────────────────────────────────

const SETTINGS = [
  { label: "Personal Details", icon: "user", desc: "Name, address, contact info", color: "#3B82F6" },
  { label: "Notification Preferences", icon: "bell", desc: "Email, push, SMS alerts", color: "#8B5CF6" },
  { label: "Security & Privacy", icon: "lock", desc: "Password, 2FA, biometrics", color: "#059669" },
  { label: "Documents", icon: "file", desc: "Uploaded files and statements", color: "#F59E0B" },
  { label: "Help & Support", icon: "messages", desc: "FAQs, contact us, live chat", color: "#EC4899" },
];

export default function ProfileScreen({ customer, onNavigate }) {
  const c = customer || {};

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>Profile</div>
        <div style={{ fontSize: 12, color: T.textMuted }}>Manage your account</div>
      </div>

      {/* Profile card */}
      <div style={{
        padding: "24px 20px", borderRadius: 16, marginBottom: 16, textAlign: "center",
        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 32, margin: "0 auto 12px",
          background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 22, fontWeight: 800,
          border: "2px solid rgba(255,255,255,0.3)",
        }}>
          {c.initials || "JM"}
        </div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{c.name || "James Mitchell"}</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{c.email || "james.mitchell@email.com"}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Member Since</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{c.since || "Feb 2026"}</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
          <div>
            <div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Segment</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{c.segment || "Standard"}</div>
          </div>
          <div style={{ width: 1, background: "rgba(255,255,255,0.2)" }} />
          <div>
            <div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Customer ID</div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{c.id || "CUS-002"}</div>
          </div>
        </div>
      </div>

      {/* Settings list */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Account Settings</div>
      <Card style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        {SETTINGS.map((item, i) => (
          <div key={item.label} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
            borderBottom: i < SETTINGS.length - 1 ? `1px solid ${T.borderLight}` : "none",
            cursor: "pointer", transition: "background 0.15s",
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: item.color + "14",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: item.color,
            }}>
              {Ico[item.icon]?.(16)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>{item.label}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{item.desc}</div>
            </div>
            <div style={{ color: T.textMuted }}>
              {Ico.arrow(14)}
            </div>
          </div>
        ))}
      </Card>

      {/* Quick account info */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Account Overview</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "Mortgage", value: c.mortgage?.id || "M-001234", sub: c.mortgage?.product || "2-Year Fixed" },
            { label: "Application", value: c.application?.id || "AFN-2026-00142", sub: c.application?.status?.replace(/_/g, " ") || "Offer Issued" },
            { label: "Savings Accounts", value: `${c.savings?.length || 1} active`, sub: "FSCS protected" },
          ].map((row, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 0", borderBottom: i < 2 ? `1px solid ${T.borderLight}` : "none",
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{row.label}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{row.sub}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{row.value}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Log out */}
      <Btn danger style={{ width: "100%", justifyContent: "center", padding: "14px 20px", borderRadius: 14, fontSize: 14 }}>
        Log Out
      </Btn>

      {/* App version */}
      <div style={{ textAlign: "center", marginTop: 16, paddingBottom: 8 }}>
        <div style={{ fontSize: 11, color: T.textMuted }}>Nova Customer v1.0.0</div>
        <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>Powered by Nova Platform</div>
      </div>
    </div>
  );
}
