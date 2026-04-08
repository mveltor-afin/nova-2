import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── Mock Data ──────────────────────────────────────── */
const ACCOUNTS = [
  { id:"SAV-001", customer:"James Mitchell",   product:"1 Year Fixed",   type:"Fixed Term",  principal:250000, rate:4.25, term:"12 months", maturity:"2026-04-18", interestEarned:8854, aiRisk:"Low",    autoRenew:true  },
  { id:"SAV-002", customer:"Sarah Chen",        product:"2 Year Fixed",   type:"Fixed Term",  principal:500000, rate:4.50, term:"24 months", maturity:"2027-01-15", interestEarned:28125, aiRisk:"Low",   autoRenew:true  },
  { id:"SAV-003", customer:"Robert Patel",      product:"1 Year Fixed",   type:"Fixed Term",  principal:180000, rate:4.15, term:"12 months", maturity:"2026-04-22", interestEarned:6225, aiRisk:"Medium", autoRenew:false },
  { id:"SAV-004", customer:"Emma Thompson",     product:"3 Year Fixed",   type:"Fixed Term",  principal:750000, rate:4.75, term:"36 months", maturity:"2028-06-10", interestEarned:53437, aiRisk:"Low",   autoRenew:true  },
  { id:"SAV-005", customer:"David Williams",    product:"1 Year Fixed",   type:"Fixed Term",  principal:320000, rate:4.20, term:"12 months", maturity:"2026-05-03", interestEarned:11200, aiRisk:"Low",   autoRenew:true  },
  { id:"SAV-006", customer:"Lisa Morrison",     product:"2 Year Fixed",   type:"Fixed Term",  principal:420000, rate:4.45, term:"24 months", maturity:"2027-03-20", interestEarned:24570, aiRisk:"Low",   autoRenew:true  },
  { id:"SAV-007", customer:"Ahmed Khan",        product:"1 Year Fixed",   type:"Fixed Term",  principal:150000, rate:4.10, term:"12 months", maturity:"2026-04-28", interestEarned:5125, aiRisk:"High",   autoRenew:false },
  { id:"SAV-008", customer:"Catherine Blake",   product:"3 Year Fixed",   type:"Fixed Term",  principal:600000, rate:4.70, term:"36 months", maturity:"2028-09-05", interestEarned:42300, aiRisk:"Low",   autoRenew:true  },
  { id:"SAV-009", customer:"Michael O'Brien",   product:"1 Year Fixed",   type:"Fixed Term",  principal:280000, rate:4.20, term:"12 months", maturity:"2026-06-14", interestEarned:9800, aiRisk:"Low",    autoRenew:true  },
  { id:"SAV-010", customer:"Priya Sharma",      product:"2 Year Fixed",   type:"Fixed Term",  principal:350000, rate:4.40, term:"24 months", maturity:"2027-05-22", interestEarned:20300, aiRisk:"Low",   autoRenew:true  },
  { id:"SAV-011", customer:"George Harper",     product:"30-Day Notice",  type:"Notice",      principal:200000, rate:3.85, noticePeriod:"30 days", status:"Active",          interestEarned:6416, aiRisk:"Low",    pendingWithdrawal:null },
  { id:"SAV-012", customer:"Fiona Gallagher",   product:"90-Day Notice",  type:"Notice",      principal:450000, rate:4.05, noticePeriod:"90 days", status:"Active",          interestEarned:15187, aiRisk:"Low",   pendingWithdrawal:null },
  { id:"SAV-013", customer:"Thomas Reid",       product:"30-Day Notice",  type:"Notice",      principal:175000, rate:3.80, noticePeriod:"30 days", status:"Notice Given",    interestEarned:5541, aiRisk:"Medium", pendingWithdrawal:"2026-04-25" },
  { id:"SAV-014", customer:"Julia Navarro",     product:"90-Day Notice",  type:"Notice",      principal:320000, rate:4.00, noticePeriod:"90 days", status:"Active",          interestEarned:10666, aiRisk:"Low",   pendingWithdrawal:null },
  { id:"SAV-015", customer:"Ian Forsyth",       product:"30-Day Notice",  type:"Notice",      principal:280000, rate:3.85, noticePeriod:"30 days", status:"Active",          interestEarned:8983, aiRisk:"Low",    pendingWithdrawal:null },
  { id:"SAV-016", customer:"Rebecca Cole",      product:"90-Day Notice",  type:"Notice",      principal:510000, rate:4.10, noticePeriod:"90 days", status:"Active",          interestEarned:17425, aiRisk:"Low",   pendingWithdrawal:null },
  { id:"SAV-017", customer:"Oliver Grant",      product:"1 Year Fixed",   type:"Fixed Term",  principal:190000, rate:4.15, term:"12 months", maturity:"2026-07-08", interestEarned:6570, aiRisk:"Low",    autoRenew:true  },
  { id:"SAV-018", customer:"Natasha Petrova",   product:"30-Day Notice",  type:"Notice",      principal:265000, rate:3.90, noticePeriod:"30 days", status:"Notice Given",    interestEarned:8612, aiRisk:"High",   pendingWithdrawal:"2026-04-30" },
];

