import { useState, useRef, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// Load bucket data from localStorage for product guide
// ─────────────────────────────────────────────
function loadBuckets() {
  try {
    const s = localStorage.getItem("product_buckets");
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

// ─────────────────────────────────────────────
// AI CHAT — Simulated LLM responses
// ─────────────────────────────────────────────
const AI_RESPONSES = {
  "product": "We offer mortgage products across 5 buckets: **Prime** (clean credit, up to 75% LTV), **Prime High LTV** (up to 95% for first-time buyers), **Professional** (enhanced multiples for qualified professionals), **High-Net-Worth** (£300k+ income, bespoke pricing), and **Buy-to-Let** (investment properties, ICR 145%). Each bucket has 2–3 year fixed, 5-year fixed, and tracker options.",
  "rate": "Rates depend on: **LTV band** (lower LTV = better rate), **credit profile** (7 tiers from Clean to Fresh Start), **employment type**, **property type**, **EPC rating**, and the specific **pricing tier** applied to the bucket. Use the Eligibility Calculator for an instant quote.",
  "eligibility": "To check eligibility: go to **Eligibility Check** in the left menu, enter the applicant's income, property value, deposit, employment status, credit profile, property type, and EPC rating. Click 'Check Eligibility' and the system will match against all available products across all buckets.",
  "ltv": "LTV bands: **≤60%** (best rates), **60-75%**, **75-85%**, **85-90%**, and **90-95%** (Prime High LTV only). Higher LTV means higher rates. The maximum LTV varies by bucket — Prime caps at 75%, Professional at 90%, Prime High LTV at 95%.",
  "credit": "We accept 7 credit profiles: **Clean** (no adverse), **Near Prime** (1 missed payment >12 months ago), **Light Adverse** (1 CCJ <£500), **Adverse** (1-2 CCJs), **Heavy Adverse** (defaults satisfied >24 months), **Specialist** (IVA/DMP discharged >3 years), **Fresh Start** (bankruptcy discharged >6 years). Each profile has a rate adjustment and may cap LTV.",
  "apply": "To start a new application: click **Smart Apply** from the main menu. Phase 1: enter basics (income, property, deposit). Phase 2: Nova AI auto-populates ~73% of fields. Phase 3: automatic DIP assessment. The whole process takes approximately 5 minutes.",
  "commission": "Commission is calculated as a percentage of the loan amount at disbursement. Rates vary by product type and volume tier. Track your earnings in **Commission** from the left menu. Clawback applies if the mortgage is redeemed within 24 months.",
  "documents": "Required documents typically include: proof of ID (passport/driving licence), proof of address (utility bill <3 months), income evidence (3 months payslips + P60 for employed, 2 years SA302 + tax calculations for self-employed), bank statements (3 months), and property valuation report.",
  "fees": "Product fees vary by bucket — typically £1,495 for residential and £1,995 for BTL. Valuation fees are tiered by property value (£150–£595). There are no arrangement fees on tracker products. Check the specific bucket in the Product Guide for exact fee schedules.",
  "tier": "Pricing tiers are conditional rate adjustments within each bucket. For example, the Prime bucket has tiers for Standard (base rates), Self-Employed (+0.15%), Near Prime (+0.25%), Non-Standard Property (+0.25%), and Green Discount (-0.15% for EPC A/B). Tiers are applied automatically based on the applicant's profile.",
};

function getAIResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("product") || lower.includes("bucket") || lower.includes("what do you offer")) return AI_RESPONSES.product;
  if (lower.includes("rate") || lower.includes("pricing") || lower.includes("interest")) return AI_RESPONSES.rate;
  if (lower.includes("eligible") || lower.includes("qualify") || lower.includes("can my client")) return AI_RESPONSES.eligibility;
  if (lower.includes("ltv") || lower.includes("loan to value") || lower.includes("deposit")) return AI_RESPONSES.ltv;
  if (lower.includes("credit") || lower.includes("ccj") || lower.includes("adverse") || lower.includes("bankruptcy")) return AI_RESPONSES.credit;
  if (lower.includes("apply") || lower.includes("application") || lower.includes("submit") || lower.includes("start")) return AI_RESPONSES.apply;
  if (lower.includes("commission") || lower.includes("earn") || lower.includes("paid")) return AI_RESPONSES.commission;
  if (lower.includes("document") || lower.includes("evidence") || lower.includes("proof") || lower.includes("upload")) return AI_RESPONSES.documents;
  if (lower.includes("fee") || lower.includes("cost") || lower.includes("charge") || lower.includes("valuation")) return AI_RESPONSES.fees;
  if (lower.includes("tier") || lower.includes("adjustment") || lower.includes("self-employed") || lower.includes("contractor")) return AI_RESPONSES.tier;
  return "I can help with questions about our **products**, **rates**, **eligibility criteria**, **credit profiles**, **LTV bands**, **fees**, **application process**, **commission**, **documents required**, and **pricing tiers**. What would you like to know?";
}

// ─────────────────────────────────────────────
// QUICK QUESTIONS
// ─────────────────────────────────────────────
const QUICK_QUESTIONS = [
  "What products do you offer?",
  "How are rates calculated?",
  "What credit profiles do you accept?",
  "What documents are needed?",
  "How does commission work?",
  "What are the LTV bands?",
];

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function BrokerHelpCentre({ open, onClose }) {
  const [activeTab, setActiveTab] = useState("guide");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm Nova AI — your product assistant. Ask me anything about our mortgage products, eligibility criteria, rates, or application process." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [expandedBucket, setExpandedBucket] = useState(null);
  const chatEndRef = useRef(null);

  const buckets = loadBuckets();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  if (!open) return null;

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const response = getAIResponse(msg);
      setMessages(prev => [...prev, { role: "ai", text: response }]);
      setTyping(false);
    }, 800 + Math.random() * 600);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  // ── Render helpers ──
  const renderMarkdown = (text) => {
    return text.split("**").map((part, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ color: T.primary }}>{part}</strong>
        : <span key={i}>{part}</span>
    );
  };

  const TABS = [
    { id: "guide", label: "Product Guide", icon: Ico.file(14) },
    { id: "chat", label: "Ask Nova AI", icon: Ico.sparkle(14) },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(12,45,59,0.35)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />
      {/* Modal */}
      <div
        style={{
          position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 780, maxHeight: "88vh", zIndex: 9999,
          background: T.card, borderRadius: 18, overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.22)", fontFamily: T.font,
          display: "flex", flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
              }}>
                {Ico.search(20)}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.navy }}>Broker Help Centre</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>Product information & AI-powered assistance</div>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 6, borderRadius: 8, transition: "background 0.15s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.bg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              {Ico.x(20)}
            </button>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}` }}>
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 18px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: "none", border: "none", fontFamily: T.font,
                  borderBottom: activeTab === t.id ? `2px solid ${T.primary}` : "2px solid transparent",
                  color: activeTab === t.id ? T.primary : T.textMuted, transition: "all 0.15s",
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 0 }}>

          {/* ── Product Guide Tab ── */}
          {activeTab === "guide" && (
            <div style={{ padding: "20px 24px 24px" }}>
              <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
                Browse our mortgage product range. Click a bucket to see products, rates, criteria, and fees.
              </div>

              {buckets.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: T.textMuted }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{Ico.file(32)}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>No product buckets configured</div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>Product data will appear here once configured by the Product Manager.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {buckets.map((bucket, bIdx) => {
                    const isExpanded = expandedBucket === bIdx;
                    const products = bucket.products || [];
                    const tiers = bucket.tiers || [];

                    return (
                      <div
                        key={bIdx}
                        style={{
                          borderRadius: 12, border: `1px solid ${T.borderLight}`,
                          borderLeft: `4px solid ${bucket.color}`,
                          background: T.card, overflow: "hidden", transition: "all 0.2s",
                        }}
                      >
                        {/* Bucket header — clickable */}
                        <div
                          onClick={() => setExpandedBucket(isExpanded ? null : bIdx)}
                          style={{
                            padding: "14px 18px", cursor: "pointer", display: "flex",
                            alignItems: "center", justifyContent: "space-between",
                            background: isExpanded ? bucket.color + "08" : "transparent",
                            transition: "background 0.15s",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: 8, background: bucket.color + "18",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: bucket.color, fontWeight: 800, fontSize: 13,
                            }}>
                              {bucket.name[0]}
                            </div>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{bucket.name}</div>
                              <div style={{ fontSize: 11, color: T.textMuted }}>{bucket.desc}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: bucket.color + "18", color: bucket.color }}>
                              Max {bucket.maxLTV}% LTV
                            </span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: "#F1F5F9", color: T.textMuted }}>
                              {products.length} products
                            </span>
                            <span style={{ color: T.textMuted, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                              ▾
                            </span>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div style={{ borderTop: `1px solid ${T.borderLight}`, padding: "16px 18px" }}>
                            {/* Rate grid */}
                            {products.length > 0 && (
                              <div style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Rates</div>
                                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
                                  <thead>
                                    <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                                      <th style={{ textAlign: "left", padding: "6px 8px", fontSize: 10, fontWeight: 700, color: T.textMuted }}>Product</th>
                                      <th style={{ textAlign: "center", padding: "6px 8px", fontSize: 10, fontWeight: 700, color: T.textMuted }}>ERC</th>
                                      {["≤60%", "60-75%", "75-85%", "85-90%", "90-95%"].filter(b => {
                                        const bMax = { "≤60%": 60, "60-75%": 75, "75-85%": 85, "85-90%": 90, "90-95%": 95 };
                                        return bMax[b] <= (bucket.maxLTV || 75);
                                      }).map(b => (
                                        <th key={b} style={{ textAlign: "center", padding: "6px 6px", fontSize: 10, fontWeight: 700, color: T.navy }}>{b}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {products.map((p, pIdx) => (
                                      <tr key={pIdx} style={{ borderBottom: `1px solid ${T.borderLight}`, background: pIdx % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                                        <td style={{ padding: "7px 8px", fontWeight: 600, color: T.navy }}>{p.type}</td>
                                        <td style={{ padding: "7px 8px", textAlign: "center", fontSize: 10, color: T.textMuted }}>{p.erc}</td>
                                        {["≤60%", "60-75%", "75-85%", "85-90%", "90-95%"].filter(b => {
                                          const bMax = { "≤60%": 60, "60-75%": 75, "75-85%": 85, "85-90%": 90, "90-95%": 95 };
                                          return bMax[b] <= (bucket.maxLTV || 75);
                                        }).map(b => {
                                          const rate = p.rates?.[b];
                                          const color = rate == null ? "#CBD5E1" : rate < 4.5 ? "#059669" : rate <= 5.5 ? "#D97706" : "#DC2626";
                                          return (
                                            <td key={b} style={{ padding: "7px 6px", textAlign: "center", fontWeight: 700, color }}>
                                              {rate != null ? rate.toFixed(2) + "%" : "—"}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Key criteria */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                              <div style={{ padding: "10px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Credit Profiles</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                  {(bucket.acceptedCreditProfiles || []).map(cp => (
                                    <span key={cp} style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0" }}>{cp}</span>
                                  ))}
                                </div>
                              </div>
                              <div style={{ padding: "10px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Employment</div>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                                  {(bucket.acceptedEmployments || []).map(e => (
                                    <span key={e} style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE" }}>{e}</span>
                                  ))}
                                </div>
                              </div>
                              {bucket.criteria && (
                                <>
                                  <div style={{ padding: "10px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Loan Size</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{bucket.criteria.loanSize?.min} – {bucket.criteria.loanSize?.max}</div>
                                  </div>
                                  <div style={{ padding: "10px 12px", borderRadius: 8, background: T.bg, border: `1px solid ${T.borderLight}` }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>Income Multiple</div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{bucket.criteria.incomeMultiple}</div>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Fees */}
                            {bucket.fees && (
                              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                {[
                                  { label: "Product Fee", value: bucket.fees.productFee },
                                  { label: "Term Range", value: bucket.fees.termRange },
                                  { label: "Reversion", value: bucket.fees.reversion },
                                ].map(f => (
                                  <div key={f.label} style={{ flex: "1 1 0", minWidth: 120, padding: "8px 12px", borderRadius: 8, background: bucket.color + "08", border: `1px solid ${bucket.color}20` }}>
                                    <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3 }}>{f.label}</div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginTop: 2 }}>{f.value}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Tiers summary */}
                            {tiers.length > 0 && (
                              <div style={{ marginTop: 12 }}>
                                <div style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 6 }}>Pricing Tiers</div>
                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                  {tiers.map((tier, tIdx) => {
                                    const TIER_COLORS = [T.primary, "#8B5CF6", "#F59E0B", "#E03A3A", "#0EA5E9"];
                                    const tc = TIER_COLORS[tIdx % 5];
                                    const adj = tier.adjustmentType === "flat" ? tier.flatAdj : null;
                                    return (
                                      <span key={tIdx} style={{
                                        display: "inline-flex", alignItems: "center", gap: 4,
                                        padding: "3px 8px", borderRadius: 8, fontSize: 10, fontWeight: 600,
                                        background: tc + "14", color: tc, border: `1px solid ${tc}30`,
                                      }}>
                                        {tier.name}
                                        {adj != null && <span style={{ fontWeight: 700 }}>({adj >= 0 ? "+" : ""}{Number(adj).toFixed(2)}%)</span>}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Chat Tab ── */}
          {activeTab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(88vh - 140px)" }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    {msg.role === "ai" && (
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0, marginRight: 8, marginTop: 2,
                        background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                        display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                      }}>
                        {Ico.sparkle(14)}
                      </div>
                    )}
                    <div style={{
                      maxWidth: "75%", padding: "10px 14px", borderRadius: 14,
                      fontSize: 13, lineHeight: 1.6, fontFamily: T.font,
                      background: msg.role === "user"
                        ? `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`
                        : T.bg,
                      color: msg.role === "user" ? "#fff" : T.text,
                      border: msg.role === "ai" ? `1px solid ${T.borderLight}` : "none",
                      borderTopRightRadius: msg.role === "user" ? 4 : 14,
                      borderTopLeftRadius: msg.role === "ai" ? 4 : 14,
                    }}>
                      {renderMarkdown(msg.text)}
                    </div>
                  </div>
                ))}

                {typing && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#fff",
                    }}>
                      {Ico.sparkle(14)}
                    </div>
                    <div style={{ padding: "10px 14px", borderRadius: 14, background: T.bg, border: `1px solid ${T.borderLight}`, fontSize: 13, color: T.textMuted }}>
                      <span style={{ animation: "pulse 1.2s infinite" }}>●</span>
                      <span style={{ animation: "pulse 1.2s infinite 0.2s" }}> ●</span>
                      <span style={{ animation: "pulse 1.2s infinite 0.4s" }}> ●</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />

                {/* Quick questions — only show initially */}
                {messages.length <= 1 && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 8 }}>Quick questions:</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {QUICK_QUESTIONS.map((q, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(q)}
                          style={{
                            padding: "6px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                            cursor: "pointer", fontFamily: T.font, transition: "all 0.15s",
                            border: `1px solid ${T.border}`, background: T.card, color: T.text,
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = T.primaryLight; e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = T.card; e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input bar */}
              <div style={{
                padding: "12px 24px 16px", borderTop: `1px solid ${T.border}`,
                background: T.card, flexShrink: 0,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: T.bg, borderRadius: 12, border: `1px solid ${T.border}`,
                  padding: "4px 4px 4px 14px", transition: "border-color 0.15s",
                }}>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about products, rates, criteria, fees..."
                    style={{
                      flex: 1, padding: "10px 0", border: "none", outline: "none",
                      fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text,
                    }}
                  />
                  <button
                    onClick={() => sendMessage()}
                    disabled={!input.trim() || typing}
                    style={{
                      width: 36, height: 36, borderRadius: 10, border: "none", cursor: input.trim() ? "pointer" : "default",
                      background: input.trim() ? `linear-gradient(135deg, ${T.primary}, ${T.accent})` : T.borderLight,
                      color: input.trim() ? "#fff" : T.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.15s",
                    }}
                  >
                    {Ico.send?.(16) || "→"}
                  </button>
                </div>
                <div style={{ fontSize: 10, color: T.textMuted, marginTop: 6, textAlign: "center" }}>
                  Nova AI provides general product information. Always verify rates with the Eligibility Calculator.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
