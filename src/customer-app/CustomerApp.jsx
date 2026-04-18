import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import EligibilityScreen from "./EligibilityScreen";
import CaseTracker from "./CaseTracker";
import MortgageDashboard from "./MortgageDashboard";
import SavingsHub from "./SavingsHub";
import MessagingScreen from "./MessagingScreen";
import AIAdviser from "./AIAdviser";
import ProfileScreen from "./ProfileScreen";

// ─────────────────────────────────────────────
// CUSTOMER APP SHELL
// Mobile-first, fintech-style mortgage companion
// ─────────────────────────────────────────────

const MOCK_CUSTOMER = {
  id: "CUS-002", name: "James Mitchell", email: "james.mitchell@email.com",
  since: "Feb 2026", segment: "Standard", initials: "JM",
  mortgage: { id: "M-001234", product: "2-Year Fixed", bucket: "Prime", rate: "4.49%", balance: "£285,432", payment: "£1,450", nextPayment: "01 May 2026", rateEnd: "15 Jun 2026", ltv: "72%", term: "22 yrs", propertyValue: "£396,433", equity: "£111,001", origRef: "AFN-2026-00142" },
  savings: [
    { id: "SAV-001", product: "2yr Fixed @ 4.85%", balance: "£26,824", rate: "4.85%", maturity: "18 May 2026" },
  ],
  application: { id: "AFN-2026-00142", status: "Offer_Issued", product: "2-Year Fixed", amount: "£350,000" },
  notifications: 3,
  messages: 2,
};

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "dashboard" },
  { id: "mortgage", label: "Mortgage", icon: "shield" },
  { id: "savings", label: "Savings", icon: "dollar" },
  { id: "messages", label: "Messages", icon: "messages" },
  { id: "more", label: "More", icon: "settings" },
];