const RATE_COMPARISON = [
  { product:"1 Year Fixed",   afinRate:4.20, marketAvg:4.10 },
  { product:"2 Year Fixed",   afinRate:4.45, marketAvg:4.35 },
  { product:"3 Year Fixed",   afinRate:4.72, marketAvg:4.55 },
  { product:"30-Day Notice",  afinRate:3.85, marketAvg:3.70 },
  { product:"90-Day Notice",  afinRate:4.05, marketAvg:3.90 },
];

const MATURITY_CALENDAR = [
  { month:"Apr 2026", items:[
    { id:"SAV-001", customer:"James Mitchell",   amount:250000, date:"2026-04-18" },
    { id:"SAV-003", customer:"Robert Patel",     amount:180000, date:"2026-04-22" },
    { id:"SAV-007", customer:"Ahmed Khan",        amount:150000, date:"2026-04-28" },
  ]},
  { month:"May 2026", items:[
    { id:"SAV-005", customer:"David Williams",   amount:320000, date:"2026-05-03" },
  ]},
  { month:"Jun 2026", items:[
    { id:"SAV-009", customer:"Michael O'Brien",  amount:280000, date:"2026-06-14" },
  ]},
  { month:"Jul 2026", items:[
    { id:"SAV-017", customer:"Oliver Grant",     amount:190000, date:"2026-07-08" },
  ]},
];

const TODAY = new Date("2026-04-06");

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return Math.ceil((d - TODAY) / (1000 * 60 * 60 * 24));
}

function maturityColor(days) {
  if (days == null) return T.textMuted;
  if (days < 30) return T.danger;
  if (days <= 90) return T.warning;
  return T.success;
}

const badge = (text, bg, color) => (
  <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{text}</span>
);

const TABS = ["All", "Fixed Term", "Notice", "Maturing Soon"];

