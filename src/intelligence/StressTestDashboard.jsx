import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const SCENARIOS = [
  { id: "base", label: "Base Case" },
  { id: "rate2", label: "Rate +2%" },
  { id: "rate3", label: "Rate +3%" },
  { id: "income", label: "Income -20%" },
  { id: "property", label: "Property -15%" },
  { id: "combined", label: "Combined Adverse" },
];

const ACCOUNTS = [
  { id: "MTG-001", customer: "Emma Wilson", balance: 156200, currentLTV: 58, payment: 980, rate: 4.49, income: 4200, propertyValue: 269310 },
  { id: "MTG-002", customer: "James Mitchell", balance: 285432, currentLTV: 72, payment: 1450, rate: 3.99, income: 5100, propertyValue: 396433 },
  { id: "MTG-003", customer: "Priya Sharma", balance: 198750, currentLTV: 68, payment: 1180, rate: 7.99, income: 2800, propertyValue: 292279 },
  { id: "MTG-004", customer: "David Chen", balance: 412000, currentLTV: 88, payment: 2100, rate: 5.29, income: 6500, propertyValue: 468182 },
  { id: "MTG-005", customer: "Aisha Patel", balance: 498100, currentLTV: 76, payment: 2450, rate: 4.89, income: 7200, propertyValue: 655395 },
  { id: "MTG-006", customer: "Robert Hughes", balance: 89400, currentLTV: 45, payment: 0, rate: 7.99, income: 2200, propertyValue: 198667 },
  { id: "MTG-007", customer: "Tom Brennan", balance: 350000, currentLTV: 88, payment: 1800, rate: 5.29, income: 4800, propertyValue: 397727 },
  { id: "MTG-008", customer: "Maria Santos", balance: 220000, currentLTV: 42, payment: 1280, rate: 4.19, income: 5800, propertyValue: 523810 },
];

function computeScenario(scenarioId) {
  return ACCOUNTS.map(a => {
    let stressedRate = a.rate;
    let stressedIncome = a.income;
    let stressedPropValue = a.propertyValue;

    if (scenarioId === "rate2") stressedRate += 2;
    if (scenarioId === "rate3") stressedRate += 3;
    if (scenarioId === "income") stressedIncome *= 0.8;
    if (scenarioId === "property") stressedPropValue *= 0.85;
    if (scenarioId === "combined") {
      stressedRate += 3;
      stressedIncome *= 0.8;
      stressedPropValue *= 0.85;
    }

    const stressedPayment = a.payment > 0 ? Math.round(a.payment * (stressedRate / a.rate)) : 0;
    const stressedLTV = Math.round(a.balance / stressedPropValue * 100);
    const affordabilityRatio = stressedIncome > 0 ? stressedPayment / stressedIncome : 0;
    const affordability = affordabilityRatio > 0.45 ? "Fail" : "Pass";

    return {
      ...a,
      stressedRate,
      stressedLTV,
      stressedPayment,
      affordability,
      stressed: scenarioId !== "base" && (affordability === "Fail" || stressedLTV > 90),
    };
  });
}

const SCENARIO_SUMMARIES = {
  base: { affected: 0, arrears: 0, provision: 0, capital: 0, insight: "Under base case conditions, all accounts perform within acceptable parameters. No additional provisions required. Portfolio remains well within risk appetite." },
  rate2: { affected: 2, arrears: 14200, provision: 24000, capital: -24000, insight: "A 200bps rate increase would stress 2 accounts (Priya Sharma and Robert Hughes). Both are already flagged as high risk. Existing provisions partially cover projected losses. Recommend monitoring affordability on variable-rate exposures." },
  rate3: { affected: 4, arrears: 38500, provision: 68000, capital: -68000, insight: "A 300bps shock brings 4 accounts into stress, including 2 previously performing accounts. The combined adverse payment increase across the book is 18%. Capital buffer remains adequate but provision top-up of \u00a368k recommended." },
  income: { affected: 3, arrears: 22000, provision: 42000, capital: -42000, insight: "A 20% income reduction causes 3 accounts to fail affordability tests. Priya Sharma, Robert Hughes, and Tom Brennan are most exposed due to higher existing debt-to-income ratios. Proactive outreach recommended." },
  property: { affected: 2, arrears: 8000, provision: 18000, capital: -18000, insight: "A 15% property value decline pushes 2 accounts (David Chen and Tom Brennan) above the 90% LTV threshold. While payments remain affordable, negative equity risk increases. No immediate loss expected but collateral coverage weakens." },
  combined: { affected: 5, arrears: 86000, provision: 142000, capital: -142000, insight: "The combined adverse scenario (rate +3%, income -20%, property -15%) is severe. 5 of 8 accounts are stressed, with Robert Hughes projected as a potential write-off (\u00a389k exposure). Total provision requirement of \u00a3142k against current buffer of \u00a32.4M. Capital ratio remains above minimum but Board notification triggered." },
};

const LTV_BANDS = ["<60%", "60-75%", "75-85%", "85-90%", ">90%"];

