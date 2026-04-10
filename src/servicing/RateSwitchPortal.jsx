import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import FairValueAssessment from "../shared/FairValueAssessment";

/* ── Mock Data ─────────────────────────────────── */
const PRODUCTS = [
  { id: "FIX2", name: "2-Year Fixed", rate: 4.29, erc: "2% yr1, 1% yr2" },
  { id: "FIX5", name: "5-Year Fixed", rate: 3.99, erc: "3% yr1-3, 2% yr4, 1% yr5" },
  { id: "TRACK2", name: "2-Year Tracker", rate: 4.15, erc: "1.5% yr1, 0.5% yr2" },
  { id: "DISC3", name: "3-Year Discount", rate: 4.09, erc: "2% yr1-2, 1% yr3" },
];

const MOCK_ACCOUNTS = [
  { id: "HB-40001", name: "Eleanor Vance",      currentRate: 2.19, currentProduct: "2-Year Fixed",   balance: 245000, monthly: 1046, expiry: "2026-04-18", daysLeft: 12, recommended: "FIX5",  status: "Pending" },
  { id: "HB-40012", name: "Raj Kapoor",         currentRate: 2.49, currentProduct: "2-Year Fixed",   balance: 312000, monthly: 1395, expiry: "2026-04-22", daysLeft: 16, recommended: "FIX2",  status: "Pending" },
  { id: "HB-40023", name: "Sophie Martin",      currentRate: 1.99, currentProduct: "2-Year Tracker", balance: 189000, monthly: 798,  expiry: "2026-04-28", daysLeft: 22, recommended: "TRACK2", status: "Offer Sent" },
  { id: "HB-40034", name: "Thomas Okafor",      currentRate: 2.39, currentProduct: "3-Year Fixed",   balance: 410000, monthly: 1810, expiry: "2026-05-01", daysLeft: 25, recommended: "FIX5",  status: "Pending" },
  { id: "HB-40045", name: "Hannah Brooks",      currentRate: 2.09, currentProduct: "2-Year Fixed",   balance: 275000, monthly: 1168, expiry: "2026-05-10", daysLeft: 34, recommended: "FIX2",  status: "Pending" },
  { id: "HB-40056", name: "Michael Zhang",      currentRate: 2.59, currentProduct: "2-Year Discount",balance: 198000, monthly: 890,  expiry: "2026-05-18", daysLeft: 42, recommended: "DISC3", status: "Pending" },
  { id: "HB-40067", name: "Amara Osei",         currentRate: 2.29, currentProduct: "5-Year Fixed",   balance: 345000, monthly: 1502, expiry: "2026-06-01", daysLeft: 56, recommended: "FIX5",  status: "Offer Sent" },
  { id: "HB-40078", name: "James Doyle",        currentRate: 2.79, currentProduct: "2-Year Tracker", balance: 220000, monthly: 1012, expiry: "2026-06-15", daysLeft: 70, recommended: "TRACK2", status: "Pending" },
  { id: "HB-40089", name: "Preet Sandhu",       currentRate: 2.49, currentProduct: "3-Year Discount",balance: 380000, monthly: 1680, expiry: "2026-06-22", daysLeft: 77, recommended: "FIX5",  status: "Pending" },
  { id: "HB-40100", name: "Catherine Walsh",    currentRate: 1.89, currentProduct: "2-Year Fixed",   balance: 156000, monthly: 651,  expiry: "2026-07-01", daysLeft: 86, recommended: "FIX2",  status: "Pending" },
  { id: "HB-40111", name: "Daniel Eriksson",    currentRate: 2.39, currentProduct: "2-Year Fixed",   balance: 290000, monthly: 1270, expiry: "2026-04-14", daysLeft: 8,  recommended: "FIX5",  status: "Urgent" },
  { id: "HB-40122", name: "Isla MacGregor",     currentRate: 2.69, currentProduct: "2-Year Tracker", balance: 205000, monthly: 942,  expiry: "2026-04-26", daysLeft: 20, recommended: "TRACK2", status: "Pending" },
];

