import { useState, useRef, useEffect } from "react";
import { T, Ico } from "./tokens";
import { Btn } from "./primitives";

// ─────────────────────────────────────────────
// AI UNDERWRITING COPILOT
// Conversational AI that understands the case context
// and answers underwriter questions with evidence-backed responses.
// ─────────────────────────────────────────────

const CASE_KNOWLEDGE = {
  income: "Applicant declares £70,000 basic salary + £8,000 annual bonus. P60 confirms £67,500 (discrepancy of £2,500 explained by bonus timing — Feb payslip shows bonus credited after P60 cut-off). 3 consecutive years of bonus confirms sustainability. Employer: TechCorp Ltd, Technology sector, 7+ years tenure.",
  affordability: "Monthly gross: £5,833. Net disposable: £3,330 after tax/NI/commitments. Mortgage payment £1,948/mo leaves £1,382 surplus (71% coverage). Stress test at 7.49%: payment £2,620, surplus £710 — passes. DTI: 18.2% (well within 40% threshold). Commitments: car finance £280/mo (18 months remaining), credit card £140/mo.",
  property: "14 Oak Lane, Bristol BS1 4NZ. Semi-detached, Freehold, 3 bedrooms. Purchase price: £485,000. AVM: £495,000 (87% confidence, within 3% of surveyor). Full survey: £485,000, Good condition, no issues. EPC: C. Flood risk: Low. Japanese knotweed: None detected.",
  credit: "Equifax score: 742 (Good). No missed payments in 6 years. 4 active accounts all in good standing. No CCJs, IVAs, bankruptcy, or DMP. Electoral roll confirmed. No fraud markers. Thin file risk: Low (sufficient credit history).",
  policy: "All lending policy rules satisfied. LTV 72% within 75% bucket max. Age at end of term: 63 (within 75 limit). Loan amount £350,000 within £25k–£1M range. Income multiple 4.49x within limit. Employment meets minimum 6 months. Property type acceptable. UK residency confirmed.",
  fraud: "No fraud indicators detected. Address matches electoral roll. Employer verified via HMRC RTI data. Bank statements show consistent salary credits from TechCorp Ltd. No unusual transaction patterns. Identity verified via biometric check (Mitek — 99% confidence).",
  product: "Product: 2-Year Fixed, Prime bucket, Standard tier. Rate: 4.49%. Code: P2F. ERC: 3% year 1, 2% year 2. Product fee: £1,495. Reversion: BBR + 3.99%. Term: 25 years. Repayment: Capital & Interest.",
  documents: "6 documents uploaded. Fact Find: verified (42 fields, 94% AI confidence). Payslip Mar 2026: verified (TechCorp Ltd, £5,833 gross). Bank Statement Feb: verified (regular salary, no concerns). P60 2025: flagged (£2,500 discrepancy — explained). ID Passport: verified (expires 2031). Proof of Address: flagged (utility bill >3 months — request updated).",
  recommendation: "Nova AI recommends APPROVAL. Risk score: 14/100 (Low). All 6 assessment pillars green. Key strengths: stable 7-year employment, 72% LTV equity buffer, clean credit. Watch points: P60 discrepancy (explained), fixed rate expires Aug 2028 (note for servicing). No conditions precedent recommended.",
};

function getAIResponse(question, loan) {
  const q = question.toLowerCase();

  if (q.includes("income") || q.includes("salary") || q.includes("earn") || q.includes("bonus") || q.includes("p60"))
    return { text: CASE_KNOWLEDGE.income, sources: ["Payslip Mar 2026", "P60 2025", "Bank Statement Feb 2026"], confidence: 96 };

  if (q.includes("afford") || q.includes("stress") || q.includes("dti") || q.includes("payment") || q.includes("surplus"))
    return { text: CASE_KNOWLEDGE.affordability, sources: ["Affordability Model", "Stress Test Calculator"], confidence: 94 };

  if (q.includes("property") || q.includes("valuation") || q.includes("avm") || q.includes("survey") || q.includes("address") || q.includes("flood") || q.includes("epc"))
    return { text: CASE_KNOWLEDGE.property, sources: ["AVM Report", "Full Survey Report", "Land Registry"], confidence: 92 };

  if (q.includes("credit") || q.includes("score") || q.includes("ccj") || q.includes("adverse") || q.includes("missed payment"))
    return { text: CASE_KNOWLEDGE.credit, sources: ["Equifax Credit Report", "Electoral Roll"], confidence: 98 };

  if (q.includes("policy") || q.includes("rule") || q.includes("comply") || q.includes("criteria") || q.includes("eligible"))
    return { text: CASE_KNOWLEDGE.policy, sources: ["Lending Policy v3.2", "Product Criteria Matrix"], confidence: 100 };

  if (q.includes("fraud") || q.includes("suspicious") || q.includes("verify") || q.includes("identity") || q.includes("kyc"))
    return { text: CASE_KNOWLEDGE.fraud, sources: ["Mitek ID Verification", "HMRC RTI", "ComplyAdvantage"], confidence: 99 };

  if (q.includes("product") || q.includes("rate") || q.includes("bucket") || q.includes("tier") || q.includes("erc") || q.includes("fee"))
    return { text: CASE_KNOWLEDGE.product, sources: ["Product Catalogue", "Pricing Engine"], confidence: 100 };

  if (q.includes("document") || q.includes("upload") || q.includes("evidence") || q.includes("flag"))
    return { text: CASE_KNOWLEDGE.documents, sources: ["Document Intelligence AI", "Upload Registry"], confidence: 94 };

  if (q.includes("recommend") || q.includes("approve") || q.includes("decision") || q.includes("risk") || q.includes("should i"))
    return { text: CASE_KNOWLEDGE.recommendation, sources: ["AI Risk Scorecard", "Decision Engine", "Policy Checker"], confidence: 91 };

  if (q.includes("compare") || q.includes("similar") || q.includes("benchmark"))
    return { text: "Compared to similar cases in the last 90 days: this applicant's DTI (18.2%) is in the 25th percentile (better than 75% of cases). Credit score 742 is in the 40th percentile. LTV 72% is typical for Prime bucket. Average decision time for similar cases: 4.2 hours. 94% of similar cases were approved.", sources: ["Case Analytics", "MI Dashboard"], confidence: 88 };

  return { text: `I can help with questions about this case's **income & employment**, **affordability & stress test**, **property & valuation**, **credit history**, **policy compliance**, **fraud checks**, **product & pricing**, **documents**, or my **recommendation**. What would you like to know about ${loan?.names || "this applicant"}?`, sources: [], confidence: 100 };
}

