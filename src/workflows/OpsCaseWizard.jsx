import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Select, Input } from "../shared/primitives";
import { TEAM_MEMBERS } from "../data/loans";
import { MOCK_SURVEYORS } from "../data/valuations";

const STEPS = [
  { id: "valuation", label: "Valuation" },
  { id: "offer", label: "Offer & ESIS" },
  { id: "solicitor", label: "Instruct Solicitor" },
  { id: "conveyancing", label: "Conveyancing" },
  { id: "precompletion", label: "Pre-Completion" },
  { id: "disbursement", label: "Disbursement" },
];

const VAL_TYPES = ["AVM Only", "Desktop", "Drive-by", "Full", "Structural"];

const CONVEYANCING_STAGES = [
  "Instructed",
  "Client ID Verified",
  "Searches Ordered",
  "Searches Received",
  "Title Report Issued",
  "Enquiries Raised",
  "Enquiries Resolved",
  "Exchange of Contracts",
  "Completion",
];

const PRE_COMPLETION_ITEMS = [
  { key: "offerAccepted", label: "Offer accepted", auto: true },
  { key: "deedSigned", label: "Mortgage deed signed", auto: true },
  { key: "insurance", label: "Buildings insurance confirmed", auto: true },
  { key: "completionStmt", label: "Completion statement verified", auto: false },
  { key: "fundsRequested", label: "Funds requested from Finance", auto: false },
  { key: "solConfirmed", label: "Solicitor confirmed completion date", auto: false },
];

function parseLoanAmount(amtStr) {
  if (!amtStr) return 0;
  return parseInt(String(amtStr).replace(/[^0-9]/g, ""), 10) || 0;
}

function parseRate(rateStr) {
  if (!rateStr) return 0;
  return parseFloat(String(rateStr).replace("%", "").replace("/mo", "")) || 0;
}

function parseTerm(termStr) {
  if (!termStr) return 25;
  const n = parseInt(String(termStr), 10);
  return n || 25;
}

function fmtCurrency(n) {
  return "\u00A3" + Math.round(n).toLocaleString("en-GB");
}

function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/* ── Pill helper ── */
const Pill = ({ text, color, bg }) => (
  <span style={{
    display: "inline-block", padding: "3px 10px", borderRadius: 6,
    fontSize: 11, fontWeight: 700, color: color || "#fff",
    background: bg || T.primary, whiteSpace: "nowrap",
  }}>{text}</span>
);

/* ── Step dot in sidebar ── */
const StepDot = ({ status }) => {
  const colors = { done: T.success, current: T.warning, future: T.border };
  const c = colors[status] || colors.future;
  return (
    <div style={{
      width: 14, height: 14, borderRadius: "50%", background: c,
      border: status === "current" ? `2px solid ${T.warning}` : "none",
      boxShadow: status === "current" ? `0 0 8px ${T.warning}` : "none",
      flexShrink: 0,
    }} />
  );
};

