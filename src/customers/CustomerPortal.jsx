import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ────────────────────────────────────────────
   MOCK DATA
   ──────────────────────────────────────────── */
const CUSTOMER = {
  name: "James Mitchell",
  ref: "HLX-2026-004817",
  email: "james.mitchell@email.co.uk",
  balance: 287450.00,
  ltv: 68.2,
  rate: 4.29,
  rateType: "Fixed",
  rateExpiry: "14 Mar 2028",
  term: "27 yrs 4 mo",
  monthlyPayment: 1423.67,
  nextPayment: "01 May 2026",
  propertyValue: 421500,
  originalLoan: 295000,
};

const STEPS = [
  { key: "submitted",    label: "Application Submitted" },
  { key: "kyc",          label: "KYC Complete" },
  { key: "underwriting", label: "Underwriting" },
  { key: "offer",        label: "Offer Issued" },
  { key: "completion",   label: "Completion" },
];
const CURRENT_STEP = 2; // 0-based — "Underwriting" is active

const DOCUMENTS = [
  { name: "Passport — James Mitchell",       uploaded: "18 Mar 2026", status: "Verified" },
  { name: "3 Months Bank Statements",        uploaded: "18 Mar 2026", status: "Verified" },
  { name: "P60 — 2024/25",                   uploaded: "19 Mar 2026", status: "Verified" },
  { name: "Payslip — February 2026",         uploaded: "19 Mar 2026", status: "Pending" },
  { name: "Mortgage Statement (existing)",   uploaded: "20 Mar 2026", status: "Pending" },
];

const RATE_PRODUCTS = [
  { name: "2-Year Fixed",   rate: 3.89, monthly: 1382.10, fee: 999 },
  { name: "5-Year Fixed",   rate: 4.15, monthly: 1405.44, fee: 0 },
  { name: "Tracker (BBR+0.89%)", rate: 4.39, monthly: 1431.22, fee: 0 },
];

const MESSAGES = [
  { id: 1, from: "Helix Bank", date: "2 Apr 2026", text: "Hi James, we've received your documents and everything is now with our underwriting team. We'll be in touch within 3 working days." },
  { id: 2, from: "James Mitchell", date: "3 Apr 2026", text: "Thanks — is there anything else you need from me in the meantime?" },
  { id: 3, from: "Helix Bank", date: "3 Apr 2026", text: "Nothing further needed right now. We'll notify you as soon as we have an update." },
];

/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */
const fmt = (n) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SoftCard = ({ children, style: sx }) => (
  <div style={{
    background: T.card, borderRadius: 16, border: `1px solid ${T.borderLight}`,
    padding: 28, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...sx,
  }}>{children}</div>
);

