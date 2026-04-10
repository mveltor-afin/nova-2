import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

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

function initialsOf(name = "") {
  return name
    .replace(/&/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

function PipelineStepper({ currentStage }) {
  const idx = Math.max(0, PIPELINE_STAGES.indexOf(currentStage));
  return (
    <Card>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 18 }}>Pipeline Progress</div>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ position: "absolute", top: 14, left: 14, right: 14, height: 3, background: T.borderLight, borderRadius: 2 }} />
        <div style={{
          position: "absolute", top: 14, left: 14, height: 3,
          width: `calc((100% - 28px) * ${idx / (PIPELINE_STAGES.length - 1)})`,
          background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`, borderRadius: 2,
          transition: "width 0.3s",
        }} />
        {PIPELINE_STAGES.map((stage, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <div key={stage} style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: active ? `linear-gradient(135deg,${T.primary},${T.primaryDark})` : done ? T.accent : T.card,
                border: `2px solid ${active ? T.primary : done ? T.accent : T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: active || done ? "#fff" : T.textMuted,
                fontSize: 11, fontWeight: 700,
                boxShadow: active ? `0 0 0 4px ${T.primaryGlow}` : "none",
              }}>
                {done ? Ico.check(14) : i + 1}
              </div>
              <div style={{
                marginTop: 8, fontSize: 10, fontWeight: active ? 700 : 600,
                color: active ? T.primary : done ? T.text : T.textMuted,
                textAlign: "center", maxWidth: 80, lineHeight: 1.3,
              }}>{stage}</div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DIPModal({ prospect, onClose }) {
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
        background: T.card, borderRadius: 14, width: "100%", maxWidth: 480, padding: 28,
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Quick DIP for {prospect?.name}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>Decision in principle - no credit footprint</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>{Ico.x(20)}</button>
        </div>

        {!result && (
          <>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 5 }}>Loan Amount</label>
              <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="£350,000"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 5 }}>LTV %</label>
              <input value={ltv} onChange={e => setLtv(e.target.value)} placeholder="75"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 5 }}>Term (years)</label>
              <input value={term} onChange={e => setTerm(e.target.value)} placeholder="25"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
            </div>
            <Btn primary onClick={runDip} disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? "Running DIP..." : "Run DIP"}
            </Btn>
          </>
        )}

        {result && (
          <div>
            <div style={{
              padding: 18, borderRadius: 10, background: T.successBg, border: `1px solid ${T.successBorder}`, marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.success, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
                {Ico.check(18)} {result.decision}
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

export default function BrokerCustomerHub({ prospect, onBack }) {
  const [notes, setNotes] = useState("");
  const [showDip, setShowDip] = useState(false);

  if (!prospect) return null;

  const timeline = [
    { icon: "user", title: "Customer enquiry received", detail: `Via ${prospect.source}`, time: "12 Mar 2026" },
    { icon: "messages", title: "Initial discussion held", detail: "Discussed borrowing needs and budget", time: "14 Mar 2026" },
    { icon: "file", title: "Documents requested", detail: "ID, 3 months payslips, bank statements", time: "15 Mar 2026" },
    { icon: "upload", title: "Documents received", detail: "Full pack received and reviewed", time: "18 Mar 2026" },
    { icon: "zap", title: "DIP run", detail: "Approved in principle for £385,000", time: "20 Mar 2026" },
    { icon: "send", title: "Application submitted", detail: `Case ref ${prospect.caseRef || "pending"}`, time: "22 Mar 2026" },
  ];

  const documents = [
    { name: "Photo ID - Passport.pdf", size: "2.1 MB", status: "Verified" },
    { name: "Proof of Address.pdf", size: "890 KB", status: "Verified" },
    { name: "Payslips (3 months).pdf", size: "1.4 MB", status: "Verified" },
    { name: "Bank Statements.pdf", size: "3.2 MB", status: "Pending" },
  ];

  return (
    <div>
      <div onClick={onBack} style={{
        display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600,
        color: T.primary, cursor: "pointer", marginBottom: 18,
      }}>
        {Ico.arrowLeft(14)} Back to My Customers
      </div>

      {/* Header */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`,
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700,
          }}>{initialsOf(prospect.name)}</div>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{prospect.name}</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
              {prospect.email} &middot; {prospect.phone}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: SOURCE_COLORS[prospect.source] || T.primary,
                background: T.bg, padding: "3px 10px", borderRadius: 12, border: `1px solid ${T.border}`,
              }}>● {prospect.source}</span>
              {prospect.caseRef && (
                <span style={{ fontSize: 11, fontWeight: 600, color: T.primary }}>{prospect.caseRef}</span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn icon="send" small>Email</Btn>
            <Btn icon="clock" small>Schedule</Btn>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <KPICard label="Stage" value={prospect.stage} color={T.primary} />
        <KPICard label="Loan Amount" value={prospect.value} color={T.accent} />
        <KPICard label="Last Contact" value={prospect.lastContact} color={T.warning} />
        <KPICard label="Next Action" value={prospect.nextAction} color="#8B5CF6" />
      </div>

      {/* Pipeline Stepper */}
      <div style={{ marginBottom: 18 }}>
        <PipelineStepper currentStage={prospect.stage} />
      </div>

      {/* Quick Actions */}
      <Card style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 14 }}>Quick Actions</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn primary icon="zap" onClick={() => setShowDip(true)}>Run DIP</Btn>
          <Btn icon="send">Submit Application</Btn>
          <Btn icon="file">Send Document Request</Btn>
          <Btn icon="clock">Schedule Call</Btn>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Activity Timeline */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16 }}>Activity Timeline</div>
          <div style={{ position: "relative" }}>
            {timeline.map((ev, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: i === timeline.length - 1 ? 0 : 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%", background: T.primaryLight,
                    color: T.primary, display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>{Ico[ev.icon]?.(14)}</div>
                  {i < timeline.length - 1 && <div style={{ width: 2, flex: 1, background: T.borderLight, marginTop: 4 }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>{ev.detail}</div>
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{ev.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Notes */}
        <Card>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Broker Notes</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add private notes about this customer..."
            style={{
              width: "100%", minHeight: 180, padding: 12, borderRadius: 9,
              border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
              color: T.text, resize: "vertical", outline: "none", boxSizing: "border-box",
            }}
          />
          <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
            <Btn primary small>Save Notes</Btn>
          </div>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Documents</div>
          <Btn icon="upload" small>Upload</Btn>
        </div>
        <div>
          {documents.map((d, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 0",
              borderTop: i === 0 ? "none" : `1px solid ${T.borderLight}`,
            }}>
              <div style={{ color: T.primary }}>{Ico.file(18)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{d.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{d.size}</div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 12,
                background: d.status === "Verified" ? T.successBg : T.warningBg,
                color: d.status === "Verified" ? T.success : T.warning,
              }}>{d.status}</span>
              <button style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>{Ico.download(16)}</button>
            </div>
          ))}
        </div>
      </Card>

      {showDip && <DIPModal prospect={prospect} onClose={() => setShowDip(false)} />}
    </div>
  );
}
