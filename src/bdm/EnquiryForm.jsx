import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";

const brokerOptions = [
  { value: "", label: "Select broker..." },
  { value: "Watson & Partners", label: "Watson & Partners" },
  { value: "Apex Mortgages", label: "Apex Mortgages" },
  { value: "Prime Financial", label: "Prime Financial" },
  { value: "Direct Broker Ltd", label: "Direct Broker Ltd" },
  { value: "new", label: "New broker \u2014 enter details" },
];

const customerTypes = ["Residential", "BTL", "Shared Ownership", "Remortgage"];
const propertyTypes = [{ value: "", label: "Select..." }, "House", "Flat", "Bungalow"];
const constructionTypes = [{ value: "", label: "Select..." }, "Standard", "Non-standard"];
const employmentTypes = [{ value: "", label: "Select..." }, "Employed", "Self-Employed", "Contract", "Retired", "Multiple"];

const opsMembers = [
  { name: "Tom Walker", active: 4, specialism: "BTL experience" },
  { name: "Lucy Fernandez", active: 3, specialism: "Residential specialist" },
  { name: "Emma Chen", active: 5, specialism: "Shared ownership" },
];

const uwMembers = [
  { name: "James Mitchell", active: 6, mandate: "Standard" },
  { name: "Amir Hassan", active: 4, mandate: "Complex/Self-employed" },
];

const mockProducts = [
  { name: "Afin Fix 2yr 75%", rate: "4.49%", maxLtv: 75, type: "Fixed" },
  { name: "Afin Fix 5yr 75%", rate: "4.29%", maxLtv: 75, type: "Fixed" },
  { name: "Afin Fix 2yr 85%", rate: "4.89%", maxLtv: 85, type: "Fixed" },
  { name: "Afin Tracker 75%", rate: "4.19%", maxLtv: 75, type: "Tracker" },
];