function getLTVDistribution(accounts, field) {
  const bands = [0, 0, 0, 0, 0];
  accounts.forEach(a => {
    const v = a[field];
    if (v < 60) bands[0]++;
    else if (v < 75) bands[1]++;
    else if (v < 85) bands[2]++;
    else if (v <= 90) bands[3]++;
    else bands[4]++;
  });
  return bands;
}

export default function StressTestDashboard() {
  const [activeScenario, setActiveScenario] = useState("base");

  const scenarioData = computeScenario(activeScenario);
  const summary = SCENARIO_SUMMARIES[activeScenario];
  const beforeDist = getLTVDistribution(ACCOUNTS, "currentLTV");
  const afterDist = getLTVDistribution(scenarioData, "stressedLTV");

  const stressedCount = scenarioData.filter(a => a.stressed).length;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.navy }}>Stress Testing Dashboard</h1>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Portfolio resilience under adverse scenarios</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>{Ico.clock(14)} Last run: 01 Apr 2026</span>
          <Btn primary icon="download">Export Stress Test Report</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Portfolio at Risk" value="\u00a31.2M" color={T.danger} sub="Under combined adverse" />
        <KPICard label="Accounts Impacted" value="4" color={T.warning} sub="Across scenarios" />
        <KPICard label="Provision Required" value="\u00a3186k" color="#3B82F6" sub="Combined adverse" />
        <KPICard label="Capital Buffer" value="\u00a32.4M" color={T.success} sub="Above minimum requirement" />
      </div>

      {/* Scenario tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            onClick={() => setActiveScenario(s.id)}
            style={{
              padding: "10px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              fontFamily: T.font, fontSize: 13, fontWeight: 600,
              background: activeScenario === s.id ? T.primary : "#F0EDE4",
              color: activeScenario === s.id ? "#fff" : T.text,
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Impact summary */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Impact Summary — {SCENARIOS.find(s => s.id === activeScenario)?.label}</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <div style={{ padding: 14, borderRadius: 8, background: "#FAFAF8", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Accounts Affected</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: summary.affected > 0 ? T.danger : T.success }}>{summary.affected}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 8, background: "#FAFAF8", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Additional Arrears</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: summary.arrears > 0 ? T.danger : T.success }}>{summary.arrears > 0 ? `\u00a3${(summary.arrears / 1000).toFixed(1)}k` : "\u00a30"}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 8, background: "#FAFAF8", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Provision Increase</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: summary.provision > 0 ? T.warning : T.success }}>{summary.provision > 0 ? `+\u00a3${(summary.provision / 1000).toFixed(0)}k` : "\u00a30"}</div>
          </div>
          <div style={{ padding: 14, borderRadius: 8, background: "#FAFAF8", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Capital Impact</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: summary.capital < 0 ? T.danger : T.success }}>{summary.capital < 0 ? `-\u00a3${(Math.abs(summary.capital) / 1000).toFixed(0)}k` : "\u00a30"}</div>
          </div>
        </div>
      </Card>

      {/* LTV distribution */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>LTV Distribution Shift</h3>
        <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
          {LTV_BANDS.map((band, i) => {
            const maxVal = Math.max(...beforeDist, ...afterDist, 1);
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 80 }}>
                  <div style={{ width: 20, height: (beforeDist[i] / maxVal) * 70 + 10, background: T.primary, borderRadius: "4px 4px 0 0", transition: "height 0.3s" }} />
                  <div style={{ width: 20, height: (afterDist[i] / maxVal) * 70 + 10, background: activeScenario === "base" ? T.primary : T.danger, borderRadius: "4px 4px 0 0", opacity: 0.7, transition: "height 0.3s" }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted }}>{band}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: T.primary }} /> Before
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: activeScenario === "base" ? T.primary : T.danger, opacity: 0.7 }} /> After Stress
          </div>
        </div>
      </Card>

      {/* Affected accounts table */}
      <Card style={{ marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Affected Accounts</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Account", "Customer", "Current LTV", "Stressed LTV", "Current Payment", "Stressed Payment", "Affordability"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scenarioData.map((a, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}`, background: a.stressed ? T.dangerBg : "transparent" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{a.id}</td>
                  <td style={{ padding: "10px 12px" }}>{a.customer}</td>
                  <td style={{ padding: "10px 12px" }}>{a.currentLTV}%</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: a.stressedLTV > 90 ? T.danger : a.stressedLTV > a.currentLTV ? T.warning : T.text }}>{a.stressedLTV}%</td>
                  <td style={{ padding: "10px 12px" }}>{a.payment > 0 ? `\u00a3${a.payment.toLocaleString()}` : "\u2014"}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: a.stressedPayment > a.payment ? T.danger : T.text }}>{a.stressedPayment > 0 ? `\u00a3${a.stressedPayment.toLocaleString()}` : "\u2014"}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 4,
                      background: a.affordability === "Pass" ? T.successBg : T.dangerBg,
                      color: a.affordability === "Pass" ? T.success : T.danger,
                    }}>{a.affordability}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Insight */}
      <Card style={{ background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.04))", border: `1px solid ${T.primary}22` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 8, background: T.primaryLight, flexShrink: 0 }}>{Ico.sparkle(20)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 4 }}>AI Stress Analysis — {SCENARIOS.find(s => s.id === activeScenario)?.label}</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{summary.insight}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
