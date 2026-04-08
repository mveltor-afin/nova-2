import React, { useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Card, KPICard, Btn } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS } from "../data/customers";

const custName = (id) => CUSTOMERS.find((c) => c.id === id)?.name || id;

const parseBalance = (b) => {
  if (!b || b === "—") return 0;
  return parseFloat(b.replace(/[£,]/g, ""));
};

const fmt = (n) => {
  if (n >= 1000000) return `£${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `£${(n / 1000).toFixed(0)}k`;
  return `£${n.toLocaleString("en-GB")}`;
};

export default function CurrentAccountsScreen() {
  const accounts = useMemo(() => PRODUCTS.filter((p) => p.type === "Current Account"), []);
  const activeCount = accounts.filter((a) => a.status === "Active").length;
  const totalBalances = accounts.reduce((s, a) => s + parseBalance(a.balance), 0);
  const avgBalance = accounts.length > 0 ? totalBalances / accounts.length : 0;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ico.wallet(22)}
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Current Accounts</h1>
          </div>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0 32px" }}>All current account products across customers</p>
        </div>
        <Btn icon="download" small>Export</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Total Accounts" value={accounts.length} color="#8B5CF6" />
        <KPICard label="Total Balances" value={fmt(totalBalances)} color={T.primary} />
        <KPICard label="Avg Balance" value={fmt(avgBalance)} color={T.success} />
        <KPICard label="Active" value={activeCount} color={T.success} />
      </div>

      {/* Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["Account", "Customer", "Product", "Balance", "Sort Code", "Account No", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id} style={{ borderBottom: `1px solid ${T.borderLight}` }}
                  onMouseEnter={(e) => e.currentTarget.style.background = T.primaryLight}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px", fontWeight: 600, color: T.primary }}>{a.id}</td>
                  <td style={{ padding: "12px 14px" }}>{custName(a.customerId)}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>{a.product}</td>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>{a.balance}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>{a.sortCode}</td>
                  <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12 }}>{a.accountNo}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}`, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{a.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