function EnquiryForm({ onBack }) {
  const [broker, setBroker] = useState("");
  const [custType, setCustType] = useState("");
  const [propType, setPropType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [construction, setConstruction] = useState("");
  const [postcode, setPostcode] = useState("");
  const [income, setIncome] = useState("");
  const [propValue, setPropValue] = useState("");
  const [deposit, setDeposit] = useState("");
  const [employment, setEmployment] = useState("");
  const [flags, setFlags] = useState({
    adverse: false, selfCert: false, interestOnly: false,
    ftb: false, rightToBuy: false, helpToBuy: false,
  });
  const [notes, setNotes] = useState("");

  const [phase, setPhase] = useState(1);
  const [checking, setChecking] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const [opsChoice, setOpsChoice] = useState("");
  const [uwChoice, setUwChoice] = useState("");
  const [autoAssign, setAutoAssign] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const pv = parseFloat(propValue) || 0;
  const dep = parseFloat(deposit) || 0;
  const ltv = pv > 0 ? Math.round(((pv - dep) / pv) * 100) : 0;

  const toggleFlag = (key) => setFlags(f => ({ ...f, [key]: !f[key] }));

  const determineResult = () => {
    if (ltv > 90) return "Ineligible";
    if (employment === "Self-Employed" || flags.adverse || construction === "Non-standard" || flags.interestOnly) return "Conditional";
    return "Eligible";
  };

  const handleCheckCriteria = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      setAiResult(determineResult());
      setPhase(2);
    }, 1500);
  };

  const handleSubmitEnquiry = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const resultColor = aiResult === "Eligible" ? T.success : aiResult === "Conditional" ? T.warning : T.danger;
  const resultBg = aiResult === "Eligible" ? T.successBg : aiResult === "Conditional" ? T.warningBg : T.dangerBg;
  const resultIcon = aiResult === "Eligible" ? Ico.check(32) : aiResult === "Conditional" ? Ico.alert(32) : Ico.x(32);

  return (
    <div style={{ fontFamily: T.font, color: T.text, maxWidth: 900, margin: "0 auto" }}>
      {/* Back link */}
      <div onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
        {Ico.arrowLeft(16)} Back to Dashboard
      </div>

      {/* Phase 1: Enquiry Details */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          {Ico.sparkle(22)}
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>New Enquiry</h2>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 24px 32px" }}>AI-powered instant criteria check</p>

        <Select label="Broker" value={broker} onChange={setBroker} options={brokerOptions} required />

        {/* Customer Type toggle cards */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 8 }}>Customer Type <span style={{ color: T.danger }}>*</span></label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {customerTypes.map(ct => (
              <div key={ct} onClick={() => setCustType(ct)} style={{
                padding: "12px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                border: custType === ct ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                background: custType === ct ? T.primaryLight : T.card,
                color: custType === ct ? T.primary : T.text,
                transition: "all 0.15s",
              }}>{ct}</div>
            ))}
          </div>
        </div>

        {/* Property */}
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, marginBottom: 10, marginTop: 20 }}>Property Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <Select label="Type" value={propType} onChange={setPropType} options={propertyTypes} required />
          <Input label="Bedrooms" value={bedrooms} onChange={setBedrooms} placeholder="e.g. 3" type="number" />
          <Select label="Construction" value={construction} onChange={setConstruction} options={constructionTypes} />
          <Input label="Location" value={postcode} onChange={setPostcode} placeholder="e.g. SW1A 1AA" />
        </div>

        {/* Financials */}
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, marginBottom: 10, marginTop: 20 }}>Financials</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <Input label="Income" value={income} onChange={setIncome} prefix="\u00a3" placeholder="70,000" type="number" required />
          <Input label="Property Value" value={propValue} onChange={setPropValue} prefix="\u00a3" placeholder="350,000" type="number" required />
          <Input label="Deposit / Equity" value={deposit} onChange={setDeposit} prefix="\u00a3" placeholder="100,000" type="number" required />
        </div>
        {pv > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 8, background: ltv > 90 ? T.dangerBg : ltv > 80 ? T.warningBg : T.successBg, marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: ltv > 90 ? T.danger : ltv > 80 ? "#92400E" : T.success }}>LTV: {ltv}%</span>
            <span style={{ fontSize: 12, color: T.textMuted }}>Loan amount: \u00a3{(pv - dep).toLocaleString()}</span>
          </div>
        )}

        {/* Employment */}
        <Select label="Employment" value={employment} onChange={setEmployment} options={employmentTypes} required />

        {/* Flags */}
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textSecondary, marginBottom: 10 }}>Flags</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { key: "adverse", label: "Adverse credit history" },
            { key: "selfCert", label: "Self-cert income" },
            { key: "interestOnly", label: "Interest only" },
            { key: "ftb", label: "First time buyer" },
            { key: "rightToBuy", label: "Right to buy" },
            { key: "helpToBuy", label: "Help to Buy" },
          ].map(f => (
            <label key={f.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", padding: "8px 12px", borderRadius: 8, border: `1px solid ${flags[f.key] ? T.primary : T.border}`, background: flags[f.key] ? T.primaryLight : "transparent" }}>
              <input type="checkbox" checked={flags[f.key]} onChange={() => toggleFlag(f.key)} style={{ accentColor: T.primary }} />
              {f.label}
            </label>
          ))}
        </div>

        {/* Notes */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional details about this enquiry..."
            style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, minHeight: 80, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        </div>

        <Btn primary onClick={handleCheckCriteria} disabled={checking || phase > 1} icon="sparkle">
          {checking ? "Checking..." : "Check Criteria \u2192"}
        </Btn>
      </Card>

      {/* Checking spinner */}
      {checking && (
        <Card style={{ textAlign: "center", padding: 40, marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.primary, marginBottom: 8 }}>{Ico.sparkle(24)}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: T.primary }}>Nova AI checking criteria...</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>Analysing eligibility across all product lines</div>
        </Card>
      )}

      {/* Phase 2: AI Criteria Check */}
      {phase >= 2 && !checking && (
        <Card style={{ marginBottom: 20 }}>
          {/* Big result */}
          <div style={{ textAlign: "center", padding: "24px 0 20px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: resultBg, color: resultColor, marginBottom: 12 }}>
              {resultIcon}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: resultColor }}>{aiResult}</div>
          </div>

          {/* Product matches */}
          {aiResult !== "Ineligible" && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Product Matches</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {mockProducts.filter(p => ltv <= p.maxLtv).map(p => (
                  <div key={p.name} style={{ padding: "12px 16px", borderRadius: 10, border: `1px solid ${T.successBorder}`, background: T.successBg }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{p.type} &middot; Rate: {p.rate} &middot; Max LTV: {p.maxLtv}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conditions */}
          {aiResult === "Conditional" && (
            <div style={{ padding: "14px 18px", borderRadius: 10, background: T.warningBg, border: `1px solid ${T.warningBorder}`, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400E", marginBottom: 4 }}>Conditions</div>
              <div style={{ fontSize: 13, color: "#92400E" }}>Manual review required for self-employed income verification. Recommend 2 years SA302s.</div>
            </div>
          )}

          {/* Ineligible reason */}
          {aiResult === "Ineligible" && (
            <div style={{ padding: "14px 18px", borderRadius: 10, background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, marginBottom: 4 }}>Reason</div>
              <div style={{ fontSize: 13, color: T.danger }}>LTV {ltv}% exceeds maximum 90% for this product type.</div>
            </div>
          )}

          {/* AI Insight */}
          <div style={{ padding: "14px 18px", borderRadius: 10, background: T.primaryLight, border: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            {Ico.bot(18)}
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 4 }}>AI Insight</div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>
                {aiResult === "Ineligible"
                  ? `At ${ltv}% LTV, no products are available. Consider increasing the deposit to bring LTV below 90%.`
                  : `Based on \u00a3${income || "70,000"} income and ${ltv}% LTV, this client fits ${mockProducts.filter(p => ltv <= p.maxLtv).length} standard ${custType || "residential"} products. Recommend Afin Fix 2yr 75% at 4.49%.`
                }
              </div>
            </div>
          </div>

          {aiResult !== "Ineligible" && phase === 2 && (
            <div style={{ marginTop: 20, textAlign: "center" }}>
              <Btn primary onClick={() => setPhase(3)} icon="arrow">Continue to Squad Allocation \u2192</Btn>
            </div>
          )}
        </Card>
      )}

      {/* Phase 3: Squad Allocation */}
      {phase >= 3 && !submitted && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            {Ico.users(20)}
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Assign Squad</h3>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
            {/* BDM - locked */}
            <div style={{ padding: 18, borderRadius: 12, border: `2px solid ${T.success}`, background: T.successBg }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: T.success, letterSpacing: 0.4 }}>BDM</span>
                <span style={{ color: T.success }}>{Ico.check(16)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>ST</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Sarah Thompson</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>Auto-assigned (you)</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: T.textMuted }}>{Ico.lock(12)} Locked</div>
            </div>

            {/* Ops */}
            <div style={{ padding: 18, borderRadius: 12, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#1E40AF", letterSpacing: 0.4, marginBottom: 10 }}>Ops / Customer Care</div>
              <Select value={autoAssign ? "Tom Walker" : opsChoice} onChange={setOpsChoice} options={[
                { value: "", label: "Select..." },
                ...opsMembers.map(m => ({ value: m.name, label: `${m.name} (${m.active} active)` })),
              ]} />
              <div style={{ fontSize: 11, color: T.textMuted, padding: "8px 10px", borderRadius: 6, background: T.primaryLight, display: "flex", gap: 6, alignItems: "flex-start" }}>
                {Ico.bot(12)}
                <span>Tom Walker recommended \u2014 lowest workload and BTL experience.</span>
              </div>
            </div>

            {/* UW */}
            <div style={{ padding: 18, borderRadius: 12, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#5B21B6", letterSpacing: 0.4, marginBottom: 10 }}>Underwriter</div>
              <Select value={autoAssign ? "Amir Hassan" : uwChoice} onChange={setUwChoice} options={[
                { value: "", label: "Select..." },
                ...uwMembers.map(m => ({ value: m.name, label: `${m.name} (${m.active} active) \u2014 ${m.mandate}` })),
              ]} />
              <div style={{ fontSize: 11, color: T.textMuted, padding: "8px 10px", borderRadius: 6, background: T.primaryLight, display: "flex", gap: 6, alignItems: "flex-start" }}>
                {Ico.bot(12)}
                <span>Amir Hassan recommended \u2014 specialist in self-employed cases.</span>
              </div>
            </div>
          </div>

          {/* Auto-assign toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: T.primaryLight, marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, color: T.primary }}>
              <input type="checkbox" checked={autoAssign} onChange={e => {
                setAutoAssign(e.target.checked);
                if (e.target.checked) { setOpsChoice("Tom Walker"); setUwChoice("Amir Hassan"); }
              }} style={{ accentColor: T.primary, width: 18, height: 18 }} />
              {Ico.sparkle(16)} Let Nova AI assign optimal squad
            </label>
          </div>

          <Btn primary onClick={handleSubmitEnquiry} disabled={submitting} icon="send">
            {submitting ? "Submitting..." : "Submit Enquiry & Notify Squad \u2192"}
          </Btn>
        </Card>
      )}

      {/* Success state */}
      {submitted && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: "50%", background: T.successBg, color: T.success, marginBottom: 16 }}>
            {Ico.check(32)}
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.success, marginBottom: 8 }}>Enquiry Created</div>
          <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6, maxWidth: 500, margin: "0 auto" }}>
            Enquiry <strong>ENQ-009</strong> created. Squad notified: <strong>Sarah Thompson</strong> (BDM), <strong>{autoAssign ? "Tom Walker" : (opsChoice || "Tom Walker")}</strong> (Ops), <strong>{autoAssign ? "Amir Hassan" : (uwChoice || "Amir Hassan")}</strong> (UW). Broker will receive criteria pack within 5 minutes.
          </div>
          <div style={{ marginTop: 20 }}>
            <Btn primary onClick={onBack} icon="arrowLeft">Back to Dashboard</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

export default EnquiryForm;
