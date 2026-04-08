import { useState, useRef, useEffect } from "react";
import { T, Ico } from "./tokens";
import { Btn } from "./primitives";

// ─────────────────────────────────────────────
// CONTEXT-AWARE QUICK ACTION CHIPS
// ─────────────────────────────────────────────
const CHIPS = {
  Pipeline:     ["Cases breaching SLA", "Unassigned cases", "This week's forecast"],
  Case:         ["Summarise this case", "Draft broker update", "Check affordability", "Risk assessment"],
  Customer360:  ["Retention strategy", "Cross-sell opportunities", "Draft email"],
  Servicing:    ["Rate switch options", "Payment forecast", "Collections recommendation"],
  Collections:  ["Optimal contact strategy", "Arrangement recommendation"],
  _default:     ["What can I help with?", "Show platform stats", "Recent activity"],
};

// ─────────────────────────────────────────────
// DEMO RESPONSES (rich formatted content)
// ─────────────────────────────────────────────
const DEMO_RESPONSES = {
  "Summarise this case": {
    text: `**Case Summary -- ML-2024-04821**

This is a residential remortgage application for **Sarah & James Mitchell**, submitted by broker NatWest Intermediaries on 18 Mar 2026. The property at **14 Oakwood Drive, Cheltenham GL52 3HJ** was valued at **\u00a3425,000** with a requested loan of **\u00a3297,500** (LTV 70%).

Key observations:
- Affordability verified at **3.2x combined income** (\u00a393,400 joint)
- Credit score: **712** (Experian) -- no adverse in last 6 years
- Existing mortgage with Halifax, \u00a3302,100 outstanding, rate expiry 01 May 2026
- AML/KYC checks **passed** on both applicants
- Valuation complete -- surveyor value aligned with AVM (\u00a3422,000 vs \u00a3425,000)
- Outstanding item: **employer reference for James Mitchell** (chased 02 Apr)

**Risk flags:** None. Recommend proceeding to formal offer once employer reference received.`,
    hasAction: false,
  },
  "Draft broker update": {
    text: `**Draft Email -- Broker Update**

---

**To:** sarah.chen@natwesti.co.uk
**Subject:** Case ML-2024-04821 -- Mitchell Remortgage Update

Hi Sarah,

Thank you for your recent submission regarding the Mitchell remortgage application.

I'm pleased to confirm the following progress:

1. **Valuation** -- Completed and satisfactory (\u00a3425,000)
2. **AML/KYC** -- All checks passed for both applicants
3. **Affordability** -- Verified and within policy parameters
4. **Credit search** -- No adverse findings

**Outstanding item:** We are awaiting an employer reference for James Mitchell. This was chased on 02 April. Could you please follow up with the applicant to expedite?

Once received, we anticipate issuing a formal offer within **2-3 working days**.

Please don't hesitate to reach out if you have any questions.

Kind regards,
Helix Bank Mortgage Operations

---`,
    hasAction: true,
    actionLabel: "Copy to clipboard",
  },
  "Cross-sell opportunities": {
    text: `**Cross-sell Opportunities -- Sarah & James Mitchell**

Based on the customer profile, transaction history, and current product holdings, Nova identifies the following opportunities:

1. **Home Insurance Bundle** -- Estimated revenue: **\u00a3480/yr**
   - No existing home insurance on file; property completion imminent
   - Conversion probability: **82%**

2. **Life & Critical Illness Cover** -- Estimated revenue: **\u00a31,200/yr**
   - Joint mortgage with no linked protection products
   - Combined cover \u00a3297,500 aligned with mortgage balance
   - Conversion probability: **68%**

3. **Premium Current Account** -- Estimated revenue: **\u00a3228/yr**
   - Both applicants bank with competitors; salary credits show \u00a37,800/month combined
   - Offer: fee-free for 12 months with mortgage bundle
   - Conversion probability: **45%**

4. **Savings Account (Fixed Rate ISA)** -- Estimated revenue: **\u00a3340/yr**
   - Surplus monthly income of ~\u00a32,100 identified from bank statements
   - Conversion probability: **55%**

**Total estimated annual revenue: \u00a32,248**
**Recommended next step:** Trigger retention journey with bundled offer at completion stage.`,
    hasAction: false,
  },
  "Cases breaching SLA": {
    text: `**SLA Breach Report -- 6 Apr 2026**

Currently **4 cases** are breaching or at risk of breaching SLA:

| Case ID | Applicant | Stage | SLA Status | Overdue By |
|---------|-----------|-------|------------|------------|
| ML-04819 | R. Patel | Underwriting | **Breached** | 2 days |
| ML-04803 | K. Williams | Valuation | **Breached** | 1 day |
| ML-04827 | T. Okonkwo | KYC | **At risk** | Due today |
| ML-04831 | A. Novak | Doc review | **At risk** | Due in 3 hrs |

**Recommendations:**
- Assign ML-04819 to a senior underwriter -- complexity flag on income verification
- Chase valuation provider for ML-04803 (Countrywide, ref #V-22941)
- Auto-complete KYC for ML-04827 -- all checks passed, awaiting manual sign-off`,
    hasAction: false,
  },
  "Unassigned cases": {
    text: `There are currently **7 unassigned cases** in the pipeline:

- **ML-04835** -- New submission, residential purchase, \u00a3380,000 (received 2 hrs ago)
- **ML-04834** -- BTL remortgage, \u00a3520,000 (received 3 hrs ago)
- **ML-04832** -- Help to Buy equity loan repayment, \u00a3195,000 (received 5 hrs ago)
- **ML-04830** -- Shared ownership staircasing, \u00a3275,000 (received yesterday)
- **ML-04828** -- Product transfer, \u00a3410,000 (received yesterday)
- **ML-04826** -- Further advance, \u00a385,000 (received 2 days ago)
- **ML-04820** -- New build purchase, \u00a3345,000 (received 3 days ago -- **priority**)

**Suggested assignments** based on workload and specialisation:
- ML-04835, ML-04828 \u2192 **Amir Hassan** (capacity: 3 slots, residential specialist)
- ML-04834 \u2192 **Claire Dunn** (BTL specialist)
- ML-04820 \u2192 **Mark Stevens** (new build experience, urgent)`,
    hasAction: false,
  },
  "Check affordability": {
    text: `**Affordability Assessment -- ML-2024-04821**

| Metric | Value | Status |
|--------|-------|--------|
| Gross joint income | \u00a393,400 | Verified |
| Net monthly income | \u00a35,680 | Verified |
| Loan amount | \u00a3297,500 | -- |
| Income multiple | **3.18x** | Within 4.49x limit |
| Monthly payment (stress) | \u00a31,487 | At stress rate 8.5% |
| Debt-to-income | **26.2%** | Below 45% threshold |
| Committed expenditure | \u00a31,840/mo | Verified via bank statements |
| Residual income | \u00a32,353/mo | Above \u00a31,200 minimum |

**Result: PASS** -- All affordability criteria met. No ONS adjustments required.`,
    hasAction: false,
  },
  "Risk assessment": {
    text: `**Risk Assessment Summary**

Overall risk rating: **LOW**

- **Credit risk:** Low -- Score 712, no adverse history
- **Fraud risk:** Low -- ID verification passed, no watchlist matches
- **Valuation risk:** Low -- AVM/surveyor delta < 1%
- **Concentration risk:** N/A -- standard residential
- **Regulatory risk:** Low -- full documentation, no self-cert

No manual referral triggers activated.`,
    hasAction: false,
  },
  "Retention strategy": {
    text: `**Retention Strategy -- Mitchell Household**

Churn probability: **34%** (moderate -- rate expiry approaching)

Recommended actions:
1. **Proactive rate switch offer** -- 4.19% 2yr fixed (saving \u00a387/mo vs revert rate)
2. **Bundle incentive** -- Waive \u00a3499 product fee if retained with insurance add-on
3. **Personal outreach** -- Schedule RM call 14 days before rate expiry
4. **Digital nudge** -- Trigger portal notification with personalised offer

Estimated retention value: **\u00a318,200** (lifetime revenue at risk)`,
    hasAction: false,
  },
  "Rate switch options": {
    text: `**Available Rate Switch Products**

| Product | Rate | Term | Monthly Pmt | Saving vs Revert |
|---------|------|------|------------|-----------------|
| Fix 2yr | 4.19% | 24 mo | \u00a31,298 | \u00a3187/mo |
| Fix 5yr | 4.49% | 60 mo | \u00a31,342 | \u00a3143/mo |
| Tracker  | 4.09% (BBR+0.84) | 24 mo | \u00a31,283 | \u00a3202/mo |
| Discount | 4.35% | 24 mo | \u00a31,321 | \u00a3164/mo |

Current revert rate: **6.49%** (\u00a31,485/mo). All options assume \u00a3297,500 balance, 25yr remaining term.`,
    hasAction: false,
  },
};

