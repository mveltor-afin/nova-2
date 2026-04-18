import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";

// ─────────────────────────────────────────────
// MY CASES — Personal case queue for logged-in ops user
// Shows cases assigned to OPS-01 grouped by stage.
// ─────────────────────────────────────────────

const LOGGED_IN_USER = "OPS-01"; // Tom Walker

// Map loan status → ops stage + wizard step
const STAGE_MAP = {
  Approved:         { stage: "Valuation",              step: 1, label: "Valuation" },
  Underwriting:     { stage: "Valuation",              step: 1, label: "Valuation" },
  KYC_In_Progress:  { stage: "Valuation",              step: 1, label: "Valuation" },
  DIP_Approved:     { stage: "Valuation",              step: 1, label: "Valuation" },
  Offer_Issued:     { stage: "Solicitor & Conveyancing", step: 3, label: "Solicitor & Conveyancing" },
  Offer_Accepted:   { stage: "Pre-Completion",         step: 4, label: "Pre-Completion" },
  Disbursed:        { stage: "Disbursement",           step: 5, label: "Disbursement" },
  Submitted:        { stage: "Valuation",              step: 1, label: "Valuation" },
  Referred:         { stage: "Offer & ESIS",           step: 2, label: "Offer & ESIS" },
};

function getStageInfo(status) {
  return STAGE_MAP[status] || { stage: "Valuation", step: 1, label: "Valuation" };
}

// Mock days-in-stage and SLA
const DAYS_IN_STAGE = {
  "AFN-2026-00142": 2,
  "AFN-2026-00128": 8,
  "AFN-2026-00119": 5,
  "AFN-2026-00146": 3,
  "AFN-2026-00139": 6,
};

const SLA_LIMITS = {
  Valuation: 5,
  "Offer & ESIS": 3,
  "Solicitor & Conveyancing": 10,
  "Pre-Completion": 5,
  Disbursement: 2,
};

function getSLAStatus(stageName, daysInStage) {
  const limit = SLA_LIMITS[stageName] || 5;
  if (daysInStage <= limit * 0.6) return { label: "On Track", color: T.success, bg: T.successBg };
  if (daysInStage <= limit) return { label: "At Risk", color: T.warning, bg: T.warningBg };
  return { label: "Breaching", color: T.danger, bg: T.dangerBg };
}

const STAGE_ORDER = ["Valuation", "Offer & ESIS", "Solicitor & Conveyancing", "Pre-Completion", "Disbursement"];

const STAGE_ICONS = {
  Valuation: Ico.search,
  "Offer & ESIS": Ico.file,
  "Solicitor & Conveyancing": Ico.shield,
  "Pre-Completion": Ico.check,
  Disbursement: Ico.dollar,
};

