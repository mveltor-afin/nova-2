import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// SAVINGS HUB
// Savings accounts overview and new account options
// ─────────────────────────────────────────────

const MOCK_SAVINGS = [
  { id: "SAV-001", product: "2yr Fixed Saver", balance: "£26,824", rate: "4.85%", maturity: "18 May 2026", interestEarned: "£1,302", status: "Active" },
  { id: "SAV-002", product: "Easy Access Saver", balance: "£8,412", rate: "3.25%", maturity: null, interestEarned: "£273", status: "Active" },
  { id: "SAV-003", product: "90-Day Notice", balance: "£15,000", rate: "4.50%", maturity: null, interestEarned: "£675", status: "Active" },
];

const NEW_ACCOUNT_OPTIONS = [
  { type: "Fixed Term", desc: "Lock in a guaranteed rate", bestRate: "4.95%", term: "1–5 years", minDeposit: "£1,000", icon: "lock", color: "#3B82F6" },
  { type: "Notice Account", desc: "Higher rate, give notice to withdraw", bestRate: "4.60%", term: "30–180 day notice", minDeposit: "£500", icon: "clock", color: "#8B5CF6" },
  { type: "Easy Access", desc: "Withdraw anytime, no penalties", bestRate: "3.35%", term: "No restrictions", minDeposit: "£1", icon: "zap", color: "#059669" },
];

export default function SavingsHub({ savings: propSavings }) {
  const [expandedNew, setExpandedNew] = useState(false);
  const accounts = MOCK_SAVINGS;

  // Calculate totals
  const totalBalance = accounts.reduce((sum, a) => sum + Number(String(a.balance).replace(/[^0-9.]/g, "")), 0);
  const totalInterest = accounts.reduce((sum, a) => sum + Number(String(a.interestEarned).replace(/[^0-9.]/g, "")), 0);

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>Savings</div>
        <div style={{ fontSize: 12, color: T.textMuted }}>Manage your savings accounts</div>
      </div>

      {/* Total balance card */}
      <div style={{
        padding: "20px", borderRadius: 16, marginBottom: 14,
        background: `linear-gradient(135deg, #059669, #047857)`, color: "#fff",
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>Total Savings Balance</div>
        <div style={{ fontSize: 30, fontWeight: 800, marginTop: 4 }}>£{totalBalance.toLocaleString()}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <div>
            <div style={{ fontSize: 9, opacity: 0.7, textTransform: "uppercase" }}>Accounts</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{accounts.length}</div>
          </div>
          <div>
            <div style={{ fontSize: 9, opacity: 0.7, textTransform: "uppercase" }}>Interest This Year</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>£{totalInterest.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Accounts list */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Your Accounts</div>
      {accounts.map((acc, i) => (
        <Card key={acc.id} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{acc.product}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{acc.id}</div>
            </div>
            <div style={{ padding: "3px 8px", borderRadius: 6, background: T.successBg, fontSize: 10, fontWeight: 700, color: T.success }}>
              {acc.status}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ display: "flex", gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Balance</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#059669" }}>{acc.balance}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Rate</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.primary }}>{acc.rate} AER</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {acc.maturity && (
                <>
                  <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Matures</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.navy }}>{acc.maturity}</div>
                </>
              )}
              {!acc.maturity && (
                <div style={{ fontSize: 11, color: T.textMuted }}>No fixed term</div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 10, padding: "8px 0 0", borderTop: `1px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: T.textMuted }}>Interest earned this year</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.success }}>{acc.interestEarned}</span>
          </div>
        </Card>
      ))}

      {/* Interest Summary */}
      <Card style={{ marginBottom: 14, background: `linear-gradient(135deg, ${T.primary}06, ${T.accent}08)`, border: `1px solid ${T.primary}15` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          {Ico.chart(16)}
          <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Interest Summary — 2026</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Total Earned</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.success }}>£{totalInterest.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, padding: "12px", borderRadius: 10, background: "#fff", textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Avg Rate</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: T.primary }}>4.20%</div>
          </div>
        </div>
      </Card>

      {/* Open New Account */}
      <div style={{ fontSize: 12, fontWeight: 700, color: T.navy, marginBottom: 10 }}>Open New Account</div>
      {NEW_ACCOUNT_OPTIONS.map((opt, i) => (
        <div key={i} style={{
          background: "#fff", borderRadius: 14, border: `1px solid ${T.borderLight}`, padding: "16px",
          marginBottom: 10, cursor: "pointer", transition: "all 0.15s",
        }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: opt.color + "14", display: "flex", alignItems: "center", justifyContent: "center", color: opt.color, flexShrink: 0 }}>
              {Ico[opt.icon]?.(18)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{opt.type}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{opt.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: opt.color }}>{opt.bestRate}</div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Best Rate</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <span style={{ fontSize: 10, color: T.textMuted }}>{opt.term}</span>
                <span style={{ fontSize: 10, color: T.textMuted }}>Min: {opt.minDeposit}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* FSCS Badge */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
        borderRadius: 14, background: "#F0FDF4", border: "1px solid #BBF7D0", marginTop: 6,
      }}>
        <div style={{ width: 40, height: 40, borderRadius: 20, background: "#059669", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>
          {Ico.shield(20)}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>FSCS Protected</div>
          <div style={{ fontSize: 11, color: "#065F46", lineHeight: 1.4 }}>Your eligible deposits are protected up to £85,000 by the Financial Services Compensation Scheme.</div>
        </div>
      </div>
    </div>
  );
}