/* ────────────────────────────────────────────
   STEP 1 — VALUATION
──────────────────────────────────────────── */
function StepValuation({ loan }) {
  const [valType, setValType] = useState("Full");
  const [surveyorId, setSurveyorId] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const loanAmount = parseLoanAmount(loan.amount);
  const surveyor = MOCK_SURVEYORS.find(s => s.id === surveyorId);
  const reportDate = fmtDate(addDays(new Date(), surveyor ? parseInt(surveyor.sla) : 5));

  const handleOrder = () => {
    setOrdering(true);
    setTimeout(() => { setOrdering(false); setOrdered(true); }, 1500);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Loan Amount" value={loan.amount} color={T.primary} />
        <KPICard label="LTV" value={loan.ltv + "%"} color={loan.ltv > 80 ? T.warning : T.success} />
        <KPICard label="Property Type" value={loan.propertyType || "Standard"} color="#6366F1" />
      </div>

      {/* AVM result */}
      <Card style={{ marginBottom: 16, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          {Ico.sparkle(16)}
          <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>AVM Result</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.success }}>{"\u00A3"}495,000 <span style={{ fontSize: 13, fontWeight: 500, color: T.textMuted }}>(87% confidence)</span></div>
      </Card>

      <Select
        label="Valuation Type"
        value={valType}
        onChange={setValType}
        options={VAL_TYPES.map(v => ({ value: v, label: v }))}
      />

      <Select
        label="Select Surveyor"
        value={surveyorId}
        onChange={setSurveyorId}
        options={[{ value: "", label: "-- Select surveyor --" }, ...MOCK_SURVEYORS.filter(s => s.active).map(s => ({
          value: s.id, label: `${s.firm} — SLA: ${s.sla}, Fee: ${s.fee}, Rating: ${s.rating}`
        }))]}
      />

      {surveyor && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 8 }}>{surveyor.firm}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div style={{ fontSize: 12, color: T.textMuted }}>SLA: <strong style={{ color: T.text }}>{surveyor.sla}</strong></div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Fee: <strong style={{ color: T.text }}>{surveyor.fee}</strong></div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Rating: <strong style={{ color: T.text }}>{surveyor.rating}/5</strong></div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Coverage: <strong style={{ color: T.text }}>{surveyor.coverage}</strong></div>
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {surveyor.types.map(t => <Pill key={t} text={t} bg={T.primaryLight} color={T.primary} />)}
          </div>
        </Card>
      )}

      {!ordered && (
        <Btn primary disabled={!surveyorId || ordering} onClick={handleOrder} icon="send">
          {ordering ? "Ordering..." : "Order Valuation"}
        </Btn>
      )}

      {ordered && (
        <Card style={{ background: T.successBg, border: `1px solid ${T.successBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {Ico.check(18)}
            <span style={{ fontSize: 14, fontWeight: 700, color: T.success }}>Valuation Ordered</span>
          </div>
          <div style={{ fontSize: 13, color: T.text }}>
            {valType} valuation instructed with <strong>{surveyor?.firm}</strong>.
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
            Estimated report date: <strong>{reportDate}</strong>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   STEP 2 — OFFER & ESIS
──────────────────────────────────────────── */
function StepOffer({ loan }) {
  const [esisGen, setEsisGen] = useState(false);
  const [generatingEsis, setGeneratingEsis] = useState(false);
  const [offerIssued, setOfferIssued] = useState(false);
  const [issuingOffer, setIssuingOffer] = useState(false);

  const loanAmount = parseLoanAmount(loan.amount);
  const rate = parseRate(loan.rate);
  const termYears = parseTerm(loan.term);
  const monthlyRate = rate / 100 / 12;
  const totalPayments = termYears * 12;
  const monthlyPayment = monthlyRate > 0
    ? Math.round(loanAmount * (monthlyRate) * Math.pow(1 + monthlyRate, totalPayments) / (Math.pow(1 + monthlyRate, totalPayments) - 1))
    : 0;
  const totalPayable = monthlyPayment * totalPayments;
  const aprc = (rate + 0.3).toFixed(2);
  const expiryDate = fmtDate(addDays(new Date(), 90));

  const handleEsis = () => {
    setGeneratingEsis(true);
    setTimeout(() => { setGeneratingEsis(false); setEsisGen(true); }, 1000);
  };
  const handleOffer = () => {
    setIssuingOffer(true);
    setTimeout(() => { setIssuingOffer(false); setOfferIssued(true); }, 1000);
  };

  return (
    <div>
      {/* Product details */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Product" value={loan.product} sub={loan.code} color={T.primary} />
        <KPICard label="Rate" value={loan.rate} sub={loan.tier} color={T.success} />
        <KPICard label="Amount" value={loan.amount} sub={loan.term} color="#6366F1" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <Pill text={loan.bucket} bg={loan.bucketColor} />
        <Pill text={loan.tier} bg={T.primaryLight} color={T.primary} />
      </div>

      {/* Generate ESIS */}
      {!esisGen && (
        <Btn primary disabled={generatingEsis} onClick={handleEsis} icon="file" style={{ marginBottom: 16 }}>
          {generatingEsis ? "Generating..." : "Generate ESIS"}
        </Btn>
      )}

      {esisGen && (
        <Card style={{ marginBottom: 16, border: `1px solid ${T.primary}` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.primary, marginBottom: 12 }}>ESIS Preview</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
            <div><span style={{ color: T.textMuted }}>Lender:</span> <strong>Afin Bank</strong></div>
            <div><span style={{ color: T.textMuted }}>Product:</span> <strong>{loan.product}</strong></div>
            <div><span style={{ color: T.textMuted }}>Rate:</span> <strong>{loan.rate}</strong></div>
            <div><span style={{ color: T.textMuted }}>APRC:</span> <strong>{aprc}%</strong></div>
            <div><span style={{ color: T.textMuted }}>Monthly Payment:</span> <strong>{fmtCurrency(monthlyPayment)}</strong></div>
            <div><span style={{ color: T.textMuted }}>Total Payable:</span> <strong>{fmtCurrency(totalPayable)}</strong></div>
            <div style={{ gridColumn: "1 / -1" }}><span style={{ color: T.textMuted }}>ERC Schedule:</span> <strong>{loan.erc}</strong></div>
          </div>
        </Card>
      )}

      {/* Issue Offer */}
      {esisGen && !offerIssued && (
        <Btn primary disabled={issuingOffer} onClick={handleOffer} icon="send" style={{ marginBottom: 16 }}>
          {issuingOffer ? "Issuing..." : "Issue Offer"}
        </Btn>
      )}

      {offerIssued && (
        <>
          <Card style={{ marginBottom: 16, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {Ico.check(18)}
              <span style={{ fontSize: 14, fontWeight: 700, color: T.success }}>Offer issued -- valid for 90 days</span>
            </div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Expiry: <strong>{expiryDate}</strong></div>
          </Card>

          {/* Offer letter preview */}
          <Card style={{ border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>Offer Letter Preview</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
              <div><span style={{ color: T.textMuted }}>Borrower:</span> <strong>{loan.names}</strong></div>
              <div><span style={{ color: T.textMuted }}>Property:</span> <strong>{loan.propertyType || "Standard"}</strong></div>
              <div><span style={{ color: T.textMuted }}>Loan Amount:</span> <strong>{loan.amount}</strong></div>
              <div><span style={{ color: T.textMuted }}>Rate:</span> <strong>{loan.rate}</strong></div>
              <div><span style={{ color: T.textMuted }}>Term:</span> <strong>{loan.term}</strong></div>
              <div style={{ gridColumn: "1 / -1" }}>
                <span style={{ color: T.textMuted }}>Conditions:</span>{" "}
                <strong>Standard — satisfactory valuation, buildings insurance, mortgage deed</strong>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   STEP 3 — INSTRUCT SOLICITOR
──────────────────────────────────────────── */
function StepSolicitor({ loan }) {
  const [solId, setSolId] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const solicitor = TEAM_MEMBERS.solicitors.find(s => s.id === solId);

  const handleSend = () => {
    setSending(true);
    setTimeout(() => { setSending(false); setSent(true); }, 1000);
  };

  const miniStages = CONVEYANCING_STAGES;

  return (
    <div>
      <Select
        label="Select Solicitor"
        value={solId}
        onChange={setSolId}
        options={[
          { value: "", label: "-- Select solicitor --" },
          ...TEAM_MEMBERS.solicitors.map(s => ({
            value: s.id,
            label: `${s.firm} — SRA: ${s.sra}, Avg: ${s.avgDays} days, Rating: ${s.rating}`,
          })),
        ]}
      />

      {solicitor && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6 }}>{solicitor.firm}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 12, marginBottom: 10 }}>
            <div><span style={{ color: T.textMuted }}>SRA:</span> <strong>{solicitor.sra}</strong></div>
            <div><span style={{ color: T.textMuted }}>Avg Days:</span> <strong>{solicitor.avgDays}</strong></div>
            <div><span style={{ color: T.textMuted }}>Rating:</span> <strong>{solicitor.rating}/5</strong></div>
            <div><span style={{ color: T.textMuted }}>Active Cases:</span> <strong>{solicitor.active}/{solicitor.capacity}</strong></div>
            <div><span style={{ color: T.textMuted }}>Phone:</span> <strong>{solicitor.phone}</strong></div>
            <div><span style={{ color: T.textMuted }}>Email:</span> <strong>{solicitor.email}</strong></div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {solicitor.specialism.map(s => <Pill key={s} text={s} bg={T.primaryLight} color={T.primary} />)}
          </div>
        </Card>
      )}

      {!sent && (
        <Btn primary disabled={!solId || sending} onClick={handleSend} icon="send" style={{ marginBottom: 16 }}>
          {sending ? "Sending..." : "Send Instruction Pack"}
        </Btn>
      )}

      {sent && (
        <>
          <Card style={{ marginBottom: 16, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.check(18)}
              <span style={{ fontSize: 13, fontWeight: 600, color: T.success }}>
                Instruction pack sent to {solicitor?.firm} at {solicitor?.email}
              </span>
            </div>
          </Card>

          {/* Mini conveyancing timeline */}
          <Card>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 12 }}>Conveyancing Milestones</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {miniStages.map((stage, i) => {
                const isComplete = i === 0;
                const isCurrent = i === 1;
                return (
                  <div key={stage} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                      background: isComplete ? T.success : isCurrent ? T.warning : T.border,
                    }} />
                    <span style={{
                      fontSize: 12, color: isComplete ? T.success : isCurrent ? T.text : T.textMuted,
                      fontWeight: isComplete || isCurrent ? 600 : 400,
                    }}>
                      {stage}{isComplete ? " \u2713" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   STEP 4 — CONVEYANCING PROGRESS
──────────────────────────────────────────── */
function StepConveyancing({ loan }) {
  const [chasing, setChasing] = useState(false);
  const [chased, setChased] = useState(false);

  const completedIdx = 2; // 0,1,2 complete, 3 is current
  const currentIdx = 3;
  const estimatedCompletion = fmtDate(addDays(new Date(), 28));

  const handleChase = () => {
    setChasing(true);
    setTimeout(() => { setChasing(false); setChased(true); }, 1000);
  };

  return (
    <div>
      {/* SLA status */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="SLA Status" value="On Track" sub="Day 14 of 35" color={T.success} />
        <KPICard label="Est. Completion" value={estimatedCompletion} color="#6366F1" />
      </div>

      {/* Full timeline */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 16 }}>Conveyancing Timeline</div>
        {CONVEYANCING_STAGES.map((stage, i) => {
          const isComplete = i <= completedIdx;
          const isCurrent = i === currentIdx;
          const isFuture = i > currentIdx;
          return (
            <div key={stage} style={{ display: "flex", alignItems: "flex-start", gap: 12, position: "relative" }}>
              {/* Vertical line */}
              {i < CONVEYANCING_STAGES.length - 1 && (
                <div style={{
                  position: "absolute", left: 11, top: 24, width: 2, height: "calc(100% - 4px)",
                  background: isComplete ? T.success : T.border,
                }} />
              )}
              {/* Dot */}
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: isComplete ? T.success : isCurrent ? T.warning : "#E5E7EB",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: isCurrent ? `0 0 10px ${T.warning}` : "none",
                animation: isCurrent ? "pulse 2s infinite" : "none",
              }}>
                {isComplete && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{"\u2713"}</span>}
                {isCurrent && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
              </div>
              {/* Label */}
              <div style={{ paddingBottom: 20 }}>
                <div style={{
                  fontSize: 13, fontWeight: isComplete || isCurrent ? 600 : 400,
                  color: isFuture ? T.textMuted : T.text,
                }}>
                  {stage}
                  {isComplete && <span style={{ color: T.success, marginLeft: 6 }}>{"\u2713"}</span>}
                  {isCurrent && <Pill text="Current" bg={T.warningBg} color={T.warning} />}
                </div>
              </div>
            </div>
          );
        })}
      </Card>

      {/* Solicitor cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 6 }}>Buyer Solicitor</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Harrison & Co</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>SRA-612345</div>
        </Card>
        <Card>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 6 }}>Seller Solicitor</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Morris & Partners</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>SRA-789012</div>
        </Card>
      </div>

      {/* Chase */}
      {!chased ? (
        <Btn primary={false} disabled={chasing} onClick={handleChase} icon="send">
          {chasing ? "Sending..." : "Chase Solicitor"}
        </Btn>
      ) : (
        <Card style={{ background: T.successBg, border: `1px solid ${T.successBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.check(16)}
            <span style={{ fontSize: 13, fontWeight: 600, color: T.success }}>Follow-up sent to solicitor</span>
          </div>
        </Card>
      )}

      {/* Pulse keyframe injected via style tag */}
      <style>{`@keyframes pulse { 0%,100%{box-shadow:0 0 4px ${T.warning}} 50%{box-shadow:0 0 14px ${T.warning}} }`}</style>
    </div>
  );
}

