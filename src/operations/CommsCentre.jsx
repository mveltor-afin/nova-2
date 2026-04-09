import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const channelBadge = (ch) => {
  const map = {
    Email: { bg: "#DBEAFE", color: "#1E40AF", icon: "send" },
    SMS: { bg: "#D1FAE5", color: "#065F46", icon: "messages" },
    Letter: { bg: "#FEF3C7", color: "#92400E", icon: "file" },
    Push: { bg: "#EDE9FE", color: "#5B21B6", icon: "bell" },
  };
  const s = map[ch] || map.Email;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
      {Ico[s.icon]?.(12)} {ch}
    </span>
  );
};

const statusBadge = (st) => {
  const map = {
    Sent: { bg: "#D1FAE5", color: "#065F46" },
    Pending: { bg: "#FEF3C7", color: "#92400E" },
    Failed: { bg: "#FEE2E2", color: "#991B1B" },
    Draft: { bg: "#E8E8E8", color: "#555" },
  };
  const s = map[st] || map.Draft;
  return <span style={{ background: s.bg, color: s.color, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{st}</span>;
};

const outboxData = [
  { id: 1, recipient: "Emma Wilson", channel: "Email", template: "Rate Expiry Reminder", ref: "M-002891", scheduled: "08 Apr 09:00", status: "Sent" },
  { id: 2, recipient: "Priya Sharma", channel: "SMS", template: "Missed Payment", ref: "M-001891", scheduled: "08 Apr 14:00", status: "Pending" },
  { id: 3, recipient: "James Cooper", channel: "Email", template: "Welcome Pack", ref: "M-003210", scheduled: "08 Apr 10:30", status: "Sent" },
  { id: 4, recipient: "Sarah Jenkins", channel: "Letter", template: "Arrears Notice Stage 1", ref: "M-001456", scheduled: "09 Apr 09:00", status: "Pending" },
  { id: 5, recipient: "David Chen", channel: "Email", template: "Rate Switch Confirmation", ref: "M-002105", scheduled: "07 Apr 16:00", status: "Sent" },
  { id: 6, recipient: "Fatima Al-Rashid", channel: "Push", template: "Payment Confirmation", ref: "M-003450", scheduled: "08 Apr 11:00", status: "Sent" },
  { id: 7, recipient: "Tom Richards", channel: "SMS", template: "Missed Payment", ref: "M-001290", scheduled: "08 Apr 15:00", status: "Failed" },
  { id: 8, recipient: "Lucy Barker", channel: "Email", template: "Annual Review", ref: "M-002670", scheduled: "09 Apr 08:00", status: "Draft" },
  { id: 9, recipient: "Raj Patel", channel: "Email", template: "Offer Letter", ref: "M-003780", scheduled: "09 Apr 10:00", status: "Pending" },
  { id: 10, recipient: "Hannah Moore", channel: "Letter", template: "Vulnerability Support", ref: "M-001122", scheduled: "10 Apr 09:00", status: "Pending" },
];

const templateData = [
  { name: "Rate Expiry Reminder", channel: "Email", trigger: "Auto", lastUsed: "07 Apr", icon: "clock", mergeFields: ["{{customer_name}}", "{{rate_type}}", "{{expiry_date}}", "{{current_rate}}", "{{new_rate}}"] },
  { name: "Payment Confirmation", channel: "Email", trigger: "Auto", lastUsed: "08 Apr", icon: "check", mergeFields: ["{{customer_name}}", "{{amount}}", "{{payment_date}}", "{{reference}}"] },
  { name: "Missed Payment", channel: "SMS", trigger: "Auto", lastUsed: "06 Apr", icon: "alert", mergeFields: ["{{customer_name}}", "{{amount_due}}", "{{due_date}}", "{{contact_number}}"] },
  { name: "Arrears Notice Stage 1", channel: "Letter", trigger: "Manual", lastUsed: "03 Apr", icon: "file", mergeFields: ["{{customer_name}}", "{{address}}", "{{arrears_amount}}", "{{days_overdue}}"] },
  { name: "Welcome Pack", channel: "Email", trigger: "Auto", lastUsed: "08 Apr", icon: "send", mergeFields: ["{{customer_name}}", "{{product_name}}", "{{account_number}}", "{{start_date}}"] },
  { name: "Rate Switch Confirmation", channel: "Email", trigger: "Manual", lastUsed: "05 Apr", icon: "zap", mergeFields: ["{{customer_name}}", "{{old_rate}}", "{{new_rate}}", "{{effective_date}}"] },
  { name: "Annual Review", channel: "Email", trigger: "Auto", lastUsed: "01 Apr", icon: "chart", mergeFields: ["{{customer_name}}", "{{review_date}}", "{{current_balance}}", "{{ltv}}"] },
  { name: "Vulnerability Support", channel: "Letter", trigger: "Manual", lastUsed: "28 Mar", icon: "shield", mergeFields: ["{{customer_name}}", "{{address}}", "{{case_manager}}", "{{support_plan}}"] },
];

const triggerData = [
  { name: "Rate expiry 90 days", event: "Rate expiry approaching", template: "Rate Expiry Reminder", channel: "Email", delay: "Immediate", active: true },
  { name: "DD failure", event: "Direct Debit failure", template: "Missed Payment", channel: "SMS", delay: "2 hours", active: true },
  { name: "KYC expiry 30 days", event: "KYC documents expiring", template: "KYC Renewal", channel: "Email", delay: "Immediate", active: true },
  { name: "Application submitted", event: "New application received", template: "Welcome + Confirmation", channel: "Email", delay: "Immediate", active: true },
  { name: "Offer issued", event: "Offer generated", template: "Offer Letter", channel: "Email", delay: "Immediate", active: true },
  { name: "Payment holiday confirmed", event: "Payment holiday approved", template: "Confirmation", channel: "Letter", delay: "1 day", active: true },
];

const historyData = [
  { date: "08 Apr 09:00", recipient: "Emma Wilson", channel: "Email", subject: "Rate Expiry Reminder", status: "Delivered", opened: "Yes" },
  { date: "08 Apr 08:45", recipient: "David Chen", channel: "Email", subject: "Rate Switch Confirmation", status: "Delivered", opened: "Yes" },
  { date: "07 Apr 16:30", recipient: "Fatima Al-Rashid", channel: "Push", subject: "Payment Confirmation", status: "Delivered", opened: "Yes" },
  { date: "07 Apr 14:00", recipient: "James Cooper", channel: "Email", subject: "Welcome Pack", status: "Delivered", opened: "No" },
  { date: "07 Apr 11:00", recipient: "Tom Richards", channel: "SMS", subject: "Missed Payment Alert", status: "Failed", opened: "No" },
  { date: "06 Apr 09:00", recipient: "Sarah Jenkins", channel: "Email", subject: "Annual Review Reminder", status: "Delivered", opened: "Yes" },
  { date: "06 Apr 08:00", recipient: "Lucy Barker", channel: "Email", subject: "Rate Expiry Reminder", status: "Delivered", opened: "No" },
  { date: "05 Apr 15:30", recipient: "Raj Patel", channel: "Email", subject: "Application Received", status: "Delivered", opened: "Yes" },
  { date: "05 Apr 10:00", recipient: "Hannah Moore", channel: "Letter", subject: "Vulnerability Support Plan", status: "Dispatched", opened: "N/A" },
  { date: "04 Apr 14:00", recipient: "Priya Sharma", channel: "SMS", subject: "Missed Payment Reminder", status: "Delivered", opened: "Yes" },
  { date: "04 Apr 09:00", recipient: "Michael Brown", channel: "Email", subject: "Offer Letter", status: "Delivered", opened: "Yes" },
  { date: "03 Apr 16:00", recipient: "Sophie Taylor", channel: "Email", subject: "Payment Confirmation", status: "Delivered", opened: "No" },
  { date: "03 Apr 11:00", recipient: "Alex Nguyen", channel: "Push", subject: "Direct Debit Setup", status: "Delivered", opened: "Yes" },
  { date: "02 Apr 09:30", recipient: "Claire Bennett", channel: "Letter", subject: "Arrears Notice Stage 1", status: "Dispatched", opened: "N/A" },
  { date: "01 Apr 08:00", recipient: "Oliver White", channel: "Email", subject: "Annual Review", status: "Delivered", opened: "Yes" },
];

const thStyle = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}` };
const tdStyle = { padding: "10px 14px", fontSize: 13, borderBottom: `1px solid ${T.borderLight}`, color: T.text };

export default function CommsCentre() {
  const [tab, setTab] = useState("Outbox");
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchHistory, setSearchHistory] = useState("");
  const [triggers, setTriggers] = useState(triggerData);

  // Compose form state
  const [composeRecipient, setComposeRecipient] = useState("");
  const [composeChannel, setComposeChannel] = useState("Email");
  const [composeTemplate, setComposeTemplate] = useState("");
  const [composeMessage, setComposeMessage] = useState("");
  const [composeDate, setComposeDate] = useState("");
  const [composeTime, setComposeTime] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const tabs = ["Outbox", "Templates", "Triggers", "History"];

  const filteredHistory = historyData.filter(h =>
    h.recipient.toLowerCase().includes(searchHistory.toLowerCase()) ||
    h.subject.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, color: T.navy }}>
          {Ico.messages(24)} Communication Centre
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Manage all customer touchpoints from one place</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Sent Today" value="48" color={T.success} sub="+8 from yesterday" />
        <KPICard label="Pending" value="12" color={T.warning} sub="4 scheduled today" />
        <KPICard label="Failed" value="2" color={T.danger} sub="1 retry queued" />
        <KPICard label="Open Rate" value="72%" color={T.primary} sub="+3% this week" />
        <KPICard label="Templates Active" value="14" color={T.accent} sub="2 updated recently" />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `2px solid ${T.borderLight}` }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            border: "none", background: "none", fontFamily: T.font,
            color: tab === t ? T.primary : T.textMuted,
            borderBottom: tab === t ? `2px solid ${T.primary}` : "2px solid transparent",
            marginBottom: -2,
          }}>{t}</button>
        ))}
      </div>

      {/* Outbox Tab */}
      {tab === "Outbox" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Pending & Recent Communications</div>
            <Btn primary icon="plus" onClick={() => setComposeOpen(true)}>Compose</Btn>
          </div>

          <Card noPad>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAF7" }}>
                    <th style={thStyle}>Recipient</th>
                    <th style={thStyle}>Channel</th>
                    <th style={thStyle}>Template</th>
                    <th style={thStyle}>Case / Product Ref</th>
                    <th style={thStyle}>Scheduled</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {outboxData.map(row => (
                    <tr key={row.id} style={{ transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{row.recipient}</td>
                      <td style={tdStyle}>{channelBadge(row.channel)}</td>
                      <td style={tdStyle}>{row.template}</td>
                      <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12 }}>{row.ref}</td>
                      <td style={tdStyle}>{row.scheduled}</td>
                      <td style={tdStyle}>{statusBadge(row.status)}</td>
                      <td style={tdStyle}>
                        {row.status === "Sent" && <Btn small ghost>View</Btn>}
                        {row.status === "Pending" && (
                          <span style={{ display: "flex", gap: 6 }}>
                            <Btn small ghost>Edit</Btn>
                            <Btn small ghost danger>Cancel</Btn>
                          </span>
                        )}
                        {row.status === "Failed" && <Btn small ghost>Retry</Btn>}
                        {row.status === "Draft" && <Btn small ghost>Edit</Btn>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Compose Modal */}
          {composeOpen && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
              <div style={{ background: T.card, borderRadius: 16, padding: 32, width: 540, maxHeight: "85vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.navy }}>Compose Communication</div>
                  <button onClick={() => { setComposeOpen(false); setShowPreview(false); }} style={{ border: "none", background: "none", cursor: "pointer", color: T.textMuted }}>{Ico.x(20)}</button>
                </div>

                {!showPreview ? (
                  <>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Recipient</label>
                      <select value={composeRecipient} onChange={e => setComposeRecipient(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font }}>
                        <option value="">Select recipient...</option>
                        <option value="Emma Wilson">Emma Wilson</option>
                        <option value="Priya Sharma">Priya Sharma</option>
                        <option value="James Cooper">James Cooper</option>
                        <option value="Sarah Jenkins">Sarah Jenkins</option>
                        <option value="David Chen">David Chen</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Channel</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["Email", "SMS", "Letter", "Push"].map(ch => (
                          <button key={ch} onClick={() => setComposeChannel(ch)} style={{
                            padding: "8px 16px", borderRadius: 8, border: `1px solid ${composeChannel === ch ? T.primary : T.border}`,
                            background: composeChannel === ch ? T.primaryLight : T.card, color: composeChannel === ch ? T.primary : T.textMuted,
                            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font,
                          }}>{ch}</button>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Template</label>
                      <select value={composeTemplate} onChange={e => setComposeTemplate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font }}>
                        <option value="">Select template...</option>
                        {templateData.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                      </select>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Custom Message</label>
                      <textarea value={composeMessage} onChange={e => setComposeMessage(e.target.value)} placeholder="Add a custom message or leave blank to use template default..." rows={4} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, resize: "vertical", boxSizing: "border-box" }} />
                    </div>

                    <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Schedule Date</label>
                        <input type="date" value={composeDate} onChange={e => setComposeDate(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>Schedule Time</label>
                        <input type="time" value={composeTime} onChange={e => setComposeTime(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, boxSizing: "border-box" }} />
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <Btn ghost onClick={() => { setComposeOpen(false); setShowPreview(false); }}>Cancel</Btn>
                      <Btn onClick={() => setShowPreview(true)}>Preview</Btn>
                      <Btn primary icon="send">Send</Btn>
                    </div>
                  </>
                ) : (
                  <>
                    <Card style={{ background: "#FAFAF7", marginBottom: 20 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, marginBottom: 8 }}>PREVIEW</div>
                      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>To: {composeRecipient || "—"}</div>
                      <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 4 }}>Channel: {composeChannel}</div>
                      <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 4 }}>Template: {composeTemplate || "None"}</div>
                      <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 8 }}>Scheduled: {composeDate || "Immediately"} {composeTime}</div>
                      <div style={{ padding: 16, background: T.card, borderRadius: 10, border: `1px solid ${T.borderLight}`, fontSize: 13, lineHeight: 1.6 }}>
                        {composeMessage || `Dear ${composeRecipient || "Customer"},\n\nThis is a preview of your ${composeTemplate || "communication"} template.\n\nKind regards,\nHelix Bank`}
                      </div>
                    </Card>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                      <Btn ghost onClick={() => setShowPreview(false)}>Back to Edit</Btn>
                      <Btn primary icon="send">Send</Btn>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {tab === "Templates" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Communication Templates</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
            {templateData.map(t => (
              <Card key={t.name} style={{ cursor: "pointer", transition: "box-shadow 0.15s", border: selectedTemplate === t.name ? `2px solid ${T.primary}` : `1px solid ${T.border}` }} onClick={() => setSelectedTemplate(selectedTemplate === t.name ? null : t.name)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>
                    {Ico[t.icon]?.(18)}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                  {channelBadge(t.channel)}
                  <span style={{
                    background: t.trigger === "Auto" ? T.successBg : "#F3E8FF",
                    color: t.trigger === "Auto" ? T.success : "#7C3AED",
                    padding: "3px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  }}>{t.trigger}</span>
                </div>
                <div style={{ fontSize: 12, color: T.textMuted }}>Last used: {t.lastUsed}</div>
              </Card>
            ))}
          </div>

          {/* Template Preview */}
          {selectedTemplate && (() => {
            const t = templateData.find(x => x.name === selectedTemplate);
            return (
              <Card style={{ marginTop: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: T.navy }}>Template Preview: {t.name}</div>
                <div style={{ padding: 20, background: "#FAFAF7", borderRadius: 10, border: `1px solid ${T.borderLight}`, fontSize: 13, lineHeight: 1.8 }}>
                  <p style={{ margin: 0 }}>Dear <span style={{ background: "#DBEAFE", color: "#1E40AF", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{t.mergeFields[0]}</span>,</p>
                  <br />
                  <p style={{ margin: 0 }}>
                    We are writing regarding your mortgage account. Please find the details below relating to your{" "}
                    {t.mergeFields.slice(1).map((f, i) => (
                      <span key={i}>
                        <span style={{ background: "#DBEAFE", color: "#1E40AF", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{f}</span>
                        {i < t.mergeFields.length - 2 ? ", " : ""}
                      </span>
                    ))}.
                  </p>
                  <br />
                  <p style={{ margin: 0 }}>If you have any questions, please do not hesitate to contact us.</p>
                  <br />
                  <p style={{ margin: 0 }}>Kind regards,<br />Helix Bank Mortgage Services</p>
                </div>
                <div style={{ marginTop: 12, fontSize: 12, color: T.textMuted }}>
                  Merge fields: {t.mergeFields.map((f, i) => (
                    <span key={i} style={{ background: "#DBEAFE", color: "#1E40AF", padding: "1px 6px", borderRadius: 4, fontWeight: 600, marginRight: 6, fontSize: 11 }}>{f}</span>
                  ))}
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Triggers Tab */}
      {tab === "Triggers" && (
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Auto-Send Triggers</div>
          <Card noPad>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAF7" }}>
                    <th style={thStyle}>Trigger Name</th>
                    <th style={thStyle}>Event</th>
                    <th style={thStyle}>Template</th>
                    <th style={thStyle}>Channel</th>
                    <th style={thStyle}>Delay</th>
                    <th style={thStyle}>Active</th>
                  </tr>
                </thead>
                <tbody>
                  {triggers.map((tr, i) => (
                    <tr key={i}>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{tr.name}</td>
                      <td style={tdStyle}>{tr.event}</td>
                      <td style={tdStyle}>{tr.template}</td>
                      <td style={tdStyle}>{channelBadge(tr.channel)}</td>
                      <td style={tdStyle}>{tr.delay}</td>
                      <td style={tdStyle}>
                        <button onClick={() => {
                          const updated = [...triggers];
                          updated[i] = { ...updated[i], active: !updated[i].active };
                          setTriggers(updated);
                        }} style={{
                          width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer",
                          background: tr.active ? T.success : T.border, position: "relative", transition: "background 0.2s",
                        }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: "50%", background: "#fff",
                            position: "absolute", top: 3, left: tr.active ? 23 : 3, transition: "left 0.2s",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                          }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {tab === "History" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Communication History</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.card, border: `1px solid ${T.border}`, borderRadius: 9, padding: "6px 12px" }}>
              {Ico.search(16)}
              <input value={searchHistory} onChange={e => setSearchHistory(e.target.value)} placeholder="Search history..." style={{ border: "none", outline: "none", fontSize: 13, fontFamily: T.font, background: "transparent", width: 200 }} />
            </div>
          </div>
          <Card noPad>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#FAFAF7" }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Recipient</th>
                    <th style={thStyle}>Channel</th>
                    <th style={thStyle}>Subject</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h, i) => (
                    <tr key={i} style={{ transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background = "#FAFAF7"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ ...tdStyle, fontSize: 12, color: T.textMuted }}>{h.date}</td>
                      <td style={{ ...tdStyle, fontWeight: 600 }}>{h.recipient}</td>
                      <td style={tdStyle}>{channelBadge(h.channel)}</td>
                      <td style={tdStyle}>{h.subject}</td>
                      <td style={tdStyle}>{statusBadge(h.status === "Dispatched" ? "Sent" : h.status === "Delivered" ? "Sent" : h.status)}</td>
                      <td style={tdStyle}>
                        <span style={{ color: h.opened === "Yes" ? T.success : h.opened === "No" ? T.danger : T.textMuted, fontWeight: 600, fontSize: 12 }}>
                          {h.opened}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