const SectionTitle = ({ icon, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
    <span style={{ color: T.primary }}>{icon}</span>
    <span style={{ fontSize: 17, fontWeight: 700, color: T.text, letterSpacing: -0.2 }}>{children}</span>
  </div>
);

/* ────────────────────────────────────────────
   MAIN COMPONENT
   ──────────────────────────────────────────── */
function CustomerPortal() {
  const [overpayAmt, setOverpayAmt] = useState("");
  const [msgDraft, setMsgDraft] = useState("");
  const [messages, setMessages] = useState(MESSAGES);

  const overpay = parseFloat(overpayAmt) || 0;
  // Rough illustrative calc: months saved ~ (overpay / monthlyPayment) * 1.4, interest saved ~ overpay * 0.38
  const monthsSaved = overpay > 0 ? Math.round((overpay / CUSTOMER.monthlyPayment) * 1.4) : 0;
  const interestSaved = overpay > 0 ? overpay * 0.38 : 0;

  const handleSendMsg = () => {
    if (!msgDraft.trim()) return;
    setMessages(prev => [...prev, { id: prev.length + 1, from: "James Mitchell", date: "Today", text: msgDraft.trim() }]);
    setMsgDraft("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F6F4EF", fontFamily: T.font }}>
      {/* ── Internal Staff Banner ── */}
      <div style={{
        background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`, color: "#fff",
        padding: "8px 24px", fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {Ico.eye(14)}
        <span>DEMO PREVIEW — Customer Portal as seen by the borrower</span>
        <span style={{ marginLeft: "auto", opacity: 0.6, fontSize: 11 }}>Internal use only</span>
      </div>

      {/* ── Customer Header ── */}
      <div style={{
        background: T.card, borderBottom: `1px solid ${T.borderLight}`,
        padding: "24px 40px", display: "flex", alignItems: "center", gap: 20,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 20,
        }}>JM</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: -0.3 }}>
            Welcome back, James
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
            Application ref: <span style={{ fontWeight: 600, color: T.textSecondary }}>{CUSTOMER.ref}</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <Btn icon="bell" ghost small>Notifications</Btn>
          <Btn icon="settings" ghost small>Settings</Btn>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* ═══ 1. Progress Tracker ═══ */}
        <SoftCard>
          <SectionTitle icon={Ico.loans(20)}>Application Progress</SectionTitle>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", padding: "0 8px" }}>
            {/* connecting line */}
            <div style={{
              position: "absolute", top: 18, left: 36, right: 36, height: 3,
              background: T.borderLight, borderRadius: 2, zIndex: 0,
            }} />
            <div style={{
              position: "absolute", top: 18, left: 36, height: 3, borderRadius: 2, zIndex: 1,
              background: `linear-gradient(90deg, ${T.accent}, ${T.primary})`,
              width: `${(CURRENT_STEP / (STEPS.length - 1)) * (100 - (72 / 9.6 * 100 / 960))}%`,
              maxWidth: `calc(${(CURRENT_STEP / (STEPS.length - 1)) * 100}% - 36px)`,
            }} />
            {STEPS.map((s, i) => {
              const done = i < CURRENT_STEP;
              const active = i === CURRENT_STEP;
              return (
                <div key={s.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative", zIndex: 2 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: done ? T.accent : active ? T.primary : "#E8E5DC",
                    color: done || active ? "#fff" : T.textMuted,
                    fontWeight: 700, fontSize: 14,
                    boxShadow: active ? `0 0 0 4px ${T.primaryGlow}` : "none",
                    transition: "all 0.3s",
                  }}>
                    {done ? Ico.check(18) : i + 1}
                  </div>
                  <div style={{
                    marginTop: 10, fontSize: 11, fontWeight: active ? 700 : 600,
                    color: done ? T.accent : active ? T.primary : T.textMuted,
                    textAlign: "center", lineHeight: 1.3, maxWidth: 100,
                  }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </SoftCard>

        {/* ═══ 2. Status Card ═══ */}
        <SoftCard style={{ display: "flex", alignItems: "center", gap: 24, background: "linear-gradient(135deg, #F0FDFB, #F6F4EF)" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.successBg}, rgba(49,184,151,0.15))`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {Ico.shield(36)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>
              Your application is being reviewed
            </div>
            <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.6 }}>
              Your application is with our underwriting team. Expected decision:{" "}
              <span style={{ fontWeight: 700, color: T.primary }}>3 working days</span>.
              We'll notify you by email and in-app as soon as there's an update.
            </div>
          </div>
        </SoftCard>

        {/* ═══ 3. Account Details (KPI row) ═══ */}
        <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <KPICard label="Outstanding Balance" value={`£${fmt(CUSTOMER.balance)}`} sub="of £295,000 original" color={T.primary} />
          <KPICard label="Loan-to-Value" value={`${CUSTOMER.ltv}%`} sub={`Property: £${fmt(CUSTOMER.propertyValue)}`} color={T.accent} />
          <KPICard label="Current Rate" value={`${CUSTOMER.rate}%`} sub={`${CUSTOMER.rateType} until ${CUSTOMER.rateExpiry}`} color={T.warning} />
          <KPICard label="Remaining Term" value={CUSTOMER.term} sub="Started Sep 2023" color="#7C3AED" />
        </div>

        {/* ═══ 4. Documents ═══ */}
        <SoftCard>
          <SectionTitle icon={Ico.file(20)}>Your Documents</SectionTitle>
          <div style={{ borderRadius: 10, border: `1px solid ${T.borderLight}`, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#FAFAF7" }}>
                  {["Document", "Uploaded", "Status"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: T.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `1px solid ${T.borderLight}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DOCUMENTS.map((d, i) => (
                  <tr key={i} style={{ borderBottom: i < DOCUMENTS.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
                    <td style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ color: T.primary }}>{Ico.file(16)}</span>
                      <span style={{ fontWeight: 500, color: T.text }}>{d.name}</span>
                    </td>
                    <td style={{ padding: "12px 16px", color: T.textMuted }}>{d.uploaded}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: d.status === "Verified" ? T.successBg : T.warningBg,
                        color: d.status === "Verified" ? T.success : T.warning,
                      }}>
                        {d.status === "Verified" && Ico.check(12)}
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Btn icon="upload" primary small>Upload Additional Document</Btn>
          </div>
        </SoftCard>

        {/* ═══ 5. Payments & Overpayment Calculator ═══ */}
        <SoftCard>
          <SectionTitle icon={Ico.dollar(20)}>Payments</SectionTitle>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {/* Next payment info */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Next Payment</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: T.text }}>£{fmt(CUSTOMER.monthlyPayment)}</span>
                <span style={{ fontSize: 13, color: T.textMuted }}>per month</span>
              </div>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
                Due: <span style={{ fontWeight: 600, color: T.text }}>{CUSTOMER.nextPayment}</span> — Direct Debit
              </div>
              <div style={{ padding: 16, borderRadius: 10, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: T.success }}>
                  {Ico.check(16)} All payments up to date
                </div>
              </div>
            </div>

            {/* Overpayment calculator */}
            <div style={{ flex: 1, minWidth: 280, padding: 20, borderRadius: 12, background: "#FAFAF7", border: `1px solid ${T.borderLight}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Overpayment Calculator</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>See how a lump-sum payment could reduce your mortgage</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.textMuted }}>£</span>
                <input
                  type="number" placeholder="e.g. 5000" value={overpayAmt}
                  onChange={e => setOverpayAmt(e.target.value)}
                  style={{
                    flex: 1, padding: "10px 14px", borderRadius: 10,
                    border: `1px solid ${T.border}`, fontSize: 14,
                    fontFamily: T.font, outline: "none", background: T.card,
                  }}
                />
              </div>
              {overpay > 0 && (
                <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                  <div style={{ flex: 1, padding: 14, borderRadius: 10, background: T.card, border: `1px solid ${T.borderLight}`, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: T.primary }}>{monthsSaved} mo</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>term reduction</div>
                  </div>
                  <div style={{ flex: 1, padding: 14, borderRadius: 10, background: T.card, border: `1px solid ${T.borderLight}`, textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: T.accent }}>£{fmt(interestSaved)}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>interest saved</div>
                  </div>
                </div>
              )}
              <Btn primary small disabled={overpay <= 0} style={{ width: "100%" }}>Make Overpayment</Btn>
            </div>
          </div>
        </SoftCard>

        {/* ═══ 6. Rate Switch ═══ */}
        <SoftCard>
          <SectionTitle icon={Ico.zap(20)}>Switch Your Rate</SectionTitle>
          <div style={{
            padding: 16, borderRadius: 10, marginBottom: 20,
            background: T.warningBg, border: `1px solid ${T.warningBorder}`,
            display: "flex", alignItems: "center", gap: 12, fontSize: 13,
          }}>
            {Ico.clock(18)}
            <span>
              Your current <strong>{CUSTOMER.rate}% {CUSTOMER.rateType}</strong> rate expires on{" "}
              <strong>{CUSTOMER.rateExpiry}</strong>. Review the options below to switch early.
            </span>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            {RATE_PRODUCTS.map((p, i) => (
              <div key={i} style={{
                flex: 1, minWidth: 200, padding: 20, borderRadius: 12,
                border: `1px solid ${i === 0 ? T.primary : T.borderLight}`,
                background: i === 0 ? T.primaryLight : T.card,
                position: "relative",
              }}>
                {i === 0 && (
                  <div style={{
                    position: "absolute", top: -10, right: 16, padding: "2px 10px",
                    borderRadius: 6, background: T.primary, color: "#fff",
                    fontSize: 10, fontWeight: 700, letterSpacing: 0.3,
                  }}>RECOMMENDED</div>
                )}
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 12 }}>{p.name}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: T.primary, marginBottom: 2 }}>{p.rate}%</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
                  £{fmt(p.monthly)}/mo {p.fee > 0 ? `· £${p.fee} fee` : "· No fee"}
                </div>
                <Btn primary={i === 0} small style={{ width: "100%" }}>Switch to This Rate</Btn>
              </div>
            ))}
          </div>
        </SoftCard>

        {/* ═══ 7. Secure Messaging ═══ */}
        <SoftCard>
          <SectionTitle icon={Ico.messages(20)}>Secure Messages</SectionTitle>
          <div style={{
            maxHeight: 280, overflowY: "auto", marginBottom: 16,
            padding: "4px 0",
          }}>
            {messages.map(m => {
              const isCustomer = m.from === "James Mitchell";
              return (
                <div key={m.id} style={{
                  display: "flex", justifyContent: isCustomer ? "flex-end" : "flex-start",
                  marginBottom: 12,
                }}>
                  <div style={{
                    maxWidth: "75%", padding: "12px 16px", borderRadius: 14,
                    background: isCustomer ? T.primary : "#F0EEEA",
                    color: isCustomer ? "#fff" : T.text,
                    borderBottomRightRadius: isCustomer ? 4 : 14,
                    borderBottomLeftRadius: isCustomer ? 14 : 4,
                  }}>
                    <div style={{ fontSize: 13, lineHeight: 1.5 }}>{m.text}</div>
                    <div style={{
                      fontSize: 10, marginTop: 6,
                      color: isCustomer ? "rgba(255,255,255,0.6)" : T.textMuted,
                      textAlign: "right",
                    }}>{m.from} · {m.date}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Type a message..."
              value={msgDraft}
              onChange={e => setMsgDraft(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendMsg()}
              style={{
                flex: 1, padding: "11px 16px", borderRadius: 12,
                border: `1px solid ${T.border}`, fontSize: 13,
                fontFamily: T.font, outline: "none",
              }}
            />
            <Btn primary small onClick={handleSendMsg} icon="send">Send</Btn>
          </div>
        </SoftCard>

        {/* ═══ 8. Account Summary ═══ */}
        <SoftCard>
          <SectionTitle icon={Ico.user(20)}>Account Details</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { label: "Outstanding Balance", val: `£${fmt(CUSTOMER.balance)}` },
              { label: "Loan-to-Value (LTV)", val: `${CUSTOMER.ltv}%` },
              { label: "Current Rate",        val: `${CUSTOMER.rate}% ${CUSTOMER.rateType}` },
              { label: "Remaining Term",      val: CUSTOMER.term },
              { label: "Next Payment",        val: `£${fmt(CUSTOMER.monthlyPayment)} on ${CUSTOMER.nextPayment}` },
              { label: "Property Value",      val: `£${fmt(CUSTOMER.propertyValue)}` },
            ].map((item, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 10, background: "#FAFAF7", border: `1px solid ${T.borderLight}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{item.val}</div>
              </div>
            ))}
          </div>
        </SoftCard>

        {/* Footer */}
        <div style={{ textAlign: "center", padding: "20px 0 0", fontSize: 12, color: T.textMuted }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 6 }}>
            {Ico.lock(14)} Secured with 256-bit encryption
          </div>
          Helix Bank plc is authorised and regulated by the FCA (Ref: 123456). Registered in England & Wales No. 07654321.
        </div>
      </div>
    </div>
  );
}

export default CustomerPortal;
