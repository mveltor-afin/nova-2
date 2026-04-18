import React, { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ── Mock loan data (mirroring MOCK_LOANS) ──
const CASES = [
  { id: "AFN-2026-00142", customer: "James & Sarah Mitchell", amount: 350000, product: "2-Year Fixed", status: "Underwriting", productType: "standard" },
  { id: "AFN-2026-00139", customer: "Priya Sharma", amount: 275000, product: "2-Year Tracker", status: "Offer_Issued", productType: "tracker" },
  { id: "AFN-2026-00135", customer: "David Chen", amount: 425000, product: "5-Year Fixed", status: "KYC_In_Progress", productType: "fix5" },
  { id: "AFN-2026-00128", customer: "Emma & Tom Wilson", amount: 290000, product: "2-Year Fixed", status: "Disbursed", productType: "standard" },
  { id: "AFN-2026-00125", customer: "Aisha Patel", amount: 510000, product: "5-Year Fixed", status: "Approved", productType: "fix5" },
  { id: "AFN-2026-00119", customer: "Robert Hughes", amount: 180000, product: "—", status: "Referred", productType: "standard" },
  { id: "AFN-2026-00115", customer: "Sophie & Jack Brown", amount: 320000, product: "2-Year Fixed", status: "DIP_Approved", productType: "standard" },
];

const COMMISSION_RATES = { standard: 0.0035, fix5: 0.004, tracker: 0.003 };

function commissionAmount(c) {
  return Math.round(c.amount * (COMMISSION_RATES[c.productType] || 0.0035));
}

function paymentStatus(status) {
  if (status === "Disbursed") return { label: "Paid", color: T.success, bg: T.successBg };
  if (status === "Approved" || status === "Offer_Issued" || status === "Offer_Accepted") return { label: "On Completion", color: "#D97706", bg: T.warningBg };
  if (status === "Referred" || status === "Declined") return { label: "N/A", color: T.textMuted, bg: "#F1F5F9" };
  return { label: "Pending", color: T.textMuted, bg: "#F1F5F9" };
}

function rateLabel(type) {
  if (type === "fix5") return "0.40%";
  if (type === "tracker") return "0.30%";
  return "0.35%";
}

const MONTHLY = [
  { month: "Oct", value: 1800 },
  { month: "Nov", value: 2400 },
  { month: "Dec", value: 3100 },
  { month: "Jan", value: 1950 },
  { month: "Feb", value: 2140 },
  { month: "Mar", value: 2800 },
];

const TIERS = [
  { name: "Bronze", range: "0 – £5k/quarter", rate: "0.30%", min: 0, max: 5000 },
  { name: "Silver", range: "£5k – £15k/quarter", rate: "0.35%", min: 5000, max: 15000, current: true },
  { name: "Gold", range: "£15k – £25k/quarter", rate: "0.40%", min: 15000, max: 25000, unlock: "£3,600 to unlock" },
  { name: "Platinum", range: ">£25k/quarter", rate: "0.45%", min: 25000, max: 40000 },
];

const UPCOMING = [
  { id: "AFN-2026-00128", amount: "£1,015", note: "Expected 15 Apr" },
  { id: "AFN-2026-00125", amount: "£1,785", note: "On completion (est. May)" },
  { id: "AFN-2026-00142", amount: "£1,225", note: "On completion (est. Jun)" },
];

const fmt = (n) => "£" + n.toLocaleString("en-GB");

const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `2px solid ${T.border}` };
const td = { padding: "10px 14px", fontSize: 13, borderBottom: `1px solid ${T.borderLight}`, color: T.text };