function SavingsDashboard() {
  const [tab, setTab] = useState("All");
  const [hoveredDot, setHoveredDot] = useState(null);

  const filtered = ACCOUNTS.filter(a => {
    if (tab === "Fixed Term") return a.type === "Fixed Term";
    if (tab === "Notice") return a.type === "Notice";
    if (tab === "Maturing Soon") return a.type === "Fixed Term" && daysUntil(a.maturity) != null && daysUntil(a.maturity) <= 30;
    return true;
  }).sort((a, b) => {
    const da = a.maturity ? new Date(a.maturity) : new Date("2099-01-01");
    const db = b.maturity ? new Date(b.maturity) : new Date("2099-01-01");
    return da - db;
  });

  const maturingSoon = ACCOUNTS.filter(a => a.type === "Fixed Term" && daysUntil(a.maturity) <= 30);
  const maturingCount = maturingSoon.length;
  const maturingTotal = maturingSoon.reduce((s, a) => s + a.principal, 0);

  const renewalAutoRenew = ACCOUNTS.filter(a => a.type === "Fixed Term" && daysUntil(a.maturity) <= 30 && a.autoRenew);
  const renewalAtRisk = ACCOUNTS.filter(a => a.type === "Fixed Term" && daysUntil(a.maturity) <= 30 && !a.autoRenew);

  // BarChart (from MIScreen pattern)
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

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Savings Dashboard</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Operational view of deposit accounts, maturities and retention</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Total Deposits"    value="£12.4M"  sub="all savings accounts"             color={T.primary} />
        <KPICard label="Fixed Term Book"   value="£8.2M"   sub="10 accounts"                      color={T.accent} />
        <KPICard label="Notice Acct Book"  value="£4.2M"   sub="8 accounts"                       color="#8B5CF6" />
        <KPICard label="Maturing <30d"     value="£1.8M"   sub={`${maturingCount} accounts`}      color={T.danger} />
        <KPICard label="New This Month"    value="£640k"   sub="3 new accounts"                   color={T.success} />
        <KPICard label="Avg Rate Paid"     value="4.12%"   sub="blended across book"              color={T.warning} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: T.font,
            fontSize: 13, fontWeight: 600,
            background: tab === t ? T.primary : T.card,
            color: tab === t ? "#fff" : T.textSecondary,
            boxShadow: tab === t ? `0 2px 8px ${T.primaryGlow}` : "none",
          }}>{t}</button>
        ))}
      </div>

      {/* Accounts Table */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Savings Accounts ({filtered.length})</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Account ID","Customer","Product","Type","Principal","Rate","Term / Notice","Maturity / Status","Interest Earned","AI Risk"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const days = daysUntil(a.maturity);
                return (
                  <tr key={a.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: "10px 10px", fontWeight: 600, color: T.primary }}>{a.id}</td>
                    <td style={{ padding: "10px 10px" }}>{a.customer}</td>
                    <td style={{ padding: "10px 10px" }}>{a.product}</td>
                    <td style={{ padding: "10px 10px" }}>
                      {a.type === "Fixed Term"
                        ? badge("Fixed Term", "#EDE9FE", "#5B21B6")
                        : badge("Notice", "#DBEAFE", "#1E40AF")}
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 600 }}>{"\u00A3"}{a.principal.toLocaleString()}</td>
                    <td style={{ padding: "10px 10px" }}>{a.rate}%</td>
                    <td style={{ padding: "10px 10px" }}>{a.type === "Fixed Term" ? a.term : a.noticePeriod}</td>
                    <td style={{ padding: "10px 10px" }}>
                      {a.type === "Fixed Term" ? (
                        <span>
                          {a.maturity}{" "}
                          <span style={{ fontWeight: 700, color: maturityColor(days) }}>({days}d)</span>
                        </span>
                      ) : (
                        <span>
                          {a.status === "Notice Given"
                            ? badge("Notice Given", T.warningBg, T.warning)
                            : badge("Active", T.successBg, T.success)}
                          {a.pendingWithdrawal && (
                            <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 6 }}>W/D {a.pendingWithdrawal}</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 10px", fontWeight: 600 }}>{"\u00A3"}{a.interestEarned.toLocaleString()}</td>
                    <td style={{ padding: "10px 10px" }}>
                      {a.aiRisk === "Low" && badge("Low", T.successBg, T.success)}
                      {a.aiRisk === "Medium" && badge("Medium", T.warningBg, T.warning)}
                      {a.aiRisk === "High" && badge("High", T.dangerBg, T.danger)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Maturity Calendar */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Maturity Calendar</div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 20 }}>Upcoming fixed-term maturities — dot size represents deposit amount</div>
        <div style={{ position: "relative", padding: "20px 0" }}>
          {/* Timeline line */}
          <div style={{ position: "absolute", top: "50%", left: 40, right: 40, height: 2, background: T.border, transform: "translateY(-50%)" }} />
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 40px", position: "relative" }}>
            {MATURITY_CALENDAR.map((m, mi) => {
              const maxAmt = 500000;
              return (
                <div key={mi} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1, position: "relative" }}>
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-end", minHeight: 60, justifyContent: "center" }}>
                    {m.items.map((item, ii) => {
                      const dotSize = Math.max(14, Math.min(40, (item.amount / maxAmt) * 40));
                      const isHovered = hoveredDot === `${mi}-${ii}`;
                      return (
                        <div key={ii} style={{ position: "relative" }}
                          onMouseEnter={() => setHoveredDot(`${mi}-${ii}`)}
                          onMouseLeave={() => setHoveredDot(null)}>
                          <div style={{
                            width: dotSize, height: dotSize, borderRadius: "50%",
                            background: daysUntil(item.date) < 30 ? T.danger : daysUntil(item.date) <= 90 ? T.warning : T.success,
                            opacity: 0.85, cursor: "pointer",
                            border: isHovered ? `2px solid ${T.primary}` : "2px solid transparent",
                            transition: "all 0.15s",
                          }} />
                          {isHovered && (
                            <div style={{
                              position: "absolute", bottom: dotSize + 8, left: "50%", transform: "translateX(-50%)",
                              background: T.primaryDark, color: "#fff", padding: "8px 12px", borderRadius: 8, fontSize: 11,
                              whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            }}>
                              <div style={{ fontWeight: 700 }}>{item.customer}</div>
                              <div>{"\u00A3"}{item.amount.toLocaleString()} — {item.date}</div>
                              <div style={{ color: "rgba(255,255,255,0.7)" }}>{item.id}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.primary, zIndex: 1 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary }}>{m.month}</div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Rate Competitiveness */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Rate Competitiveness</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Product","Afin Rate","Market Avg","Delta","Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 8px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RATE_COMPARISON.map((r, i) => {
                const delta = (r.afinRate - r.marketAvg).toFixed(2);
                const above = delta > 0;
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: "10px 8px", fontWeight: 600 }}>{r.product}</td>
                    <td style={{ padding: "10px 8px" }}>{r.afinRate}%</td>
                    <td style={{ padding: "10px 8px" }}>{r.marketAvg}%</td>
                    <td style={{ padding: "10px 8px", fontWeight: 600, color: above ? T.success : T.danger }}>
                      {above ? "+" : ""}{delta}%
                    </td>
                    <td style={{ padding: "10px 8px" }}>
                      {above
                        ? badge("Above market", T.successBg, T.success)
                        : badge("Below market", T.dangerBg, T.danger)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {/* Renewal Pipeline */}
        <Card>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Renewal Pipeline</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ background: T.bg, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Maturing This Month</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{maturingCount}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{"\u00A3"}{(maturingTotal / 1000000).toFixed(1)}M</div>
            </div>
            <div style={{ background: T.bg, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Auto-Renew Set</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{renewalAutoRenew.length}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{"\u00A3"}{(renewalAutoRenew.reduce((s, a) => s + a.principal, 0) / 1000).toFixed(0)}k</div>
            </div>
            <div style={{ background: T.dangerBg, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>At Risk of Withdrawal</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.danger }}>{renewalAtRisk.length}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>{"\u00A3"}{(renewalAtRisk.reduce((s, a) => s + a.principal, 0) / 1000).toFixed(0)}k</div>
            </div>
            <div style={{ background: T.bg, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Retention Offers Sent</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>1</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>of {renewalAtRisk.length} at-risk</div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Insight */}
      <Card style={{ marginBottom: 24, background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.04))", border: `1px solid ${T.accent}40` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ color: T.accent, flexShrink: 0, marginTop: 2 }}>{Ico.sparkle(20)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: T.primary }}>AI Savings Insight</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
              {"\u00A3"}1.8M in deposits maturing within 30 days. 2 customers have not set auto-renewal and have been
              browsing competitor rates on comparison sites (Open Banking signal). Recommend proactive retention
              calls with competitive rate-match offers to prevent outflow.
            </div>
            <div style={{ marginTop: 14 }}>
              <Btn primary icon="send">Send Batch Retention Offers</Btn>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SavingsDashboard;
