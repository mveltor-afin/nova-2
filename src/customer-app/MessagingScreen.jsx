import { useState, useRef, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// MESSAGING SCREEN
// Chat interface with the bank
// ─────────────────────────────────────────────

const SEED_MESSAGES = [
  { id: 1, from: "system", text: "Welcome to Nova Secure Messaging. All messages are encrypted and stored securely.", time: "03 Apr", ts: "09:00" },
  { id: 2, from: "bank", name: "Sarah Chen", role: "Mortgage Adviser", text: "Hi James, your application AFN-2026-00142 has been received and is now being processed. I'll be your dedicated adviser throughout.", time: "03 Apr", ts: "11:15" },
  { id: 3, from: "customer", text: "Thanks Sarah! I've uploaded my payslips and bank statements. Is there anything else you need?", time: "05 Apr", ts: "15:30" },
  { id: 4, from: "bank", name: "Sarah Chen", role: "Mortgage Adviser", text: "Perfect, I can see those have been uploaded. We'll also need your latest P60 and a copy of the draft contract from your solicitor. Could you upload those when you have them?", time: "05 Apr", ts: "16:45" },
  { id: 5, from: "system", text: "Document request: P60 (2024/25) and Draft Purchase Contract. Please upload via the Documents section.", time: "05 Apr", ts: "16:46" },
  { id: 6, from: "bank", name: "Sarah Chen", role: "Mortgage Adviser", text: "Great news — your application has passed underwriting and your offer has been issued! You should receive the formal offer letter within 24 hours. Please review and accept it at your earliest convenience.", time: "17 Apr", ts: "09:20" },
];

export default function MessagingScreen() {
  const [messages, setMessages] = useState(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      from: "customer",
      text: input.trim(),
      time: "17 Apr",
      ts: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([...messages, newMsg]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 70px)" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.borderLight}`, background: "#fff" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.navy }}>Messages</div>
        <div style={{ fontSize: 12, color: T.textMuted }}>Secure messaging with your adviser</div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {messages.map((msg) => {
          // System message
          if (msg.from === "system") {
            return (
              <div key={msg.id} style={{ textAlign: "center", margin: "12px 0" }}>
                <div style={{
                  display: "inline-block", padding: "8px 14px", borderRadius: 10,
                  background: T.primaryLight, fontSize: 11, color: T.textSecondary,
                  lineHeight: 1.5, maxWidth: "85%",
                }}>
                  {msg.text}
                </div>
                <div style={{ fontSize: 9, color: T.textMuted, marginTop: 4 }}>{msg.time} {msg.ts}</div>
              </div>
            );
          }

          const isCustomer = msg.from === "customer";

          return (
            <div key={msg.id} style={{
              display: "flex", justifyContent: isCustomer ? "flex-end" : "flex-start",
              marginBottom: 12, gap: 8,
            }}>
              {/* Bank avatar */}
              {!isCustomer && (
                <div style={{
                  width: 32, height: 32, borderRadius: 16, flexShrink: 0,
                  background: `linear-gradient(135deg, ${T.primary}, ${T.accent})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 11, fontWeight: 700, marginTop: 4,
                }}>
                  SC
                </div>
              )}

              <div style={{ maxWidth: "75%" }}>
                {/* Name and role for bank messages */}
                {!isCustomer && msg.name && (
                  <div style={{ fontSize: 10, fontWeight: 600, color: T.primary, marginBottom: 3 }}>
                    {msg.name} <span style={{ fontWeight: 400, color: T.textMuted }}>· {msg.role}</span>
                  </div>
                )}

                {/* Bubble */}
                <div style={{
                  padding: "10px 14px", lineHeight: 1.5, fontSize: 13,
                  borderRadius: isCustomer ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: isCustomer
                    ? `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`
                    : "#fff",
                  color: isCustomer ? "#fff" : T.text,
                  border: isCustomer ? "none" : `1px solid ${T.borderLight}`,
                  boxShadow: isCustomer ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
                }}>
                  {msg.text}
                </div>
                <div style={{
                  fontSize: 9, color: T.textMuted, marginTop: 3,
                  textAlign: isCustomer ? "right" : "left",
                }}>
                  {msg.time} {msg.ts}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: "10px 16px 10px", borderTop: `1px solid ${T.borderLight}`,
        background: "#fff", display: "flex", alignItems: "center", gap: 8,
      }}>
        {/* Attachment button */}
        <div style={{
          width: 38, height: 38, borderRadius: 12, background: T.primaryLight,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: T.primary, cursor: "pointer", flexShrink: 0,
        }}>
          {Ico.upload(18)}
        </div>

        {/* Text input */}
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
            placeholder="Type a message..."
            style={{
              flex: 1, padding: "10px 14px", border: "none", outline: "none",
              fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text,
            }}
          />
        </div>

        {/* Send button */}
        <div
          onClick={sendMessage}
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
    </div>
  );
}