export default function CommissionTracker() {
  const maxBar = Math.max(...MONTHLY.map(m => m.value));
  const currentQuarterEarned = 1950 + 2140 + 2800; // Jan+Feb+Mar
  const silverMin = 5000;
  const silverMax = 15000;
  const tierProgress = ((currentQuarterEarned - silverMin) / (silverMax - silverMin)) * 100;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 700, color: T.text }}>
          {Ico.dollar(22)} Commission Tracker
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, marginLeft: 32 }}>Your earnings and projections</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Pending Commission" value="£4,820" color={T.warning} />
        <KPICard label="Paid This Month" value="£2,140" color={T.success} />
        <KPICard label="Projected This Quarter" value="£18,600" color={T.primary} />
        <KPICard label="Cases Earning" value="5" color="#8B5CF6" />
        <KPICard label="Avg Commission / Case" value="£964" color="#0EA5E9" />
      </div>

      {/* Earnings by Case */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          {Ico.loans(18)} Earnings by Case
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Case ID</th>
                <th style={th}>Customer</th>
                <th style={th}>Loan Amount</th>
                <th style={th}>Product</th>
                <th style={th}>Status</th>
                <th style={th}>Comm. Rate</th>
                <th style={th}>Commission</th>
                <th style={th}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map(c => {
                const ps = paymentStatus(c.status);
                const comm = commissionAmount(c);
                return (
                  <tr key={c.id} style={{ transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ ...td, fontWeight: 600, fontFamily: "monospace", fontSize: 12 }}>{c.id}</td>
                    <td style={td}>{c.customer}</td>
                    <td style={td}>{fmt(c.amount)}</td>
                    <td style={{ ...td, fontSize: 12 }}>{c.product}</td>
                    <td style={td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: ps.bg, color: ps.color === T.textMuted ? "#555" : ps.color }}>
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ ...td, textAlign: "center" }}>{rateLabel(c.productType)}</td>
                    <td style={{ ...td, fontWeight: 600 }}>{fmt(comm)}</td>
                    <td style={td}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 4, background: ps.bg, color: ps.color }}>
                        {ps.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Monthly Earnings Chart */}
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.chart(18)} Monthly Earnings
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140 }}>
            {MONTHLY.map(m => {
              const h = (m.value / maxBar) * 120;
              return (
                <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted }}>{fmt(m.value)}</span>
                  <div style={{
                    width: "100%", maxWidth: 40, height: h, borderRadius: 6,
                    background: `linear-gradient(180deg, ${T.primary}, ${T.primaryDark})`,
                    transition: "height 0.3s",
                  }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.textMuted }}>{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Commission Tiers */}
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.zap(18)} Commission Tiers
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIERS.map(t => (
              <div key={t.name} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8,
                background: t.current ? T.primaryLight : "transparent",
                border: t.current ? `1px solid ${T.primary}` : `1px solid ${T.borderLight}`,
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                  <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 8 }}>{t.range}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.primary }}>{t.rate}</span>
                {t.current && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: T.success, color: "#fff" }}>
                    Current tier
                  </span>
                )}
                {t.unlock && (
                  <span style={{ fontSize: 10, fontWeight: 600, color: "#D97706" }}>{t.unlock}</span>
                )}
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginBottom: 4 }}>
              <span>Silver: {fmt(currentQuarterEarned)} earned</span>
              <span>{fmt(silverMax)} target</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "#E2E8F0", overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(tierProgress, 100)}%`, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`, transition: "width 0.3s" }} />
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        {/* Upcoming Payments */}
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.clock(18)} Upcoming Payments
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {UPCOMING.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, background: "#F8FAFC", border: `1px solid ${T.borderLight}` }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: T.primary }}>{u.id}</span>
                <span style={{ fontSize: 11, color: T.textMuted }}>—</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{u.amount}</span>
                <span style={{ fontSize: 11, color: T.textMuted }}>—</span>
                <span style={{ fontSize: 12, color: T.textSecondary }}>{u.note}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insight */}
        <Card style={{ background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.06))", border: `1px solid ${T.accent}40` }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, color: T.primary }}>
            {Ico.sparkle(18)} AI Insight
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: T.textSecondary, margin: 0 }}>
            You're <strong>19% ahead</strong> of this time last quarter. If <strong>AFN-00125</strong> and <strong>AFN-00142</strong> complete
            this month, you'll hit <strong>Gold tier</strong> for the first time &mdash; unlocking <strong>0.40%</strong> on all future cases.
          </p>
        </Card>
      </div>
    </div>
  );
}