const QUICK_QUESTIONS = [
  "Is the income sustainable?",
  "Does this pass the stress test?",
  "Any concerns with the property?",
  "Should I approve this case?",
  "What are the key risk factors?",
  "Compare to similar cases",
];

export default function AICopilot({ loan, open, onClose }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: `I'm your AI Copilot for case **${loan?.id || "—"}** (${loan?.names || "—"}). I've analysed all uploaded documents, credit data, and case details. Ask me anything — I'll cite my sources.`, sources: [], confidence: null },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  if (!open) return null;

  const sendMessage = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const response = getAIResponse(msg, loan);
      setMessages(prev => [...prev, { role: "ai", ...response }]);
      setTyping(false);
    }, 600 + Math.random() * 800);
  };

  const renderMarkdown = (text) => text.split("**").map((part, i) =>
    i % 2 === 1 ? <strong key={i} style={{ color: T.primary }}>{part}</strong> : <span key={i}>{part}</span>
  );

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(12,45,59,0.18)" }} onClick={onClose} />
      <div style={{
        position: "fixed", bottom: 20, right: 20, width: 440, height: "70vh", zIndex: 9999,
        background: T.card, borderRadius: 18, overflow: "hidden",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)", fontFamily: T.font,
        display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {Ico.sparkle(20)}
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>AI Underwriting Copilot</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>{loan?.id} · {loan?.names}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 4, cursor: "pointer", color: "#fff" }}>{Ico.x(18)}</button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              {msg.role === "ai" ? (
                <div>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0, marginTop: 2 }}>{Ico.sparkle(12)}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text }}>{renderMarkdown(msg.text)}</div>
                  </div>
                  {msg.sources?.length > 0 && (
                    <div style={{ marginLeft: 32, marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Sources:</span>
                      {msg.sources.map((s, j) => (
                        <span key={j} style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: "#EEF2FF", color: "#4338CA", border: "1px solid #C7D2FE" }}>{s}</span>
                      ))}
                      {msg.confidence != null && (
                        <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 4, background: msg.confidence >= 95 ? "#D1FAE5" : "#FEF3C7", color: msg.confidence >= 95 ? "#065F46" : "#92400E" }}>
                          {msg.confidence}% confidence
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "80%", padding: "8px 14px", borderRadius: "14px 14px 4px 14px", background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff", fontSize: 13, lineHeight: 1.5 }}>
                    {msg.text}
                  </div>
                </div>
              )}
            </div>
          ))}

          {typing && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{Ico.sparkle(12)}</div>
              <span style={{ fontSize: 13, color: T.textMuted }}>Analysing case data...</span>
            </div>
          )}

          <div ref={chatEndRef} />

          {messages.length <= 1 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Quick questions</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)} style={{
                    padding: "5px 10px", borderRadius: 16, fontSize: 11, fontWeight: 600,
                    cursor: "pointer", fontFamily: T.font, border: `1px solid ${T.border}`,
                    background: T.card, color: T.text, transition: "all 0.15s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.color = T.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.text; }}
                  >{q}</button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "10px 16px 14px", borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center", background: T.bg, borderRadius: 12, border: `1px solid ${T.border}`, padding: "4px 4px 4px 14px" }}>
            <input
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") sendMessage(); }}
              placeholder="Ask about this case..."
              style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 13, fontFamily: T.font, color: T.text, padding: "8px 0" }}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim()} style={{
              width: 32, height: 32, borderRadius: 8, border: "none", cursor: input.trim() ? "pointer" : "default",
              background: input.trim() ? `linear-gradient(135deg, ${T.primary}, ${T.accent})` : T.borderLight,
              color: input.trim() ? "#fff" : T.textMuted, display: "flex", alignItems: "center", justifyContent: "center",
            }}>{Ico.send(14)}</button>
          </div>
          <div style={{ fontSize: 9, color: T.textMuted, marginTop: 4, textAlign: "center" }}>AI responses are based on uploaded documents and case data. Always verify before making decisions.</div>
        </div>
      </div>
    </>
  );
}
