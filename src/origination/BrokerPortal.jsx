import React, { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─── Mock Data ───────────────────────────────────────────
const STAGES = ["Application", "DIP", "Underwriting", "Offered", "Completed"];

const MOCK_CASES = [
  { ref: "WP-2026-0041", customer: "James Thornton", amount: 285000, product: "2yr Fix 4.29%", stage: "Offered", sla: "On Track", updated: "10 Apr 2026" },
  { ref: "WP-2026-0039", customer: "Sarah & David Kim", amount: 425000, product: "5yr Fix 4.09%", stage: "Underwriting", sla: "On Track", updated: "09 Apr 2026" },
  { ref: "WP-2026-0037", customer: "Priya Patel", amount: 310000, product: "Tracker 3.89%", stage: "DIP", sla: "At Risk", updated: "08 Apr 2026" },
  { ref: "WP-2026-0035", customer: "Marcus O'Brien", amount: 520000, product: "5yr Fix 4.09%", stage: "Completed", sla: "On Track", updated: "07 Apr 2026" },
  { ref: "WP-2026-0033", customer: "Elena Vasquez", amount: 195000, product: "2yr Fix 4.29%", stage: "Application", sla: "On Track", updated: "06 Apr 2026" },
  { ref: "WP-2026-0030", customer: "Tom & Lucy Hayes", amount: 375000, product: "BTL 5.19%", stage: "Offered", sla: "Breached", updated: "04 Apr 2026" },
  { ref: "WP-2026-0028", customer: "Anika Sharma", amount: 290000, product: "2yr Fix 4.29%", stage: "Completed", sla: "On Track", updated: "02 Apr 2026" },
  { ref: "WP-2026-0025", customer: "Robert Chen", amount: 460000, product: "Tracker 3.89%", stage: "Underwriting", sla: "At Risk", updated: "01 Apr 2026" },
];

const COMMISSION_ROWS = [
  { ref: "WP-2026-0035", customer: "Marcus O'Brien", amount: 520000, product: "5yr Fix", rate: "0.40%", commission: 2080, status: "Paid", date: "07 Apr 2026" },
  { ref: "WP-2026-0028", customer: "Anika Sharma", amount: 290000, product: "2yr Fix", rate: "0.35%", commission: 1015, status: "Paid", date: "02 Apr 2026" },
  { ref: "WP-2026-0022", customer: "Ben Foster", amount: 340000, product: "5yr Fix", rate: "0.40%", commission: 1360, status: "Paid", date: "26 Mar 2026" },
  { ref: "WP-2026-0019", customer: "Claire Dunn", amount: 275000, product: "Tracker", rate: "0.35%", commission: 963, status: "Processing", date: "22 Mar 2026" },
  { ref: "WP-2026-0016", customer: "Nabil Haq", amount: 415000, product: "BTL", rate: "0.45%", commission: 1868, status: "Paid", date: "18 Mar 2026" },
  { ref: "WP-2026-0013", customer: "Fiona McLeod", amount: 380000, product: "2yr Fix", rate: "0.35%", commission: 1330, status: "Paid", date: "14 Mar 2026" },
  { ref: "WP-2026-0010", customer: "George Ellis", amount: 510000, product: "5yr Fix", rate: "0.40%", commission: 2040, status: "Pending", date: "10 Mar 2026" },
  { ref: "WP-2026-0007", customer: "Hannah Lee", amount: 295000, product: "Tracker", rate: "0.35%", commission: 1033, status: "Paid", date: "05 Mar 2026" },
  { ref: "WP-2026-0004", customer: "Ian Watts", amount: 450000, product: "BTL", rate: "0.45%", commission: 2025, status: "Pending", date: "28 Feb 2026" },
  { ref: "WP-2026-0001", customer: "Jane Kowalski", amount: 360000, product: "2yr Fix", rate: "0.35%", commission: 1260, status: "Paid", date: "21 Feb 2026" },
];

const PRODUCTS = [
  { name: "2 Year Fixed", rate: "4.29%", ltv: "90%", color: T.primary, features: ["Fee-free option available", "Portable to new property", "Early repayment at 2% of balance"], eligibility: "Employed & Self-Employed" },
  { name: "5 Year Fixed", rate: "4.09%", ltv: "85%", color: T.accent, features: ["Rate security for 5 years", "Free valuation included", "Cashback on completion"], eligibility: "Employed & Self-Employed" },
  { name: "Tracker (BBR +0.89%)", rate: "3.89%", ltv: "80%", color: "#6366F1", features: ["No early repayment charges", "Tracks Bank Rate automatically", "Switch to fixed anytime"], eligibility: "All employment types" },
  { name: "Buy to Let", rate: "5.19%", ltv: "75%", color: "#F59E0B", features: ["Interest-only available", "Portfolio landlord accepted", "Top-slicing considered"], eligibility: "Min 1 property owned" },
  { name: "Green Mortgage", rate: "3.99%", ltv: "90%", color: "#10B981", features: ["Reduced rate for EPC A-C", "Cashback for improvements", "Free energy assessment"], eligibility: "EPC Rating A-C required" },
  { name: "First-Time Buyer", rate: "4.19%", ltv: "95%", color: "#EC4899", features: ["95% LTV available", "No arrangement fee", "Free legal advice included"], eligibility: "First-time buyers only" },
];

// ─── Helpers ─────────────────────────────────────────────
const fmt = n => "£" + Number(n).toLocaleString("en-GB");

const SLABadge = ({ status }) => {
  const map = { "On Track": { bg: T.successBg, color: T.success, border: T.successBorder }, "At Risk": { bg: T.warningBg, color: "#92400E", border: T.warningBorder }, "Breached": { bg: T.dangerBg, color: T.danger, border: T.dangerBorder } };
  const s = map[status] || map["On Track"];
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{status}</span>;
};

const MiniStepper = ({ current }) => {
  const idx = STAGES.indexOf(current);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {STAGES.map((st, i) => (
        <div key={st} title={st} style={{ width: 10, height: 10, borderRadius: "50%", background: i <= idx ? T.primary : T.borderLight, border: i <= idx ? `2px solid ${T.primary}` : `2px solid ${T.border}`, transition: "all 0.2s" }} />
      ))}
    </div>
  );
};

