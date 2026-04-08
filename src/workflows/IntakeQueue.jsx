import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, PRODUCT_TYPES } from "../data/customers";

// ─────────────────────────────────────────────
// INTAKE QUEUE — Product-agnostic application intake
// ─────────────────────────────────────────────

const INCOMING_CASES = [
  {
    id: "INQ-001", customerId: "CUS-007", customerName: "Tom & Lucy Brennan",
    productType: "Mortgage", productName: "Afin Fix 2yr 90%", submitted: "09:12 today",
    checks: { kyc: "pending", credit: "pass", avm: "pass", sanctions: "pass", docs: { parsed: 4, total: 6 } },
    aiAssessment: "First-time buyers, dual income, fast-track eligible based on LTI ratio 3.2x.",
  },
  {
    id: "INQ-002", customerId: "CUS-002", customerName: "James & Sarah Mitchell",
    productType: "Insurance", productName: "Life Cover -- £350k", submitted: "08:45 today",
    checks: { kyc: "pass", credit: "pass", avm: null, sanctions: "pass", docs: { parsed: 2, total: 2 } },
    aiAssessment: "Existing mortgage customer, quote ready for review. Standard health declaration received.",
  },
  {
    id: "INQ-003", customerId: "CUS-004", customerName: "David Chen",
    productType: "Shared Ownership", productName: "Shared Ownership 40%", submitted: "Yesterday 16:30",
    checks: { kyc: "pass", credit: "pass", avm: "pass", sanctions: "pass", docs: { parsed: 5, total: 7 } },
    aiAssessment: "Platinum customer, awaiting Bristol Housing association response on eligibility.",
  },
  {
    id: "INQ-004", customerId: null, customerName: "Olga Federova",
    productType: "Mortgage", productName: "Afin Fix 5yr 75%", submitted: "07:55 today",
    checks: { kyc: "warn", credit: "warn", avm: "pass", sanctions: "pass", docs: { parsed: 3, total: 5 } },
    aiAssessment: "New-to-bank applicant. Credit file thin -- may need manual review. AVM supports valuation.",
  },
  {
    id: "INQ-005", customerId: null, customerName: "Fatima Al-Rashid",
    productType: "Savings", productName: "2yr Fixed @ 4.85%", submitted: "Yesterday 14:20",
    checks: { kyc: "pass", credit: null, avm: null, sanctions: "pass", docs: { parsed: 2, total: 2 } },
    aiAssessment: "Large deposit (£75k) -- requires enhanced due diligence sign-off before opening.",
  },
  {
    id: "INQ-006", customerId: "CUS-008", customerName: "Maria Santos",
    productType: "Shared Ownership", productName: "Shared Ownership 50%", submitted: "Yesterday 11:00",
    checks: { kyc: "pass", credit: "pass", avm: "pass", sanctions: "pass", docs: { parsed: 6, total: 6 } },
    aiAssessment: "Platinum customer, all checks clear. Edinburgh HA confirmation pending.",
  },
];

const FILTER_TABS = ["All", "Mortgages", "Savings", "Insurance", "Shared Ownership"];

const checkIcon = (status) => {
  if (status === "pass") return <span style={{ color: T.success, fontWeight: 700 }}>&#10003;</span>;
  if (status === "warn") return <span style={{ color: T.warning, fontWeight: 700 }}>&#9888;</span>;
  if (status === "fail") return <span style={{ color: T.danger, fontWeight: 700 }}>&#10007;</span>;
  if (status === "pending") return <span style={{ color: T.warning, fontWeight: 700 }}>&#9888;</span>;
  return <span style={{ color: T.textMuted }}>--</span>;
};

const ProductBadge = ({ type }) => {
  const pt = PRODUCT_TYPES[type] || PRODUCT_TYPES["Mortgage"];
  return (
    <span style={{
      background: pt.color + "18", color: pt.color, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 6, whiteSpace: "nowrap",
    }}>
      {pt.label}
    </span>
  );
};

