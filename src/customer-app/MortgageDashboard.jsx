import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// MORTGAGE DASHBOARD
// Full mortgage management screen
// ─────────────────────────────────────────────

const PAYMENT_HISTORY = [
  { date: "01 Apr 2026", amount: "£1,450.00", status: "Paid", method: "Direct Debit" },
  { date: "01 Mar 2026", amount: "£1,450.00", status: "Paid", method: "Direct Debit" },
  { date: "01 Feb 2026", amount: "£1,450.00", status: "Paid", method: "Direct Debit" },
  { date: "01 Jan 2026", amount: "£1,450.00", status: "Paid", method: "Direct Debit" },
];

const RATE_SWITCH_OPTIONS = [
  { product: "2-Year Fixed", rate: "4.19%", monthly: "£1,392", saving: "£58/mo", code: "P2F" },
  { product: "5-Year Fixed", rate: "4.59%", monthly: "£1,428", saving: "£22/mo", code: "P5F" },
  { product: "2-Year Tracker", rate: "4.84%", monthly: "£1,450", saving: "£0/mo", code: "PTR" },
];

export default function MortgageDashboard({ mortgage, customer, onNavigate }) {
  const [overpayment, setOverpayment] = useState(100);
  const m = mortgage || {};

  // Parse numeric values from mortgage
  const balance = Number(String(m.balance).replace(/[^0-9.]/g, "")) || 285432;
  const rate = parseFloat(m.rate) || 4.49;
  const payment = Number(String(m.payment).replace(/[^0-9.]/g, "")) || 1450;
  const propertyVal = Number(String(m.propertyValue).replace(/[^0-9.]/g, "")) || 396433;
  const equity = Number(String(m.equity).replace(/[^0-9.]/g, "")) || 111001;
  const termYrs = parseInt(m.term) || 22;

  // Overpayment calculations
  const monthlyRate = rate / 100 / 12;
  const totalMonths = termYrs * 12;
  const totalInterestNormal = (payment * totalMonths) - balance;
  const newPayment = payment + overpayment;
  const newMonths = overpayment > 0 ? Math.ceil(Math.log(newPayment / (newPayment - balance * monthlyRate)) / Math.log(1 + monthlyRate)) : totalMonths;
  const totalInterestOverpay = (newPayment * Math.min(newMonths, totalMonths)) - balance;
  const interestSaved = Math.max(0, totalInterestNormal - totalInterestOverpay);
  const monthsSaved = Math.max(0, totalMonths - newMonths);
  const yearsSaved = Math.floor(monthsSaved / 12);
  const remainingMonthsSaved = monthsSaved % 12;
  const newTermYrs = Math.floor(newMonths / 12);
  const newTermMos = newMonths % 12;

  // Rate expiry check
  const rateEndDate = new Date("2026-06-15");
  const daysToExpiry = Math.max(0, Math.floor((rateEndDate - new Date()) / 86400000));
  const showRateSwitch = daysToExpiry <= 90;

  // LTV for bar
  const ltvPct = Math.round((balance / propertyVal) * 100);

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 16px" }}>
        <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>Mortgage</div>
        <div style={{ fontSize: 12, color: T.textMuted }}>Account {m.id || "M-001234"}</div>
      </div>

      {/* Hero card */}
      <div style={{
        padding: "20px", borderRadius: 16, marginBottom: 14,
        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.5 }}>Outstanding Balance</div>
            <div style={{ fontSize: 30, fontWeight: 800, marginTop: 2 }}>{m.balance || "£285,432"}</div>
          </div>
          <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 700 }}>
            {m.product || "2-Year Fixed"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div><div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Rate</div><div style={{ fontSize: 15, fontWeight: 700 }}>{m.rate || "4.49%"}</div></div>
          <div><div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>LTV</div><div style={{ fontSize: 15, fontWeight: 700 }}>{ltvPct}%</div></div>
          <div><div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Equity</div><div style={{ fontSize: 15, fontWeight: 700 }}>{m.equity || "£111,001"}</div></div>
          <div><div style={{ fontSize: 9, opacity: 0.6, textTransform: "uppercase" }}>Term</div><div style={{ fontSize: 15, fontWeight: 700 }}>{m.term || "22 yrs"}</div></div>
        </div>
      </div>

      {/* Payment section */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Next Payment</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: T.navy }}>{m.payment || "£1,450"}</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{m.nextPayment || "01 May 2026"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 10, background: T.successBg }}>
            {Ico.check(14)}
            <span style={{ fontSize: 12, fontWeight: 600, color: T.success }}>Direct Debit Active</span>
          </div>
        </div>
      </Card>

      {/* Overpayment calculator */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {Ico.zap(16)}
          <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Overpayment Calculator</span>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: T.textMuted }}>Monthly overpayment</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>£{overpayment}</span>
          </div>
          <input
            type="range" min="0" max="500" step="25" value={overpayment}
            onChange={e => setOverpayment(Number(e.target.value))}
            style={{ width: "100%", accentColor: T.primary, height: 6, cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted }}>
            <span>£0</span><span>£500</span>
          </div>
        </div>

        {overpayment > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div style={{ padding: "10px", borderRadius: 10, background: T.successBg, textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Interest Saved</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.success }}>£{Math.round(interestSaved).toLocaleString()}</div>
            </div>
            <div style={{ padding: "10px", borderRadius: 10, background: T.primaryLight, textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>Time Saved</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>{yearsSaved}y {remainingMonthsSaved}m</div>
            </div>
            <div style={{ padding: "10px", borderRadius: 10, background: T.warningBg, textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 2 }}>New Term</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.warning }}>{newTermYrs}y {newTermMos}m</div>
            </div>
          </div>
        )}
      </Card>

      {/* Rate Switch */}
      {showRateSwitch && (
        <Card style={{ marginBottom: 14, padding: 0, overflow: "hidden" }}>
          <div style={{
            padding: "14px 18px",
            background: daysToExpiry <= 30 ? "linear-gradient(135deg, #DC2626, #B91C1C)" : "linear-gradient(135deg, #F59E0B, #D97706)",
            color: "#fff",
          }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>Rate Switch Options</div>
            <div style={{ fontSize: 11, opacity: 0.9 }}>Your current rate expires in {daysToExpiry} days ({m.rateEnd || "15 Jun 2026"})</div>
          </div>
          <div style={{ padding: "14px 18px" }}>
            {RATE_SWITCH_OPTIONS.map((opt, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "12px 0", borderBottom: i < RATE_SWITCH_OPTIONS.length - 1 ? `1px solid ${T.borderLight}` : "none",
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{opt.product}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>Code: {opt.code}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: T.primary }}>{opt.rate}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{opt.monthly}/mo</div>
                  {opt.saving !== "£0/mo" && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.success }}>Save {opt.saving}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Property Value Tracker */}
      <Card style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 14 }}>Property Value</div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Estimated Value</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.navy }}>{m.propertyValue || "£396,433"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Your Equity</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.success }}>{m.equity || "£111,001"}</div>
          </div>
        </div>
        {/* LTV bar */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>
            <span>LTV Ratio</span>
            <span>{ltvPct}%</span>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: T.borderLight, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 5, transition: "width 0.5s ease",
              width: `${ltvPct}%`,
              background: ltvPct <= 60 ? T.success : ltvPct <= 75 ? T.accent : ltvPct <= 85 ? T.warning : T.danger,
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: T.textMuted, marginTop: 2 }}>
            <span>0%</span><span>60%</span><span>75%</span><span>90%</span><span>100%</span>
          </div>
        </div>
      </Card>

      {/* Payment History */}
      <Card>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Payment History</div>
        {PAYMENT_HISTORY.map((p, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", borderBottom: i < PAYMENT_HISTORY.length - 1 ? `1px solid ${T.borderLight}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: T.successBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.success }}>
                {Ico.check(14)}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{p.amount}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{p.date}</div>
              </div>
            </div>
            <div style={{ padding: "3px 8px", borderRadius: 6, background: T.successBg, fontSize: 10, fontWeight: 700, color: T.success }}>
              {p.status}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
