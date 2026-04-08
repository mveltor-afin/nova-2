import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const BarChart = ({ data, color, height = 80, labelKey = "label", valueKey = "v", unit = "" }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{unit}{d[valueKey]}</div>
          <div style={{ width: "100%", background: `${color}20`, borderRadius: "4px 4px 0 0", position: "relative", height: height - 28 }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderRadius: "4px 4px 0 0",
              background: color, height: `${(d[valueKey] / max) * 100}%`, transition: "height 0.4s" }} />
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, textAlign: "center", lineHeight: 1.2 }}>{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
};

const MODELS = [
  { name: "Document Parser", version: "3.2.1", accuracy: 96.4, precision: 95.8, recall: 97.1, f1: 96.4, decisions: 1842, overrideRate: 4.2, drift: "Stable" },
  { name: "Underwriting Recommender", version: "2.8.0", accuracy: 93.1, precision: 92.4, recall: 93.8, f1: 93.1, decisions: 312, overrideRate: 12.5, drift: "Stable" },
  { name: "Fraud Detector", version: "4.1.3", accuracy: 97.8, precision: 98.2, recall: 96.1, f1: 97.1, decisions: 2104, overrideRate: 2.8, drift: "Stable" },
  { name: "Vulnerability Detector", version: "1.4.2", accuracy: 89.6, precision: 87.3, recall: 92.1, f1: 89.6, decisions: 486, overrideRate: 15.3, drift: "Watch" },
  { name: "Payment Risk Predictor", version: "2.2.0", accuracy: 94.5, precision: 93.9, recall: 95.2, f1: 94.5, decisions: 756, overrideRate: 6.1, drift: "Stable" },
  { name: "AVM Confidence", version: "3.0.1", accuracy: 91.2, precision: 90.5, recall: 91.8, f1: 91.1, decisions: 628, overrideRate: 9.4, drift: "Alert" },
];

const CONFUSION_MATRICES = {
  "Document Parser": { tp: 1776, fp: 32, fn: 18, tn: 16 },
  "Underwriting Recommender": { tp: 278, fp: 12, fn: 10, tn: 12 },
  "Fraud Detector": { tp: 82, fp: 3, fn: 6, tn: 2013 },
  "Vulnerability Detector": { tp: 68, fp: 14, fn: 8, tn: 396 },
  "Payment Risk Predictor": { tp: 124, fp: 8, fn: 6, tn: 618 },
  "AVM Confidence": { tp: 542, fp: 28, fn: 22, tn: 36 },
};

const MONTHLY_ACCURACY = {
  "Document Parser": [
    { label: "Nov", v: 95.8 }, { label: "Dec", v: 96.0 }, { label: "Jan", v: 96.1 },
    { label: "Feb", v: 96.2 }, { label: "Mar", v: 96.3 }, { label: "Apr", v: 96.4 },
  ],
  "Underwriting Recommender": [
    { label: "Nov", v: 91.2 }, { label: "Dec", v: 91.8 }, { label: "Jan", v: 92.4 },
    { label: "Feb", v: 92.8 }, { label: "Mar", v: 93.0 }, { label: "Apr", v: 93.1 },
  ],
  "Fraud Detector": [
    { label: "Nov", v: 97.2 }, { label: "Dec", v: 97.4 }, { label: "Jan", v: 97.5 },
    { label: "Feb", v: 97.6 }, { label: "Mar", v: 97.7 }, { label: "Apr", v: 97.8 },
  ],
  "Vulnerability Detector": [
    { label: "Nov", v: 90.8 }, { label: "Dec", v: 90.2 }, { label: "Jan", v: 89.9 },
    { label: "Feb", v: 89.8 }, { label: "Mar", v: 89.7 }, { label: "Apr", v: 89.6 },
  ],
  "Payment Risk Predictor": [
    { label: "Nov", v: 93.8 }, { label: "Dec", v: 94.0 }, { label: "Jan", v: 94.1 },
    { label: "Feb", v: 94.2 }, { label: "Mar", v: 94.4 }, { label: "Apr", v: 94.5 },
  ],
  "AVM Confidence": [
    { label: "Nov", v: 92.6 }, { label: "Dec", v: 92.1 }, { label: "Jan", v: 91.8 },
    { label: "Feb", v: 91.5 }, { label: "Mar", v: 91.3 }, { label: "Apr", v: 91.2 },
  ],
};

