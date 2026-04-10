import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import EmptyState from "../shared/EmptyState";

// Broker's own prospects and customers — NOT the bank's full customer base
const MOCK_BROKER_PROSPECTS = [
  { id: "PRO-001", name: "James & Sarah Mitchell", email: "j.mitchell@outlook.com", phone: "+44 7700 900456",
    stage: "Application Submitted", caseRef: "AFN-2026-00142", value: "£350,000", lastContact: "2h ago",
    nextAction: "Awaiting underwriting decision", source: "Referral" },
  { id: "PRO-002", name: "David Chen", email: "d.chen@gmail.com", phone: "+44 7700 900321",
    stage: "KYC In Progress", caseRef: "AFN-2026-00135", value: "£425,000", lastContact: "3d ago",
    nextAction: "Chase ID document upload", source: "Direct" },
  { id: "PRO-003", name: "Emma & Tom Wilson", email: "emma.wilson@gmail.com", phone: "+44 7700 900123",
    stage: "Disbursed", caseRef: "AFN-2026-00128", value: "£290,000", lastContact: "1w ago",
    nextAction: "Schedule completion call", source: "Referral" },
  { id: "PRO-004", name: "Sophie & Jack Brown", email: "sophie.brown@outlook.com", phone: "+44 7700 900789",
    stage: "DIP Approved", caseRef: "AFN-2026-00115", value: "£320,000", lastContact: "6d ago",
    nextAction: "Convert DIP to full application", source: "Cold lead" },
  { id: "PRO-005", name: "Lisa Patel", email: "l.patel@yahoo.com", phone: "+44 7700 900111",
    stage: "Initial Enquiry", caseRef: null, value: "£250,000 (est)", lastContact: "Today",
    nextAction: "Run eligibility check", source: "Website" },
  { id: "PRO-006", name: "Mark Richardson", email: "m.richardson@btinternet.com", phone: "+44 7700 900222",
    stage: "Initial Enquiry", caseRef: null, value: "£180,000 (est)", lastContact: "Yesterday",
    nextAction: "Schedule first meeting", source: "Referral" },
];

const PIPELINE_STAGES = [
  "Initial Enquiry",
  "DIP Approved",
  "Application Submitted",
  "KYC In Progress",
  "Underwriting",
  "Offer Issued",
  "Disbursed",
];

const SOURCE_COLORS = {
  "Referral":  T.success,
  "Direct":    T.primary,
  "Cold lead": T.warning,
  "Website":   "#8B5CF6",
};

