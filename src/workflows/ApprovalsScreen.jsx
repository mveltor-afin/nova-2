import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, PRODUCT_TYPES } from "../data/customers";

// ─────────────────────────────────────────────
// APPROVALS SCREEN — Unified approval queue
// ─────────────────────────────────────────────

const USER_MANDATE_LIMIT = 250000;

const APPROVAL_ITEMS = [
  {
    id: "APR-001", customerId: "CUS-007", customer: "Tom & Lucy Brennan",
    productType: "Mortgage", description: "Credit decision -- new mortgage application",
    amount: "£285,000", amountNum: 285000, mandateLevel: "Senior Underwriter",
    submittedBy: "Sarah Jones", timeWaiting: "2h 15m",
  },
  {
    id: "APR-002", customerId: "CUS-001", customer: "Emma Wilson",
    productType: "Mortgage", description: "Rate switch -- Fix 2yr 75% to Fix 5yr 60%",
    amount: "£156,200", amountNum: 156200, mandateLevel: "Underwriter",
    submittedBy: "Mark Thompson", timeWaiting: "45m",
  },
  {
    id: "APR-003", customerId: "CUS-004", customer: "David Chen",
    productType: "Mortgage", description: "Disbursement 4-eye approval -- mortgage drawdown",
    amount: "£412,000", amountNum: 412000, mandateLevel: "Head of Operations",
    submittedBy: "Lisa Park", timeWaiting: "3h 10m",
  },
  {
    id: "APR-004", customerId: "CUS-005", customer: "Aisha Patel",
    productType: "Fixed Term Deposit", description: "Large deposit sign-off -- £50k fixed term",
    amount: "£50,000", amountNum: 50000, mandateLevel: "Ops Manager",
    submittedBy: "James Chen", timeWaiting: "1h 30m",
  },
  {
    id: "APR-005", customerId: "CUS-002", customer: "James & Sarah Mitchell",
    productType: "Insurance", description: "Life cover policy approval -- £350k cover",
    amount: "£350,000", amountNum: 350000, mandateLevel: "Senior Underwriter",
    submittedBy: "Rachel Adams", timeWaiting: "4h 20m",
  },
  {
    id: "APR-006", customerId: "CUS-004", customer: "David Chen",
    productType: "Shared Ownership", description: "Housing association confirmation -- Bristol Housing 40%",
    amount: "£128,000", amountNum: 128000, mandateLevel: "Underwriter",
    submittedBy: "Tom Wilson", timeWaiting: "1d 2h",
  },
  {
    id: "APR-007", customerId: "CUS-003", customer: "Priya Sharma",
    productType: "Mortgage", description: "Mandate escalation -- arrears forbearance arrangement",
    amount: "£198,750", amountNum: 198750, mandateLevel: "Collections Manager",
    submittedBy: "Sarah Jones", timeWaiting: "5h 45m",
  },
  {
    id: "APR-008", customerId: "CUS-008", customer: "Maria Santos",
    productType: "Shared Ownership", description: "Pre-approval sign-off -- Edinburgh HA 50% share",
    amount: "£140,000", amountNum: 140000, mandateLevel: "Underwriter",
    submittedBy: "Mark Thompson", timeWaiting: "2h 50m",
  },
];

const ProductBadge = ({ type }) => {
  const pt = PRODUCT_TYPES[type] || PRODUCT_TYPES["Mortgage"];
  return (
    <span style={{
      background: pt.color + "18", color: pt.color, fontSize: 11, fontWeight: 700,
      padding: "3px 10px", borderRadius: 6, whiteSpace: "nowrap",
    }}>
      {pt.label}
    </span>
  );
};

export default function ApprovalsScreen() {
  const [items, setItems] = useState(APPROVAL_ITEMS);

  const handleAction = (id, action) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        {Ico.check(22)}
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Approvals</h2>
          <div style={{ fontSize: 12, color: T.textMuted }}>Unified approval queue across all products</div>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Pending Approval" value={items.length} sub="items awaiting decision" color={T.warning} />
        <KPICard label="My Queue" value="3" sub="assigned to me" color={T.primary} />
        <KPICard label="Approved Today" value="4" sub="decisions made" color={T.success} />
        <KPICard label="Avg Decision Time" value="2.1h" sub="target: 4h" color={T.accent} />
      </div>

      {/* Approvals Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                {["ID", "Customer", "Product", "Description", "Amount", "Mandate Level", "Submitted By", "Waiting", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "14px 16px", textAlign: "left", fontSize: 11, fontWeight: 700,
                    color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5,
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const exceedsMandate = item.amountNum > USER_MANDATE_LIMIT;
                return (
                  <tr key={item.id} style={{
                    borderBottom: `1px solid ${T.borderLight}`,
                    background: exceedsMandate ? T.warningBg : "transparent",
                  }}>
                    <td style={{ padding: "14px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {item.id}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{item.customer}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <ProductBadge type={item.productType} />
                    </td>
                    <td style={{ padding: "14px 16px", maxWidth: 260 }}>{item.description}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, whiteSpace: "nowrap" }}>
                      {item.amount}
                      {exceedsMandate && (
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 3, marginLeft: 6,
                          fontSize: 10, fontWeight: 700, color: T.warning,
                        }}>
                          {Ico.alert(12)} Over mandate
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: T.textMuted }}>{item.mandateLevel}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: T.textMuted }}>{item.submittedBy}</td>
                    <td style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
                      color: item.timeWaiting.includes("d") ? T.danger : item.timeWaiting.replace(/[^\d]/g,"") > 3 ? T.warning : T.textMuted }}>
                      {Ico.clock(12)} {item.timeWaiting}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small primary onClick={() => handleAction(item.id, "approve")}>Approve</Btn>
                        <Btn small danger onClick={() => handleAction(item.id, "reject")}>Reject</Btn>
                        <Btn small ghost onClick={() => handleAction(item.id, "refer")}>Refer</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 40, textAlign: "center", color: T.textMuted }}>
                    All items have been processed. Queue is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mandate note */}
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: T.textMuted }}>
        {Ico.alert(14)}
        <span>Highlighted rows exceed your mandate level (£250,000). Escalation or senior co-sign required.</span>
      </div>
    </div>
  );
}