export default function CustomerApp() {
  const [screen, setScreen] = useState("home");
  const [showAI, setShowAI] = useState(false);

  const customer = MOCK_CUSTOMER;

  const renderScreen = () => {
    switch (screen) {
      case "home": return <HomeScreen customer={customer} onNavigate={setScreen} onOpenAI={() => setShowAI(true)} />;
      case "eligibility": return <EligibilityScreen onBack={() => setScreen("home")} />;
      case "tracker": return <CaseTracker application={customer.application} onBack={() => setScreen("home")} />;
      case "mortgage": return <MortgageDashboard mortgage={customer.mortgage} customer={customer} onNavigate={setScreen} />;
      case "savings": return <SavingsHub savings={customer.savings} />;
      case "messages": return <MessagingScreen />;
      case "more": return <ProfileScreen customer={customer} onNavigate={setScreen} />;
      default: return <HomeScreen customer={customer} onNavigate={setScreen} onOpenAI={() => setShowAI(true)} />;
    }
  };

  return (
    <div style={{ fontFamily: T.font, background: "#F8FAF9", minHeight: "100vh", display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto", position: "relative", boxShadow: "0 0 40px rgba(0,0,0,0.08)" }}>
      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 70 }}>
        {renderScreen()}
      </div>

      {/* AI Adviser FAB */}
      <div
        onClick={() => setShowAI(true)}
        style={{
          position: "fixed", bottom: 80, right: "calc(50% - 220px)", width: 52, height: 52, borderRadius: 26,
          background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
          boxShadow: "0 4px 20px rgba(26,74,84,0.3)", cursor: "pointer", zIndex: 100,
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {Ico.sparkle(24)}
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, background: "#fff",
        borderTop: `1px solid ${T.borderLight}`, display: "flex",
        padding: "6px 0 env(safe-area-inset-bottom, 8px)", zIndex: 99,
      }}>
        {NAV_ITEMS.map(item => {
          const active = screen === item.id || (item.id === "home" && ["home", "eligibility", "tracker"].includes(screen));
          return (
            <div key={item.id} onClick={() => setScreen(item.id)} style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              padding: "6px 0", cursor: "pointer", transition: "all 0.15s",
              color: active ? T.primary : T.textMuted,
            }}>
              {Ico[item.icon]?.(20)}
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{item.label}</span>
              {item.id === "messages" && customer.messages > 0 && (
                <div style={{ position: "absolute", top: 2, marginLeft: 14, width: 16, height: 16, borderRadius: 8, background: T.danger, color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{customer.messages}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Adviser overlay */}
      {showAI && <AIAdviser customer={customer} onClose={() => setShowAI(false)} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// HOME SCREEN
// ─────────────────────────────────────────────
function HomeScreen({ customer, onNavigate, onOpenAI }) {
  const m = customer.mortgage;
  const daysToRateEnd = Math.max(0, Math.floor((new Date("2026-06-15") - new Date()) / 86400000));

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {/* Header */}
      <div style={{ padding: "24px 0 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.navy }}>Hello, {customer.name.split(" ")[0]}</div>
          <div style={{ fontSize: 13, color: T.textMuted }}>Your home journey at a glance</div>
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700 }}>
          {customer.initials}
        </div>
      </div>

      {/* Rate expiry alert */}
      {daysToRateEnd <= 90 && (
        <div onClick={() => onNavigate("mortgage")} style={{
          padding: "14px 16px", borderRadius: 14, marginBottom: 16, cursor: "pointer",
          background: daysToRateEnd <= 30 ? "linear-gradient(135deg, #DC2626, #B91C1C)" : "linear-gradient(135deg, #F59E0B, #D97706)",
          color: "#fff",
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Rate expires in {daysToRateEnd} days</div>
          <div style={{ fontSize: 11, opacity: 0.9 }}>Tap to view your rate switch options →</div>
        </div>
      )}

      {/* Mortgage summary card */}
      <div onClick={() => onNavigate("mortgage")} style={{
        padding: "20px", borderRadius: 16, marginBottom: 12, cursor: "pointer",
        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>Mortgage Balance</div>
            <div style={{ fontSize: 28, fontWeight: 800, marginTop: 2 }}>{m.balance}</div>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 700 }}>{m.product}</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div><div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Rate</div><div style={{ fontSize: 15, fontWeight: 700 }}>{m.rate}</div></div>
          <div><div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>LTV</div><div style={{ fontSize: 15, fontWeight: 700 }}>{m.ltv}</div></div>
          <div><div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Monthly</div><div style={{ fontSize: 15, fontWeight: 700 }}>{m.payment}</div></div>
          <div><div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Equity</div><div style={{ fontSize: 15, fontWeight: 700 }}>{m.equity}</div></div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          { label: "Make Overpayment", icon: "plus", color: "#059669", screen: "mortgage" },
          { label: "Rate Switch", icon: "arrow", color: "#3B82F6", screen: "mortgage" },
          { label: "Eligibility Check", icon: "zap", color: "#8B5CF6", screen: "eligibility" },
          { label: "Track Application", icon: "clock", color: "#F59E0B", screen: "tracker" },
        ].map(a => (
          <div key={a.label} onClick={() => onNavigate(a.screen)} style={{
            padding: "16px", borderRadius: 14, background: "#fff", cursor: "pointer",
            border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 10,
            transition: "all 0.15s",
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: a.color + "14", display: "flex", alignItems: "center", justifyContent: "center", color: a.color }}>
              {Ico[a.icon]?.(18)}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{a.label}</span>
          </div>
        ))}
      </div>

      {/* Savings strip */}
      {customer.savings.length > 0 && (
        <div onClick={() => onNavigate("savings")} style={{ padding: "16px 18px", borderRadius: 14, background: "#fff", border: `1px solid ${T.borderLight}`, marginBottom: 12, cursor: "pointer" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 8 }}>Savings</div>
          {customer.savings.map(s => (
            <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{s.product}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Matures: {s.maturity}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#059669" }}>{s.balance}</div>
                <div style={{ fontSize: 10, color: T.textMuted }}>{s.rate} AER</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI insight card */}
      <div onClick={onOpenAI} style={{
        padding: "16px 18px", borderRadius: 14, cursor: "pointer",
        background: `linear-gradient(135deg, ${T.primary}08, ${T.accent}10)`,
        border: `1px solid ${T.primary}20`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          {Ico.sparkle(16)}
          <span style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>AI Adviser</span>
        </div>
        <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>
          Your rate expires soon. If you overpay £200/mo now, you'll save £4,200 in interest and own your home 2 years earlier. Tap to explore options.
        </div>
      </div>

      {/* Next payment */}
      <div style={{ padding: "14px 18px", borderRadius: 14, background: "#fff", border: `1px solid ${T.borderLight}`, marginTop: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Next Payment</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>{m.payment}</div>
            <div style={{ fontSize: 11, color: T.textMuted }}>{m.nextPayment} via Direct Debit</div>
          </div>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: T.successBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.success }}>
            {Ico.check(24)}
          </div>
        </div>
      </div>
    </div>
  );
}