const RECENT_OVERRIDES = {
  "Document Parser": [
    { date: "04 Apr", caseId: "HB-2026-1184", field: "Income verification", reason: "Payslip format unrecognised" },
    { date: "03 Apr", caseId: "HB-2026-1179", field: "ID document type", reason: "Biometric passport edge case" },
    { date: "01 Apr", caseId: "HB-2026-1172", field: "Address extraction", reason: "Non-standard format" },
  ],
  "Underwriting Recommender": [
    { date: "05 Apr", caseId: "HB-2026-1186", field: "Risk grade", reason: "Complex income structure" },
    { date: "03 Apr", caseId: "HB-2026-1178", field: "LTV tolerance", reason: "New-build premium area" },
    { date: "02 Apr", caseId: "HB-2026-1175", field: "Recommendation", reason: "Senior underwriter discretion" },
  ],
  "Fraud Detector": [
    { date: "04 Apr", caseId: "HB-2026-1183", field: "Alert level", reason: "Known employer pattern" },
    { date: "28 Mar", caseId: "HB-2026-1160", field: "Document authenticity", reason: "Watermark variant" },
  ],
  "Vulnerability Detector": [
    { date: "05 Apr", caseId: "HB-2026-1187", field: "Vulnerability flag", reason: "Context not captured in text" },
    { date: "04 Apr", caseId: "HB-2026-1182", field: "Vulnerability flag", reason: "Age alone not vulnerable" },
    { date: "02 Apr", caseId: "HB-2026-1176", field: "Risk level", reason: "Temporary health condition" },
  ],
  "Payment Risk Predictor": [
    { date: "04 Apr", caseId: "HB-2026-1185", field: "Risk score", reason: "Seasonal income pattern" },
    { date: "01 Apr", caseId: "HB-2026-1171", field: "Payment forecast", reason: "Known bonus structure" },
  ],
  "AVM Confidence": [
    { date: "05 Apr", caseId: "HB-2026-1188", field: "Confidence band", reason: "Listed building not in comparables" },
    { date: "03 Apr", caseId: "HB-2026-1180", field: "Valuation range", reason: "Recent local sale data" },
    { date: "02 Apr", caseId: "HB-2026-1174", field: "Confidence band", reason: "Unusual property type" },
  ],
};

const GOVERNANCE = {
  "Document Parser": { lastAudit: "15 Mar 2026", nextReview: "15 Jun 2026", classification: "Tier 2 — Operational" },
  "Underwriting Recommender": { lastAudit: "01 Feb 2026", nextReview: "01 May 2026", classification: "Tier 1 — Decision Critical" },
  "Fraud Detector": { lastAudit: "20 Mar 2026", nextReview: "20 Jun 2026", classification: "Tier 1 — Decision Critical" },
  "Vulnerability Detector": { lastAudit: "10 Jan 2026", nextReview: "10 Apr 2026", classification: "Tier 1 — Consumer Duty" },
  "Payment Risk Predictor": { lastAudit: "28 Feb 2026", nextReview: "28 May 2026", classification: "Tier 1 — Decision Critical" },
  "AVM Confidence": { lastAudit: "05 Mar 2026", nextReview: "05 Jun 2026", classification: "Tier 2 — Operational" },
};

const driftColor = (d) => d === "Stable" ? T.success : d === "Watch" ? T.warning : T.danger;
const driftBg = (d) => d === "Stable" ? T.successBg : d === "Watch" ? T.warningBg : T.dangerBg;

const thStyle = { textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "8px 12px", borderBottom: `2px solid ${T.border}`, textTransform: "uppercase", letterSpacing: 0.5 };
const tdStyle = { fontSize: 13, padding: "10px 12px", borderBottom: `1px solid ${T.borderLight}`, color: T.text };