const filterType = (tab) => {
  if (tab === "All") return null;
  if (tab === "Mortgages") return "Mortgage";
  if (tab === "Savings") return "Savings";
  if (tab === "Insurance") return "Insurance";
  if (tab === "Shared Ownership") return "Shared Ownership";
  return null;
};

export default function IntakeQueue() {
  const [activeTab, setActiveTab] = useState("All");

  const filtered = activeTab === "All"
    ? INCOMING_CASES
    : INCOMING_CASES.filter(c => {
        const ft = filterType(activeTab);
        return c.productType === ft;
      });

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {Ico.products(22)}
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Intake Queue</h2>
          <div style={{ fontSize: 12, color: T.textMuted }}>All incoming product applications</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="New Today" value="4" sub="applications received" color={T.primary} />
        <KPICard label="Awaiting Triage" value="2" sub="need assignment" color={T.warning} />
        <KPICard label="Auto-Checks Complete" value="3" sub="ready to process" color={T.success} />
        <KPICard label="Avg First Touch" value="14 min" sub="target: 15 min" color={T.accent} />
      </div>

      {/* AI Triage Banner */}
      <Card style={{ background: `linear-gradient(135deg, ${T.primaryLight}, rgba(49,184,151,0.06))`, border: `1px solid ${T.accent}40`, marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          {Ico.sparkle(18)}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: T.primary }}>AI Triage Summary</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
              4 new applications. 2 are mortgages (1 fast-track eligible). 1 shared ownership awaiting housing association response. 1 insurance quote ready for review.
            </div>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: T.font, fontSize: 13, fontWeight: 600,
              background: activeTab === tab ? T.primary : "transparent",
              color: activeTab === tab ? "#fff" : T.textMuted,
              transition: "all 0.15s",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cases */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map(c => (
          <Card key={c.id} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              {/* Left: Customer + Product */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{c.customerName}</span>
                  <ProductBadge type={c.productType} />
                </div>
                <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 4 }}>{c.productName}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Submitted: {c.submitted}</div>
              </div>

              {/* Center: Auto-check badges */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {[
                  { label: "KYC", val: c.checks.kyc },
                  { label: "Credit", val: c.checks.credit },
                  ...(c.productType === "Mortgage" || c.productType === "Shared Ownership" ? [{ label: "AVM", val: c.checks.avm }] : []),
                  { label: "Sanctions", val: c.checks.sanctions },
                ].map(ch => (
                  <span key={ch.label} style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
                    background: ch.val === "pass" ? T.successBg : ch.val === "warn" || ch.val === "pending" ? T.warningBg : ch.val === "fail" ? T.dangerBg : "#F1F1F1",
                    color: ch.val === "pass" ? T.success : ch.val === "warn" || ch.val === "pending" ? T.warning : ch.val === "fail" ? T.danger : T.textMuted,
                  }}>
                    {ch.label} {checkIcon(ch.val)}
                  </span>
                ))}
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 5,
                  background: c.checks.docs.parsed === c.checks.docs.total ? T.successBg : T.warningBg,
                  color: c.checks.docs.parsed === c.checks.docs.total ? T.success : T.warning,
                }}>
                  Docs {c.checks.docs.parsed}/{c.checks.docs.total}
                </span>
              </div>

              {/* Right: Action */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <Btn primary small onClick={() => {}}>Start Processing &rarr;</Btn>
              </div>
            </div>

            {/* AI Assessment */}
            <div style={{
              marginTop: 12, padding: "8px 12px", borderRadius: 8,
              background: T.primaryLight, fontSize: 12, color: T.textSecondary,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {Ico.bot(14)}
              <span>{c.aiAssessment}</span>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Card style={{ textAlign: "center", padding: 40, color: T.textMuted }}>
            No applications in this category.
          </Card>
        )}
      </div>
    </div>
  );
}
