import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const MOCK_REPORTS = [
  { id: "REG-001", name: "PRA110 — Liquidity", regulator: "PRA", frequency: "Monthly", status: "Submitted", due: "31 Mar 2026", lastSubmitted: "28 Mar 2026",
    fields: [
      { name: "Total HQLA", source: "auto", complete: true, value: "142.3m" },
      { name: "Net cash outflows", source: "auto", complete: true, value: "98.7m" },
      { name: "LCR ratio", source: "auto", complete: true, value: "144.1%" },
      { name: "Contractual maturity ladder", source: "auto", complete: true, value: "Populated" },
      { name: "Concentration of funding", source: "manual", complete: true, value: "Reviewed" },
    ], completeness: 100, errors: 0 },
  { id: "REG-002", name: "MLAR — Mortgage Lending", regulator: "FCA", frequency: "Quarterly", status: "Draft", due: "15 Apr 2026", lastSubmitted: "15 Jan 2026",
    fields: [
      { name: "New lending volume", source: "auto", complete: true, value: "234.5m" },
      { name: "Gross lending by product", source: "auto", complete: true, value: "Populated" },
      { name: "Arrears analysis", source: "auto", complete: true, value: "Populated" },
      { name: "Possessions data", source: "auto", complete: true, value: "0 cases" },
      { name: "Interest rate analysis", source: "auto", complete: false, value: "Pending" },
      { name: "Geographic distribution", source: "manual", complete: false, value: "Pending" },
    ], completeness: 67, errors: 2 },
  { id: "REG-003", name: "FCA Complaints Return", regulator: "FCA", frequency: "Bi-annual", status: "Ready", due: "30 Apr 2026", lastSubmitted: "31 Oct 2025",
    fields: [
      { name: "Total complaints received", source: "auto", complete: true, value: "47" },
      { name: "Complaints by category", source: "auto", complete: true, value: "Populated" },
      { name: "Resolution timeframes", source: "auto", complete: true, value: "Populated" },
      { name: "FOS referrals", source: "manual", complete: true, value: "3" },
      { name: "Redress paid", source: "auto", complete: true, value: "12,450" },
    ], completeness: 100, errors: 0 },
  { id: "REG-004", name: "Product Sales Data (PSD)", regulator: "FCA", frequency: "Quarterly", status: "Draft", due: "15 Apr 2026", lastSubmitted: "15 Jan 2026",
    fields: [
      { name: "Mortgage sales by product type", source: "auto", complete: true, value: "Populated" },
      { name: "Intermediary vs direct split", source: "auto", complete: true, value: "72% / 28%" },
      { name: "Average LTV by product", source: "auto", complete: true, value: "Populated" },
      { name: "Fee income breakdown", source: "auto", complete: false, value: "Pending" },
      { name: "Cancellation data", source: "manual", complete: false, value: "Pending" },
    ], completeness: 60, errors: 1 },
  { id: "REG-005", name: "COREP — Capital Adequacy", regulator: "PRA", frequency: "Quarterly", status: "Submitted", due: "31 Mar 2026", lastSubmitted: "29 Mar 2026",
    fields: [
      { name: "CET1 capital", source: "auto", complete: true, value: "89.2m" },
      { name: "Risk-weighted assets", source: "auto", complete: true, value: "612.4m" },
      { name: "CET1 ratio", source: "auto", complete: true, value: "14.57%" },
      { name: "Leverage ratio", source: "auto", complete: true, value: "5.12%" },
      { name: "Pillar 2A buffer", source: "manual", complete: true, value: "2.5%" },
    ], completeness: 100, errors: 0 },
  { id: "REG-006", name: "Consumer Duty Annual Report", regulator: "FCA", frequency: "Annual", status: "Draft", due: "31 Jul 2026", lastSubmitted: "31 Jul 2025",
    fields: [
      { name: "Outcome scores summary", source: "auto", complete: true, value: "87% avg" },
      { name: "Board attestation", source: "manual", complete: false, value: "Pending" },
      { name: "Vulnerability data", source: "auto", complete: true, value: "Populated" },
      { name: "Fair value assessment", source: "manual", complete: false, value: "Pending" },
      { name: "Remedial actions log", source: "manual", complete: false, value: "Pending" },
    ], completeness: 40, errors: 0 },
  { id: "REG-007", name: "SAR Submissions Summary", regulator: "NCA", frequency: "Monthly", status: "Submitted", due: "31 Mar 2026", lastSubmitted: "30 Mar 2026",
    fields: [
      { name: "SARs filed this period", source: "auto", complete: true, value: "12" },
      { name: "Categories breakdown", source: "auto", complete: true, value: "Populated" },
      { name: "Average filing time", source: "auto", complete: true, value: "2.3 days" },
      { name: "Consent requests", source: "manual", complete: true, value: "1" },
    ], completeness: 100, errors: 0 },
  { id: "REG-008", name: "Regulatory Capital (ICAAP)", regulator: "PRA", frequency: "Annual", status: "Overdue", due: "28 Feb 2026", lastSubmitted: "28 Feb 2025",
    fields: [
      { name: "Stress testing results", source: "manual", complete: true, value: "Completed" },
      { name: "Capital planning projections", source: "auto", complete: true, value: "Populated" },
      { name: "Risk appetite statement", source: "manual", complete: false, value: "Under review" },
      { name: "Reverse stress test", source: "manual", complete: false, value: "Pending" },
      { name: "Wind-down analysis", source: "manual", complete: false, value: "Pending" },
      { name: "Board sign-off", source: "manual", complete: false, value: "Pending" },
    ], completeness: 33, errors: 3 },
  { id: "REG-009", name: "Annual Financial Crime Report", regulator: "FCA", frequency: "Annual", status: "Ready", due: "30 Jun 2026", lastSubmitted: "30 Jun 2025",
    fields: [
      { name: "AML controls effectiveness", source: "auto", complete: true, value: "94%" },
      { name: "Transaction monitoring stats", source: "auto", complete: true, value: "Populated" },
      { name: "Training completion rates", source: "auto", complete: true, value: "97%" },
      { name: "MLRO report summary", source: "manual", complete: true, value: "Completed" },
    ], completeness: 100, errors: 0 },
];