/* ────────────────────────────────────────────
   STEP 5 — PRE-COMPLETION
──────────────────────────────────────────── */
function StepPreCompletion() {
  const [checks, setChecks] = useState(() => {
    const initial = {};
    PRE_COMPLETION_ITEMS.forEach(it => {
      initial[it.key] = it.auto ? fmtDate(addDays(new Date(), -Math.floor(Math.random() * 7 + 1))) : null;
    });
    return initial;
  });

  const toggle = (key) => {
    setChecks(prev => ({
      ...prev,
      [key]: prev[key] ? null : fmtDate(new Date()),
    }));
  };

  const allDone = PRE_COMPLETION_ITEMS.every(it => checks[it.key]);

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Pre-Completion Checklist</div>
        {PRE_COMPLETION_ITEMS.map(it => {
          const done = !!checks[it.key];
          return (
            <div
              key={it.key}
              onClick={() => toggle(it.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 0",
                borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer",
                userSelect: "none",
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: done ? "none" : `2px solid ${T.border}`,
                background: done ? T.success : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{"\u2713"}</span>}
              </div>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: done ? T.text : T.textMuted }}>
                {it.label}
              </span>
              {done && (
                <span style={{ fontSize: 11, color: T.textMuted }}>{checks[it.key]}</span>
              )}
            </div>
          );
        })}
      </Card>

      {!allDone && (
        <div style={{ fontSize: 12, color: T.warning, fontWeight: 600 }}>
          {Ico.alert(14)} All items must be completed before proceeding.
        </div>
      )}
      {allDone && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: T.success, fontSize: 13, fontWeight: 600 }}>
          {Ico.check(16)} All pre-completion items verified
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   STEP 6 — DISBURSEMENT
──────────────────────────────────────────── */
function StepDisbursement({ loan, onClose }) {
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const scheduledDate = fmtDate(addDays(new Date(), 3));

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => { setCreating(false); setCreated(true); }, 1500);
  };

  const handleComplete = () => {
    setCompleting(true);
    setTimeout(() => { setCompleting(false); setCompleted(true); }, 1500);
  };

  if (completed) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: T.successBg,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", border: `3px solid ${T.success}`,
        }}>
          {Ico.check(40)}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.success, marginBottom: 8 }}>
          Case Complete
        </div>
        <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 24 }}>
          {loan.id} has been onboarded to servicing.
        </div>
        <Btn primary onClick={onClose}>Close</Btn>
      </div>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14 }}>Disbursement Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 13 }}>
          <div><span style={{ color: T.textMuted }}>Loan Amount:</span> <strong>{loan.amount}</strong></div>
          <div><span style={{ color: T.textMuted }}>Scheduled Date:</span> <strong>{scheduledDate}</strong></div>
          <div><span style={{ color: T.textMuted }}>Sort Code:</span> <strong>20-45-18</strong></div>
          <div><span style={{ color: T.textMuted }}>Account Number:</span> <strong>43819274</strong></div>
        </div>
      </Card>

      {!created && (
        <Btn primary disabled={creating} onClick={handleCreate} icon="dollar" style={{ marginBottom: 16 }}>
          {creating ? "Creating..." : "Create Disbursement Instruction"}
        </Btn>
      )}

      {created && (
        <>
          <Card style={{ marginBottom: 16, background: T.warningBg, border: `1px solid ${T.warningBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              {Ico.lock(16)}
              <span style={{ fontSize: 13, fontWeight: 700, color: T.warning }}>Awaiting checker authorisation</span>
            </div>
            <div style={{ fontSize: 12, color: T.textMuted }}>
              A second Finance user must authorise this disbursement (4-eyes check).
            </div>
          </Card>

          <Btn primary disabled={completing} onClick={handleComplete} icon="check" style={{ marginTop: 8 }}>
            {completing ? "Completing..." : "Complete Case"}
          </Btn>
        </>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN WIZARD COMPONENT
════════════════════════════════════════════ */
export default function OpsCaseWizard({ loan, onClose }) {
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const canGoBack = step > 0;
  const canGoNext = step < STEPS.length - 1;

  const goNext = () => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps(prev => [...prev, step]);
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep(s => Math.max(s - 1, 0));

  const renderStep = () => {
    switch (step) {
      case 0: return <StepValuation loan={loan} />;
      case 1: return <StepOffer loan={loan} />;
      case 2: return <StepSolicitor loan={loan} />;
      case 3: return <StepConveyancing loan={loan} />;
      case 4: return <StepPreCompletion />;
      case 5: return <StepDisbursement loan={loan} onClose={onClose} />;
      default: return null;
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(12,45,59,0.55)", backdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: T.font,
    }}>
      <div style={{
        width: 900, maxWidth: "96vw", maxHeight: "90vh",
        background: T.card, borderRadius: 18,
        display: "flex", flexDirection: "column",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        overflow: "hidden",
      }}>
        {/* ── Header ── */}
        <div style={{
          background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
          padding: "18px 24px", display: "flex", alignItems: "center", gap: 14,
          color: "#fff", position: "relative",
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.7, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>
              Process Case
            </div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{loan.names}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{loan.id}</span>
              <span style={{ fontSize: 12, opacity: 0.6 }}>|</span>
              <span style={{ fontSize: 12, opacity: 0.8 }}>{loan.product}</span>
              <Pill text={loan.bucket} bg={loan.bucketColor} />
            </div>
          </div>
          <div
            onClick={onClose}
            style={{ cursor: "pointer", opacity: 0.8, padding: 4 }}
          >
            {Ico.x(22)}
          </div>
        </div>

        {/* ── Body: sidebar + content ── */}
        <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
          {/* Sidebar */}
          <div style={{
            width: 210, minWidth: 210, borderRight: `1px solid ${T.border}`,
            padding: "20px 16px", background: "#FAFAF7",
            overflowY: "auto",
          }}>
            {STEPS.map((s, i) => {
              const isDone = completedSteps.includes(i);
              const isCurrent = i === step;
              const status = isDone ? "done" : isCurrent ? "current" : "future";
              return (
                <div
                  key={s.id}
                  onClick={() => {
                    if (isDone || isCurrent || i <= step) setStep(i);
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 8px", borderRadius: 8, marginBottom: 2,
                    cursor: isDone || i <= step ? "pointer" : "default",
                    background: isCurrent ? T.primaryLight : "transparent",
                  }}
                >
                  <StepDot status={status} />
                  <span style={{
                    fontSize: 12, fontWeight: isCurrent ? 700 : 500,
                    color: isCurrent ? T.primary : isDone ? T.success : T.textMuted,
                  }}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
              Step {step + 1} of {STEPS.length}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 20 }}>
              {STEPS[step].label}
            </div>
            {renderStep()}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          borderTop: `1px solid ${T.border}`, padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#FAFAF7",
        }}>
          <Btn disabled={!canGoBack} onClick={goBack} icon="arrowLeft">
            Back
          </Btn>
          <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted }}>
            Step {step + 1} of {STEPS.length}
          </span>
          {canGoNext ? (
            <Btn primary onClick={goNext} icon="arrow">Next</Btn>
          ) : (
            <div style={{ width: 80 }} />
          )}
        </div>
      </div>
    </div>
  );
}
