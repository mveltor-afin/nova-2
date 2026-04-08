import { useState } from "react";
import { T, Ico, STATE_COLOR } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import {
  MOCK_SVC_ACCOUNTS, MOCK_SVC_PAYMENTS, MOCK_SVC_TIMELINE,
  MOCK_VULN_ALERTS, MOCK_RATE_SWITCH_PRODUCTS, ACCOUNT_STATES
} from "../data/servicing";

// ─────────────────────────────────────────────
// HELPER UTILITIES
// ─────────────────────────────────────────────
const fmt = v => v; // values already formatted as strings in mock data
const parseBalance = b => {
  if (!b || b === "—") return 0;
  return parseFloat(b.replace(/[£,]/g, ""));
};
const daysUntil = dateStr => {
  if (!dateStr || dateStr === "SVR" || dateStr === "—") return null;
  const parts = dateStr.split(" ");
  const months = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
  const d = new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
};
const fmtCurrency = n => "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

// ─────────────────────────────────────────────
// STATE BADGE
// ─────────────────────────────────────────────
const StateBadge = ({ state }) => {
  const c = STATE_COLOR[state] || { bg: T.bg, txt: T.textMuted };
  return (
    <span style={{ background: c.bg, color: c.txt, padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: 0.3 }}>
      {state}
    </span>
  );
};

