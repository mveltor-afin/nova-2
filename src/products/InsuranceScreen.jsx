import React, { useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Card, KPICard, Btn } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS } from "../data/customers";

const custName = (id) => CUSTOMERS.find((c) => c.id === id)?.name || id;

const statusStyle = (s) => {
  const map = {
    Active: { bg: T.successBg, color: T.success },
    "Pending Quote": { bg: "#DBEAFE", color: "#1E40AF" },
    Lapsed: { bg: T.dangerBg, color: T.danger },
  };
  return map[s] || { bg: "#E5E7EB", color: "#374151" };
};

export default function InsuranceScreen() {
  const insurance = useMemo(() => PRODUCTS.filter((p) => p.type === "Insurance"), []);
  const active = insurance.filter((p) => p.status === "Active");
  const pendingQuotes = insurance.filter((p) => p.status === "Pending Quote");

  // Parse cover values for total
  const parseCover = (c) => {
    if (!c) return 0;
    const match = c.match(/£([\d,]+)/);
    return match ? parseFloat(match[1].replace(/,/g, "")) : 0;
  };

  const totalCover = active.reduce((s, p) => s + parseCover(p.cover), 0);

  // Parse premium for monthly income
  const parsePremium = (pr) => {
    if (!pr || pr === "—") return 0;
    const match = pr.match(/£(\d+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const monthlyPremiumIncome = active.reduce((s, p) => s + parsePremium(p.premium), 0);

  // Renewals within 90 days (approximate from renewal date)
  const today = new Date();
  const renewals90 = active.filter((p) => {
    if (!p.renewal) return false;
    const parts = p.renewal.split(" ");
    const d = new Date(`${parts[1]} ${parts[0]}, ${parts[2]}`);
    const diff = (d - today) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 90;
  });

  // Cross-sell: customers with mortgages but no insurance
  const mortgageCustomerIds = PRODUCTS.filter((p) => p.type === "Mortgage" && p.status !== "Application").map((p) => p.customerId);
  const insuredCustomerIds = insurance.map((p) => p.customerId);
  const uninsuredMortgageCustomers = [...new Set(mortgageCustomerIds)].filter((id) => !insuredCustomerIds.includes(id));

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
            {Ico.shield(22)}
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Insurance Portfolio</h1>
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0 32px" }}>Policies, renewals, and cross-sell opportunities</p>
        </div>
        <Btn icon="download" small>Export</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Active Policies" value={active.length} color={T.success} />
        <KPICard label="Pending Quotes" value={pendingQuotes.length} color="#1E40AF" />
        <KPICard label="Total Cover" value={fmt(totalCover)} color={T.primary} />
        <KPICard label="Monthly Premium" value={`£${monthlyPremiumIncome}`} color="#8B5CF6" />
        <KPICard label="Renewals <90d" value={renewals90.length} sub={renewals90.length > 0 ? "Action needed" : "None upcoming"} color={renewals90.length > 0 ? T.warning : T.success} />
      </div>

      {/* Table */}
      <Card noPad style={{ marginBottom: 20 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Policy", "Customer", "Product", "Status", "Cover", "Premium", "Term", "Provider", "Renewal Date"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {insurance.map((p) => {
                const ss = statusStyle(p.status);
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = T.primaryLight}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: T.primary }}>{p.id}</td>
                    <td style={{ padding: "12px 14px" }}>{custName(p.customerId)}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>{p.product}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: ss.bg, color: ss.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{p.status}</span>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.cover}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>{p.premium}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.term}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.provider}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.renewal || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Renewal Pipeline */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {Ico.clock(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Renewal Pipeline</span>
        </div>
        {active.filter((p) => p.renewal).length === 0 ? (
          <div style={{ fontSize: 13, color: T.textMuted, padding: "12px 0" }}>No renewals upcoming.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {active.filter((p) => p.renewal).map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: T.bg, borderRadius: 10, border: `1px solid ${T.borderLight}` }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.id} — {custName(p.customerId)}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{p.product} | Renewal: {p.renewal}</div>
                </div>
                <Btn small primary icon="send">Send Renewal</Btn>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cross-sell Opportunities */}
      <Card>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {Ico.sparkle(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Cross-sell Opportunities</span>
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 4 }}>Mortgage customers without insurance</span>
        </div>
        {uninsuredMortgageCustomers.length === 0 ? (
          <div style={{ fontSize: 13, color: T.textMuted, padding: "12px 0" }}>All mortgage customers have insurance cover.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {uninsuredMortgageCustomers.map((id) => {
              const cust = CUSTOMERS.find((c) => c.id === id);
              const mortgage = PRODUCTS.find((p) => p.customerId === id && p.type === "Mortgage");
              return (
                <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: T.primaryLight, borderRadius: 10, border: `1px solid ${T.borderLight}` }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{cust?.name || id}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>
                      Mortgage: {mortgage?.balance || "—"} | No insurance on file
                    </div>
                  </div>
                  <Btn small primary icon="plus">Create Quote</Btn>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
