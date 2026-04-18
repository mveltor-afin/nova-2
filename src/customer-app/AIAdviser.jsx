import { useState, useRef, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// AI ADVISER
// Full-screen chatbot overlay with simulated responses
// ─────────────────────────────────────────────

const QUICK_QUESTIONS = [
  "Can I afford to overpay?",
  "When will I own my home?",
  "Should I fix for 2 or 5 years?",
  "What happens if rates rise?",
  "Am I on the best deal?",
];

function generateResponse(question, mortgage) {
  const balance = mortgage?.balance || "£285,432";
  const rate = mortgage?.rate || "4.49%";
  const payment = mortgage?.payment || "£1,450";
  const term = mortgage?.term || "22 yrs";
  const equity = mortgage?.equity || "£111,001";
  const rateEnd = mortgage?.rateEnd || "15 Jun 2026";
  const propertyValue = mortgage?.propertyValue || "£396,433";

  if (question.includes("overpay")) {
    return `Based on your current balance of ${balance} at ${rate}, overpaying £200/month would:\n\n- Save approximately £4,200 in total interest\n- Reduce your mortgage term by 2 years and 3 months\n- Bring your new monthly total to £1,650\n\nYour current product allows up to 10% overpayment per year (approx. £28,543) without early repayment charges. At £200/month (£2,400/year), you'd be well within this limit.\n\nI'd recommend starting with even £100/month — every bit helps reduce your interest burden.`;
  }
  if (question.includes("own my home")) {
    return `At your current rate of ${payment}/month, your mortgage will be fully repaid in ${term} (approximately ${parseInt(term) > 0 ? "20" + (parseInt(term) + 26 - parseInt(term)) : "2048"}).\n\nHere's how you could accelerate that:\n\n- Overpay £100/mo → Own in ~20 years (save 2 yrs)\n- Overpay £250/mo → Own in ~18 years (save 4 yrs)\n- Overpay £500/mo → Own in ~15 years (save 7 yrs)\n\nYour current equity is ${equity} (${Math.round((Number(equity.replace(/[^0-9]/g,'')) / Number(propertyValue.replace(/[^0-9]/g,''))) * 100)}% of property value). You're making strong progress!`;
  }
  if (question.includes("2 or 5 years")) {
    return `Your current ${rate} rate expires on ${rateEnd}. Here's my analysis:\n\n**2-Year Fixed at 4.19%**\n- Monthly: £1,392 (save £58/mo vs current)\n- Total cost over 2 years: £33,408\n- Best if you think rates will fall further\n\n**5-Year Fixed at 4.59%**\n- Monthly: £1,428 (save £22/mo vs current)\n- Total cost over 5 years: £85,680\n- Best for payment certainty and budgeting\n\nGiven current market conditions, the 2-year fix offers better value. However, if you prefer stability, the 5-year fix protects you against potential rate rises. Your call depends on your risk appetite.`;
  }
  if (question.includes("rates rise")) {
    return `Here's how rate changes would affect your monthly payment on your ${balance} balance:\n\n- Current (${rate}): ${payment}/mo\n- +0.50% (4.99%): £1,498/mo (+£48)\n- +1.00% (5.49%): £1,548/mo (+£98)\n- +1.50% (5.99%): £1,600/mo (+£150)\n- +2.00% (6.49%): £1,653/mo (+£203)\n\nYour current fixed rate protects you until ${rateEnd}. After that, if you don't switch, you'll move to the standard variable rate (BBR + 3.99%, currently ~8.24%).\n\nI strongly recommend locking in a new rate before ${rateEnd} to avoid the SVR jump.`;
  }
  if (question.includes("best deal")) {
    return `Let me check your current deal against what's available...\n\nYour current rate: ${rate} (${mortgage?.product || "2-Year Fixed"})\n\nBest available rates for your profile (LTV ${mortgage?.ltv || "72%"}):\n\n1. **Prime 2-Year Fixed**: 4.19% — saves £58/mo (£1,392 vs ${payment})\n2. **Professional 2-Year Fixed**: 3.69% — saves £106/mo if you qualify\n3. **Prime 5-Year Fixed**: 4.59% — slightly higher but 5yr security\n\nVerdict: You could save £58-£106/month by switching when your rate expires on ${rateEnd}. I'd recommend exploring the rate switch options in your Mortgage dashboard.`;
  }

  return `I'd be happy to help with that. Based on your mortgage profile:\n\n- Balance: ${balance}\n- Rate: ${rate}\n- Monthly payment: ${payment}\n- Property value: ${propertyValue}\n- Equity: ${equity}\n\nCould you ask me something more specific? Try one of the suggested questions above, or ask about overpayments, rate switches, or your equity position.`;
}

export default function AIAdviser({ customer, onClose }) {
  const mortgage = customer?.mortgage || {};
  const name = customer?.name?.split(" ")[0] || "James";

  const greeting = `Hello ${name}! I'm your AI mortgage adviser. I have access to your account details and can help you make informed decisions about your mortgage.\n\nYour rate expires on ${mortgage.rateEnd || "15 Jun 2026"} — that's something we should discuss. What would you like to know?`;

  const [messages, setMessages] = useState([
    { id: 1, from: "ai", text: greeting },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const askQuestion = (question) => {
    const userMsg = { id: messages.length + 1, from: "user", text: question };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      const response = generateResponse(question, mortgage);
      const aiMsg = { id: messages.length + 2, from: "ai", text: response };
      setMessages(prev => [...prev, aiMsg]);
      setTyping(false);
    }, 1200);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    askQuestion(input.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Filter out already-asked questions
  const askedQuestions = messages.filter(m => m.from === "user").map(m => m.text);
  const availableChips = QUICK_QUESTIONS.filter(q => !askedQuestions.includes(q));

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "#F8FAF9", zIndex: 1000,
      display: "flex", flexDirection: "column",
      maxWidth: 480, margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18,
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {Ico.sparkle(20)}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>AI Adviser</div>
            <div style={{ fontSize: 11, opacity: 0.8 }}>Powered by Nova Intelligence</div>
          </div>
        </div>
        <div onClick={onClose} style={{
          width: 32, height: 32, borderRadius: 16,
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          {Ico.x(18)}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {messages.map((msg) => {
          const isAI = msg.from === "ai";
          return (
            <div key={msg.id} style={{
              display: "flex", justifyContent: isAI ? "flex-start" : "flex-end",
              marginBottom: 14, gap: 8,
            }}>
              {isAI && (
                <div style={{
                  width: 28, height: 28, borderRadius: 14, flexShrink: 0,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", marginTop: 2,
                }}>
                  {Ico.sparkle(14)}
                </div>
              )}
              <div style={{
                maxWidth: "80%", padding: "12px 14px", lineHeight: 1.6, fontSize: 13,
                borderRadius: isAI ? "4px 14px 14px 14px" : "14px 14px 4px 14px",
                background: isAI ? "#fff" : `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`,
                color: isAI ? T.text : "#fff",
                border: isAI ? `1px solid ${T.borderLight}` : "none",
                whiteSpace: "pre-line",
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {typing && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 14, flexShrink: 0,
              background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}>
              {Ico.sparkle(14)}
            </div>
            <div style={{
              padding: "12px 18px", borderRadius: "4px 14px 14px 14px",
              background: "#fff", border: `1px solid ${T.borderLight}`,
              display: "flex", gap: 4, alignItems: "center",
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: 3, background: T.textMuted,
                  animation: `typingDot 1.4s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Quick question chips */}
        {availableChips.length > 0 && !typing && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, marginBottom: 8 }}>
            {availableChips.map((q, i) => (
              <div key={i} onClick={() => askQuestion(q)} style={{
                padding: "8px 12px", borderRadius: 20,
                background: `linear-gradient(135deg, ${T.primary}08, ${T.accent}10)`,
                border: `1px solid ${T.primary}20`,
                fontSize: 12, fontWeight: 600, color: T.primary,
                cursor: "pointer", transition: "all 0.15s",
              }}>
                {q}
              </div>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "10px 16px 16px", borderTop: `1px solid ${T.borderLight}`,
        background: "#fff", display: "flex", alignItems: "center", gap: 8,
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          borderRadius: 14, border: `1px solid ${T.border}`, background: "#FAFAFA",
          overflow: "hidden",
        }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your mortgage..."
            style={{
              flex: 1, padding: "10px 14px", border: "none", outline: "none",
              fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text,
            }}
          />
        </div>
        <div
          onClick={handleSend}
          style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: input.trim()
              ? `linear-gradient(135deg, ${T.primary}, ${T.accent})`
              : T.borderLight,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: input.trim() ? "#fff" : T.textMuted,
            cursor: input.trim() ? "pointer" : "default",
            transition: "all 0.15s",
          }}
        >
          {Ico.send(16)}
        </div>
      </div>

      {/* Typing animation CSS */}
      <style>{`
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
