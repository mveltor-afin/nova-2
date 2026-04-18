import React from "react";
import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── mock data ── */
const ACCOUNTS = [
  { id: "M-001234", customer: "James Mitchell", product: "2-Year Fixed Residential", rate: "4.49%", expiry: "12 May 2026", daysLeft: 25, churnRisk: "High", riskScore: 82, aiAction: "Rate switch offer: 2-Year Fixed @ 4.29% (-0.20% vs current)", status: "Offer Sent" },
  { id: "M-001891", customer: "Sarah Whitfield", product: "5-Year Fixed Residential", rate: "3.89%", expiry: "28 May 2026", daysLeft: 41, churnRisk: "Medium", riskScore: 54, aiAction: "Rate switch offer: 5-Year Fixed @ 4.59% — competitive vs market", status: "Pending Review" },
  { id: "M-002104", customer: "David Okonkwo", product: "2-Year Fixed BTL", rate: "5.24%", expiry: "03 Jun 2026", daysLeft: 47, churnRisk: "Low", riskScore: 23, aiAction: "Rate switch offer: 2-Year Fixed @ 4.99% (-0.25% vs current)", status: "Accepted" },
  { id: "M-002567", customer: "Emily Chen", product: "Variable Tracker", rate: "5.49%", expiry: "19 May 2026", daysLeft: 32, churnRisk: "High", riskScore: 89, aiAction: "Retention call recommended — high churn risk", status: "Pending Review" },
  { id: "M-003012", customer: "Robert Hughes", product: "2-Year Fixed Residential", rate: "4.69%", expiry: "07 Jul 2026", daysLeft: 81, churnRisk: "Low", riskScore: 18, aiAction: "Rate switch offer: 2-Year Fixed @ 4.29% (-0.40% vs current)", status: "Offer Sent" },
  { id: "M-003456", customer: "Priya Sharma", product: "5-Year Fixed Residential", rate: "4.19%", expiry: "22 Jun 2026", daysLeft: 66, churnRisk: "Medium", riskScore: 47, aiAction: "Rate switch offer: 3-Year Fixed @ 4.39% — value retention", status: "Accepted" },
  { id: "M-003890", customer: "Thomas Anderson", product: "2-Year Fixed BTL", rate: "5.74%", expiry: "15 May 2026", daysLeft: 28, churnRisk: "High", riskScore: 91, aiAction: "Retention call recommended — high churn risk", status: "Offer Sent" },
  { id: "M-004201", customer: "Fiona MacLeod", product: "Offset Mortgage", rate: "5.59%", expiry: "01 Jun 2026", daysLeft: 45, churnRisk: "Medium", riskScore: 58, aiAction: "Rate switch offer: 2-Year Fixed @ 4.49% (-1.10% vs current)", status: "Pending Review" },
];

const ACTIVITY_LOG = [
  { ts: "17 Apr 09:42", action: "Auto-generated rate switch offer for M-001234 — 2-Year Fixed @ 4.29%", status: "Completed" },
  { ts: "17 Apr 09:38", action: "Sent personalised email to James Mitchell — rate expiry in 25 days", status: "Completed" },
  { ts: "17 Apr 09:15", action: "Escalated M-003890 to retention team — churn risk 91%", status: "Escalated" },
  { ts: "16 Apr 16:52", action: "Generated comparison report for Emily Chen — 4 product options analysed", status: "Completed" },
  { ts: "16 Apr 14:30", action: "Sent SMS reminder to Robert Hughes — rate expiry in 82 days", status: "Completed" },
  { ts: "16 Apr 11:18", action: "Auto-generated retention offer for M-002567 — pending manager approval", status: "Pending Approval" },
  { ts: "15 Apr 17:05", action: "Flagged Thomas Anderson for priority outbound call — churn risk increased to 91%", status: "Escalated" },
  { ts: "15 Apr 15:22", action: "Processed rate switch acceptance from David Okonkwo — M-002104", status: "Completed" },
  { ts: "15 Apr 10:44", action: "Sent personalised email to Priya Sharma — retention offer with 3-Year Fixed option", status: "Completed" },
  { ts: "14 Apr 09:30", action: "Recalculated churn scores for 47 accounts approaching 90-day expiry window", status: "Completed" },
];

