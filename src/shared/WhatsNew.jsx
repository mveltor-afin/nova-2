import { useState, useEffect } from "react";
import { T, Ico } from "./tokens";
import { Btn, Card } from "./primitives";

const CURRENT_VERSION = "2.18.0";
const LS_KEY = "nova_whats_new_seen";

const releases = [
  {
    version: "2.18.0",
    date: "17 Apr 2026",
    items: [
      { tag: "New", text: "Broker Help Centre — Product Guide + AI Assistant for brokers. Browse all products, rates, criteria, and ask Nova AI questions." },
      { tag: "New", text: "Product Guide shows live bucket data with rates, accepted dimensions, fees, and pricing tiers" },
      { tag: "New", text: "Ask Nova AI — conversational assistant answering product, eligibility, fee, and document questions" },
    ],
  },
  {
    version: "2.17.0",
    date: "17 Apr 2026",
    items: [
      { tag: "New", text: "Eligibility Calculator now reads Product Buckets — enforces all bucket criteria, shows bucket name, tier, and fees" },
      { tag: "Improved", text: "Pricing Tiers redesigned to styled cards with condition pills and adjustment badges" },
      { tag: "Improved", text: "Criteria, dimensions, and property/employment selectors fully consolidated" },
      { tag: "Fixed", text: "All unicode escape sequences replaced with actual characters (£, ≤, ·, —, –)" },
    ],
  },
  {
    version: "2.4.0",
    date: "9 Apr 2026",
    items: [
      { tag: "New", text: "Smart Apply — conversational 3-phase application flow (5 min submissions)" },
      { tag: "New", text: "Servicing redesign — account-centric with AI-driven action modals" },
      { tag: "New", text: "Customer Hub integrations tab — per-customer Open Banking, Credit Bureau, HMRC status" },
      { tag: "Improved", text: "Mobile responsive layout for iPhone and tablet" },
    ],
  },
  {
    version: "2.3.0",
    date: "7 Apr 2026",
    items: [
      { tag: "New", text: "Customer 360 Hub with gamification (tiers, badges, payment streaks)" },
      { tag: "New", text: "6 product types — Mortgages, Savings, Current Accounts, Insurance, Shared Ownership" },
      { tag: "New", text: "AI Dashboard with cross-product intelligence" },
      { tag: "New", text: "Intake Queue — product-agnostic, AI pre-processed" },
    ],
  },
  {
    version: "2.2.0",
    date: "6 Apr 2026",
    items: [
      { tag: "New", text: "AI Underwriting Assessment — 6-section automated credit analysis" },
      { tag: "New", text: "Pipeline Forecaster with SLA predictions" },
      { tag: "New", text: "Property Intelligence — Zoopla/Rightmove mock integration" },
      { tag: "New", text: "165 CRUD permissions matrix" },
    ],
  },
  {
    version: "2.1.0",
    date: "5 Apr 2026",
    items: [
      { tag: "New", text: "Nova AI Copilot — context-aware assistant on every screen" },
      { tag: "New", text: "Broker Eligibility Calculator" },
      { tag: "New", text: "Collections workflow with kanban pipeline" },
      { tag: "New", text: "4-eyes disbursement authorisation" },
    ],
  },
  {
    version: "2.0.0",
    date: "4 Apr 2026",
    items: [
      { tag: "New", text: "Launch: Nova 2.0 — customer-first architecture" },
      { tag: "New", text: "40+ screens, 6 personas" },
      { tag: "New", text: "AI-native mortgage lending platform" },
    ],
  },
];

const tagColors = {
  New:      { bg: "#D1FAE5", text: "#065F46" },
  Improved: { bg: "#DBEAFE", text: "#1E40AF" },
  Fixed:    { bg: "#FEF3C7", text: "#92400E" },
};

function WhatsNew({ open, onClose }) {
  const [visible, setVisible] = useState(false);

  // Auto-show logic: if no explicit open prop, check localStorage
  useEffect(() => {
    if (open !== undefined) {
      setVisible(open);
      return;
    }
    const seen = localStorage.getItem(LS_KEY);
    if (seen !== CURRENT_VERSION) {
      setVisible(true);
    }
  }, [open]);

  const handleDismiss = () => {
    localStorage.setItem(LS_KEY, CURRENT_VERSION);
    setVisible(false);
    onClose?.();
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(12,45,59,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: T.font,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 520, maxHeight: "85vh", background: T.card,
          borderRadius: 16, border: `1px solid ${T.border}`,
          boxShadow: "0 24px 64px rgba(12,45,59,0.25)",
          display: "flex", flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "24px 28px 20px", borderBottom: `1px solid ${T.borderLight}`,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ color: T.warning }}>{Ico.sparkle(22)}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>What's New in Nova 2.0</div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
            background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, color: "#fff",
          }}>
            v{CURRENT_VERSION}
          </span>
          <button
            onClick={handleDismiss}
            style={{
              background: "none", border: "none", cursor: "pointer", color: T.textMuted,
              padding: 4, display: "flex",
            }}
          >
            {Ico.x(18)}
          </button>
        </div>

        {/* Scrollable release list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {releases.map((rel, ri) => (
            <div key={rel.version} style={{ marginBottom: ri < releases.length - 1 ? 28 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                  background: ri === 0 ? T.primaryLight : "#F1F5F9",
                  color: ri === 0 ? T.primary : T.textMuted,
                  border: ri === 0 ? `1px solid ${T.primary}` : `1px solid ${T.borderLight}`,
                }}>
                  v{rel.version}
                </span>
                <span style={{ fontSize: 12, color: T.textMuted, fontWeight: 500 }}>{rel.date}</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 4 }}>
                {rel.items.map((item, ii) => {
                  const tc = tagColors[item.tag] || tagColors.New;
                  return (
                    <div key={ii} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: T.text, lineHeight: 1.5 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                        background: tc.bg, color: tc.text, whiteSpace: "nowrap", marginTop: 2,
                      }}>
                        {item.tag}
                      </span>
                      <span>{item.text}</span>
                    </div>
                  );
                })}
              </div>

              {ri < releases.length - 1 && (
                <div style={{ borderBottom: `1px solid ${T.borderLight}`, marginTop: 20 }} />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          padding: "16px 28px", borderTop: `1px solid ${T.borderLight}`,
          display: "flex", justifyContent: "flex-end",
        }}>
          <Btn primary onClick={handleDismiss}>Dismiss</Btn>
        </div>
      </div>
    </div>
  );
}

export default WhatsNew;
