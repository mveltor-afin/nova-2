import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Select, Input } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, PRODUCT_TYPES } from "../data/customers";
import { TEAM_MEMBERS } from "../data/loans";
import { MOCK_SURVEYORS } from "../data/valuations";

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

// ─────────────────────────────────────────────
// OPS PROCESSING WIZARD — modal with interactive steps
// ─────────────────────────────────────────────
const WIZARD_STEPS = [
  { id: "kyc", label: "KYC & AML" },
  { id: "valuation", label: "Valuation" },
  { id: "solicitor", label: "Solicitor" },
  { id: "docs", label: "Documents" },
  { id: "confirm", label: "Confirm" },
];

function ProcessingWizard({ caseData, onClose }) {
  const [step, setStep] = useState(0);
  const [kycStatus, setKycStatus] = useState(caseData.checks.kyc === "pass" ? "complete" : null);
  const [amlStatus, setAmlStatus] = useState(caseData.checks.sanctions === "pass" ? "complete" : null);
  const [valuationType, setValuationType] = useState("Full");
  const [selectedSurveyor, setSelectedSurveyor] = useState("");
  const [selectedSolicitor, setSelectedSolicitor] = useState("");
  const [docMessage, setDocMessage] = useState("");
  const [docSent, setDocSent] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const solicitors = TEAM_MEMBERS.solicitors || [];
  const surveyors = MOCK_SURVEYORS || [];
  const currentStep = WIZARD_STEPS[step];

  const inputSt = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(12,45,59,0.55)", backdropFilter: "blur(4px)" }} />
      <div style={{ position: "relative", width: "90vw", maxWidth: 820, maxHeight: "85vh", background: T.card, borderRadius: 18, boxShadow: "0 20px 80px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column", overflow: "hidden" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: "16px 24px", background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Process Application — {caseData.customerName}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{caseData.productName} · {caseData.id}</div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 6, cursor: "pointer", color: "#fff" }}>{Ico.x(18)}</button>
          </div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", padding: "12px 24px", borderBottom: `1px solid ${T.border}`, gap: 0, flexShrink: 0 }}>
          {WIZARD_STEPS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, display: "flex", alignItems: "center" }}>
              <div onClick={() => i <= step && setStep(i)} style={{
                display: "flex", alignItems: "center", gap: 6, cursor: i <= step ? "pointer" : "default",
                padding: "6px 12px", borderRadius: 8,
                background: i === step ? T.primaryLight : "transparent",
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700,
                  background: i < step ? T.success : i === step ? T.primary : T.borderLight,
                  color: i <= step ? "#fff" : T.textMuted,
                }}>{i < step ? "✓" : i + 1}</div>
                <span style={{ fontSize: 12, fontWeight: i === step ? 700 : 500, color: i === step ? T.primary : i < step ? T.success : T.textMuted }}>{s.label}</span>
              </div>
              {i < WIZARD_STEPS.length - 1 && <div style={{ flex: 1, height: 1, background: i < step ? T.success : T.borderLight, margin: "0 4px" }} />}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px 28px" }}>

          {/* Step 1: KYC & AML */}
          {currentStep.id === "kyc" && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Identity Verification & AML Screening</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* KYC */}
                <Card style={{ borderLeft: `4px solid ${kycStatus === "complete" ? T.success : T.warning}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 8 }}>KYC — Biometric ID Check</div>
                  {kycStatus === "complete" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: T.success, fontWeight: 700, fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>Verified — Mitek biometric match 99%</span>
                    </div>
                  ) : kycStatus === "running" ? (
                    <div style={{ fontSize: 13, color: T.warning }}>Running biometric check...</div>
                  ) : (
                    <Btn primary small onClick={() => { setKycStatus("running"); setTimeout(() => setKycStatus("complete"), 2000); }}>
                      Trigger KYC Check
                    </Btn>
                  )}
                </Card>
                {/* AML */}
                <Card style={{ borderLeft: `4px solid ${amlStatus === "complete" ? T.success : T.warning}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 8 }}>AML — Sanctions & PEP Screening</div>
                  {amlStatus === "complete" ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: T.success, fontWeight: 700, fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 13, color: T.success, fontWeight: 600 }}>Clear — no sanctions/PEP matches</span>
                    </div>
                  ) : amlStatus === "running" ? (
                    <div style={{ fontSize: 13, color: T.warning }}>Scanning ComplyAdvantage...</div>
                  ) : (
                    <Btn primary small onClick={() => { setAmlStatus("running"); setTimeout(() => setAmlStatus("complete"), 1500); }}>
                      Run AML Screening
                    </Btn>
                  )}
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Valuation */}
          {currentStep.id === "valuation" && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Order Valuation</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Valuation Type</label>
                  <select style={inputSt} value={valuationType} onChange={e => setValuationType(e.target.value)}>
                    <option value="AVM">AVM Only (instant)</option>
                    <option value="Desktop">Desktop Valuation</option>
                    <option value="Drive-by">Drive-by</option>
                    <option value="Full">Full Valuation (recommended)</option>
                    <option value="Structural">Structural Survey</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Select Surveyor</label>
                  <select style={inputSt} value={selectedSurveyor} onChange={e => setSelectedSurveyor(e.target.value)}>
                    <option value="">Select surveyor...</option>
                    {surveyors.map(s => (
                      <option key={s.id} value={s.id}>{s.firm} — {s.sla} SLA — £{s.fee} — ★{s.rating}</option>
                    ))}
                  </select>
                </div>
              </div>
              {selectedSurveyor && (() => {
                const sv = surveyors.find(s => s.id === selectedSurveyor);
                return sv ? (
                  <Card style={{ background: T.bg }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Firm</div><div style={{ fontSize: 13, fontWeight: 600 }}>{sv.firm}</div></div>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>SLA</div><div style={{ fontSize: 13, fontWeight: 600 }}>{sv.sla}</div></div>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Fee</div><div style={{ fontSize: 13, fontWeight: 600 }}>£{sv.fee}</div></div>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Rating</div><div style={{ fontSize: 13, fontWeight: 600 }}>★ {sv.rating}</div></div>
                    </div>
                  </Card>
                ) : null;
              })()}
            </div>
          )}

          {/* Step 3: Solicitor */}
          {currentStep.id === "solicitor" && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Instruct Solicitor</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Select from Panel</label>
                <select style={inputSt} value={selectedSolicitor} onChange={e => setSelectedSolicitor(e.target.value)}>
                  <option value="">Select solicitor firm...</option>
                  {solicitors.map(s => (
                    <option key={s.id} value={s.id}>{s.firm} — avg {s.avgDays} days — ★{s.rating} — {(s.specialism || []).join(", ")}</option>
                  ))}
                </select>
              </div>
              {selectedSolicitor && (() => {
                const sol = solicitors.find(s => s.id === selectedSolicitor);
                return sol ? (
                  <Card style={{ background: T.bg }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Firm</div><div style={{ fontSize: 13, fontWeight: 600 }}>{sol.firm}</div></div>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>SRA</div><div style={{ fontSize: 13, fontWeight: 600, fontFamily: "monospace" }}>{sol.sra}</div></div>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Avg Completion</div><div style={{ fontSize: 13, fontWeight: 600 }}>{sol.avgDays} days</div></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Rating</div><div style={{ fontSize: 13, fontWeight: 600 }}>★ {sol.rating}</div></div>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Phone</div><div style={{ fontSize: 13, fontWeight: 600 }}>{sol.phone}</div></div>
                      <div><div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Email</div><div style={{ fontSize: 13, fontWeight: 600 }}>{sol.email}</div></div>
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {(sol.specialism || []).map(sp => (
                        <span key={sp} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}>{sp}</span>
                      ))}
                    </div>
                  </Card>
                ) : null;
              })()}
            </div>
          )}

          {/* Step 4: Documents */}
          {currentStep.id === "docs" && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 8 }}>Chase Outstanding Documents</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
                Documents received: {caseData.checks.docs.parsed}/{caseData.checks.docs.total}
                {caseData.checks.docs.parsed < caseData.checks.docs.total && ` — ${caseData.checks.docs.total - caseData.checks.docs.parsed} outstanding`}
              </div>
              {caseData.checks.docs.parsed < caseData.checks.docs.total ? (
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Message to Broker</label>
                  <textarea style={{ ...inputSt, height: 100, resize: "vertical" }} value={docMessage}
                    onChange={e => setDocMessage(e.target.value)}
                    placeholder={`Dear Broker,\n\nPlease provide the following outstanding documents for ${caseData.customerName}:\n- [list documents]\n\nRegards,\nOps Team`}
                  />
                  <div style={{ marginTop: 10 }}>
                    {docSent ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.success, fontWeight: 600 }}>
                        <span style={{ fontSize: 14 }}>✓</span> Document request sent to broker
                      </div>
                    ) : (
                      <Btn primary small onClick={() => setDocSent(true)}>Send Document Request</Btn>
                    )}
                  </div>
                </div>
              ) : (
                <Card style={{ borderLeft: `4px solid ${T.success}`, background: "#F0FDF4" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.success, fontWeight: 600 }}>
                    <span style={{ fontSize: 14 }}>✓</span> All documents received and parsed
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Step 5: Confirm */}
          {currentStep.id === "confirm" && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.navy, marginBottom: 16 }}>Processing Summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "KYC", status: kycStatus === "complete", detail: "Biometric ID verified" },
                  { label: "AML", status: amlStatus === "complete", detail: "Sanctions & PEP clear" },
                  { label: "Valuation", status: !!selectedSurveyor, detail: selectedSurveyor ? `${valuationType} ordered — ${(surveyors.find(s => s.id === selectedSurveyor) || {}).firm || ""}` : "Not ordered" },
                  { label: "Solicitor", status: !!selectedSolicitor, detail: selectedSolicitor ? `${(solicitors.find(s => s.id === selectedSolicitor) || {}).firm || ""} instructed` : "Not instructed" },
                  { label: "Documents", status: caseData.checks.docs.parsed === caseData.checks.docs.total || docSent, detail: caseData.checks.docs.parsed === caseData.checks.docs.total ? "All received" : docSent ? "Chase sent to broker" : "Outstanding" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 8, background: item.status ? "#F0FDF4" : "#FEF3C7", border: `1px solid ${item.status ? "#A7F3D0" : "#FDE68A"}` }}>
                    <span style={{ fontSize: 14, color: item.status ? T.success : T.warning, fontWeight: 700 }}>{item.status ? "✓" : "!"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
              {!confirmed ? (
                <Btn primary style={{ marginTop: 16, width: "100%", justifyContent: "center", padding: "12px 24px" }} onClick={() => setConfirmed(true)}>
                  Confirm Processing Complete
                </Btn>
              ) : (
                <div style={{ marginTop: 16, padding: "16px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #A7F3D0", textAlign: "center" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.success, marginBottom: 4 }}>✓ Processing Complete</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>Case is now in the pipeline. Valuation and solicitor work will progress automatically.</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 24px", borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
          <Btn onClick={() => step > 0 ? setStep(step - 1) : onClose()} disabled={confirmed}>
            {step === 0 ? "Cancel" : "← Back"}
          </Btn>
          {step < WIZARD_STEPS.length - 1 && (
            <Btn primary onClick={() => setStep(step + 1)}>
              Next →
            </Btn>
          )}
          {confirmed && (
            <Btn primary onClick={onClose}>Done</Btn>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IntakeQueue({ onOpenCase }) {
  const [activeTab, setActiveTab] = useState("All");
  const [processingCase, setProcessingCase] = useState(null);

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
                <Btn primary small onClick={() => setProcessingCase(c)}>
                  Start Processing →
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

          </Card>
        ))}

        {filtered.length === 0 && (
          <Card style={{ textAlign: "center", padding: 40, color: T.textMuted }}>
            No applications in this category.
          </Card>
        )}
      </div>

      {/* Processing Wizard Modal */}
      {processingCase && <ProcessingWizard caseData={processingCase} onClose={() => setProcessingCase(null)} />}
    </div>
  );
}