function AIModelScreen() {
  const [selected, setSelected] = useState(null);

  const model = selected !== null ? MODELS[selected] : null;

  return (
    <div style={{ fontFamily: T.font }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.text }}>AI Model Performance</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Model accuracy, drift monitoring and governance oversight</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Models Active" value="6" sub="in production" color={T.primary} />
        <KPICard label="Avg Accuracy" value="94.2%" sub="across all models" color={T.success} />
        <KPICard label="False Positive Rate" value="3.1%" sub="last 30 days" color={T.warning} />
        <KPICard label="Human Override Rate" value="8%" sub="decisions overridden" color="#8B5CF6" />
        <KPICard label="Last Retrained" value="01 Apr 2026" sub="Document Parser v3.2.1" color={T.accent} />
      </div>

      {/* Model Table */}
      <Card noPad style={{ marginBottom: 16 }}>
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: T.text }}>Model Registry</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Click a model for detailed performance breakdown</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Model</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Version</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Accuracy</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Precision</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Recall</th>
                <th style={{ ...thStyle, textAlign: "center" }}>F1</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Decisions</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Override %</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Drift</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map((m, i) => (
                <tr key={i} onClick={() => setSelected(i)}
                  style={{ cursor: "pointer", background: selected === i ? T.primaryLight : "transparent", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (selected !== i) e.currentTarget.style.background = T.primaryLight; }}
                  onMouseLeave={e => { if (selected !== i) e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <span style={{ marginRight: 8, color: T.primary }}>{Ico.bot(14)}</span>
                    {m.name}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontFamily: "monospace", fontSize: 12 }}>{m.version}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: m.accuracy >= 95 ? T.success : m.accuracy >= 90 ? T.text : T.danger }}>{m.accuracy}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{m.precision}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{m.recall}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{m.f1}</td>
                  <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{m.decisions.toLocaleString()}</td>
                  <td style={{ ...tdStyle, textAlign: "center", color: m.overrideRate > 10 ? T.danger : m.overrideRate > 5 ? T.warning : T.success }}>{m.overrideRate}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: driftBg(m.drift), color: driftColor(m.drift) }}>
                      {m.drift}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Model Detail */}
      {model && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{model.name}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>v{model.version} — {model.decisions.toLocaleString()} decisions this month</div>
            </div>
            <Btn small ghost onClick={() => setSelected(null)}>Close</Btn>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
            {/* Confusion Matrix */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>Confusion Matrix</div>
              {(() => {
                const cm = CONFUSION_MATRICES[model.name];
                return (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    <div style={{ background: T.successBg, borderRadius: 8, padding: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginBottom: 4 }}>TRUE POS</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: T.success }}>{cm.tp.toLocaleString()}</div>
                    </div>
                    <div style={{ background: T.dangerBg, borderRadius: 8, padding: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginBottom: 4 }}>FALSE POS</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: T.danger }}>{cm.fp.toLocaleString()}</div>
                    </div>
                    <div style={{ background: T.warningBg, borderRadius: 8, padding: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginBottom: 4 }}>FALSE NEG</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: T.warning }}>{cm.fn.toLocaleString()}</div>
                    </div>
                    <div style={{ background: "#F0F4F8", borderRadius: 8, padding: 12, textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, marginBottom: 4 }}>TRUE NEG</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: T.textSecondary }}>{cm.tn.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Monthly Accuracy Trend */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>Accuracy Trend (6 months)</div>
              <BarChart data={MONTHLY_ACCURACY[model.name]} color={T.primary} height={120} unit="" />
            </div>

            {/* Recent Overrides */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>Recent Overrides</div>
              {(RECENT_OVERRIDES[model.name] || []).map((o, i) => (
                <div key={i} style={{ padding: "8px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
                    <span style={{ fontWeight: 600, color: T.text }}>{o.caseId}</span>
                    <span style={{ color: T.textMuted }}>{o.date}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textSecondary }}>{o.field} — {o.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Governance */}
          <div style={{ background: T.bg, borderRadius: 10, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: T.primary }}>{Ico.shield(16)}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Model Governance</span>
            </div>
            {(() => {
              const gov = GOVERNANCE[model.name];
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Last Audit</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{gov.lastAudit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Next Scheduled Review</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{gov.nextReview}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Regulatory Classification</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{gov.classification}</div>
                  </div>
                </div>
              );
            })()}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AIModelScreen;