// Fallback for chips without specific demo content
const FALLBACK_RESPONSE = (chip) => ({
  text: `I've analysed the available data for "${chip}". Here's what I found:\n\n- Analysis is based on current portfolio data as of today\n- Key metrics are within expected parameters\n- No immediate action items flagged\n\nWould you like me to drill deeper into any specific aspect, or generate a report?`,
  hasAction: false,
});

// ─────────────────────────────────────────────
// TYPING INDICATOR
// ─────────────────────────────────────────────
const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, padding: "12px 16px" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: T.primary,
        opacity: 0.4, animation: `novaPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
    <style>{`@keyframes novaPulse { 0%,80%,100%{opacity:0.25;transform:scale(0.8)} 40%{opacity:1;transform:scale(1.1)} }`}</style>
  </div>
);

// ─────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────
const MsgBubble = ({ role, text, hasAction, actionLabel, onAction }) => {
  const isBot = role === "bot";
  return (
    <div style={{ display: "flex", justifyContent: isBot ? "flex-start" : "flex-end", marginBottom: 14 }}>
      <div style={{
        maxWidth: "92%", padding: "12px 16px", borderRadius: isBot ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
        background: isBot ? T.card : `linear-gradient(135deg,${T.primary},${T.primaryDark})`,
        color: isBot ? T.text : "#fff", fontSize: 13, lineHeight: 1.65, fontFamily: T.font,
        border: isBot ? `1px solid ${T.border}` : "none",
        boxShadow: isBot ? "0 1px 4px rgba(0,0,0,0.04)" : `0 2px 8px ${T.primaryGlow}`,
        whiteSpace: "pre-wrap",
      }}>
        {/* render markdown-ish bold */}
        {text.split(/(\*\*[^*]+\*\*)/).map((seg, i) =>
          seg.startsWith("**") && seg.endsWith("**")
            ? <strong key={i}>{seg.slice(2, -2)}</strong>
            : <span key={i}>{seg}</span>
        )}
        {hasAction && (
          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${isBot ? T.borderLight : "rgba(255,255,255,0.15)"}` }}>
            <Btn small primary onClick={onAction} icon="file">{actionLabel || "Copy"}</Btn>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function NovaCopilot({ open, onClose, context = {} }) {
  const { screen = "Dashboard", loanId, customerId, persona } = context;
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  // Reset conversation when context changes
  useEffect(() => { setMessages([]); }, [screen, loanId, customerId]);

  // Resolve chips for current context
  const screenKey = Object.keys(CHIPS).find(k => screen?.toLowerCase().includes(k.toLowerCase()));
  const chips = CHIPS[screenKey] || CHIPS._default;

  // Contextual welcome text
  const contextLabel = loanId ? `Case ${loanId}` : customerId ? `Customer ${customerId}` : screen;
  const welcomeText = `I see you're viewing **${contextLabel}**. How can I help?`;

  // Send a message (from input or chip)
  const send = (text) => {
    if (!text.trim()) return;
    const userMsg = { role: "user", text: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const demo = DEMO_RESPONSES[text.trim()] || FALLBACK_RESPONSE(text.trim());
      setMessages(prev => [...prev, { role: "bot", ...demo }]);
      setTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleCopy = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, right: 0, bottom: 0, width: 380, zIndex: 200,
      background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)",
      borderLeft: `1px solid ${T.border}`, display: "flex", flexDirection: "column",
      fontFamily: T.font, boxShadow: "-4px 0 24px rgba(0,0,0,0.08)",
    }}>
      {/* ── HEADER ── */}
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", gap: 10,
        background: `linear-gradient(135deg,${T.primaryDark},${T.primary})`, color: "#fff",
      }}>
        <span style={{ opacity: 0.85 }}>{Ico.sparkle(20)}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.2 }}>Nova AI Copilot</div>
          <div style={{
            fontSize: 10, marginTop: 3, padding: "2px 8px", borderRadius: 4,
            background: "rgba(255,255,255,0.15)", display: "inline-block",
          }}>
            {screen}{loanId ? ` / ${loanId}` : ""}{persona ? ` \u00b7 ${persona}` : ""}
          </div>
        </div>
        <div onClick={onClose} style={{ cursor: "pointer", opacity: 0.8 }}>{Ico.x(18)}</div>
      </div>

      {/* ── MESSAGES AREA ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
        {/* Welcome */}
        <MsgBubble role="bot" text={welcomeText} />

        {/* Quick-action chips */}
        {messages.length === 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16, marginTop: -4 }}>
            {chips.map(c => (
              <div key={c} onClick={() => send(c)} style={{
                padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: T.primaryLight, color: T.primary, cursor: "pointer",
                border: `1px solid ${T.primaryGlow}`, transition: "all 0.15s",
              }}>{c}</div>
            ))}
          </div>
        )}

        {/* Conversation */}
        {messages.map((m, i) => (
          <MsgBubble key={i} role={m.role} text={m.text} hasAction={m.hasAction} actionLabel={m.actionLabel}
            onAction={() => handleCopy(m.text)} />
        ))}

        {typing && <TypingDots />}
        <div ref={endRef} />
      </div>

      {/* ── ACTION HINT ── */}
      <div style={{
        padding: "6px 20px", fontSize: 10, color: T.textMuted, borderTop: `1px solid ${T.borderLight}`,
        background: "rgba(26,74,84,0.03)",
      }}>
        {Ico.zap(11)} Nova can execute actions. Try: <em>'Assign to Amir'</em> or <em>'Send retention offer'</em>
      </div>

      {/* ── INPUT ── */}
      <div style={{
        padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8,
        background: T.card,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send(input)}
          placeholder="Ask Nova anything..."
          style={{
            flex: 1, padding: "10px 14px", borderRadius: 10, border: `1px solid ${T.border}`,
            fontSize: 13, fontFamily: T.font, outline: "none", background: "#FAFAF8",
          }}
        />
        <Btn primary small onClick={() => send(input)} icon="send" style={{ borderRadius: 10 }} />
      </div>
    </div>
  );
}
