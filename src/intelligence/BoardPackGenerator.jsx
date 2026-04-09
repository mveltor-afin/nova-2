import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const SECTIONS = [
  { id: 1, name: "Executive Summary", metrics: ["Net Interest Margin: 2.14%", "Portfolio Growth: +8.2% YoY", "Customer NPS: 7.8 avg"] },
  { id: 2, name: "Portfolio Overview", metrics: ["Total Book: £2.21M", "Avg LTV: 67%", "Weighted Avg Rate: 5.34%"] },
  { id: 3, name: "Pipeline & Origination", metrics: ["Active DIPs: 12", "Avg Case Time: 18 days", "Conversion: 68%"] },
  { id: 4, name: "Credit Quality", metrics: ["Arrears Rate: 0.8%", "Provisions: £186k", "Watch List: 2 accounts"] },
  { id: 5, name: "Risk Appetite Utilisation", metrics: ["Mandate Usage: 72%", "Concentration: Within limits", "LTV Distribution: Compliant"] },
  { id: 6, name: "Customer Outcomes", metrics: ["Complaints: 3 (2 resolved)", "Vulnerable Customers: 1", "Consumer Duty: Pass"] },
  { id: 7, name: "AI Performance", metrics: ["Automation Rate: 74%", "Model Accuracy: 96.2%", "Override Rate: 8%"] },
  { id: 8, name: "Broker Performance", metrics: ["Top Broker: Meridian Finance", "Avg Quality Score: 8.4", "Volume: 42 cases YTD"] },
  { id: 9, name: "Regulatory Compliance", metrics: ["Upcoming Deadlines: 4", "Submissions: All current", "Open Findings: 0"] },
  { id: 10, name: "Financial Summary", metrics: ["Revenue: £284k/month", "Cost-to-Income: 48%", "NIM: 2.14%"] },
  { id: 11, name: "Savings Portfolio", metrics: ["Deposit Book: £205k", "Avg Rate: 3.95%", "Maturities <90d: £26.8k"] },
  { id: 12, name: "Appendices", metrics: ["Detailed tables", "Methodology notes", "Data sources"] },
];

const PREVIOUS_REPORTS = [
  { date: "01 Apr 2026", pages: 24, charts: 47, tables: 12 },
  { date: "01 Mar 2026", pages: 22, charts: 44, tables: 11 },
  { date: "01 Feb 2026", pages: 23, charts: 45, tables: 12 },
];

const PROGRESS_STEPS = [
  "Compiling Portfolio data...",
  "Calculating risk metrics...",
  "Generating charts...",
  "Building PDF...",
];

export default function BoardPackGenerator() {
  const [includedSections, setIncludedSections] = useState(
    SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );
  const [generating, setGenerating] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [generated, setGenerated] = useState(false);

  const toggleSection = (id) => {
    setIncludedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = () => {
    setGenerating(true);
    setGenerated(false);
    setProgressStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < PROGRESS_STEPS.length) {
        setProgressStep(step);
      } else {
        clearInterval(interval);
        setGenerating(false);
        setGenerated(true);
      }
    }, 750);
  };

  const includedCount = Object.values(includedSections).filter(Boolean).length;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.navy }}>Board Pack Generator</h1>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>One-click monthly board report</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Last Generated" value="01 Apr" color={T.primary} sub="2026" />
        <KPICard label="Pages" value="24" color="#3B82F6" sub="Including appendices" />
        <KPICard label="Data Sources" value="12" color={T.success} sub="All connected" />
        <KPICard label="Generation Time" value="8.2s" color={T.warning} sub="Avg last 3 months" />
      </div>

      {/* Generate button and progress */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: generating || generated ? 16 : 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Generate Report</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{includedCount} of {SECTIONS.length} sections included</div>
          </div>
          <Btn primary icon="zap" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating..." : "Generate Board Pack"}
          </Btn>
        </div>

        {generating && (
          <div style={{ padding: 16, background: "#FAFAF8", borderRadius: 10, border: `1px solid ${T.borderLight}` }}>
            {PROGRESS_STEPS.map((step, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", opacity: i <= progressStep ? 1 : 0.3 }}>
                {i < progressStep ? (
                  <span style={{ color: T.success }}>{Ico.check(16)}</span>
                ) : i === progressStep ? (
                  <span style={{ color: T.primary, animation: "spin 1s linear infinite" }}>{Ico.clock(16)}</span>
                ) : (
                  <span style={{ color: T.textMuted }}>{Ico.clock(16)}</span>
                )}
                <span style={{ fontSize: 13, fontWeight: i <= progressStep ? 600 : 400, color: i <= progressStep ? T.text : T.textMuted }}>{step}</span>
              </div>
            ))}
            <div style={{ marginTop: 10, height: 4, background: T.borderLight, borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((progressStep + 1) / PROGRESS_STEPS.length) * 100}%`, background: T.primary, borderRadius: 2, transition: "width 0.5s" }} />
            </div>
          </div>
        )}

        {generated && (
          <div>
            <div style={{ padding: 16, background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}`, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                {Ico.check(18)}
                <span style={{ fontSize: 14, fontWeight: 700, color: T.success }}>Board Pack generated successfully</span>
              </div>
              <div style={{ fontSize: 13, color: T.text }}>24 pages, 47 charts, 12 data tables</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn primary icon="download">Download PDF</Btn>
              <Btn icon="send">Email to Board</Btn>
            </div>
          </div>
        )}
      </Card>

      {/* Report sections */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{Ico.file(18)} Report Sections</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {SECTIONS.map(section => {
            const included = includedSections[section.id];
            return (
              <div
                key={section.id}
                style={{
                  padding: 16, borderRadius: 10,
                  background: included ? "#FAFAF8" : "#F5F5F3",
                  border: `1px solid ${included ? T.border : T.borderLight}`,
                  opacity: included ? 1 : 0.6,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, background: T.primaryLight, padding: "2px 6px", borderRadius: 4 }}>{section.id}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{section.name}</span>
                  </div>
                  <button
                    onClick={() => toggleSection(section.id)}
                    style={{
                      width: 36, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                      background: included ? T.success : T.border,
                      position: "relative", transition: "background 0.2s",
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: "50%", background: "#fff",
                      position: "absolute", top: 2,
                      left: included ? 18 : 2,
                      transition: "left 0.2s",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                    }} />
                  </button>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {section.metrics.map((m, mi) => (
                    <div key={mi} style={{ fontSize: 11, color: T.textMuted, padding: "2px 0" }}>
                      {Ico.check(12)} {m}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Previous reports */}
      <Card>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{Ico.clock(18)} Previous Reports</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {PREVIOUS_REPORTS.map((report, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: 10, background: "#FAFAF8", border: `1px solid ${T.borderLight}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {Ico.file(18)}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Board Pack — {report.date}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{report.pages} pages, {report.charts} charts, {report.tables} data tables</div>
                </div>
              </div>
              <Btn small ghost icon="download">Download</Btn>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