const CommissionStatus = ({ status }) => {
  const map = { Paid: { bg: T.successBg, color: T.success }, Pending: { bg: T.warningBg, color: "#92400E" }, Processing: { bg: "#DBEAFE", color: "#1E40AF" } };
  const s = map[status] || map.Paid;
  return <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: s.bg, color: s.color }}>{status}</span>;
};

// ─── Tabs ────────────────────────────────────────────────
const TABS = [
  { key: "eligibility", label: "Quick Eligibility", icon: "zap" },
  { key: "cases", label: "My Cases", icon: "loans" },
  { key: "commission", label: "Commission", icon: "dollar" },
  { key: "products", label: "Products", icon: "products" },
];

// ─── Eligibility Tab ─────────────────────────────────────
function EligibilityTab() {
  const [loanAmount, setLoanAmount] = useState("320000");
  const [propertyValue, setPropertyValue] = useState("400000");
  const [income, setIncome] = useState("75000");
  const [employment, setEmployment] = useState("Employed");
  const [creditScore, setCreditScore] = useState("Excellent 750+");
  const [product, setProduct] = useState("2yr Fix");

  const result = useMemo(() => {
    const loan = parseFloat(loanAmount) || 0;
    const prop = parseFloat(propertyValue) || 0;
    const inc = parseFloat(income) || 0;
    const ltv = prop > 0 ? ((loan / prop) * 100).toFixed(1) : 0;
    const maxLoan = inc * 4.5;
    const ltvNum = parseFloat(ltv);

    let status = "ELIGIBLE";
    if (loan > maxLoan || ltvNum > 95) status = "INELIGIBLE";
    else if (ltvNum > 85 || creditScore === "Fair 550-649" || employment === "Contractor") status = "REFER";
    if (creditScore === "Poor <550") status = "INELIGIBLE";

    const rateMap = { "2yr Fix": 4.29, "5yr Fix": 4.09, "Tracker": 3.89, "BTL": 5.19 };
    const baseRate = rateMap[product] || 4.29;
    const monthly = loan > 0 ? ((loan * (baseRate / 100 / 12)) / (1 - Math.pow(1 + baseRate / 100 / 12, -300))).toFixed(2) : 0;

    const matchingProducts = [
      { name: "Afin 2yr Fixed", rate: "4.29%", monthly: ((loan * (4.29 / 100 / 12)) / (1 - Math.pow(1 + 4.29 / 100 / 12, -300))).toFixed(2) },
      { name: "Afin 5yr Fixed", rate: "4.09%", monthly: ((loan * (4.09 / 100 / 12)) / (1 - Math.pow(1 + 4.09 / 100 / 12, -300))).toFixed(2) },
      { name: "Afin Tracker", rate: "3.89%", monthly: ((loan * (3.89 / 100 / 12)) / (1 - Math.pow(1 + 3.89 / 100 / 12, -300))).toFixed(2) },
    ];
    if (product === "BTL" || employment !== "Employed") {
      matchingProducts.push({ name: "Afin BTL Special", rate: "5.19%", monthly: ((loan * (5.19 / 100 / 12)) / (1 - Math.pow(1 + 5.19 / 100 / 12, -300))).toFixed(2) });
    }

    return { status, ltv, maxLoan, monthly, matchingProducts };
  }, [loanAmount, propertyValue, income, employment, creditScore, product]);

  const statusColor = { ELIGIBLE: T.success, REFER: "#D97706", INELIGIBLE: T.danger };
  const statusBg = { ELIGIBLE: T.successBg, REFER: T.warningBg, INELIGIBLE: T.dangerBg };

  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 };

  return (
    <div>
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <span style={{ color: T.primary }}>{Ico.zap(20)}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Quick Eligibility Check</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Loan Amount</label>
            <div style={{ display: "flex", alignItems: "center", borderRadius: 9, border: `1px solid ${T.border}`, background: T.card, overflow: "hidden" }}>
              <span style={{ padding: "0 0 0 12px", fontSize: 13, color: T.textMuted }}>£</span>
              <input type="text" value={loanAmount} onChange={e => setLoanAmount(e.target.value)} style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Property Value</label>
            <div style={{ display: "flex", alignItems: "center", borderRadius: 9, border: `1px solid ${T.border}`, background: T.card, overflow: "hidden" }}>
              <span style={{ padding: "0 0 0 12px", fontSize: 13, color: T.textMuted }}>£</span>
              <input type="text" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Income</label>
            <div style={{ display: "flex", alignItems: "center", borderRadius: 9, border: `1px solid ${T.border}`, background: T.card, overflow: "hidden" }}>
              <span style={{ padding: "0 0 0 12px", fontSize: 13, color: T.textMuted }}>£</span>
              <input type="text" value={income} onChange={e => setIncome(e.target.value)} style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Employment Type</label>
            <select value={employment} onChange={e => setEmployment(e.target.value)} style={inputStyle}>
              <option>Employed</option>
              <option>Self-Employed</option>
              <option>Contractor</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Credit Score</label>
            <select value={creditScore} onChange={e => setCreditScore(e.target.value)} style={inputStyle}>
              <option>Excellent 750+</option>
              <option>Good 650-749</option>
              <option>Fair 550-649</option>
              <option>Poor &lt;550</option>
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Product</label>
            <select value={product} onChange={e => setProduct(e.target.value)} style={inputStyle}>
              <option>2yr Fix</option>
              <option>5yr Fix</option>
              <option>Tracker</option>
              <option>BTL</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <Card style={{ marginTop: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Eligibility Result</span>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 18px", borderRadius: 8, fontWeight: 700, fontSize: 14, letterSpacing: 0.5,
              background: statusBg[result.status], color: statusColor[result.status],
              border: `2px solid ${statusColor[result.status]}`,
            }}>
              {result.status === "ELIGIBLE" && Ico.check(16)}
              {result.status === "INELIGIBLE" && Ico.x(16)}
              {result.status === "REFER" && Ico.alert(16)}
              {result.status}
            </span>
          </div>
          <Btn primary icon="arrow">Start DIP</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <div style={{ background: T.bg, borderRadius: 10, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>LTV</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: parseFloat(result.ltv) > 85 ? "#D97706" : T.primary }}>{result.ltv}%</div>
          </div>
          <div style={{ background: T.bg, borderRadius: 10, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Max Loan</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: T.primary }}>{fmt(result.maxLoan)}</div>
          </div>
          <div style={{ background: T.bg, borderRadius: 10, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Monthly Payment</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: T.primary }}>{fmt(result.monthly)}</div>
          </div>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Available Products</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.matchingProducts.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: T.bg, border: `1px solid ${T.borderLight}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: T.primary }}>{Ico.products(16)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{p.name}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.accent }}>{p.rate}</span>
                <span style={{ fontSize: 12, color: T.textMuted }}>{fmt(p.monthly)}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Cases Tab ───────────────────────────────────────────
function CasesTab() {
  const thStyle = { padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left", borderBottom: `2px solid ${T.border}` };
  const tdStyle = { padding: "14px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };

  return (
    <Card noPad>
      <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.primary }}>{Ico.loans(20)}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>My Cases</span>
          <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 4 }}>{MOCK_CASES.length} total</span>
        </div>
        <Btn primary small icon="plus">New Case</Btn>
      </div>
      <div style={{ overflowX: "auto", padding: "16px 0 0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font }}>
          <thead>
            <tr>
              <th style={thStyle}>Case Ref</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Stage</th>
              <th style={thStyle}>Progress</th>
              <th style={thStyle}>SLA</th>
              <th style={thStyle}>Updated</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_CASES.map(c => (
              <tr key={c.ref} style={{ cursor: "pointer", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = T.primaryLight} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ ...tdStyle, fontWeight: 600, color: T.primary }}>{c.ref}</td>
                <td style={tdStyle}>{c.customer}</td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(c.amount)}</td>
                <td style={{ ...tdStyle, fontSize: 12 }}>{c.product}</td>
                <td style={tdStyle}>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: c.stage === "Completed" ? T.successBg : c.stage === "Offered" ? "#DBEAFE" : T.primaryLight, color: c.stage === "Completed" ? T.success : c.stage === "Offered" ? "#1E40AF" : T.primary }}>
                    {c.stage}
                  </span>
                </td>
                <td style={tdStyle}><MiniStepper current={c.stage} /></td>
                <td style={tdStyle}><SLABadge status={c.sla} /></td>
                <td style={{ ...tdStyle, fontSize: 12, color: T.textMuted }}>{c.updated}</td>
                <td style={tdStyle}><Btn small ghost icon="eye">View</Btn></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ─── Commission Tab ──────────────────────────────────────
function CommissionTab() {
  const thStyle = { padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left", borderBottom: `2px solid ${T.border}` };
  const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <KPICard label="Total Earned YTD" value="£48,200" sub="+18% vs last year" color={T.success} />
        <KPICard label="Pipeline" value="£12,400" sub="5 cases in progress" color={T.primary} />
        <KPICard label="Avg per Case" value="£1,850" sub="Above network average" color={T.accent} />
        <KPICard label="Cases Completed" value="26" sub="YTD 2026" color="#6366F1" />
      </div>

      <Card noPad>
        <div style={{ padding: "20px 24px 0", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.primary }}>{Ico.dollar(20)}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Commission History</span>
        </div>
        <div style={{ overflowX: "auto", padding: "16px 0 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font }}>
            <thead>
              <tr>
                <th style={thStyle}>Case Ref</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Loan Amount</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Rate</th>
                <th style={thStyle}>Commission</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {COMMISSION_ROWS.map(r => (
                <tr key={r.ref}>
                  <td style={{ ...tdStyle, fontWeight: 600, color: T.primary }}>{r.ref}</td>
                  <td style={tdStyle}>{r.customer}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{fmt(r.amount)}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{r.product}</td>
                  <td style={tdStyle}>{r.rate}</td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: T.success }}>{fmt(r.commission)}</td>
                  <td style={tdStyle}><CommissionStatus status={r.status} /></td>
                  <td style={{ ...tdStyle, fontSize: 12, color: T.textMuted }}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card style={{ marginTop: 20, background: T.primaryLight, borderColor: T.primary }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{Ico.wallet(20)}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Next payment: £4,200 on 30 Apr 2026</div>
              <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>3 cases pending verification</div>
            </div>
          </div>
          <Btn small icon="download">Download Statement</Btn>
        </div>
      </Card>
    </div>
  );
}

// ─── Products Tab ────────────────────────────────────────
function ProductsTab() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <span style={{ color: T.primary }}>{Ico.products(20)}</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Product Range</span>
        <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 4 }}>Rates effective 10 Apr 2026</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {PRODUCTS.map(p => (
          <Card key={p.name} style={{ position: "relative", overflow: "hidden", padding: 0 }}>
            <div style={{ height: 4, background: p.color }} />
            <div style={{ padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 30, fontWeight: 700, color: p.color, marginBottom: 12 }}>{p.rate}</div>
              <div style={{ marginBottom: 14 }}>
                {p.features.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>
                    <span style={{ color: T.success, marginTop: 1 }}>{Ico.check(14)}</span>
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginBottom: 6 }}>
                <span>Max LTV</span><span style={{ fontWeight: 700, color: T.text }}>{p.ltv}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textMuted, marginBottom: 16 }}>
                <span>Eligibility</span><span style={{ fontWeight: 600, color: T.textSecondary }}>{p.eligibility}</span>
              </div>
              <Btn small primary style={{ width: "100%", justifyContent: "center" }}>Check Eligibility</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function BrokerPortal() {
  const [activeTab, setActiveTab] = useState("eligibility");

  return (
    <div style={{ fontFamily: T.font, background: T.bg, minHeight: "100vh", padding: "0 0 60px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, padding: "32px 40px 24px", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {Ico.shield(22)}
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.3 }}>Afin Broker Portal</div>
              <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>Welcome back, Watson & Partners</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Btn small style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }} icon="bell">Notifications</Btn>
            <Btn small style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }} icon="user">Account</Btn>
          </div>
        </div>
        <div style={{ fontSize: 13, opacity: 0.7, marginLeft: 56 }}>Submit cases, track progress, check eligibility — all in one place</div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: T.card, borderBottom: `1px solid ${T.border}`, padding: "0 40px", display: "flex", gap: 0 }}>
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            display: "flex", alignItems: "center", gap: 7, padding: "14px 22px", fontSize: 13, fontWeight: 600,
            fontFamily: T.font, border: "none", cursor: "pointer", background: "transparent",
            color: activeTab === tab.key ? T.primary : T.textMuted,
            borderBottom: activeTab === tab.key ? `2.5px solid ${T.primary}` : "2.5px solid transparent",
            transition: "all 0.15s",
          }}>
            {Ico[tab.icon]?.(16)}{tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ padding: "24px 40px" }}>
        {activeTab === "eligibility" && <EligibilityTab />}
        {activeTab === "cases" && <CasesTab />}
        {activeTab === "commission" && <CommissionTab />}
        {activeTab === "products" && <ProductsTab />}
      </div>
    </div>
  );
}
