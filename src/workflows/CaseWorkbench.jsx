import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── mock loan data ─────────────────────────────────────── */
const DEFAULT_LOAN = {
  id: "AFN-2026-00142",
  customer: "James & Sarah Mitchell",
  broker: "Oakbridge Financial",
  amount: 425000,
  property: "14 Harbourside Walk, Bristol BS1 5AH",
  propertyType: "3-bed semi-detached",
  status: "In Progress",
  submitted: "25 Mar 2026, 09:14",
  assignedTo: "Emma Clarke (Ops) / James Mitchell (UW)",
  avmValue: 495000,
  avmConfidence: 87,
  ltv: 78,
};

/* ── helper: progress ring ──────────────────────────────── */
const ProgressRing = ({ done, total, size = 36 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const pct = total ? done / total : 0;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.borderLight} strokeWidth={3} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={pct === 1 ? T.success : T.primary} strokeWidth={3} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central" style={{ transform: "rotate(90deg)", transformOrigin: "center", fontSize: 9, fontWeight: 700, fill: T.text }}>{done}/{total}</text>
    </svg>
  );
};

/* ── helper: checklist item ─────────────────────────────── */
const CheckItem = ({ done, locked, label, detail, auto }) => {
  const icon = locked ? Ico.lock(14) : done ? Ico.check(14) : null;
  const bg = locked ? "#F3F4F6" : done ? T.successBg : "#fff";
  const borderColor = locked ? T.borderLight : done ? T.successBorder : T.border;
  return (
    <div style={{ display: "flex", gap: 10, padding: "10px 12px", borderRadius: 8, background: bg, border: `1px solid ${borderColor}`, marginBottom: 8, opacity: locked ? 0.55 : 1 }}>
      <span style={{ fontSize: 14, lineHeight: "20px", flexShrink: 0, color: done ? T.success : locked ? T.textMuted : T.text }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: T.text, display: "flex", alignItems: "center", gap: 6 }}>
          {label}
          {auto && <span style={{ fontSize: 9, fontWeight: 700, background: "rgba(26,74,84,0.08)", color: T.primary, padding: "1px 6px", borderRadius: 4 }}>AI</span>}
        </div>
        <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2, lineHeight: 1.4 }}>{detail}</div>
      </div>
    </div>
  );
};

/* ── status label helper ────────────────────────────────── */
const StatusLabel = ({ text, color }) => (
  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "3px 10px", borderRadius: 6, background: color === "green" ? T.successBg : color === "amber" ? T.warningBg : color === "blue" ? "#DBEAFE" : "#F3F4F6", color: color === "green" ? T.success : color === "amber" ? "#92400E" : color === "blue" ? "#1E40AF" : T.textMuted }}>
    {text}
  </span>
);

/* ── gate dot ───────────────────────────────────────────── */
const GateDot = ({ label, status, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 18, height: 18, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, background: color === "green" ? T.successBg : T.warningBg, color: color === "green" ? T.success : "#92400E", border: `2px solid ${color === "green" ? T.success : T.warning}` }}>
      {color === "green" ? "✓" : "⚠"}
    </span>
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{label}</div>
      <div style={{ fontSize: 11, color: T.textMuted }}>{status}</div>
    </div>
  </div>
);