const RiskBadge = ({ risk }) => {
  const colors = { low: { bg: T.successBg, txt: T.success }, medium: { bg: T.warningBg, txt: T.warning }, high: { bg: T.dangerBg, txt: T.danger } };
  const c = colors[risk] || colors.low;
  return (
    <span style={{ background: c.bg, color: c.txt, padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>
      {risk}
    </span>
  );
};

// ─────────────────────────────────────────────
// MOCK DOCUMENTS
// ─────────────────────────────────────────────
const MOCK_DOCUMENTS = [
  { name: "Mortgage Offer", category: "Legal", date: "15 Jan 2024", status: "Signed" },
  { name: "Valuation Report", category: "Property", date: "08 Jan 2024", status: "Complete" },
  { name: "Payment Schedule", category: "Finance", date: "20 Jan 2024", status: "Active" },
  { name: "Insurance Certificate", category: "Insurance", date: "22 Jan 2024", status: "Verified" },
  { name: "Rate Switch Confirmation", category: "Product", date: "10 Mar 2024", status: "Confirmed" },
  { name: "Annual Statement 2025", category: "Statements", date: "01 Jan 2026", status: "Issued" },
];

// ─────────────────────────────────────────────
// ACTION DEFINITIONS
// ─────────────────────────────────────────────
const ACTION_GROUPS = [
  {
    title: "PAYMENT MANAGEMENT", actions: [
      { id: "holiday", label: "Payment Holiday", icon: "clock", desc: "Pause payments for up to 6 months", btn: "Configure" },
      { id: "reschedule", label: "Loan Rescheduling", icon: "chart", desc: "Extend or modify the loan term", btn: "Configure" },
      { id: "fees", label: "Fees & Penalties", icon: "wallet", desc: "View fee schedule and applied charges", btn: "View" },
    ]
  },
  {
    title: "RATE & PRODUCT", actions: [
      { id: "rateswitch", label: "Rate Switch", icon: "arrow", desc: "Switch to a new rate before expiry", btn: "Switch" },
      { id: "ratechange", label: "Interest Rate Changes", icon: "zap", desc: "View base rate impact analysis", btn: "View" },
      { id: "refinance", label: "Refinance / Further Advance", icon: "plus", desc: "Borrow additional funds on property", btn: "Apply" },
    ]
  },
  {
    title: "ACCOUNT LIFECYCLE", actions: [
      { id: "redemption", label: "Redemption", icon: "shield", desc: "Full or partial redemption settlement", btn: "Calculate" },
      { id: "closure", label: "Account Closure", icon: "lock", desc: "Close account after full repayment", btn: "Initiate" },
      { id: "termination", label: "Termination", icon: "x", desc: "Terminate account due to default", btn: "Review" },
      { id: "writeoff", label: "Write-off", icon: "file", desc: "Submit balance for write-off approval", btn: "Submit" },
    ]
  },
  {
    title: "RISK & SUPPORT", actions: [
      { id: "collections", label: "Collections", icon: "alert", desc: "Manage arrears and collections activity", btn: "Manage" },
      { id: "vulnerability", label: "Vulnerability Detection", icon: "eye", desc: "Review vulnerability flags and protocols", btn: "Review" },
      { id: "offset", label: "Offset & Credit", icon: "assign", desc: "Manage linked savings offset", btn: "Configure" },
      { id: "txadj", label: "Transaction Adjustments", icon: "sparkle", desc: "Adjust or reverse transactions", btn: "Adjust" },
    ]
  },
];

// ═════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════
function ServicingScreen({ onViewApplication, initialAccountId }) {
  // ── State ──
  const [selectedAccount, setSelectedAccount] = useState(() =>
    initialAccountId ? MOCK_SVC_ACCOUNTS.find(a => a.id === initialAccountId) || null : null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeAction, setActiveAction] = useState(null);
  const [timelineFilter, setTimelineFilter] = useState("All");

  // Slider states
  const [holidayMonths, setHolidayMonths] = useState(3);
  const [reschedTerm, setReschedTerm] = useState(27);
  const [partialAmount, setPartialAmount] = useState(0);
  const [redemptionMode, setRedemptionMode] = useState("full");
  const [offsetExtra, setOffsetExtra] = useState(0);
  const [furtherAdvance, setFurtherAdvance] = useState(0);

  // ── Derived ──
  const totalBook = MOCK_SVC_ACCOUNTS.reduce((s, a) => s + parseBalance(a.balance), 0);
  const arrearsCount = MOCK_SVC_ACCOUNTS.filter(a => a.state === "Active in Arrears").length;
  const rateExpiringCount = MOCK_SVC_ACCOUNTS.filter(a => { const d = daysUntil(a.rateEnd); return d !== null && d > 0 && d < 90; }).length;
  const vulnCount = MOCK_SVC_ACCOUNTS.filter(a => a.vuln).length;

  const filteredAccounts = searchQuery.trim()
    ? MOCK_SVC_ACCOUNTS.filter(a => {
        const q = searchQuery.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.product.toLowerCase().includes(q);
      })
    : MOCK_SVC_ACCOUNTS;

  // ── Select account ──
  const selectAccount = acc => {
    setSelectedAccount(acc);
    setActiveTab("overview");
    setActiveAction(null);
    setSearchQuery("");
    setSearchFocused(false);
    setRecentAccounts(prev => {
      const filtered = prev.filter(a => a.id !== acc.id);
      return [acc, ...filtered].slice(0, 3);
    });
  };

  // ── AI Recommendations ──
  const getAIRecommendations = acc => {
    if (!acc) return [];
    const recs = [];
    const daysToRate = daysUntil(acc.rateEnd);

    if (daysToRate !== null && daysToRate > 0 && daysToRate < 90) {
      recs.push({
        type: "rate",
        priority: "high",
        icon: "zap",
        text: `Rate expires in ${daysToRate} days. Initiate rate switch to avoid SVR reversion. Recommended: Afin Fix 2yr at 4.29%.`,
        action: "rateswitch"
      });
    }

    if (acc.arrears) {
      const lastFailed = MOCK_SVC_PAYMENTS.find(p => p.status === "Failed");
      recs.push({
        type: "arrears",
        priority: "critical",
        icon: "alert",
        text: `Account is ${acc.arrears} in arrears.${lastFailed ? ` Last payment failed on ${lastFailed.date}.` : ""} Recommend: contact customer within 24h. Vulnerability score: ${MOCK_VULN_ALERTS.find(v => v.account === acc.id)?.score || "N/A"}.`,
        action: "collections"
      });
    }

    if (acc.vuln) {
      const vulnAlert = MOCK_VULN_ALERTS.find(v => v.account === acc.id);
      if (vulnAlert) {
        recs.push({
          type: "vulnerability",
          priority: "high",
          icon: "eye",
          text: `Vulnerability flag active. ${vulnAlert.trigger}. Ensure all communications follow vulnerability protocol.`,
          action: "vulnerability"
        });
      }
    }

    if (!acc.arrears && !acc.vuln && (daysToRate === null || daysToRate >= 90)) {
      recs.push({
        type: "healthy",
        priority: "low",
        icon: "check",
        text: `Account in good standing. No actions required. Next rate review: ${acc.rateEnd}.`,
        action: null
      });
    }

    // Always add DD prediction
    const successProb = acc.aiRisk === "low" ? 98.5 : acc.aiRisk === "medium" ? 89.2 : 62.4;
    recs.push({
      type: "prediction",
      priority: "info",
      icon: "bot",
      text: `AI payment risk prediction for next DD: ${successProb}% success probability.`,
      action: null
    });

    return recs;
  };

  // ── Slider helpers ──
  const sliderStyle = { width: "100%", accentColor: T.primary, height: 6 };
  const bal = selectedAccount ? parseBalance(selectedAccount.balance) : 0;
  const rate = selectedAccount ? parseFloat(selectedAccount.rate) / 100 : 0;
  const monthlyPayment = selectedAccount ? parseBalance(selectedAccount.payment) : 0;

  // ═════════════════════════════════════════════
  // INLINE ACTION CONTENT
  // ═════════════════════════════════════════════
  const renderActionContent = () => {
    if (!activeAction || !selectedAccount) return null;
    const acc = selectedAccount;

    const ActionHeader = ({ title, onClose }) => (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{title}</div>
        <Btn small ghost onClick={onClose} icon="x">Close</Btn>
      </div>
    );

    switch (activeAction) {
      case "holiday": {
        const extraInterest = Math.round(bal * rate * (holidayMonths / 12));
        const termExtension = holidayMonths;
        const newPayment = Math.round(monthlyPayment * (1 + (holidayMonths * 0.008)));
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title="Payment Holiday Configuration" onClose={() => setActiveAction(null)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 8 }}>
                  Holiday Duration: {holidayMonths} month{holidayMonths > 1 ? "s" : ""}
                </label>
                <input type="range" min={1} max={6} value={holidayMonths} onChange={e => setHolidayMonths(+e.target.value)} style={sliderStyle} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
                  <span>1 month</span><span>6 months</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: 14, borderRadius: 8, background: T.warningBg, border: `1px solid ${T.warningBorder}` }}>
                  <div style={{ fontSize: 11, color: T.warning, fontWeight: 600 }}>Extra Interest Accrued</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{fmtCurrency(extraInterest)}</div>
                </div>
                <div style={{ padding: 14, borderRadius: 8, background: T.primaryLight }}>
                  <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>Term Extension</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>+{termExtension} months</div>
                </div>
                <div style={{ padding: 14, borderRadius: 8, background: T.primaryLight }}>
                  <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>New Monthly Payment</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{fmtCurrency(newPayment)}</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn ghost onClick={() => setActiveAction(null)}>Cancel</Btn>
              <Btn primary>Apply Payment Holiday</Btn>
            </div>
          </Card>
        );
      }

      case "reschedule": {
        const currentTerm = parseInt(acc.term);
        const newMonthly = Math.round(monthlyPayment * (currentTerm / reschedTerm));
        const totalBefore = monthlyPayment * currentTerm * 12;
        const totalAfter = newMonthly * reschedTerm * 12;
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title="Loan Rescheduling" onClose={() => setActiveAction(null)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 8 }}>
                  New Term: {reschedTerm} years
                </label>
                <input type="range" min={15} max={35} value={reschedTerm} onChange={e => setReschedTerm(+e.target.value)} style={sliderStyle} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
                  <span>15 years</span><span>35 years</span>
                </div>
              </div>
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ padding: 14, borderRadius: 8, background: T.dangerBg }}>
                    <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>BEFORE</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary }}>Term: {currentTerm} yrs</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{acc.payment}/mo</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 8, background: T.successBg }}>
                    <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>AFTER</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary }}>Term: {reschedTerm} yrs</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>{fmtCurrency(newMonthly)}/mo</div>
                  </div>
                </div>
                <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: T.warningBg, fontSize: 11, color: T.warning, fontWeight: 600 }}>
                  Total cost difference: {fmtCurrency(Math.abs(totalAfter - totalBefore))} {totalAfter > totalBefore ? "more" : "less"}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn ghost onClick={() => setActiveAction(null)}>Cancel</Btn>
              <Btn primary>Apply Rescheduling</Btn>
            </div>
          </Card>
        );
      }

      case "redemption": {
        const erc = bal * 0.02;
        const adminFee = 160;
        const fullSettlement = bal + erc + adminFee;
        const partialSettlement = partialAmount + (partialAmount * 0.02) + adminFee;
        const newBalance = bal - partialAmount;
        const newLTV = Math.round((newBalance / (bal / (parseFloat(acc.ltv) / 100))) * 100);
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title="Redemption Calculator" onClose={() => setActiveAction(null)} />
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
              <Btn small primary={redemptionMode === "full"} ghost={redemptionMode !== "full"} onClick={() => setRedemptionMode("full")}>Full Redemption</Btn>
              <Btn small primary={redemptionMode === "partial"} ghost={redemptionMode !== "partial"} onClick={() => setRedemptionMode("partial")}>Partial Redemption</Btn>
            </div>
            {redemptionMode === "full" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div style={{ padding: 16, borderRadius: 10, background: T.primaryLight }}>
                  <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>Outstanding Balance</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{acc.balance}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 10, background: T.warningBg }}>
                  <div style={{ fontSize: 11, color: T.warning, fontWeight: 600 }}>ERC (2%)</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{fmtCurrency(erc)}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 10, background: T.successBg, border: `2px solid ${T.success}` }}>
                  <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>Total Settlement</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{fmtCurrency(fullSettlement)}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>Incl. £{adminFee} admin fee</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 8 }}>
                    Partial Amount: {fmtCurrency(partialAmount)}
                  </label>
                  <input type="range" min={0} max={bal} step={1000} value={partialAmount} onChange={e => setPartialAmount(+e.target.value)} style={sliderStyle} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
                    <span>£0</span><span>{fmtCurrency(bal)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: T.primaryLight }}>
                    <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>Settlement Amount</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtCurrency(partialSettlement)}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: T.successBg }}>
                    <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>New Balance</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtCurrency(newBalance)}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: T.primaryLight }}>
                    <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>New LTV</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{newLTV}%</div>
                  </div>
                </div>
              </div>
            )}
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn ghost onClick={() => setActiveAction(null)}>Cancel</Btn>
              <Btn primary>Generate Settlement Statement</Btn>
            </div>
          </Card>
        );
      }

      case "rateswitch":
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title="Rate Switch Products" onClose={() => setActiveAction(null)} />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                    {["Product", "Rate", "Monthly", "ERC", "vs Current", ""].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_RATE_SWITCH_PRODUCTS.map((p, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}`, background: p.rec ? T.successBg : "transparent" }}>
                      <td style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: T.textMuted }}>{p.reason}</div>
                        {p.rec && <span style={{ fontSize: 9, fontWeight: 700, background: T.success, color: "#fff", padding: "2px 6px", borderRadius: 4, marginTop: 4, display: "inline-block" }}>AI RECOMMENDED</span>}
                      </td>
                      <td style={{ padding: "12px", fontWeight: 700 }}>{p.rate}</td>
                      <td style={{ padding: "12px" }}>{p.monthly}</td>
                      <td style={{ padding: "12px", fontSize: 12, color: T.textMuted }}>{p.erc}</td>
                      <td style={{ padding: "12px", fontWeight: 600, color: p.saving.includes("+") ? T.success : p.saving.includes("-") ? T.danger : T.text }}>{p.saving}</td>
                      <td style={{ padding: "12px" }}>
                        {!p.name.includes("SVR") && <Btn small primary={p.rec} ghost={!p.rec}>Switch</Btn>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );

      case "fees": {
        const feeSchedule = [
          { name: "Late Payment Fee", amount: "£25", trigger: "Payment >5 days late" },
          { name: "Missed Payment Fee", amount: "£50", trigger: "DD failure" },
          { name: "ERC (Year 1)", amount: "2% of balance", trigger: "Early redemption" },
          { name: "ERC (Year 2)", amount: "1% of balance", trigger: "Early redemption" },
          { name: "Admin Fee", amount: "£160", trigger: "Settlement/closure" },
          { name: "Duplicate Statement", amount: "£10", trigger: "On request" },
        ];
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title="Fees & Penalties" onClose={() => setActiveAction(null)} />
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["Fee", "Amount", "Trigger"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {feeSchedule.map((f, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>{f.name}</td>
                    <td style={{ padding: "10px 12px" }}>{f.amount}</td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: T.textMuted }}>{f.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        );
      }

      case "refinance": {
        const maxAdvance = bal * 0.15;
        const newTotal = bal + furtherAdvance;
        const propValue = bal / (parseFloat(acc.ltv) / 100);
        const newLTV = Math.round((newTotal / propValue) * 100);
        const addlPayment = Math.round((furtherAdvance * rate) / 12);
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title="Refinance / Further Advance" onClose={() => setActiveAction(null)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 8 }}>
                  Further Advance: {fmtCurrency(furtherAdvance)}
                </label>
                <input type="range" min={0} max={Math.round(maxAdvance)} step={1000} value={furtherAdvance} onChange={e => setFurtherAdvance(+e.target.value)} style={sliderStyle} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
                  <span>£0</span><span>{fmtCurrency(Math.round(maxAdvance))}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 8, background: T.primaryLight }}>
                  <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>New Total Balance</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtCurrency(newTotal)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: newLTV > 90 ? T.dangerBg : T.successBg }}>
                  <div style={{ fontSize: 11, color: newLTV > 90 ? T.danger : T.success, fontWeight: 600 }}>New LTV</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{newLTV}%</div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: T.warningBg }}>
                  <div style={{ fontSize: 11, color: T.warning, fontWeight: 600 }}>Additional Monthly</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>+{fmtCurrency(addlPayment)}/mo</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn ghost onClick={() => setActiveAction(null)}>Cancel</Btn>
              <Btn primary>Submit Application</Btn>
            </div>
          </Card>
        );
      }

      case "offset": {
        const linkedSavings = 15000;
        const totalOffset = linkedSavings + offsetExtra;
        const effectiveBalance = Math.max(0, bal - totalOffset);
        const monthlySaving = Math.round((totalOffset * rate) / 12);
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title="Offset & Credit" onClose={() => setActiveAction(null)} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <div style={{ padding: 14, borderRadius: 8, background: T.successBg, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>Linked Savings Balance</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtCurrency(linkedSavings)}</div>
                </div>
                <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 8 }}>
                  What-if additional savings: {fmtCurrency(offsetExtra)}
                </label>
                <input type="range" min={0} max={50000} step={1000} value={offsetExtra} onChange={e => setOffsetExtra(+e.target.value)} style={sliderStyle} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginTop: 4 }}>
                  <span>£0</span><span>£50,000</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: 12, borderRadius: 8, background: T.primaryLight }}>
                  <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>Total Offset</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtCurrency(totalOffset)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: T.successBg }}>
                  <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>Effective Balance</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtCurrency(effectiveBalance)}</div>
                </div>
                <div style={{ padding: 12, borderRadius: 8, background: T.successBg, border: `2px solid ${T.success}` }}>
                  <div style={{ fontSize: 11, color: T.success, fontWeight: 600 }}>Monthly Saving</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{fmtCurrency(monthlySaving)}/mo</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn ghost onClick={() => setActiveAction(null)}>Cancel</Btn>
              <Btn primary>Apply Offset Changes</Btn>
            </div>
          </Card>
        );
      }

      case "ratechange": {
        const scenarios = [
          { change: "-0.25%", newRate: (parseFloat(acc.rate) - 0.25).toFixed(2) + "%", newPayment: fmtCurrency(Math.round(monthlyPayment * 0.97)), impact: "save" },
          { change: "No change", newRate: acc.rate, newPayment: acc.payment, impact: "neutral" },
          { change: "+0.25%", newRate: (parseFloat(acc.rate) + 0.25).toFixed(2) + "%", newPayment: fmtCurrency(Math.round(monthlyPayment * 1.03)), impact: "cost" },
          { change: "+0.50%", newRate: (parseFloat(acc.rate) + 0.50).toFixed(2) + "%", newPayment: fmtCurrency(Math.round(monthlyPayment * 1.06)), impact: "cost" },
        ];
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title="Interest Rate Change Impact" onClose={() => setActiveAction(null)} />
            <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Current rate: {acc.rate} | Product: {acc.product}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {scenarios.map((s, i) => (
                <div key={i} style={{ padding: 16, borderRadius: 10, background: s.impact === "save" ? T.successBg : s.impact === "cost" ? T.dangerBg : T.primaryLight, textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.impact === "save" ? T.success : s.impact === "cost" ? T.danger : T.text }}>{s.change}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.text, margin: "8px 0" }}>{s.newRate}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{s.newPayment}/mo</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn ghost onClick={() => setActiveAction(null)}>Close</Btn>
            </div>
          </Card>
        );
      }

      // Simplified views for remaining actions
      default: {
        const titles = {
          collections: "Collections Management",
          vulnerability: "Vulnerability Detection",
          txadj: "Transaction Adjustments",
          closure: "Account Closure",
          termination: "Termination Review",
          writeoff: "Write-off Submission",
        };
        const vulnAlert = MOCK_VULN_ALERTS.find(v => v.account === acc.id);
        return (
          <Card style={{ marginTop: 16, border: `2px solid ${T.primary}` }}>
            <ActionHeader title={titles[activeAction] || "Action"} onClose={() => setActiveAction(null)} />
            {activeAction === "collections" && acc.arrears && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ padding: 14, borderRadius: 8, background: T.dangerBg }}>
                    <div style={{ fontSize: 11, color: T.danger, fontWeight: 600 }}>Arrears Amount</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{acc.arrears}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 8, background: T.warningBg }}>
                    <div style={{ fontSize: 11, color: T.warning, fontWeight: 600 }}>Account State</div>
                    <div style={{ fontSize: 22, fontWeight: 700 }}>{acc.state}</div>
                  </div>
                  <div style={{ padding: 14, borderRadius: 8, background: T.primaryLight }}>
                    <div style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>AI Risk</div>
                    <div style={{ fontSize: 22, fontWeight: 700, textTransform: "capitalize" }}>{acc.aiRisk}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn primary icon="send">Send Collections Letter</Btn>
                  <Btn ghost icon="clock">Schedule Call</Btn>
                  <Btn ghost icon="chart">Arrange Payment Plan</Btn>
                </div>
              </div>
            )}
            {activeAction === "collections" && !acc.arrears && (
              <div style={{ padding: 20, textAlign: "center", color: T.textMuted }}>No arrears on this account. Collections not applicable.</div>
            )}
            {activeAction === "vulnerability" && vulnAlert && (
              <div>
                <div style={{ padding: 16, borderRadius: 10, background: "#F3E8FF", border: "1px solid #D8B4FE", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "#7C3AED" }}>{Ico.alert(18)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#7C3AED" }}>Vulnerability Alert — Score: {vulnAlert.score}/100</span>
                  </div>
                  <div style={{ fontSize: 13, color: T.text, marginBottom: 6 }}><strong>Trigger:</strong> {vulnAlert.trigger}</div>
                  <div style={{ fontSize: 13, color: T.text, marginBottom: 6 }}><strong>Flag:</strong> {vulnAlert.flag}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>Assigned to: {vulnAlert.assigned} | Status: {vulnAlert.status}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <Btn primary icon="user">Assign Handler</Btn>
                  <Btn ghost icon="file">Log Contact</Btn>
                  <Btn ghost icon="check">Resolve Flag</Btn>
                </div>
              </div>
            )}
            {activeAction === "vulnerability" && !vulnAlert && (
              <div style={{ padding: 20, textAlign: "center", color: T.textMuted }}>No vulnerability flags on this account.</div>
            )}
            {activeAction === "closure" && (
              <div style={{ padding: 20, textAlign: "center" }}>
                <div style={{ color: T.textMuted, marginBottom: 16 }}>Account closure requires zero balance and no outstanding charges.</div>
                <div style={{ fontSize: 13, marginBottom: 16 }}>Current balance: <strong>{acc.balance}</strong></div>
                <Btn primary disabled={bal > 0}>Initiate Closure</Btn>
              </div>
            )}
            {activeAction === "termination" && (
              <div style={{ padding: 20, textAlign: "center" }}>
                <div style={{ color: T.danger, fontWeight: 600, marginBottom: 8 }}>Account Termination</div>
                <div style={{ color: T.textMuted, marginBottom: 16 }}>This action is irreversible. Requires senior manager approval.</div>
                <Btn danger>Submit for Approval</Btn>
              </div>
            )}
            {activeAction === "writeoff" && (
              <div style={{ padding: 20, textAlign: "center" }}>
                <div style={{ color: T.danger, fontWeight: 600, marginBottom: 8 }}>Balance Write-off</div>
                <div style={{ color: T.textMuted, marginBottom: 16 }}>Submit balance of {acc.balance} for write-off committee review.</div>
                <Btn danger>Submit Write-off Request</Btn>
              </div>
            )}
            {activeAction === "txadj" && (
              <div style={{ padding: 20, textAlign: "center" }}>
                <div style={{ color: T.textMuted, marginBottom: 16 }}>Adjust or reverse transactions on this account. All adjustments require dual authorisation.</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  <Btn primary icon="sparkle">New Adjustment</Btn>
                  <Btn ghost icon="clock">View History</Btn>
                </div>
              </div>
            )}
          </Card>
        );
      }
    }
  };

  // ═════════════════════════════════════════════
  // TAB RENDERERS
  // ═════════════════════════════════════════════
  const renderOverviewTab = () => {
    const acc = selectedAccount;
    const daysToRate = daysUntil(acc.rateEnd);
    const vulnAlert = MOCK_VULN_ALERTS.find(v => v.account === acc.id);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Account Details Grid */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Account Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: T.borderLight, borderRadius: 8, overflow: "hidden" }}>
            {[
              ["Account ID", acc.id], ["State", acc.state], ["Product", acc.product], ["Balance", acc.balance],
              ["Rate", acc.rate], ["LTV", acc.ltv], ["Term", acc.term], ["Next Payment", acc.nextPayment],
              ["Rate End", acc.rateEnd], ["Monthly Payment", acc.payment],
              ...(acc.arrears ? [["Arrears", acc.arrears]] : []),
              ["AI Risk Score", acc.aiRisk],
            ].map(([k, v], i) => (
              <div key={i} style={{ padding: "12px 16px", background: T.card }}>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: k === "Arrears" ? T.danger : T.text }}>{v}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* State Machine */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Account State Machine</div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", padding: "8px 0" }}>
            {ACCOUNT_STATES.map((st, i) => {
              const isCurrent = st === acc.state;
              const c = STATE_COLOR[st] || { bg: T.bg, txt: T.textMuted };
              return (
                <div key={st} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    padding: "10px 16px", borderRadius: 8, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
                    background: isCurrent ? c.txt : c.bg,
                    color: isCurrent ? "#fff" : c.txt,
                    border: `2px solid ${isCurrent ? c.txt : "transparent"}`,
                    boxShadow: isCurrent ? `0 0 12px ${c.txt}40` : "none",
                  }}>
                    {st}
                  </div>
                  {i < ACCOUNT_STATES.length - 1 && (
                    <div style={{ width: 28, height: 2, background: T.border, position: "relative" }}>
                      <div style={{ position: "absolute", right: -3, top: -4, fontSize: 10, color: T.textMuted }}>›</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Key Dates */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Key Dates</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 6 }}>Next Payment</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: acc.nextPayment === "OVERDUE" ? T.danger : T.text }}>{acc.nextPayment}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 6 }}>Rate Expiry</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: daysToRate !== null && daysToRate < 90 ? T.warning : T.text }}>{acc.rateEnd}</div>
              {daysToRate !== null && daysToRate > 0 && (
                <div style={{ fontSize: 11, color: daysToRate < 90 ? T.warning : T.textMuted, fontWeight: 600, marginTop: 4 }}>{daysToRate} days</div>
              )}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 6 }}>Account Opened</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Jan 2024</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 6 }}>Last Review</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Mar 2026</div>
            </div>
          </div>
        </Card>

        {/* Vulnerability Alert */}
        {vulnAlert && (
          <Card style={{ background: "#F3E8FF", border: "1px solid #D8B4FE" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ color: "#7C3AED" }}>{Ico.alert(20)}</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#7C3AED" }}>Vulnerability Alert</div>
            </div>
            <div style={{ fontSize: 13, color: T.text, marginBottom: 6 }}><strong>Trigger:</strong> {vulnAlert.trigger}</div>
            <div style={{ fontSize: 13, color: T.text, marginBottom: 6 }}><strong>Assessment:</strong> {vulnAlert.flag}</div>
            <div style={{ fontSize: 13, color: T.text }}><strong>Score:</strong> {vulnAlert.score}/100 | <strong>Status:</strong> {vulnAlert.status} | <strong>Assigned:</strong> {vulnAlert.assigned}</div>
          </Card>
        )}
      </div>
    );
  };

  const renderPaymentsTab = () => {
    const acc = selectedAccount;
    const collectedCount = MOCK_SVC_PAYMENTS.filter(p => p.status === "Collected").length;
    const totalPayments = MOCK_SVC_PAYMENTS.length;
    const ddRate = ((collectedCount / totalPayments) * 100).toFixed(1);
    const overpayments = MOCK_SVC_PAYMENTS.filter(p => p.type === "Overpayment").reduce((s, p) => s + parseBalance(p.amount), 0);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", gap: 16 }}>
          <KPICard label="Monthly Payment" value={acc.payment} color={T.primary} />
          <KPICard label="Next Payment" value={acc.nextPayment} color={acc.nextPayment === "OVERDUE" ? T.danger : T.success} />
          <KPICard label="DD Success Rate" value={ddRate + "%"} color={T.accent} />
          <KPICard label="Overpayments YTD" value={fmtCurrency(overpayments)} color={T.warning} />
        </div>

        <Card noPad>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderLight}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Payment History</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small primary icon="plus">Record Payment</Btn>
              <Btn small ghost icon="dollar">Apply Overpayment</Btn>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Date", "Type", "Amount", "Status", "Reference"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_SVC_PAYMENTS.map((p, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "12px 16px" }}>{p.date}</td>
                  <td style={{ padding: "12px 16px" }}>{p.type}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{p.amount}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: p.status === "Collected" ? T.successBg : T.dangerBg,
                      color: p.status === "Collected" ? T.success : T.danger,
                    }}>{p.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: T.textMuted, fontFamily: "monospace", fontSize: 12 }}>{p.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    );
  };

  const renderActionsTab = () => {
    const acc = selectedAccount;
    const daysToRate = daysUntil(acc.rateEnd);
    const rateExpiringSoon = daysToRate !== null && daysToRate > 0 && daysToRate < 90;

    const getHighlight = actionId => {
      if (actionId === "rateswitch" && rateExpiringSoon) return { border: T.warning, badge: "AI recommended" };
      if (actionId === "collections" && acc.arrears) return { border: T.danger, badge: "Action required" };
      if (actionId === "vulnerability" && acc.vuln) return { border: "#7C3AED", badge: "Flag active" };
      return null;
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {ACTION_GROUPS.map(group => (
          <div key={group.title}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              {group.title}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {group.actions.map(action => {
                const hl = getHighlight(action.id);
                return (
                  <div key={action.id} style={{
                    background: T.card, borderRadius: 12, padding: "16px 18px",
                    border: hl ? `2px solid ${hl.border}` : `1px solid ${T.border}`,
                    boxShadow: hl ? `0 0 16px ${hl.border}20` : "none",
                    display: "flex", alignItems: "center", gap: 14,
                    transition: "all 0.15s",
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                      background: hl ? `${hl.border}15` : T.primaryLight, color: hl ? hl.border : T.primary,
                    }}>
                      {Ico[action.icon]?.(18)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{action.label}</span>
                        {hl && (
                          <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: `${hl.border}20`, color: hl.border }}>
                            {hl.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{action.desc}</div>
                    </div>
                    <Btn small primary={!!hl} ghost={!hl} onClick={() => setActiveAction(activeAction === action.id ? null : action.id)}>
                      {action.btn} →
                    </Btn>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Inline action content */}
        {renderActionContent()}
      </div>
    );
  };

  const renderTimelineTab = () => {
    const catColors = { Payment: T.success, Servicing: T.primary, "AI Alert": T.warning };
    const filtered = timelineFilter === "All" ? MOCK_SVC_TIMELINE : MOCK_SVC_TIMELINE.filter(e => e.cat === timelineFilter);

    return (
      <div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["All", "Payment", "Servicing", "AI Alert"].map(f => (
            <Btn key={f} small primary={timelineFilter === f} ghost={timelineFilter !== f} onClick={() => setTimelineFilter(f)}>{f}</Btn>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {filtered.map((e, i) => {
            const color = catColors[e.cat] || T.textMuted;
            return (
              <div key={i} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 20, paddingTop: 2 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  {i < filtered.length - 1 && <div style={{ width: 2, flex: 1, background: T.borderLight, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: `${color}20`, color }}>{e.cat}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{e.actor}</span>
                    <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto" }}>{e.ts}</span>
                  </div>
                  <div style={{ fontSize: 13, color: T.text }}>{e.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDocumentsTab = () => {
    const statusColors = { Signed: T.success, Complete: T.success, Active: T.primary, Verified: T.success, Confirmed: T.primary, Issued: T.warning };

    return (
      <Card noPad>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Documents</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              {["Document", "Category", "Date", "Status", "Actions"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_DOCUMENTS.map((d, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: T.primary }}>{Ico.file(16)}</span>
                    <span style={{ fontWeight: 600 }}>{d.name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", color: T.textMuted }}>{d.category}</td>
                <td style={{ padding: "12px 16px", color: T.textMuted }}>{d.date}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: `${statusColors[d.status] || T.textMuted}18`, color: statusColors[d.status] || T.textMuted }}>
                    {d.status}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn small ghost icon="eye">View</Btn>
                    <Btn small ghost icon="download">Download</Btn>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    );
  };

  // ═════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "payments", label: "Payments" },
    { id: "actions", label: "Actions" },
    { id: "timeline", label: "Timeline" },
    { id: "documents", label: "Documents" },
  ];

  return (
    <div style={{ fontFamily: T.font, color: T.text, minHeight: "100vh" }}>

      {/* ── SEARCH BAR ── */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "14px 20px",
          background: T.card, borderRadius: 14, border: `1.5px solid ${searchFocused ? T.primary : T.border}`,
          boxShadow: searchFocused ? `0 0 0 3px ${T.primaryGlow}` : "none", transition: "all 0.2s",
        }}>
          <span style={{ color: T.textMuted }}>{Ico.search(20)}</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            placeholder="Search by name, account ID, or product..."
            style={{
              flex: 1, border: "none", outline: "none", fontSize: 15, fontFamily: T.font,
              background: "transparent", color: T.text,
            }}
          />
          {searchQuery && (
            <span onClick={() => setSearchQuery("")} style={{ cursor: "pointer", color: T.textMuted }}>{Ico.x(18)}</span>
          )}
        </div>

        {/* Search dropdown */}
        {searchFocused && searchQuery.trim() && filteredAccounts.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4, zIndex: 100,
            background: T.card, borderRadius: 12, border: `1px solid ${T.border}`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)", maxHeight: 320, overflowY: "auto",
          }}>
            {filteredAccounts.map(acc => {
              const c = STATE_COLOR[acc.state] || { bg: T.bg, txt: T.textMuted };
              return (
                <div key={acc.id} onClick={() => selectAccount(acc)} style={{
                  padding: "12px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                  borderBottom: `1px solid ${T.borderLight}`,
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.txt }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{acc.name}</div>
                    <div style={{ fontSize: 11, color: T.textMuted }}>{acc.id} — {acc.product}</div>
                  </div>
                  <StateBadge state={acc.state} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{acc.balance}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent chips */}
        {recentAccounts.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Recent:</span>
            {recentAccounts.map(acc => (
              <span key={acc.id} onClick={() => selectAccount(acc)} style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: selectedAccount?.id === acc.id ? T.primary : T.card,
                color: selectedAccount?.id === acc.id ? "#fff" : T.text,
                border: `1px solid ${selectedAccount?.id === acc.id ? T.primary : T.border}`,
                transition: "all 0.15s",
              }}>
                {acc.name.split(" ")[0]} — {acc.id}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── PORTFOLIO VIEW (no account selected) ── */}
      {!selectedAccount && (
        <div>
          {/* KPI Strip */}
          <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
            <KPICard label="Total Accounts" value={MOCK_SVC_ACCOUNTS.length} color={T.primary} />
            <KPICard label="Total Book" value={fmtCurrency(totalBook)} color={T.primary} />
            <KPICard label="In Arrears" value={arrearsCount} color={T.danger} sub={arrearsCount > 0 ? "Requires attention" : ""} />
            <KPICard label="Rate Expiring <90d" value={rateExpiringCount} color={T.warning} />
            <KPICard label="Vulnerability Flags" value={vulnCount} color="#7C3AED" />
            <KPICard label="DD Success Rate" value="97.5%" color={T.success} />
          </div>

          {/* Accounts Table */}
          <Card noPad>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderLight}` }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>All Mortgage Accounts</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                    {["Account", "Customer", "Product", "Balance", "Rate", "LTV", "State", "Next Payment", "AI Risk"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_SVC_ACCOUNTS.map(acc => (
                    <tr key={acc.id} onClick={() => selectAccount(acc)} style={{
                      borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "12px 16px", fontFamily: "monospace", fontWeight: 600, fontSize: 12 }}>{acc.id}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{acc.name}</td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: T.textMuted }}>{acc.product}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>{acc.balance}</td>
                      <td style={{ padding: "12px 16px" }}>{acc.rate}</td>
                      <td style={{ padding: "12px 16px" }}>{acc.ltv}</td>
                      <td style={{ padding: "12px 16px" }}><StateBadge state={acc.state} /></td>
                      <td style={{ padding: "12px 16px", color: acc.nextPayment === "OVERDUE" ? T.danger : acc.nextPayment === "SUSPENDED" ? T.warning : T.text, fontWeight: acc.nextPayment === "OVERDUE" || acc.nextPayment === "SUSPENDED" ? 700 : 400 }}>
                        {acc.nextPayment}
                      </td>
                      <td style={{ padding: "12px 16px" }}><RiskBadge risk={acc.aiRisk} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── ACCOUNT VIEW (account selected) ── */}
      {selectedAccount && (
        <div>
          {/* Account Header */}
          <div style={{ marginBottom: 20 }}>
            {/* Back link */}
            <div onClick={() => { setSelectedAccount(null); setActiveAction(null); }} style={{
              display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
              color: T.primary, cursor: "pointer", marginBottom: 14,
            }}>
              {Ico.arrowLeft(16)} All Accounts
            </div>

            <Card style={{ padding: 0 }}>
              <div style={{ padding: "20px 24px" }}>
                {/* Top row: name, id, product + state badges */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 4 }}>{selectedAccount.name}</div>
                    <div style={{ fontSize: 13, color: T.textMuted }}>
                      <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{selectedAccount.id}</span>
                      <span style={{ margin: "0 8px" }}>|</span>
                      {selectedAccount.product}
                      {selectedAccount.originationRef && onViewApplication && (
                        <span onClick={() => onViewApplication(selectedAccount.originationRef)} style={{ marginLeft: 12, color: T.primary, cursor: "pointer", fontWeight: 600 }}>
                          View Origination: {selectedAccount.originationRef}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {selectedAccount.arrears && (
                      <span style={{ background: T.dangerBg, color: T.danger, padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, border: `1px solid ${T.dangerBorder}` }}>
                        Arrears: {selectedAccount.arrears}
                      </span>
                    )}
                    {selectedAccount.vuln && (
                      <span style={{ background: "#F3E8FF", color: "#7C3AED", padding: "5px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "1px solid #D8B4FE" }}>
                        Vulnerability Flag
                      </span>
                    )}
                    <StateBadge state={selectedAccount.state} />
                  </div>
                </div>

                {/* Metric chips */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Balance", value: selectedAccount.balance },
                    { label: "Rate", value: selectedAccount.rate },
                    { label: "LTV", value: selectedAccount.ltv },
                    { label: "Monthly Payment", value: selectedAccount.payment },
                    { label: "Next Payment", value: selectedAccount.nextPayment, color: selectedAccount.nextPayment === "OVERDUE" ? T.danger : null },
                    { label: "Rate End", value: selectedAccount.rateEnd, sub: (() => { const d = daysUntil(selectedAccount.rateEnd); return d !== null && d > 0 ? `${d} days` : null; })(), color: (() => { const d = daysUntil(selectedAccount.rateEnd); return d !== null && d < 90 && d > 0 ? T.warning : null; })() },
                  ].map((m, i) => (
                    <div key={i} style={{ padding: "8px 16px", borderRadius: 8, background: T.bg, minWidth: 100 }}>
                      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 3 }}>{m.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: m.color || T.text }}>{m.value}</div>
                      {m.sub && <div style={{ fontSize: 10, fontWeight: 600, color: m.color || T.textMuted, marginTop: 2 }}>{m.sub}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* AI Actions Panel */}
          <Card style={{
            marginBottom: 20, padding: 0, overflow: "hidden",
            background: `linear-gradient(135deg, ${T.primary}08, ${T.accent}08)`,
            border: `1px solid ${T.primary}30`,
          }}>
            <div style={{ padding: "18px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                  background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, color: "#fff",
                }}>
                  {Ico.sparkle(18)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Nova AI — Recommended Actions</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>Context-specific insights for {selectedAccount.name}</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {getAIRecommendations(selectedAccount).map((rec, i) => {
                  const priorityColors = { critical: T.danger, high: T.warning, low: T.success, info: T.primary };
                  const color = priorityColors[rec.priority] || T.textMuted;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "12px 16px",
                      background: T.card, borderRadius: 10, border: `1px solid ${T.borderLight}`,
                    }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                        background: `${color}15`, color, flexShrink: 0,
                      }}>
                        {Ico[rec.icon]?.(16)}
                      </div>
                      <div style={{ flex: 1, fontSize: 13, color: T.text, lineHeight: 1.5 }}>{rec.text}</div>
                      {rec.action && (
                        <Btn small primary onClick={() => { setActiveTab("actions"); setActiveAction(rec.action); }}>
                          Take Action →
                        </Btn>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: `2px solid ${T.borderLight}` }}>
            {tabs.map(tab => (
              <div key={tab.id} onClick={() => { setActiveTab(tab.id); if (tab.id !== "actions") setActiveAction(null); }} style={{
                padding: "12px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                color: activeTab === tab.id ? T.primary : T.textMuted,
                borderBottom: activeTab === tab.id ? `2px solid ${T.primary}` : "2px solid transparent",
                marginBottom: -2, transition: "all 0.15s",
              }}>
                {tab.label}
              </div>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "payments" && renderPaymentsTab()}
          {activeTab === "actions" && renderActionsTab()}
          {activeTab === "timeline" && renderTimelineTab()}
          {activeTab === "documents" && renderDocumentsTab()}
        </div>
      )}
    </div>
  );
}

export default ServicingScreen;
