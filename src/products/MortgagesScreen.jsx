import React, { useState, useMemo } from "react";
import { T, Ico, STATE_COLOR } from "../shared/tokens";
import { Card, KPICard, Btn } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS } from "../data/customers";

const custName = (id) => CUSTOMERS.find((c) => c.id === id)?.name || id;

const statusStyle = (s) => {
  const map = {
    Active: { bg: T.successBg, color: T.success, border: T.successBorder },
    "Active in Arrears": { bg: T.dangerBg, color: T.danger, border: T.dangerBorder },
    Locked: { bg: T.warningBg, color: T.warning, border: T.warningBorder },
    Application: { bg: "#DBEAFE", color: "#1E40AF", border: "#93C5FD" },
  };
  return map[s] || { bg: "#E5E7EB", color: "#374151", border: "#D1D5DB" };
};

const parseBalance = (b) => {
  if (!b || b === "—") return 0;
  return parseFloat(b.replace(/[£,]/g, ""));
};

const parseRate = (r) => {
  if (!r || r === "—") return 0;
  return parseFloat(r.replace("%", ""));
};

const parseLTV = (l) => {
  if (!l || l === "—") return 0;
  return parseFloat(l.replace("%", ""));
};

export default function MortgagesScreen() {
  const [selected, setSelected] = useState(null);

  const mortgages = useMemo(() => PRODUCTS.filter((p) => p.type === "Mortgage"), []);
  const active = mortgages.filter((m) => m.status === "Active" || m.status === "Active in Arrears" || m.status === "Locked");

  const totalBook = active.reduce((s, m) => s + parseBalance(m.balance), 0);
  const activeCount = mortgages.filter((m) => m.status === "Active").length;
  const arrearsCount = mortgages.filter((m) => m.status === "Active in Arrears").length;
  const lockedCount = mortgages.filter((m) => m.status === "Locked").length;
  const avgLTV = Math.round(active.filter((m) => parseLTV(m.ltv) > 0).reduce((s, m, _, a) => s + parseLTV(m.ltv) / a.length, 0));
  const avgRate = (active.filter((m) => parseRate(m.rate) > 0).reduce((s, m, _, a) => s + parseRate(m.rate) / a.length, 0)).toFixed(2);

  // Rate expiry alerts: accounts with rate ending within 90 days
  const today = new Date();
  const rateExpiring = mortgages.filter((m) => {
    if (!m.rateEnd || m.rateEnd === "SVR" || m.rateEnd === "—") return false;
    const parts = m.rateEnd.split(" ");
    const d = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  });

  const fmt = (n) => {
    if (n >= 1000000) return `£${(n / 1000000).toFixed(2)}M`;
    if (n >= 1000) return `£${(n / 1000).toFixed(0)}k`;
    return `£${n.toFixed(0)}`;
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ico.loans(22)}
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Mortgage Portfolio</h1>
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0 32px" }}>Operational view across all mortgage products</p>
        </div>
        <Btn icon="download" small>Export</Btn>
      </div>

      {/* Rate Expiry Alert */}
      {rateExpiring.length > 0 && (
        <Card style={{ background: T.warningBg, border: `1px solid ${T.warningBorder}`, marginBottom: 20, padding: "14px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ico.alert(18)}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{rateExpiring.length} mortgage{rateExpiring.length > 1 ? "s" : ""} with rate expiring within 90 days</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                {rateExpiring.map((m) => `${m.id} (${custName(m.customerId)}) — expires ${m.rateEnd}`).join(" | ")}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Total Book" value={fmt(totalBook)} color={T.primary} />
        <KPICard label="Active" value={activeCount} color={T.success} />
        <KPICard label="In Arrears" value={arrearsCount} color={T.danger} />
        <KPICard label="Locked" value={lockedCount} color={T.warning} />
        <KPICard label="Avg LTV" value={`${avgLTV}%`} color="#8B5CF6" />
        <KPICard label="Avg Rate" value={`${avgRate}%`} color="#0EA5E9" />
      </div>

      {/* Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Account", "Customer", "Product", "Balance", "Rate", "LTV", "Payment", "Status", "Next Payment", "Rate End"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mortgages.map((m) => {
                const ss = statusStyle(m.status);
                return (
                  <tr
                    key={m.id}
                    onClick={() => setSelected(selected === m.id ? null : m.id)}
                    style={{ borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer", background: selected === m.id ? T.primaryLight : "transparent", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { if (selected !== m.id) e.currentTarget.style.background = T.primaryLight; }}
                    onMouseLeave={(e) => { if (selected !== m.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: T.primary }}>{m.id}</td>
                    <td style={{ padding: "12px 14px" }}>{custName(m.customerId)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>{m.product}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>{m.balance}</td>
                    <td style={{ padding: "12px 14px" }}>{m.rate}</td>
                    <td style={{ padding: "12px 14px" }}>{m.ltv}</td>
                    <td style={{ padding: "12px 14px" }}>{m.payment}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{m.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: m.nextPayment === "OVERDUE" || m.nextPayment === "SUSPENDED" ? T.danger : T.text, fontWeight: m.nextPayment === "OVERDUE" || m.nextPayment === "SUSPENDED" ? 700 : 400 }}>{m.nextPayment}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{m.rateEnd}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick-view Panel */}
      {selected && (() => {
        const m = mortgages.find((x) => x.id === selected);
        if (!m) return null;
        const cust = CUSTOMERS.find((c) => c.id === m.customerId);
        return (
          <Card style={{ marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{m.id} — {custName(m.customerId)}</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{m.product} | Ref: {m.origRef}</div>
              </div>
              <Btn small ghost onClick={() => setSelected(null)} icon="x">Close</Btn>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
              {[
                ["Balance", m.balance],
                ["Rate", m.rate],
                ["LTV", m.ltv],
                ["Term", m.term],
                ["Monthly Payment", m.payment],
                ["Next Payment", m.nextPayment],
                ["Rate End", m.rateEnd],
                ["Status", m.status],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3 }}>{l}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{v}</div>
                </div>
              ))}
              {m.arrears && (
                <div>
                  <div style={{ fontSize: 11, color: T.danger, textTransform: "uppercase", letterSpacing: 0.3 }}>Arrears</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.danger, marginTop: 2 }}>{m.arrears}</div>
                </div>
              )}
            </div>
            {/* AI Insight */}
            <div style={{ background: T.primaryLight, borderRadius: 10, padding: "14px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ color: T.primary, flexShrink: 0, marginTop: 2 }}>{Ico.sparkle(16)}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 4 }}>AI Insight</div>
                <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>
                  {m.status === "Active in Arrears"
                    ? `Customer ${custName(m.customerId)} has ${m.arrears} in arrears. ${cust?.vuln ? "Vulnerability flag is active — follow vulnerability protocol." : "Consider proactive outreach to discuss repayment options."}`
                    : m.status === "Locked"
                    ? `Account locked with ${m.arrears} outstanding. No contact in 60 days. Recommend escalation to collections manager.`
                    : m.status === "Application"
                    ? `New mortgage application in progress for ${custName(m.customerId)}. KYC status: ${cust?.kyc || "Unknown"}. Ensure onboarding workflow is progressing.`
                    : rateExpiring.find((r) => r.id === m.id)
                    ? `Rate expires ${m.rateEnd}. Current rate ${m.rate} will revert to SVR. Initiate retention conversation to retain this relationship.`
                    : `Account performing well. LTV at ${m.ltv}, ${cust?.gamification?.streak || 0} consecutive on-time payments. Consider cross-sell opportunities.`
                  }
                </div>
              </div>
            </div>
          </Card>
        );
      })()}
    </div>
  );
}
