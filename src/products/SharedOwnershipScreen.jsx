import React, { useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Card, KPICard, Btn } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS } from "../data/customers";

const custName = (id) => CUSTOMERS.find((c) => c.id === id)?.name || id;

const parseValue = (v) => {
  if (!v || v === "—") return 0;
  return parseFloat(v.replace(/[£,]/g, ""));
};

const parseShare = (s) => {
  if (!s || s === "—") return 0;
  return parseFloat(s.replace("%", ""));
};

const statusStyle = (s) => {
  const map = {
    Application: { bg: "#DBEAFE", color: "#1E40AF" },
    "Pre-approval": { bg: T.warningBg, color: T.warning },
    Active: { bg: T.successBg, color: T.success },
    Completed: { bg: "#E5E7EB", color: "#374151" },
  };
  return map[s] || { bg: "#E5E7EB", color: "#374151" };
};

export default function SharedOwnershipScreen() {
  const soProducts = useMemo(() => PRODUCTS.filter((p) => p.type === "Shared Ownership"), []);

  const totalOwnedValue = soProducts.reduce((s, p) => s + parseValue(p.ownedValue), 0);
  const avgShare = soProducts.length > 0
    ? Math.round(soProducts.reduce((s, p) => s + parseShare(p.share), 0) / soProducts.length)
    : 0;
  const housingAssocs = [...new Set(soProducts.map((p) => p.housingAssoc))];
  const pendingApps = soProducts.filter((p) => p.status === "Application" || p.status === "Pre-approval");

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
            {Ico.assign(22)}
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Shared Ownership</h1>
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0 32px" }}>Shared ownership applications and portfolio</p>
        </div>
        <Btn icon="download" small>Export</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Applications" value={soProducts.length} color="#0EA5E9" />
        <KPICard label="Portfolio Value" value={fmt(totalOwnedValue)} sub="Owned portion" color={T.primary} />
        <KPICard label="Avg Share" value={`${avgShare}%`} color="#8B5CF6" />
        <KPICard label="Housing Assocs" value={housingAssocs.length} color={T.success} />
      </div>

      {/* Table */}
      <Card noPad style={{ marginBottom: 20 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["ID", "Customer", "Share %", "Full Value", "Owned Value", "Rent", "Housing Assoc", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {soProducts.map((p) => {
                const ss = statusStyle(p.status);
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}
                    onMouseEnter={(e) => e.currentTarget.style.background = T.primaryLight}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: T.primary }}>{p.id}</td>
                    <td style={{ padding: "12px 14px" }}>{custName(p.customerId)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 60, height: 6, borderRadius: 3, background: T.bg, overflow: "hidden" }}>
                          <div style={{ width: `${parseShare(p.share)}%`, height: "100%", background: "#0EA5E9", borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 600, fontSize: 12 }}>{p.share}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.fullValue}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>{p.ownedValue}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.rent}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.housingAssoc}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: ss.bg, color: ss.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{p.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Staircase History */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          {Ico.chart(16)}
          <span style={{ fontSize: 14, fontWeight: 700 }}>Staircase History</span>
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 4 }}>Past share increases</span>
        </div>
        {soProducts.every((p) => !p.staircaseHistory || p.staircaseHistory.length === 0) ? (
          <div style={{ fontSize: 13, color: T.textMuted, padding: "12px 0", background: T.bg, borderRadius: 8, textAlign: "center" }}>
            No staircase transactions recorded yet. Share increases will appear here as customers increase their ownership percentage.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {soProducts.filter((p) => p.staircaseHistory && p.staircaseHistory.length > 0).flatMap((p) =>
              p.staircaseHistory.map((h, i) => (
                <div key={`${p.id}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: T.bg, borderRadius: 8 }}>
                  <span style={{ fontWeight: 600, color: T.primary }}>{p.id}</span>
                  <span>{custName(p.customerId)}</span>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{h.date}</span>
                  <span style={{ fontSize: 12 }}>{h.fromShare} → {h.toShare}</span>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Application Pipeline */}
      {pendingApps.length > 0 && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            {Ico.clock(16)}
            <span style={{ fontSize: 14, fontWeight: 700 }}>Application Pipeline</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pendingApps.map((p) => {
              const ss = statusStyle(p.status);
              const cust = CUSTOMERS.find((c) => c.id === p.customerId);
              const hasMortgage = PRODUCTS.some((pr) => pr.customerId === p.customerId && pr.type === "Mortgage");
              return (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", background: T.bg, borderRadius: 10, border: `1px solid ${T.borderLight}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{custName(p.customerId)}</span>
                      <span style={{ background: ss.bg, color: ss.color, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600 }}>{p.status}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
                      {p.share} share of {p.fullValue} | {p.housingAssoc} | Rent: {p.rent}
                      {hasMortgage && <span style={{ color: T.success, marginLeft: 8 }}>Existing mortgage customer</span>}
                    </div>
                  </div>
                  <Btn small primary>View Application</Btn>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* AI Insight */}
      <Card style={{ background: T.primaryLight, border: `1px solid ${T.primary}20` }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ color: T.primary, flexShrink: 0, marginTop: 2 }}>{Ico.sparkle(18)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 6 }}>AI Insight</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
              {soProducts.length} shared ownership application{soProducts.length !== 1 ? "s" : ""} in progress.
              Average share {avgShare}%.
              {soProducts.every((p) => PRODUCTS.some((pr) => pr.customerId === p.customerId && pr.type === "Mortgage"))
                ? " Both customers have existing mortgage relationships."
                : " Some customers have existing mortgage relationships — leverage for faster processing."}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
