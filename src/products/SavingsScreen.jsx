import React, { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Card, KPICard, Btn } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS } from "../data/customers";

const custName = (id) => CUSTOMERS.find((c) => c.id === id)?.name || id;

const parseBalance = (b) => {
  if (!b || b === "—") return 0;
  return parseFloat(b.replace(/[£,]/g, ""));
};

const parseRate = (r) => {
  if (!r || r === "—") return 0;
  return parseFloat(r.replace("%", ""));
};

const maturityColor = (days) => {
  if (days == null) return { bg: "#E5E7EB", color: "#6B7280" };
  if (days <= 30) return { bg: T.dangerBg, color: T.danger };
  if (days <= 90) return { bg: T.warningBg, color: T.warning };
  return { bg: T.successBg, color: T.success };
};

export default function SavingsScreen({ onViewCustomer }) {
  const [selected, setSelected] = useState(null);

  const savings = useMemo(() => PRODUCTS.filter((p) => p.type === "Fixed Term Deposit" || p.type === "Notice Account"), []);
  const activeSavings = savings.filter((s) => s.status === "Active");
  const fixed = activeSavings.filter((s) => s.type === "Fixed Term Deposit");
  const notice = activeSavings.filter((s) => s.type === "Notice Account");

  const totalDeposits = activeSavings.reduce((s, a) => s + parseBalance(a.balance), 0);
  const fixedTotal = fixed.reduce((s, a) => s + parseBalance(a.balance), 0);
  const noticeTotal = notice.reduce((s, a) => s + parseBalance(a.balance), 0);
  const maturing60 = fixed.filter((s) => s.daysToMaturity != null && s.daysToMaturity <= 60).length;
  const avgRate = activeSavings.length > 0
    ? (activeSavings.reduce((s, a) => s + parseRate(a.rate), 0) / activeSavings.length).toFixed(2)
    : "0.00";

  const fmt = (n) => {
    if (n >= 1000000) return `£${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `£${(n / 1000).toFixed(0)}k`;
    return `£${n.toFixed(0)}`;
  };

  // Build timeline data for maturity calendar
  const maturityTimeline = fixed
    .filter((s) => s.daysToMaturity != null)
    .sort((a, b) => a.daysToMaturity - b.daysToMaturity);

  const maxDays = Math.max(...maturityTimeline.map((s) => s.daysToMaturity), 365);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ico.dollar(22)}
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Savings Portfolio</h1>
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0 32px" }}>Fixed term deposits and notice accounts</p>
        </div>
        <Btn icon="download" small>Export</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Total Deposits" value={fmt(totalDeposits)} color={T.primary} />
        <KPICard label="Fixed Term" value={fmt(fixedTotal)} color="#FFBF00" />
        <KPICard label="Notice" value={fmt(noticeTotal)} color={T.success} />
        <KPICard label="Maturing <60d" value={maturing60} sub={maturing60 > 0 ? "Action needed" : "None upcoming"} color={maturing60 > 0 ? T.warning : T.success} />
        <KPICard label="Avg Rate" value={`${avgRate}%`} color="#8B5CF6" />
      </div>

      {/* Maturity Calendar */}
      {maturityTimeline.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {Ico.clock(16)}
            <span style={{ fontSize: 14, fontWeight: 700 }}>Maturity Timeline</span>
          </div>
          <div style={{ position: "relative", height: 60, background: T.bg, borderRadius: 8, overflow: "hidden" }}>
            {/* Track */}
            <div style={{ position: "absolute", top: 28, left: 20, right: 20, height: 2, background: T.border }} />
            {/* Dots */}
            {maturityTimeline.map((s) => {
              const pct = Math.max(5, Math.min(95, (s.daysToMaturity / maxDays) * 100));
              const mc = maturityColor(s.daysToMaturity);
              return (
                <div key={s.id} style={{ position: "absolute", left: `${pct}%`, top: 18, transform: "translateX(-50%)" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: mc.color, border: `3px solid ${T.card}`, boxShadow: `0 0 0 2px ${mc.color}30` }} title={`${s.id} — ${custName(s.customerId)} — ${s.daysToMaturity}d`} />
                  <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textAlign: "center", marginTop: 4, whiteSpace: "nowrap" }}>{s.daysToMaturity}d</div>
                </div>
              );
            })}
            {/* Labels */}
            <div style={{ position: "absolute", left: 20, top: 4, fontSize: 10, color: T.textMuted }}>Today</div>
            <div style={{ position: "absolute", right: 20, top: 4, fontSize: 10, color: T.textMuted }}>{maxDays}d</div>
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 11, color: T.textMuted }}>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.danger, marginRight: 4 }} /> &lt;30 days</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.warning, marginRight: 4 }} /> 30-90 days</span>
            <span><span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: T.success, marginRight: 4 }} /> &gt;90 days</span>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Account", "Customer", "Product", "Type", "Balance", "Rate", "Maturity / Notice", "Interest Earned", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {savings.map((s) => {
                const mc = maturityColor(s.daysToMaturity);
                const isFixed = s.type === "Fixed Term Deposit";
                const isOpen = selected === s.id;
                const cust = isOpen ? CUSTOMERS.find(c => c.id === s.customerId) : null;
                return (
                  <React.Fragment key={s.id}>
                    <tr
                      onClick={() => setSelected(isOpen ? null : s.id)}
                      style={{ borderBottom: isOpen ? "none" : `1px solid ${T.borderLight}`, cursor: "pointer", background: isOpen ? T.primaryLight : "transparent", transition: "background 0.15s" }}
                      onMouseEnter={(e) => { if (!isOpen) e.currentTarget.style.background = T.primaryLight; }}
                      onMouseLeave={(e) => { if (!isOpen) e.currentTarget.style.background = "transparent"; }}
                    >
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: T.primary }}>{s.id}</td>
                      <td style={{ padding: "12px 14px" }}>{custName(s.customerId)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>{s.product}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: isFixed ? "#FFF8E0" : T.successBg, color: isFixed ? "#92400E" : T.success, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          {isFixed ? "Fixed Term" : "Notice"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>{s.balance}</td>
                      <td style={{ padding: "12px 14px" }}>{s.rate}</td>
                      <td style={{ padding: "12px 14px" }}>
                        {isFixed ? (
                          <span>
                            <span style={{ fontSize: 12 }}>{s.maturity}</span>
                            {s.daysToMaturity != null && (
                              <span style={{ marginLeft: 8, background: mc.bg, color: mc.color, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                                {s.daysToMaturity}d
                              </span>
                            )}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12 }}>{s.noticePeriod}</span>
                        )}
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 12 }}>{s.interestEarned || "—"}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ background: s.status === "Active" ? T.successBg : s.status === "Pending" ? "#DBEAFE" : "#E5E7EB", color: s.status === "Active" ? T.success : s.status === "Pending" ? "#1E40AF" : "#374151", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          {s.status}
                        </span>
                        <span style={{ marginLeft: 6, color: T.textMuted, fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
                      </td>
                    </tr>
                    {/* Inline expanded detail */}
                    {isOpen && (
                      <tr>
                        <td colSpan={9} style={{ padding: 0 }}>
                          <div style={{ padding: "18px 20px", background: T.bg, borderBottom: `2px solid ${T.primary}30` }}>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 16 }}>
                              {[
                                ["Account", s.id], ["Customer", custName(s.customerId)], ["Product", s.product],
                                ["Type", isFixed ? "Fixed Term Deposit" : "Notice Account"],
                                ["Balance", s.balance], ["Rate", s.rate], ["Status", s.status],
                                ...(isFixed ? [["Principal", s.principal], ["Maturity", s.maturity], ["Interest Earned", s.interestEarned], ["Days to Maturity", s.daysToMaturity != null ? `${s.daysToMaturity} days` : "—"]] : [["Notice Period", s.noticePeriod]]),
                              ].map(([l, v]) => (
                                <div key={l}>
                                  <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, fontWeight: 700 }}>{l}</div>
                                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</div>
                                </div>
                              ))}
                            </div>
                            {/* AI Insight */}
                            <div style={{ background: T.primaryLight, borderRadius: 8, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 14 }}>
                              <div style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>{Ico.sparkle(14)}</div>
                              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>
                                {isFixed && s.daysToMaturity != null && s.daysToMaturity <= 60
                                  ? `Fixed deposit matures in ${s.daysToMaturity} days. Contact ${custName(s.customerId)} to discuss renewal options — retention opportunity.`
                                  : isFixed
                                  ? `Fixed deposit performing well at ${s.rate}. Interest earned: ${s.interestEarned}. No action required until maturity.`
                                  : `Notice account at ${s.rate} with ${s.noticePeriod} notice period. Balance: ${s.balance}. Consider rate review if market has moved.`}
                              </div>
                            </div>
                            {/* Actions */}
                            <div style={{ display: "flex", gap: 8 }}>
                              {cust && <Btn small primary icon="customers" onClick={(e) => { e.stopPropagation(); onViewCustomer?.(cust); }}>View Customer</Btn>}
                              <Btn small ghost icon="x" onClick={(e) => { e.stopPropagation(); setSelected(null); }}>Close</Btn>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
