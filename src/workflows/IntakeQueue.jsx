import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, PRODUCT_TYPES } from "../data/customers";

// ─────────────────────────────────────────────
// INTAKE QUEUE — Product-agnostic application intake
// ─────────────────────────────────────────────

const INCOMING_CASES = [
  {
    id: "INQ-001", caseRef: "AFN-2026-00115", customerId: "CUS-007", customerName: "Tom & Lucy Brennan",
    productType: "Mortgage", productName: "2-Year Fixed", bucket: "Prime High LTV", submitted: "09:12 today",
    checks: { kyc: "pending", credit: "pass", avm: "pass", sanctions: "pass", docs: { parsed: 4, total: 6 } },
    aiAssessment: "First-time buyers, dual income, fast-track eligible based on LTI ratio 3.2x.",
  },
  {
    id: "INQ-002", caseRef: "AFN-2026-00142", customerId: "CUS-002", customerName: "James & Sarah Mitchell",
    productType: "Insurance", productName: "Life Cover -- £350k", submitted: "08:45 today",
    checks: { kyc: "pass", credit: "pass", avm: null, sanctions: "pass", docs: { parsed: 2, total: 2 } },
    aiAssessment: "Existing mortgage customer, quote ready for review. Standard health declaration received.",
  },
  {
    id: "INQ-003", caseRef: "AFN-2026-00135", customerId: "CUS-004", customerName: "David Chen",
    productType: "Shared Ownership", productName: "Shared Ownership 40%", submitted: "Yesterday 16:30",
    checks: { kyc: "pass", credit: "pass", avm: "pass", sanctions: "pass", docs: { parsed: 5, total: 7 } },
    aiAssessment: "Platinum customer, awaiting Bristol Housing association response on eligibility.",
  },
  {
    id: "INQ-004", customerId: null, customerName: "Olga Federova",
    productType: "Mortgage", productName: "5-Year Fixed", bucket: "Prime", submitted: "07:55 today",
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

const OPS_CHECKLIST = [
  { id: "kyc", label: "Complete KYC / ID Verification", desc: "Trigger biometric check via Mitek", icon: "shield" },
  { id: "aml", label: "AML & Sanctions Screening", desc: "Run ComplyAdvantage check", icon: "lock" },
  { id: "valuation", label: "Order Valuation", desc: "Instruct surveyor — full or desktop", icon: "search" },
  { id: "solicitor", label: "Instruct Solicitor", desc: "Assign from panel and send instruction pack", icon: "users" },
  { id: "docs", label: "Chase Outstanding Documents", desc: "Request missing docs from broker", icon: "file" },
  { id: "assign", label: "Assign to Underwriter", desc: "Route to UW queue based on mandate and capacity", icon: "zap" },
];

export default function IntakeQueue({ onOpenCase }) {
  const [activeTab, setActiveTab] = useState("All");
  const [processingId, setProcessingId] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

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
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Btn primary small onClick={() => setProcessingId(processingId === c.id ? null : c.id)}>
                  {processingId === c.id ? "Close" : "Start Processing →"}
                </Btn>
              </div>
            </div>

            {/* AI Assessment */}
            <div style={{
              marginTop: 12, padding: "8px 12px", borderRadius: 8,
              background: T.primaryLight, fontSize: 12, color: T.textSecondary,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {Ico.sparkle?.(14) || "✦"}
              <span>{c.aiAssessment}</span>
            </div>

            {/* Ops Processing Panel */}
            {processingId === c.id && (
              <div style={{ marginTop: 14, padding: "16px 18px", borderRadius: 10, background: "#FAFAF8", border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>Processing Checklist — {c.customerName}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {OPS_CHECKLIST.map(item => {
                    const caseChecks = checkedItems[c.id] || {};
                    const done = caseChecks[item.id];
                    // Auto-check items that already passed in the intake checks
                    const autoChecked = (item.id === "kyc" && c.checks.kyc === "pass") || (item.id === "aml" && c.checks.sanctions === "pass");
                    const isChecked = done || autoChecked;
                    return (
                      <div key={item.id}
                        onClick={() => {
                          if (autoChecked) return;
                          setCheckedItems(prev => ({
                            ...prev,
                            [c.id]: { ...(prev[c.id] || {}), [item.id]: !done }
                          }));
                        }}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                          borderRadius: 8, cursor: autoChecked ? "default" : "pointer",
                          background: isChecked ? "#F0FDF4" : T.card,
                          border: `1px solid ${isChecked ? "#A7F3D0" : T.borderLight}`,
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                          background: isChecked ? T.success : "transparent",
                          border: `2px solid ${isChecked ? T.success : T.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 12, fontWeight: 700,
                        }}>
                          {isChecked && "✓"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: isChecked ? T.success : T.navy, textDecoration: isChecked ? "line-through" : "none" }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: T.textMuted }}>{item.desc}</div>
                        </div>
                        {autoChecked && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "#D1FAE5", color: "#065F46" }}>AUTO</span>}
                        {Ico[item.icon]?.(14)}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
                  <Btn small onClick={() => setProcessingId(null)}>Close</Btn>
                  <Btn small primary onClick={() => {
                    if (c.caseRef && onOpenCase) onOpenCase(c.caseRef);
                  }}>Complete & Assign to UW →</Btn>
                </div>
              </div>
            )}
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
