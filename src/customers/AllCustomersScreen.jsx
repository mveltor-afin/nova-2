import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, AI_ACTIONS, PRODUCT_TYPES } from "../data/customers";

// ── Colour maps ──
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

const TIER_COLORS = {
  Bronze:   "#CD7F32",
  Silver:   "#C0C0C0",
  Gold:     "#FFD700",
  Platinum: "#8B5CF6",
};

const Badge = ({ bg, text, children }) => (
  <span style={{ background:bg, color:text, padding:"3px 10px", borderRadius:4, fontSize:11, fontWeight:600, letterSpacing:0.3, whiteSpace:"nowrap" }}>{children}</span>
);

const getCustomerProducts = (cust) => PRODUCTS.filter(p => cust.products.includes(p.id));
const getProductTypes = (cust) => {
  const prods = getCustomerProducts(cust);
  return [...new Set(prods.map(p => p.type))];
};

export default function AllCustomersScreen({ onSelectCustomer }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:"0 0 4px", color:T.text }}>All Customers</h1>
          <p style={{ margin:0, fontSize:13, color:T.textMuted }}>{CUSTOMERS.length} customers across all segments</p>
        </div>
        <Btn primary icon="plus">New Customer</Btn>
      </div>
      <Card noPad>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#F8FAFC" }}>
              {["Name","Segment","Products","Risk","KYC","NPS","Rel. Value","Tier"].map(h => (
                <th key={h} style={{ textAlign:"left", padding:"10px 16px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CUSTOMERS.map((c, i) => {
              const prods = getCustomerProducts(c);
              const types = getProductTypes(c);
              return (
                <tr key={c.id} onClick={() => onSelectCustomer(c)}
                  style={{ cursor:"pointer", borderTop:`1px solid ${T.borderLight}`, transition:"background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${T.primary},${T.primaryDark})`,
                        display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700, flexShrink:0 }}>
                        {c.name.split(" ").map(w => w[0]).slice(0,2).join("")}
                      </div>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.name}</div>
                        <div style={{ fontSize:11, color:T.textMuted }}>{c.id} &middot; Since {c.since}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <Badge bg={SEGMENT_COLORS[c.segment]?.bg} text={SEGMENT_COLORS[c.segment]?.text}>{c.segment}</Badge>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{prods.length}</span>
                      <div style={{ display:"flex", gap:3 }}>
                        {types.map((t, ti) => (
                          <span key={ti} style={{ color:PRODUCT_TYPES[t]?.color || T.textMuted, display:"flex" }} title={PRODUCT_TYPES[t]?.label}>
                            {Ico[PRODUCT_TYPES[t]?.icon]?.(12)}
                          </span>
                        ))}
                      </div>
                      {c.pendingProducts.length > 0 && (
                        <span style={{ fontSize:10, color:T.warning, fontWeight:600 }}>+{c.pendingProducts.length} pending</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <Badge bg={RISK_COLORS[c.risk]?.bg} text={RISK_COLORS[c.risk]?.text}>{c.risk}</Badge>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <Badge bg={KYC_COLORS[c.kyc]?.bg} text={KYC_COLORS[c.kyc]?.text}>{c.kyc}</Badge>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ fontSize:13, fontWeight:600, color: c.nps == null ? T.textMuted : c.nps >= 9 ? T.success : c.nps >= 7 ? T.text : T.danger }}>
                      {c.nps != null ? c.nps : "—"}
                    </span>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ fontSize:13, fontWeight:600, color:T.text }}>{c.ltv}</span>
                  </td>
                  <td style={{ padding:"14px 16px" }}>
                    <span style={{ fontSize:11, fontWeight:700, color:TIER_COLORS[c.gamification.tier], letterSpacing:0.3 }}>
                      {c.gamification.tier}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
