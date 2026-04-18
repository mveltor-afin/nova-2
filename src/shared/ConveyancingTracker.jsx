import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { TEAM_MEMBERS } from "../data/loans";

const STAGES = [
  { label: "Instructed",           benchmarkDay: 0 },
  { label: "Client ID Verified",   benchmarkDay: 2 },
  { label: "Searches Ordered",     benchmarkDay: 3 },
  { label: "Searches Received",    benchmarkDay: 10 },
  { label: "Title Report Issued",  benchmarkDay: 14 },
  { label: "Enquiries Raised",     benchmarkDay: 16 },
  { label: "Enquiries Resolved",   benchmarkDay: 22 },
  { label: "Exchange",             benchmarkDay: 25 },
  { label: "Completion",           benchmarkDay: 28 },
];

const SELLER_SOLICITOR = {
  firm: "Whitfield & Reeves LLP",
  sra: "SRA-671234",
  handler: "Laura Whitfield",
  phone: "+44 20 7946 9901",
  email: "l.whitfield@whitfieldreeves.co.uk",
};

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function daysBetween(a, b) {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export default function ConveyancingTracker({ caseId = "AFN-2026-00142", solicitorId = "SOL-01" }) {
  const [chaseStatus, setChaseStatus] = useState(null);

  const solicitor = TEAM_MEMBERS.solicitors.find(s => s.id === solicitorId) || TEAM_MEMBERS.solicitors[0];

  // Mock: current stage is stage 5 (Title Report Issued, index 4)
  const currentStageIndex = 4;
  const instructionDate = new Date("2026-03-20");

  // Build stage data with actual/estimated dates
  const stageData = STAGES.map((stage, i) => {
    const benchmarkDate = addDays(instructionDate, stage.benchmarkDay);
    if (i < currentStageIndex) {
      // Completed: add some variance
      const variance = i === 3 ? 2 : i === 1 ? -1 : 0; // Searches took 2 extra days
      const actualDate = addDays(instructionDate, stage.benchmarkDay + variance);
      const daysTaken = stage.benchmarkDay + variance;
      return { ...stage, status: "complete", date: actualDate, daysTaken, variance };
    } else if (i === currentStageIndex) {
      const actualDate = addDays(instructionDate, stage.benchmarkDay + 1);
      return { ...stage, status: "current", date: actualDate, daysTaken: stage.benchmarkDay + 1, variance: 1 };
    } else {
      return { ...stage, status: "future", date: benchmarkDate, daysTaken: null, variance: 0 };
    }
  });

  // SLA calculation
  const totalVariance = stageData.filter(s => s.status !== "future").reduce((a, s) => a + (s.variance || 0), 0);
  const slaStatus = totalVariance <= 1 ? "on-track" : totalVariance <= 4 ? "at-risk" : "breaching";
  const slaLabel = slaStatus === "on-track" ? "On Track" : slaStatus === "at-risk" ? "At Risk" : "Breaching SLA";
  const slaColor = slaStatus === "on-track" ? T.success : slaStatus === "at-risk" ? T.warning : T.danger;
  const slaBg = slaStatus === "on-track" ? T.successBg : slaStatus === "at-risk" ? T.warningBg : T.dangerBg;

  const estimatedCompletion = addDays(instructionDate, 28 + totalVariance);

  const handleChase = () => {
    setChaseStatus("sending");
    setTimeout(() => setChaseStatus("sent"), 1500);
    setTimeout(() => setChaseStatus(null), 5000);
  };

  const dotSize = 18;

  return (
    <div style={{ padding: 32, fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Ico.shield(22)}
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Conveyancing Tracker</h1>
            <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>Case {caseId} &middot; {solicitor.firm}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* SLA Badge */}
          <span style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: slaBg, color: slaColor, border: `1px solid ${slaColor}30`,
          }}>
            {slaLabel} &middot; Est. completion {formatDate(estimatedCompletion)}
          </span>
          <Btn primary icon="send" onClick={handleChase} disabled={chaseStatus === "sending"}>
            {chaseStatus === "sending" ? "Sending..." : chaseStatus === "sent" ? "Chase Sent!" : "Chase Solicitor"}
          </Btn>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Current Stage" value={STAGES[currentStageIndex].label} sub={`Stage ${currentStageIndex + 1} of ${STAGES.length}`} color={T.primary} />
        <KPICard label="Days Elapsed" value={`${daysBetween(instructionDate, new Date())}d`} sub={`of ${28}d benchmark`} color={T.accent} />
        <KPICard label="Est. Completion" value={formatDate(estimatedCompletion)} sub={totalVariance > 0 ? `+${totalVariance}d from target` : "On target"} color={slaColor} />
        <KPICard label="Solicitor Rating" value={solicitor.rating} sub={`${solicitor.firm}`} color={T.warning} />
      </div>

      {/* Horizontal Timeline */}
      <Card style={{ marginBottom: 24, padding: "28px 32px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>Conveyancing Milestones</div>
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          {/* Connecting line */}
          <div style={{
            position: "absolute", top: dotSize / 2 - 1, left: dotSize / 2, right: dotSize / 2,
            height: 3, background: T.borderLight, zIndex: 0,
          }} />
          {/* Progress line */}
          <div style={{
            position: "absolute", top: dotSize / 2 - 1, left: dotSize / 2,
            width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`,
            height: 3, background: T.success, zIndex: 1,
          }} />

          {stageData.map((stage, i) => {
            const dotColor = stage.status === "complete" ? T.success
              : stage.status === "current" ? T.warning
              : T.borderLight;

            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 2, flex: 1, minWidth: 0 }}>
                {/* Dot */}
                <div style={{
                  width: dotSize, height: dotSize, borderRadius: "50%",
                  background: dotColor, border: `3px solid ${stage.status === "current" ? T.warning : dotColor}`,
                  boxShadow: stage.status === "current" ? `0 0 0 4px ${T.warningBg}, 0 0 12px ${T.warning}60` : "none",
                  animation: stage.status === "current" ? "pulse 2s ease-in-out infinite" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {stage.status === "complete" && (
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  )}
                </div>
                {/* Label */}
                <div style={{
                  marginTop: 8, fontSize: 10, fontWeight: 600, textAlign: "center",
                  color: stage.status === "future" ? T.textMuted : T.text,
                  maxWidth: 80, lineHeight: 1.3,
                }}>{stage.label}</div>
                {/* Date */}
                <div style={{ marginTop: 3, fontSize: 9, color: T.textMuted, textAlign: "center" }}>
                  {stage.status === "future" ? `Est. ${formatDate(stage.date)}` : formatDate(stage.date)}
                </div>
                {/* Variance indicator */}
                {stage.status !== "future" && stage.variance !== 0 && (
                  <div style={{
                    marginTop: 2, fontSize: 9, fontWeight: 700,
                    color: stage.variance > 0 ? T.danger : T.success,
                  }}>
                    {stage.variance > 0 ? `+${stage.variance}d` : `${stage.variance}d`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Pulse animation */}
        <style>{`@keyframes pulse { 0%, 100% { box-shadow: 0 0 0 4px ${T.warningBg}, 0 0 12px ${T.warning}60; } 50% { box-shadow: 0 0 0 8px ${T.warningBg}, 0 0 20px ${T.warning}90; } }`}</style>
      </Card>

      {/* Stage Detail Table */}
      <Card noPad style={{ marginBottom: 24 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, fontSize: 13, fontWeight: 700 }}>Stage Details</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: `1px solid ${T.border}` }}>
              {["#", "Stage", "Date", "Days Taken", "Benchmark", "Variance", "Status"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stageData.map((stage, i) => (
              <tr key={i} style={{
                borderBottom: `1px solid ${T.borderLight}`,
                background: stage.status === "current" ? T.warningBg : "transparent",
              }}>
                <td style={{ padding: "10px 16px", fontWeight: 600, color: T.textMuted }}>{i + 1}</td>
                <td style={{ padding: "10px 16px", fontWeight: 600 }}>{stage.label}</td>
                <td style={{ padding: "10px 16px" }}>
                  {stage.status === "future" ? <span style={{ color: T.textMuted, fontStyle: "italic" }}>Est. {formatDate(stage.date)}</span> : formatDate(stage.date)}
                </td>
                <td style={{ padding: "10px 16px" }}>
                  {stage.daysTaken != null ? `${stage.daysTaken}d` : "\u2014"}
                </td>
                <td style={{ padding: "10px 16px" }}>{stage.benchmarkDay}d</td>
                <td style={{ padding: "10px 16px" }}>
                  {stage.status === "future" ? "\u2014" : (
                    <span style={{ fontWeight: 700, color: stage.variance > 0 ? T.danger : stage.variance < 0 ? T.success : T.textMuted }}>
                      {stage.variance > 0 ? `+${stage.variance}d` : stage.variance < 0 ? `${stage.variance}d` : "0d"}
                    </span>
                  )}
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: stage.status === "complete" ? T.successBg : stage.status === "current" ? T.warningBg : "#F1F5F9",
                    color: stage.status === "complete" ? T.success : stage.status === "current" ? T.warning : T.textMuted,
                  }}>
                    {stage.status === "complete" ? "Complete" : stage.status === "current" ? "In Progress" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Solicitor Info Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Buyer Solicitor */}
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Buyer Solicitor</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: T.primaryLight,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, color: T.primary,
            }}>{solicitor.initials}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{solicitor.firm}</div>
              <div style={{ fontSize: 12, color: T.textMuted, fontFamily: "monospace" }}>{solicitor.sra}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Handler</div>
              <div style={{ fontWeight: 600 }}>{solicitor.name}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Rating</div>
              <div style={{ fontWeight: 600 }}>{solicitor.rating} / 5.0</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Phone</div>
              <div style={{ fontWeight: 600 }}>{solicitor.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Email</div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{solicitor.email}</div>
            </div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {solicitor.specialism.map(sp => (
              <span key={sp} style={{ padding: "3px 8px", borderRadius: 6, background: T.primaryLight, color: T.primary, fontSize: 11, fontWeight: 600 }}>{sp}</span>
            ))}
          </div>
        </Card>

        {/* Seller Solicitor */}
        <Card>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Seller Solicitor</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: "#F3E8FF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, color: "#7C3AED",
            }}>WR</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{SELLER_SOLICITOR.firm}</div>
              <div style={{ fontSize: 12, color: T.textMuted, fontFamily: "monospace" }}>{SELLER_SOLICITOR.sra}</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Handler</div>
              <div style={{ fontWeight: 600 }}>{SELLER_SOLICITOR.handler}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Firm Type</div>
              <div style={{ fontWeight: 600 }}>External</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Phone</div>
              <div style={{ fontWeight: 600 }}>{SELLER_SOLICITOR.phone}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>Email</div>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{SELLER_SOLICITOR.email}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* SLA Indicator */}
      <Card style={{ borderLeft: `4px solid ${slaColor}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: slaColor }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>SLA Status: {slaLabel}</span>
            </div>
            <div style={{ fontSize: 12, color: T.textMuted }}>
              {totalVariance > 0
                ? `Currently ${totalVariance} day${totalVariance > 1 ? "s" : ""} behind schedule. Target completion: ${formatDate(addDays(instructionDate, 28))}, estimated: ${formatDate(estimatedCompletion)}.`
                : `On schedule for completion by ${formatDate(addDays(instructionDate, 28))}.`}
            </div>
          </div>
          <Btn primary icon="send" onClick={handleChase} disabled={chaseStatus === "sending"}>
            {chaseStatus === "sending" ? "Sending..." : chaseStatus === "sent" ? "Chase Sent!" : "Chase Solicitor"}
          </Btn>
        </div>
      </Card>
    </div>
  );
}