/* ── helpers ── */
const riskColor = (risk) =>
  risk === "High" ? T.danger : risk === "Medium" ? T.warning : T.success;

const riskBg = (risk) =>
  risk === "High" ? T.dangerBg : risk === "Medium" ? T.warningBg : T.successBg;

const statusColor = (s) =>
  s === "Accepted" || s === "Completed" ? T.success :
  s === "Pending Review" || s === "Pending Approval" ? T.warning :
  s === "Escalated" ? T.danger : T.primary;

const statusBg = (s) =>
  s === "Accepted" || s === "Completed" ? T.successBg :
  s === "Pending Review" || s === "Pending Approval" ? T.warningBg :
  s === "Escalated" ? T.dangerBg : T.primaryLight;

const thStyle = { padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, textAlign: "left", borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" };
const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}`, verticalAlign: "top" };

export default function RetentionAgent({ customerId }) {
  const [filter, setFilter] = useState("All");

  const filtered = customerId
    ? ACCOUNTS.filter(a => a.id === customerId)
    : filter === "All" ? ACCOUNTS : ACCOUNTS.filter(a => a.churnRisk === filter);

  return (
    <div style={{ fontFamily: T.font }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          {Ico.sparkle(20)}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>AI Retention Agent</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Autonomous rate expiry monitoring and retention offer generation</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.success, display: "inline-block" }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: T.success }}>Agent Active</span>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Accounts Expiring" value="47" sub="Next 90 days" color={T.primary} />
        <KPICard label="Auto-Offers Sent" value="31" sub="+8 this week" color={T.accent} />
        <KPICard label="Retention Rate" value="87.3%" sub="+4.1% vs last quarter" color={T.success} />
        <KPICard label="Revenue Saved" value="£2.4M" sub="Annualised retained book" color={T.warning} />
      </div>

      {/* Filter Buttons */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {["All", "High", "Medium", "Low"].map(f => (
          <Btn key={f} small ghost={filter !== f} primary={filter === f} onClick={() => setFilter(f)}>
            {f === "All" ? "All Accounts" : `${f} Risk`}
          </Btn>
        ))}
      </div>

      {/* Accounts Table */}
      <Card noPad style={{ marginBottom: 28, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.clock(16)} Accounts Approaching Rate Expiry
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFAF7" }}>
                <th style={thStyle}>Account</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Current Rate</th>
                <th style={thStyle}>Expiry</th>
                <th style={thStyle}>Days Left</th>
                <th style={thStyle}>Churn Risk</th>
                <th style={thStyle}>AI Action</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id} style={{ transition: "background 0.15s" }}>
                  <td style={{ ...tdStyle, fontWeight: 600, fontFamily: "monospace", fontSize: 12, color: T.primary }}>{a.id}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{a.customer}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{a.product}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, fontFamily: "monospace" }}>{a.rate}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{a.expiry}</td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 700, color: a.daysLeft <= 30 ? T.danger : a.daysLeft <= 60 ? T.warning : T.text }}>
                      {a.daysLeft}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: riskBg(a.churnRisk), color: riskColor(a.churnRisk) }}>
                      {a.churnRisk}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12, maxWidth: 280, color: T.textSecondary }}>{a.aiAction}</td>
                  <td style={tdStyle}>
                    <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: statusBg(a.status), color: statusColor(a.status) }}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Agent Activity Log */}
      <Card noPad>
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${T.borderLight}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.bot(16)} Agent Activity Log
          </div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>Autonomous actions taken by the retention agent</div>
        </div>
        <div>
          {ACTIVITY_LOG.map((entry, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 20px", borderBottom: i < ACTIVITY_LOG.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
              <div style={{ minWidth: 100, fontSize: 11, color: T.textMuted, fontFamily: "monospace", paddingTop: 2 }}>{entry.ts}</div>
              <div style={{ flex: 1, fontSize: 13, color: T.text }}>{entry.action}</div>
              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: statusBg(entry.status), color: statusColor(entry.status), whiteSpace: "nowrap" }}>
                {entry.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