export default function MyCases({ persona, onOpenWizard }) {
  const [filter, setFilter] = useState("all");

  // Get cases assigned to OPS-01
  const myCases = MOCK_LOANS.filter(l => l.squad?.ops === LOGGED_IN_USER);

  // Enrich with stage info
  const enriched = myCases.map(loan => {
    const stageInfo = getStageInfo(loan.status);
    const days = DAYS_IN_STAGE[loan.id] || Math.floor(Math.random() * 7) + 1;
    const sla = getSLAStatus(stageInfo.stage, days);
    return { ...loan, stageInfo, daysInStage: days, sla };
  });

  // Group by stage
  const grouped = {};
  STAGE_ORDER.forEach(s => { grouped[s] = []; });
  enriched.forEach(c => {
    const stage = c.stageInfo.stage;
    if (grouped[stage]) grouped[stage].push(c);
    else grouped[stage] = [c];
  });

  // KPI counts
  const totalActive = enriched.length;
  const inValuation = grouped["Valuation"].length;
  const inOffer = grouped["Offer & ESIS"].length;
  const inConveyancing = grouped["Solicitor & Conveyancing"].length;
  const inPreCompletion = grouped["Pre-Completion"].length;

  // Filter
  const filteredStages = filter === "all"
    ? STAGE_ORDER
    : STAGE_ORDER.filter(s => s === filter);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {Ico.loans(22)}
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>My Cases</h2>
          <div style={{ fontSize: 12, color: T.textMuted }}>{totalActive} active case{totalActive !== 1 ? "s" : ""} assigned to you</div>
        </div>
        <div style={{
          padding: "6px 14px", borderRadius: 8, background: T.primaryLight,
          fontSize: 13, fontWeight: 700, color: T.primary,
        }}>
          {totalActive}
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Total Active" value={totalActive} color={T.primary} />
        <KPICard label="In Valuation" value={inValuation} sub="step 1" color={T.accent} />
        <KPICard label="In Offer" value={inOffer} sub="step 2" color="#F59E0B" />
        <KPICard label="In Conveyancing" value={inConveyancing} sub="step 3" color="#8B5CF6" />
        <KPICard label="In Pre-Completion" value={inPreCompletion} sub="step 4" color="#0EA5E9" />
      </div>

      {/* Stage filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {[{ id: "all", label: "All Stages" }, ...STAGE_ORDER.map(s => ({ id: s, label: s }))].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: T.font, fontSize: 12, fontWeight: 600,
            background: filter === f.id ? T.primary : "transparent",
            color: filter === f.id ? "#fff" : T.textMuted,
          }}>{f.label}</button>
        ))}
      </div>

      {/* Case groups */}
      {filteredStages.map(stageName => {
        const cases = grouped[stageName];
        if (!cases || cases.length === 0) return null;
        const StageIcon = STAGE_ICONS[stageName] || Ico.loans;

        return (
          <div key={stageName} style={{ marginBottom: 28 }}>
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ color: T.primary }}>{StageIcon(18)}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{stageName}</span>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 9px", borderRadius: 10,
                background: T.primaryLight, color: T.primary,
              }}>{cases.length}</span>
            </div>

            {/* Case cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cases.map(c => (
                <Card key={c.id} style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Left: case details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.navy, fontFamily: "monospace" }}>{c.id}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.names}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: (c.bucketColor || T.primary) + "14", color: c.bucketColor || T.primary }}>{c.bucket}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.textMuted, marginBottom: 6 }}>
                        <span>{c.product}</span>
                        <span style={{ fontWeight: 600 }}>{c.amount}</span>
                        <span>{c.rate}</span>
                        <span>LTV: {c.ltv}%</span>
                      </div>

                      {/* Stage indicator + SLA */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        {/* Stage progress dots */}
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          {STAGE_ORDER.map((s, i) => (
                            <div key={s} style={{
                              width: i <= STAGE_ORDER.indexOf(c.stageInfo.stage) ? 18 : 8,
                              height: 6, borderRadius: 3,
                              background: i < STAGE_ORDER.indexOf(c.stageInfo.stage) ? T.success
                                : i === STAGE_ORDER.indexOf(c.stageInfo.stage) ? T.primary
                                : T.borderLight,
                              transition: "all 0.2s",
                            }} title={s} />
                          ))}
                        </div>

                        <span style={{ fontSize: 11, color: T.textMuted }}>
                          {c.daysInStage} day{c.daysInStage !== 1 ? "s" : ""} in stage
                        </span>

                        {/* SLA pill */}
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                          background: c.sla.bg, color: c.sla.color,
                        }}>{c.sla.label}</span>
                      </div>
                    </div>

                    {/* Right: action */}
                    <Btn primary small onClick={() => onOpenWizard?.(c, c.stageInfo.step)}>
                      Continue Processing
                    </Btn>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {enriched.length === 0 && (
        <Card style={{ textAlign: "center", padding: 40, color: T.textMuted }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>{Ico.check(32)}</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Queue clear</div>
          <div style={{ fontSize: 12 }}>No cases currently assigned to you.</div>
        </Card>
      )}
    </div>
  );
}