const STATUS_STYLES = {
  Draft:     { bg: "#E8E8E8", text: "#555" },
  Ready:     { bg: "#DBEAFE", text: "#1E40AF" },
  Submitted: { bg: "#D1FAE5", text: "#065F46" },
  Overdue:   { bg: "#FEE2E2", text: "#991B1B" },
};

function RegulatoryReportingScreen() {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState(null);
  const [regFilter, setRegFilter] = useState("All");

  const regulators = ["All", "PRA", "FCA", "NCA"];

  const dueCount       = MOCK_REPORTS.filter(r => r.status === "Draft" || r.status === "Ready").length;
  const submittedQ     = MOCK_REPORTS.filter(r => r.status === "Submitted").length;
  const overdueCount   = MOCK_REPORTS.filter(r => r.status === "Overdue").length;
  const avgCompleteness = Math.round(MOCK_REPORTS.reduce((s, r) => s + r.completeness, 0) / MOCK_REPORTS.length * 10) / 10;

  const shown = MOCK_REPORTS.filter(r =>
    (regFilter === "All" || r.regulator === regFilter) &&
    (r.name.toLowerCase().includes(search.toLowerCase()) ||
     r.regulator.toLowerCase().includes(search.toLowerCase()))
  );

  /* ── Detail view ── */
  if (selected) {
    const r = selected;
    const autoCount = r.fields.filter(f => f.source === "auto").length;
    const manualCount = r.fields.filter(f => f.source === "manual").length;
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, cursor: "pointer" }} onClick={() => setSelected(null)}>
          <span style={{ color: T.primary }}>{Ico.arrowLeft(18)}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: T.primary }}>Back to Reports</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{r.name}</h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>
              {r.regulator} | {r.frequency} | Due: {r.due}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn ghost icon="download">Export Data</Btn>
            {r.status !== "Submitted" && <Btn primary icon="zap">Generate Report</Btn>}
            {r.status === "Ready" && <Btn primary icon="send" style={{ background: `linear-gradient(135deg,${T.accent},#1A9A7A)` }}>Submit to {r.regulator}</Btn>}
          </div>
        </div>

        {/* Status cards */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <KPICard label="Completeness"  value={`${r.completeness}%`} sub={r.completeness === 100 ? "All fields populated" : "Fields pending"} color={r.completeness === 100 ? T.success : T.warning} />
          <KPICard label="Validation"    value={r.errors === 0 ? "Passed" : `${r.errors} errors`} sub={r.errors === 0 ? "No issues found" : "Requires attention"} color={r.errors === 0 ? T.success : T.danger} />
          <KPICard label="Auto-extracted" value={`${autoCount}/${r.fields.length}`} sub={`${manualCount} manual fields`} color={T.primary} />
          <KPICard label="Last Submitted" value={r.lastSubmitted} sub={r.frequency} color={T.textMuted} />
        </div>

        {/* Auto-extraction status */}
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: T.text }}>Auto-Extraction Status</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Fields populated from live platform data vs. manual entry</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: autoCount, height: 10, borderRadius: "5px 0 0 5px", background: T.success }} />
            <div style={{ flex: manualCount, height: 10, borderRadius: "0 5px 5px 0", background: T.warning }} />
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.success }} /> Auto ({autoCount})
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.textMuted }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.warning }} /> Manual ({manualCount})
            </div>
          </div>
        </Card>

        {/* Data fields */}
        <Card noPad>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, fontSize: 14, fontWeight: 700, color: T.text }}>
            Data Fields
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: T.bg }}>
                {["Field", "Source", "Value", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: 11, fontWeight: 600,
                    color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.fields.map((f, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: T.text }}>{f.name}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                      background: f.source === "auto" ? T.successBg : T.warningBg,
                      color: f.source === "auto" ? T.success : T.warning }}>{f.source === "auto" ? "Auto" : "Manual"}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: T.textSecondary, fontFamily: "monospace" }}>{f.value}</td>
                  <td style={{ padding: "11px 16px" }}>
                    {f.complete ? (
                      <span style={{ color: T.success, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                        {Ico.check(14)} Complete
                      </span>
                    ) : (
                      <span style={{ color: T.warning, display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                        {Ico.clock(14)} Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {r.errors > 0 && (
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, background: T.dangerBg, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: T.danger }}>{Ico.alert(16)}</span>
              <span style={{ fontSize: 12, color: T.danger, fontWeight: 600 }}>{r.errors} validation error{r.errors > 1 ? "s" : ""} found — review required before submission</span>
            </div>
          )}
        </Card>
      </div>
    );
  }

  /* ── Main list view ── */
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Regulatory Reporting</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>
            PRA, FCA and NCA submission tracker with auto-extraction from platform data
          </p>
        </div>
        <Btn ghost icon="download">Export Schedule</Btn>
      </div>

      {/* KPI strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Reports Due"         value={String(dueCount)}          sub="draft or ready"        color={T.warning} />
        <KPICard label="Submitted This Qtr"  value={String(submittedQ)}        sub="Q1 2026"               color={T.success} />
        <KPICard label="Data Quality"         value={`${avgCompleteness}%`}    sub="avg completeness"      color={T.primary} />
        <KPICard label="Next Deadline"        value="15 Apr"                    sub="MLAR & PSD due"        color={T.danger} />
        {overdueCount > 0 && <KPICard label="Overdue" value={String(overdueCount)} sub="action required" color={T.danger} />}
      </div>

      {/* Table */}
      <Card noPad>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 340 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.textMuted }}>{Ico.search(15)}</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..."
              style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: 8, border: `1px solid ${T.border}`,
                fontSize: 13, fontFamily: T.font, outline: "none", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {regulators.map(r => (
              <div key={r} onClick={() => setRegFilter(r)}
                style={{ padding: "5px 12px", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: regFilter === r ? T.primary : T.card, color: regFilter === r ? "#fff" : T.textSecondary,
                  border: `1px solid ${regFilter === r ? T.primary : T.border}` }}>{r}</div>
            ))}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: T.bg }}>
              {["Report", "Regulator", "Frequency", "Completeness", "Status", "Due Date", "Last Submitted"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "9px 16px", fontSize: 11, fontWeight: 600,
                  color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map(r => {
              const st = STATUS_STYLES[r.status] || { bg: "#E5E7EB", text: "#374151" };
              return (
                <tr key={r.id} onClick={() => setSelected(r)}
                  style={{ borderTop: `1px solid ${T.borderLight}`, cursor: "pointer", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "11px 16px", fontSize: 13, fontWeight: 600, color: T.text }}>{r.name}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                      background: regBg(r.regulator), color: regColor(r.regulator) }}>{r.regulator}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: T.textSecondary }}>{r.frequency}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 60, height: 6, borderRadius: 3, background: T.bg, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${r.completeness}%`, borderRadius: 3,
                          background: r.completeness === 100 ? T.success : r.completeness >= 60 ? T.warning : T.danger }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{r.completeness}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ background: st.bg, color: st.text, padding: "3px 10px", borderRadius: 5, fontSize: 10, fontWeight: 700 }}>{r.status}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: r.status === "Overdue" ? T.danger : T.textMuted, fontWeight: r.status === "Overdue" ? 700 : 400, whiteSpace: "nowrap" }}>{r.due}</td>
                  <td style={{ padding: "11px 16px", fontSize: 12, color: T.textMuted, whiteSpace: "nowrap" }}>{r.lastSubmitted}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, fontSize: 12, color: T.textMuted }}>
          Showing {shown.length} of {MOCK_REPORTS.length} regulatory reports. All submissions are logged in the audit trail.
        </div>
      </Card>
    </div>
  );
}

/* ── helpers ── */
function regColor(reg) {
  return { PRA: "#7C3AED", FCA: T.primary, NCA: T.warning, BoE: "#1D4ED8" }[reg] || T.textMuted;
}
function regBg(reg) {
  return { PRA: "#F3E8FF", FCA: `${T.primary}18`, NCA: T.warningBg, BoE: "#DBEAFE" }[reg] || "#E5E7EB";
}

export default RegulatoryReportingScreen;