/* ── main component ─────────────────────────────────────── */
function CaseWorkbench({ loan: loanProp }) {
  const loan = loanProp || DEFAULT_LOAN;
  const [kycItems, setKycItems] = useState([true, true, true, false, true, true]);

  const toggleKyc = (i) => {
    setKycItems((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const kycDone = kycItems.filter(Boolean).length;
  const kycTotal = kycItems.length;
  const allKycGreen = kycDone === kycTotal;

  const valDone = 3;
  const valTotal = 6;
  const creditDone = 3;
  const creditTotal = 5;

  const allTracksComplete = allKycGreen && valDone === valTotal && creditDone === creditTotal;

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: 32, background: T.bg, minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginBottom: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: T.primary }}>{loan.id}</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>{loan.customer}</span>
          <StatusLabel text={loan.status} color="blue" />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, fontSize: 12, color: T.textMuted }}>
          <span><strong>Broker:</strong> {loan.broker}</span>
          <span><strong>Amount:</strong> {"£"}{loan.amount.toLocaleString()}</span>
          <span><strong>LTV:</strong> {loan.ltv}%</span>
          <span><strong>Submitted:</strong> {loan.submitted}</span>
          <span><strong>Assigned:</strong> {loan.assignedTo}</span>
        </div>
      </Card>

      {/* ── 3 Swimlanes ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>

        {/* ── SWIMLANE 1: KYC & Documents ──────── */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <ProgressRing done={kycDone} total={kycTotal} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>KYC & Documents</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Ops workstream</div>
            </div>
            <div style={{ marginLeft: "auto" }}><StatusLabel text="In Progress" color="amber" /></div>
          </div>

          <div onClick={() => toggleKyc(0)} style={{ cursor: "pointer" }}>
            <CheckItem done={kycItems[0]} label="Identity Verification" detail="Passport verified. Name matches. Expiry 2031." auto />
          </div>
          <div onClick={() => toggleKyc(1)} style={{ cursor: "pointer" }}>
            <CheckItem done={kycItems[1]} label="Address Verification" detail="Utility bill confirmed. Electoral roll match." auto />
          </div>
          <div onClick={() => toggleKyc(2)} style={{ cursor: "pointer" }}>
            <CheckItem done={kycItems[2]} label="Sanctions/PEP" detail="Clear. No matches found." auto />
          </div>
          <div onClick={() => toggleKyc(3)} style={{ cursor: "pointer" }}>
            <CheckItem done={kycItems[3]} label="Employer Verification" detail="Awaiting employer letter. Auto-chase sent 2h ago." />
          </div>
          <div onClick={() => toggleKyc(4)} style={{ cursor: "pointer" }}>
            <CheckItem done={kycItems[4]} label="Bank Statements" detail="3 months verified. Income £5,833/mo confirmed." auto />
          </div>
          <div onClick={() => toggleKyc(5)} style={{ cursor: "pointer" }}>
            <CheckItem done={kycItems[5]} label="Document Completeness" detail="6/6 documents received. 2 AI flags raised." auto />
          </div>

          {/* AI flags */}
          <div style={{ background: T.warningBg, border: `1px solid ${T.warningBorder}`, borderRadius: 8, padding: "10px 12px", marginTop: 4, marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ color: "#92400E", flexShrink: 0, marginTop: 1 }}>{Ico.alert(14)}</span>
            <div style={{ fontSize: 11, color: "#92400E", lineHeight: 1.5 }}>
              <strong>AI Flag:</strong> P60 shows {"£"}2,500 less than declared &mdash; verify with employer letter.
            </div>
          </div>

          <div style={{ marginTop: "auto" }}>
            <Btn primary disabled={!allKycGreen} style={{ width: "100%" }}>
              {Ico.check(14)} Mark KYC Complete
            </Btn>
          </div>
        </Card>

        {/* ── SWIMLANE 2: Valuation ────────────── */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <ProgressRing done={valDone} total={valTotal} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Valuation</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Ops workstream</div>
            </div>
            <div style={{ marginLeft: "auto" }}><StatusLabel text="Awaiting Report" color="amber" /></div>
          </div>

          <CheckItem done label="AVM Executed" detail={`£495,000 (87% confidence). Range £470k–£520k.`} auto />
          <CheckItem done label="Zoopla Cross-Check" detail={`£488,000. Within 2% of AVM. Consistent.`} auto />
          <CheckItem done label="Rightmove Comparables" detail="6 sales in BS1. Avg £479,000. Subject +3% justified." auto />
          <CheckItem label="Surveyor Instructed" detail="Countrywide Surveying. Instructed 25 Mar. SLA: 3 days." />
          <CheckItem label="Report Received" detail="Expected 28 Mar." />
          <CheckItem locked label="Valuation Approved" detail="Locked until report received." />

          {/* Property summary */}
          <div style={{ background: T.primaryLight, borderRadius: 8, padding: "12px 14px", marginTop: 4, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Property Summary</div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.7 }}>
              <div><strong>Address:</strong> {loan.property}</div>
              <div><strong>Type:</strong> {loan.propertyType}</div>
              <div><strong>AVM Value:</strong> {"£"}{loan.avmValue.toLocaleString()}</div>
              <div><strong>Confidence:</strong> {loan.avmConfidence}%</div>
            </div>
          </div>

          <div style={{ marginTop: "auto" }}>
            <Btn small style={{ width: "100%" }}>Chase Surveyor {"→"}</Btn>
          </div>
        </Card>

        {/* ── SWIMLANE 3: Credit Assessment ────── */}
        <Card style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <ProgressRing done={creditDone} total={creditTotal} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Credit Assessment</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Underwriter workstream</div>
            </div>
            <div style={{ marginLeft: "auto" }}><StatusLabel text="Awaiting UW" color="amber" /></div>
          </div>

          <CheckItem done label="Credit Bureau Pull" detail="Equifax 742 (Good). No adverse. 4 accounts." auto />
          <CheckItem done label="AI Pre-Assessment" detail="Nova AI: Recommend Approve. Risk score 14/100." auto />
          <CheckItem done label="Affordability Check" detail="DTI 18.2%. Stress test: Pass at 7.49%." auto />
          <CheckItem label="Underwriter Review" detail="Assigned to James Mitchell. Not started." />
          <CheckItem locked label="Credit Decision" detail="Locked until UW review complete." />

          {/* AI assessment summary */}
          <div style={{ background: "rgba(26,74,84,0.04)", borderRadius: 8, padding: "12px 14px", marginTop: 4, marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>{Ico.bot(14)}</span>
            <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>
              <strong>Nova AI Summary:</strong> Low risk profile. Clean credit history, comfortable DTI at 18.2%, passes stress test. LTV 78% within appetite. Recommend approval subject to valuation confirmation.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
            <Btn primary style={{ width: "100%" }}>{Ico.arrow(14)} Begin Review</Btn>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn small disabled style={{ flex: 1, background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}` }}>Approve</Btn>
              <Btn small disabled style={{ flex: 1, background: T.warningBg, color: "#92400E", border: `1px solid ${T.warningBorder}` }}>Refer</Btn>
              <Btn small disabled danger style={{ flex: 1 }}>Decline</Btn>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Decision Gate ─────────────────────── */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ color: T.primary }}>{Ico.shield(20)}</span>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Decision Gate</div>
        </div>

        {/* 3 tracks converging */}
        <div style={{ display: "flex", gap: 32, marginBottom: 20, flexWrap: "wrap" }}>
          <GateDot label="KYC & Documents" status="In Progress" color="amber" />
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 32, height: 2, background: T.border }} />
          </div>
          <GateDot label="Valuation" status="Awaiting Report" color="amber" />
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 32, height: 2, background: T.border }} />
          </div>
          <GateDot label="Credit Assessment" status="Awaiting UW" color="amber" />
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 32, height: 2, background: T.border }} />
            <span style={{ color: T.primary, marginLeft: 4 }}>{Ico.arrow(16)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 18, height: 18, borderRadius: "50%", background: "#F3F4F6", border: `2px dashed ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: T.textMuted }}>{"→"}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>Issue Offer</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Pending</div>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12, lineHeight: 1.6 }}>
          All 3 tracks must be complete before offer can be issued.
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: T.textSecondary }}>
            <strong>Progress:</strong> 2 of 3 auto-checks done. Estimated completion: 3 working days.
          </span>
          <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4, color: T.textMuted }}>
            {Ico.clock(14)} <strong>SLA:</strong> Day 3 of 15-day SLA. On track.
          </span>
          <div style={{ marginLeft: "auto" }}>
            <Btn primary disabled={!allTracksComplete} style={allTracksComplete ? { background: `linear-gradient(135deg, ${T.success}, #28A080)`, boxShadow: `0 4px 16px rgba(49,184,151,0.4)` } : {}}>
              {allTracksComplete && Ico.check(16)} Issue Offer {Ico.arrow(14)}
            </Btn>
          </div>
        </div>
      </Card>

      {/* ── AI Efficiency Panel ───────────────── */}
      <Card style={{ background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.04))", border: `1px solid ${T.primaryGlow}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span style={{ color: T.primary }}>{Ico.bot(18)}</span>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>Nova AI Efficiency Report</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: T.successBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.success, fontWeight: 800, fontSize: 16 }}>67%</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>12 of 18 items automated</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Checklist items completed by AI</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>{Ico.clock(20)}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>~4.2 hours saved</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Versus manual processing</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: T.successBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.success }}>{Ico.zap(20)}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>2 days faster</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>Estimated vs manual workflow</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CaseWorkbench;