function calcMonthly(balance, rate) {
  const r = rate / 100 / 12;
  const n = 300; // 25yr remaining
  return Math.round(balance * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

const statusStyle = (s) => {
  const m = {
    Pending:     { bg: T.warningBg, c: T.warning },
    "Offer Sent":{ bg: "#DBEAFE",   c: "#1E40AF" },
    Urgent:      { bg: T.dangerBg,  c: T.danger },
    Confirmed:   { bg: T.successBg, c: T.success },
  };
  const v = m[s] || m.Pending;
  return { background: v.bg, color: v.c, padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" };
};

/* ── Component ─────────────────────────────────── */
export default function RateSwitchPortal() {
  const [accounts, setAccounts] = useState([...MOCK_ACCOUNTS].sort((a, b) => a.daysLeft - b.daysLeft));
  const [selected, setSelected] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [chosenProduct, setChosenProduct] = useState(null);
  const [batchSent, setBatchSent] = useState(false);

  const sel = selected ? accounts.find(a => a.id === selected) : null;

  const expiring30 = accounts.filter(a => a.daysLeft <= 30).length;
  const expiring3090 = accounts.filter(a => a.daysLeft > 30 && a.daysLeft <= 90).length;
  const switchesThisMonth = accounts.filter(a => a.status === "Confirmed").length;

  const handleConfirmSwitch = () => {
    if (!sel || !chosenProduct) return;
    const prod = PRODUCTS.find(p => p.id === chosenProduct);
    setAccounts(prev => prev.map(a => a.id === sel.id ? {
      ...a, status: "Confirmed", currentRate: prod.rate, currentProduct: prod.name, recommended: chosenProduct,
    } : a));
    setShowConfirm(false);
    setChosenProduct(null);
  };

  const handleBatchSend = () => {
    setAccounts(prev => prev.map(a => a.daysLeft <= 30 && a.status === "Pending" ? { ...a, status: "Offer Sent" } : a));
    setBatchSent(true);
    setTimeout(() => setBatchSent(false), 3000);
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh", padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          {Ico.dollar(20)}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.navy }}>Rate Switch Portal</h1>
          <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>Self-service rate switching and retention management</p>
        </div>
        <Btn primary icon="send" onClick={handleBatchSend} disabled={batchSent}>
          {batchSent ? "Offers Sent" : "Send Retention Offers (<30d)"}
        </Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Expiring <30d" value={expiring30} sub="Requires attention" color={T.danger} />
        <KPICard label="Expiring 30-90d" value={expiring3090} sub="Pipeline" color={T.warning} />
        <KPICard label="Switches This Month" value={switchesThisMonth} color={T.success} />
        <KPICard label="Retention Rate" value="89%" sub="YTD" color={T.primary} />
      </div>

      {sel ? (
        /* ── Detail View ── */
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div onClick={() => { setSelected(null); setChosenProduct(null); }} style={{ cursor: "pointer", color: T.primary, display: "flex", alignItems: "center", gap: 4 }}>
              {Ico.arrowLeft(16)} <span style={{ fontSize: 13, fontWeight: 600 }}>Back to accounts</span>
            </div>
          </div>

          {/* Current terms */}
          <div style={{ display: "flex", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>{Ico.user(24)}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{sel.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{sel.id}</div>
                </div>
                <span style={statusStyle(sel.status)}>{sel.status}</span>
              </div>

              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: T.navy }}>Current Terms</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                {[
                  ["Product", sel.currentProduct],
                  ["Rate", `${sel.currentRate}%`],
                  ["Balance", `£${sel.balance.toLocaleString()}`],
                  ["Monthly Payment", `£${sel.monthly.toLocaleString()}`],
                  ["Expiry Date", sel.expiry],
                  ["Days Remaining", `${sel.daysLeft} days`],
                ].map(([label, val]) => (
                  <div key={label} style={{ background: T.bg, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.navy }}>{val}</div>
                  </div>
                ))}
              </div>

              {/* AI Recommendation */}
              <div style={{ background: "rgba(26,74,84,0.05)", borderRadius: 10, padding: 16, border: `1px solid ${T.borderLight}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  {Ico.sparkle(14)} <span style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>AI Recommendation</span>
                </div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>
                  Based on {sel.name.split(" ")[0]}'s payment history, LTV ratio, and current market conditions, we recommend the{" "}
                  <strong>{PRODUCTS.find(p => p.id === sel.recommended)?.name}</strong> at{" "}
                  <strong>{PRODUCTS.find(p => p.id === sel.recommended)?.rate}%</strong>.
                  This would save approximately <strong>£{Math.abs(calcMonthly(sel.balance, PRODUCTS.find(p => p.id === sel.recommended)?.rate || 4) - sel.monthly).toLocaleString()}/month</strong> compared to SVR reversion.
                </div>
              </div>
            </div>
          </div>

          {/* Product comparison */}
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.navy }}>Available Products</div>
          <div style={{ overflowX: "auto", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["", "Product", "Rate", "New Monthly", "Monthly Saving vs SVR", "ERC", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRODUCTS.map(prod => {
                  const newMonthly = calcMonthly(sel.balance, prod.rate);
                  const svrMonthly = calcMonthly(sel.balance, 6.49);
                  const saving = svrMonthly - newMonthly;
                  const isRecommended = prod.id === sel.recommended;
                  const isChosen = chosenProduct === prod.id;
                  return (
                    <tr key={prod.id}
                      onClick={() => setChosenProduct(prod.id)}
                      style={{
                        borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer",
                        background: isChosen ? T.primaryLight : isRecommended ? "rgba(49,184,151,0.05)" : "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => { if (!isChosen) e.currentTarget.style.background = T.primaryLight; }}
                      onMouseLeave={e => { if (!isChosen) e.currentTarget.style.background = isRecommended ? "rgba(49,184,151,0.05)" : "transparent"; }}
                    >
                      <td style={{ padding: "12px 14px", width: 30 }}>
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isChosen ? T.primary : T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isChosen && <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.primary }} />}
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                        {prod.name}
                        {isRecommended && <span style={{ marginLeft: 8, background: T.successBg, color: T.success, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>Recommended</span>}
                      </td>
                      <td style={{ padding: "12px 14px", fontWeight: 700 }}>{prod.rate}%</td>
                      <td style={{ padding: "12px 14px" }}>£{newMonthly.toLocaleString()}</td>
                      <td style={{ padding: "12px 14px", color: T.success, fontWeight: 600 }}>£{saving.toLocaleString()}/mo</td>
                      <td style={{ padding: "12px 14px", fontSize: 11, color: T.textMuted }}>{prod.erc}</td>
                      <td style={{ padding: "12px 14px" }}>
                        {isChosen && <Btn small primary onClick={e => { e.stopPropagation(); setShowConfirm(true); }}>Select</Btn>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {chosenProduct && (() => {
            const prod = PRODUCTS.find(p => p.id === chosenProduct);
            return (
              <div style={{ marginBottom: 24 }}>
                <FairValueAssessment
                  product={prod.name}
                  rate={`${prod.rate.toFixed(2)}%`}
                  amount={`£${sel.balance.toLocaleString()}`}
                />
              </div>
            );
          })()}

          {chosenProduct && (
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Btn primary icon="check" onClick={() => setShowConfirm(true)}>Confirm Rate Switch</Btn>
            </div>
          )}

          {/* Confirmation Modal */}
          {showConfirm && chosenProduct && (() => {
            const prod = PRODUCTS.find(p => p.id === chosenProduct);
            const newMonthly = calcMonthly(sel.balance, prod.rate);
            return (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}
                onClick={() => setShowConfirm(false)}>
                <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: 16, padding: 32, maxWidth: 460, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 8 }}>Confirm Rate Switch</div>
                  <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Please review the details below before confirming.</div>

                  <div style={{ background: T.bg, borderRadius: 10, padding: 16, marginBottom: 20 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div><div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase" }}>Account</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{sel.name} ({sel.id})</div></div>
                      <div><div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase" }}>New Product</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{prod.name}</div></div>
                      <div><div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase" }}>New Rate</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{prod.rate}%</div></div>
                      <div><div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase" }}>New Monthly</div><div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>£{newMonthly.toLocaleString()}</div></div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <Btn onClick={() => setShowConfirm(false)}>Cancel</Btn>
                    <Btn primary icon="check" onClick={handleConfirmSwitch}>Confirm Switch</Btn>
                  </div>
                </div>
              </div>
            );
          })()}
        </Card>
      ) : (
        /* ── Table View ── */
        <Card noPad style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>Accounts Approaching Rate Expiry</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{accounts.length} accounts</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                  {["Name", "Account", "Current Rate", "Current Product", "Expiry Date", "Days Left", "Recommended", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id} onClick={() => setSelected(acc.id)}
                    style={{ borderBottom: `1px solid ${T.borderLight}`, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", fontWeight: 600, color: T.navy }}>{acc.name}</td>
                    <td style={{ padding: "14px 16px", color: T.textMuted, fontSize: 12 }}>{acc.id}</td>
                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{acc.currentRate}%</td>
                    <td style={{ padding: "14px 16px" }}>{acc.currentProduct}</td>
                    <td style={{ padding: "14px 16px" }}>{acc.expiry}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontWeight: 700,
                        color: acc.daysLeft <= 14 ? T.danger : acc.daysLeft <= 30 ? T.warning : T.text,
                      }}>
                        {acc.daysLeft}d
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: 12, fontWeight: 600 }}>{PRODUCTS.find(p => p.id === acc.recommended)?.name}</span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={statusStyle(acc.status)}>{acc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {batchSent && (
            <div style={{ padding: "12px 24px", background: T.successBg, borderTop: `1px solid ${T.successBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.check(16)} <span style={{ fontSize: 13, fontWeight: 600, color: T.success }}>Retention offers sent to all accounts expiring within 30 days.</span>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