function MiniStepper({ currentStage }) {
  const idx = Math.max(0, PIPELINE_STAGES.indexOf(currentStage));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, minWidth: 170 }}>
      {PIPELINE_STAGES.map((stage, i) => {
        const done = i < idx;
        const active = i === idx;
        const color = active ? T.primary : done ? T.accent : T.border;
        return (
          <div key={stage} style={{ display: "flex", alignItems: "center", flex: i === PIPELINE_STAGES.length - 1 ? "0 0 auto" : 1 }}>
            <div title={stage} style={{
              width: active ? 10 : 7, height: active ? 10 : 7, borderRadius: "50%",
              background: color, flexShrink: 0,
              boxShadow: active ? `0 0 0 3px ${T.primaryGlow}` : "none",
            }} />
            {i < PIPELINE_STAGES.length - 1 && (
              <div style={{
                flex: 1, height: 2,
                background: i < idx ? T.accent : T.borderLight,
                minWidth: 10,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function QuickDipModal({ prospect, onClose }) {
  const [amount, setAmount] = useState("");
  const [ltv, setLtv] = useState("");
  const [term, setTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runDip = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResult({
        decision: "Approved in Principle",
        product: "Afin Residential 5yr Fixed 4.89%",
        maxLoan: "£385,000",
        monthlyPayment: "£1,842",
      });
    }, 1500);
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(12,45,59,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.card, borderRadius: 14, width: "100%", maxWidth: 460, padding: 26,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Quick DIP for {prospect.name}</div>
            <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>No credit footprint</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>{Ico.x(18)}</button>
        </div>

        {!result && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 5 }}>Loan Amount</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="£350,000"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 5 }}>LTV %</label>
              <input value={ltv} onChange={e => setLtv(e.target.value)} placeholder="75"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 5 }}>Term (years)</label>
              <input value={term} onChange={e => setTerm(e.target.value)} placeholder="25"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
            </div>
            <Btn primary onClick={runDip} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Running DIP..." : "Run DIP"}
            </Btn>
          </>
        )}

        {result && (
          <div>
            <div style={{
              padding: 16, borderRadius: 10, background: T.successBg, border: `1px solid ${T.successBorder}`, marginBottom: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.success, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                {Ico.check(16)} {result.decision}
              </div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6 }}>
                <div><strong>Product:</strong> {result.product}</div>
                <div><strong>Max Loan:</strong> {result.maxLoan}</div>
                <div><strong>Monthly Payment:</strong> {result.monthlyPayment}</div>
              </div>
            </div>
            <Btn primary onClick={onClose} style={{ width: "100%", justifyContent: "center" }}>Close</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function EmailDialog({ prospect, onClose }) {
  const [subject, setSubject] = useState(`Your Afin Bank application`);
  const [body, setBody] = useState(`Hi ${prospect.name.split(" ")[0]},\n\nJust checking in on your application...`);

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(12,45,59,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.card, borderRadius: 14, width: "100%", maxWidth: 520, padding: 26,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Send Email to {prospect.name}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>{Ico.x(18)}</button>
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10 }}>To: {prospect.email}</div>
        <input value={subject} onChange={e => setSubject(e.target.value)}
          style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, marginBottom: 10, boxSizing: "border-box", fontFamily: T.font }} />
        <textarea value={body} onChange={e => setBody(e.target.value)}
          style={{ width: "100%", minHeight: 160, padding: 12, borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box", resize: "vertical" }} />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn primary icon="send" onClick={onClose}>Send</Btn>
        </div>
      </div>
    </div>
  );
}

export default function BrokerProspects({ onSelectProspect }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [dipModal, setDipModal] = useState(null);
  const [emailModal, setEmailModal] = useState(null);

  const stages = ["All", "Initial Enquiry", "DIP Approved", "Application Submitted", "KYC In Progress", "Disbursed"];

  const filtered = MOCK_BROKER_PROSPECTS.filter(p => {
    if (filter !== "All" && p.stage !== filter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalValue = MOCK_BROKER_PROSPECTS.reduce((sum, p) => sum + parseInt(p.value.replace(/[£,()estim]/gi, "")), 0);
  const conversionRate = Math.round((MOCK_BROKER_PROSPECTS.filter(p => p.caseRef).length / MOCK_BROKER_PROSPECTS.length) * 100);

  const iconBtnStyle = {
    background: T.bg, border: `1px solid ${T.border}`, borderRadius: 7,
    width: 30, height: 30, display: "inline-flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", color: T.primary,
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>My Customers & Prospects</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>
            All customers you have introduced to Afin Bank
          </p>
        </div>
        <Btn primary icon="plus">Add Prospect</Btn>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Total Customers" value={String(MOCK_BROKER_PROSPECTS.length)} sub="In your portfolio" color={T.primary} />
        <KPICard label="Active Cases" value={String(MOCK_BROKER_PROSPECTS.filter(p => p.caseRef).length)} sub="With AFN reference" color={T.accent} />
        <KPICard label="Prospects" value={String(MOCK_BROKER_PROSPECTS.filter(p => !p.caseRef).length)} sub="Not yet applied" color={T.warning} />
        <KPICard label="Conversion Rate" value={`${conversionRate}%`} sub="Enquiry → Application" color={T.success} />
        <KPICard label="Total Value" value={`£${(totalValue / 1000000).toFixed(2)}M`} sub="Lifetime pipeline" color="#8B5CF6" />
      </div>

      <Card noPad>
        <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {stages.map(s => (
              <span key={s} onClick={() => setFilter(s)} style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                background: filter === s ? T.primary : T.bg,
                color: filter === s ? "#fff" : T.textSecondary,
              }}>{s}</span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: T.bg, borderRadius: 8, border: `1px solid ${T.border}` }}>
            {Ico.search(14)}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search prospects..."
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, width: 200 }} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: 40 }}>
            <EmptyState type="search" />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Name", "Contact", "Pipeline", "Case Ref", "Value", "Source", "Last Contact", "Next Action", "Quick Actions"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                return (
                  <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}`, cursor: "pointer" }}
                      onClick={() => onSelectProspect?.(p)}
                      onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>
                      <div>{p.email}</div>
                      <div style={{ fontSize: 11 }}>{p.phone}</div>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <MiniStepper currentStage={p.stage} />
                      <div style={{ fontSize: 10, color: T.textMuted, marginTop: 4, fontWeight: 600 }}>{p.stage}</div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 600, color: p.caseRef ? T.primary : T.textMuted }}>
                      {p.caseRef || "—"}
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{p.value}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: SOURCE_COLORS[p.source] }}>● {p.source}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>{p.lastContact}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.nextAction}</td>
                    <td style={{ padding: "12px 14px" }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button title="Run DIP" onClick={() => setDipModal(p)} style={iconBtnStyle}>{Ico.zap(14)}</button>
                        <button title="View Details" onClick={() => onSelectProspect?.(p)} style={iconBtnStyle}>{Ico.eye(14)}</button>
                        <button title="Send Email" onClick={() => setEmailModal(p)} style={iconBtnStyle}>{Ico.send(14)}</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {dipModal && <QuickDipModal prospect={dipModal} onClose={() => setDipModal(null)} />}
      {emailModal && <EmailDialog prospect={emailModal} onClose={() => setEmailModal(null)} />}
    </div>
  );
}
