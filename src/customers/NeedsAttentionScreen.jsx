import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, AI_ACTIONS, PRODUCT_TYPES } from "../data/customers";

// ── Colour maps ──
const PRIORITY_COLORS = {
  Critical: { bg:"#FEE2E2", text:"#991B1B", border:"#FCA5A5" },
  High:     { bg:"#FFF8E0", text:"#92400E", border:"#FFD966" },
  Medium:   { bg:"#DBEAFE", text:"#1E40AF", border:"#93C5FD" },
  Low:      { bg:"#E6F7F3", text:"#065F46", border:"#A3DDD1" },
};

const SEGMENT_COLORS = {
  Premier:  { bg:"#EDE9FE", text:"#5B21B6" },
  Standard: { bg:"#DBEAFE", text:"#1E40AF" },
  "At Risk":{ bg:"#FEE2E2", text:"#991B1B" },
  New:      { bg:"#E6F7F3", text:"#065F46" },
};

const RISK_COLORS = {
  Low:    { bg:"#D1FAE5", text:"#065F46" },
  Medium: { bg:"#FEF3C7", text:"#92400E" },
  High:   { bg:"#FEE2E2", text:"#991B1B" },
};

const KYC_COLORS = {
  Verified: { bg:"#D1FAE5", text:"#065F46" },
  Expired:  { bg:"#FEE2E2", text:"#991B1B" },
  Pending:  { bg:"#FEF3C7", text:"#92400E" },
};

// Helpers
const Badge = ({ bg, text, children }) => (
  <span style={{ background:bg, color:text, padding:"3px 10px", borderRadius:4, fontSize:11, fontWeight:600, letterSpacing:0.3, whiteSpace:"nowrap" }}>{children}</span>
);

const getCustomerProducts = (cust) => PRODUCTS.filter(p => cust.products.includes(p.id));

const getNeedsAttention = () => {
  const results = [];
  for (const cust of CUSTOMERS) {
    const actions = AI_ACTIONS[cust.id];
    if (!actions) continue;
    const urgent = actions.filter(a => a.priority === "Critical" || a.priority === "High");
    if (urgent.length > 0) {
      results.push({ customer: cust, actions: urgent, topAction: urgent[0] });
    }
  }
  return results;
};

export default function NeedsAttentionScreen({ onSelectCustomer }) {
  const items = getNeedsAttention();
  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px", color:T.text }}>Needs Attention</h1>
        <p style={{ margin:0, fontSize:13, color:T.textMuted }}>{items.length} customers require action today</p>
      </div>

      <div style={{ display:"flex", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <KPICard label="Critical" value={String(items.filter(i => i.topAction.priority === "Critical").length)} sub="Immediate action" color="#EF4444" />
        <KPICard label="High Priority" value={String(items.filter(i => i.topAction.priority === "High").length)} sub="Within 24 hours" color="#F59E0B" />
        <KPICard label="Total Actions" value={String(items.reduce((s, i) => s + i.actions.length, 0))} sub="Across all customers" color={T.primary} />
        <KPICard label="Arrears" value={
          "£" + PRODUCTS.filter(p => p.arrears).reduce((s, p) => s + parseInt(p.arrears.replace(/[£,]/g, "")), 0).toLocaleString()
        } sub="Total outstanding" color="#EF4444" />
      </div>

      <Card noPad>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:14, fontWeight:700, color:T.text }}>Customers Requiring Action</span>
          <span style={{ fontSize:12, color:T.textMuted }}>{items.length} customer{items.length !== 1 ? "s" : ""}</span>
        </div>
        {items.map((item, idx) => {
          const { customer: c, actions, topAction } = item;
          const prods = getCustomerProducts(c);
          const pc = PRIORITY_COLORS[topAction.priority];
          return (
            <div key={c.id} onClick={() => onSelectCustomer(c)}
              style={{ display:"flex", alignItems:"flex-start", gap:16, padding:"16px 20px",
                borderTop: idx ? `1px solid ${T.borderLight}` : "none", cursor:"pointer",
                transition:"background 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {/* Avatar */}
              <div style={{ width:40, height:40, borderRadius:10, background:`linear-gradient(135deg,${T.primary},${T.primaryDark})`,
                display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:14, fontWeight:700, flexShrink:0 }}>
                {c.name.split(" ").map(w => w[0]).slice(0,2).join("")}
              </div>
              {/* Info */}
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:14, fontWeight:600, color:T.text }}>{c.name}</span>
                  <span style={{ fontSize:11, color:T.textMuted }}>{c.id}</span>
                  <Badge bg={SEGMENT_COLORS[c.segment]?.bg} text={SEGMENT_COLORS[c.segment]?.text}>{c.segment}</Badge>
                  {c.vuln && <Badge bg="#FEE2E2" text="#991B1B">Vulnerable</Badge>}
                </div>
                <div style={{ fontSize:12, color:T.textMuted, marginBottom:8 }}>
                  {prods.length} product{prods.length !== 1 ? "s" : ""} &middot; {c.since} &middot; LTV {c.ltv}
                </div>
                {/* Top action */}
                <div style={{ padding:"10px 14px", borderRadius:8, background:pc.bg, border:`1px solid ${pc.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                    <Badge bg={pc.bg} text={pc.text}>{topAction.priority}</Badge>
                    <span style={{ fontSize:11, color:pc.text, fontWeight:500 }}>{topAction.type}</span>
                  </div>
                  <div style={{ fontSize:13, color:pc.text, fontWeight:500, lineHeight:1.5 }}>{topAction.action}</div>
                  <div style={{ fontSize:11, color:pc.text, opacity:0.7, marginTop:4 }}>Impact: {topAction.impact}</div>
                </div>
                {actions.length > 1 && (
                  <div style={{ fontSize:11, color:T.textMuted, marginTop:6 }}>+ {actions.length - 1} more action{actions.length - 1 > 1 ? "s" : ""}</div>
                )}
              </div>
              {/* Risk badge */}
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                <Badge bg={RISK_COLORS[c.risk]?.bg} text={RISK_COLORS[c.risk]?.text}>Risk: {c.risk}</Badge>
                <Badge bg={KYC_COLORS[c.kyc]?.bg} text={KYC_COLORS[c.kyc]?.text}>KYC: {c.kyc}</Badge>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// Re-export for use by Shell copilot panel
export { getNeedsAttention, PRIORITY_COLORS };
