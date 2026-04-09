import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const squadMembers = [
  { initials: "ST", name: "Sarah Thompson", role: "BDM", roleColor: T.success, status: "Active", activity: "Managing broker relationship", phone: "07700 900001", email: "s.thompson@helix.bank" },
  { initials: "TW", name: "Tom Walker", role: "Ops", roleColor: "#1E40AF", status: "Active", activity: "Reviewing KYC documents", phone: "07700 900002", email: "t.walker@helix.bank" },
  { initials: "JM", name: "James Mitchell", role: "UW", roleColor: "#5B21B6", status: "Active", activity: "Credit assessment in progress", phone: "07700 900003", email: "j.mitchell@helix.bank" },
];

const timelineEvents = [
  { time: "4 Apr, 09:15", text: "Enquiry submitted by Sarah Thompson (BDM)", icon: "plus" },
  { time: "4 Apr, 09:16", text: "Nova AI criteria check: Eligible — 4 products matched", icon: "sparkle" },
  { time: "4 Apr, 09:18", text: "Squad assigned: ST (BDM), TW (Ops), JM (UW)", icon: "users" },
  { time: "4 Apr, 10:00", text: "Criteria pack sent to Watson & Partners", icon: "send" },
  { time: "4 Apr, 14:30", text: "Broker confirmed client interest", icon: "check" },
  { time: "5 Apr, 09:00", text: "DIP submitted via Smart Apply", icon: "file" },
  { time: "5 Apr, 09:45", text: "DIP Result: Approved — Afin Fix 2yr 75%", icon: "check" },
  { time: "5 Apr, 11:00", text: "Full application submitted", icon: "upload" },
  { time: "5 Apr, 14:00", text: "KYC initiated by Tom Walker", icon: "shield" },
  { time: "6 Apr, 09:30", text: "Documents uploaded by broker", icon: "file" },
];

const documents = [
  { name: "Criteria pack", status: "Sent", icon: "file", date: "4 Apr 2026" },
  { name: "DIP letter", status: "Generated", icon: "file", date: "5 Apr 2026" },
  { name: "Broker notes", status: "Uploaded", icon: "upload", date: "5 Apr 2026" },
  { name: "Income evidence", status: "Pending", icon: "clock", date: "—" },
];

const messages = [
  { from: "Sarah Thompson", role: "BDM", time: "4 Apr, 10:05", text: "Hi team, new enquiry from Watson & Partners. Client looks strong — employed, £70k income, 72% LTV. Let's prioritise this one." },
  { from: "Tom Walker", role: "Ops", time: "4 Apr, 10:20", text: "Noted, Sarah. I'll start the KYC process. Can you ask the broker for the latest 3 months' bank statements?" },
  { from: "Sarah Thompson", role: "BDM", time: "4 Apr, 10:35", text: "Already requested. Watson's are usually quick — expect them within 24hrs." },
  { from: "James Mitchell", role: "UW", time: "5 Apr, 09:50", text: "DIP approved. Clean case, no concerns. Moving to full application review." },
  { from: "Tom Walker", role: "Ops", time: "5 Apr, 14:15", text: "KYC initiated. ID verification passed. Waiting on address verification docs." },
  { from: "Watson & Partners", role: "Broker", time: "6 Apr, 09:30", text: "Documents uploaded: payslips, bank statements, and ID. Client keen to move quickly." },
];

const conversionSteps = ["Enquiry", "DIP", "Application", "Offer", "Complete"];

function EnquiryDetail({ enquiry, onBack }) {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Timeline", "Documents", "Communications"];

  const e = enquiry || {
    id: "ENQ-001", broker: "Watson & Partners", scenario: "3-bed semi, employed, £70k income",
    amount: 350000, ltv: 72, aiResult: "Eligible", status: "DIP Submitted", squad: "ST/TW/JM",
  };

  const currentStep = 2; // Application stage
  const hasSquad = e.squad && e.squad !== "—" && e.squad !== "Pending";

  const aiResultStyle = {
    Eligible: { bg: T.successBg, color: T.success, border: T.successBorder },
    Conditional: { bg: T.warningBg, color: "#92400E", border: T.warningBorder },
    Ineligible: { bg: T.dangerBg, color: T.danger, border: T.dangerBorder },
  }[e.aiResult] || { bg: T.successBg, color: T.success, border: T.successBorder };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Back link */}
      <div onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer", color: T.primary, fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
        {Ico.arrowLeft(16)} Back to Dashboard
      </div>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{e.id}</h1>
            <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: aiResultStyle.bg, color: aiResultStyle.color, border: `1px solid ${aiResultStyle.border}` }}>{e.aiResult}</span>
          </div>
          <div style={{ fontSize: 14, color: T.textMuted }}>{e.broker} &middot; {e.status} &middot; Created 4 Apr 2026</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn small icon="messages">Message Broker</Btn>
          <Btn small primary icon="file">Generate Report</Btn>
        </div>
      </div>

      {/* Squad Panel */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.users(18)}
            <span style={{ fontSize: 16, fontWeight: 700 }}>Case Squad</span>
          </div>
          <Btn small primary icon="send">Message Squad</Btn>
        </div>

        {!hasSquad ? (
          <div style={{ padding: "16px 20px", borderRadius: 10, background: T.warningBg, border: `1px solid ${T.warningBorder}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#92400E" }}>Squad Pending — Assign Now</span>
            <Btn small primary icon="assign">Assign Squad</Btn>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {squadMembers.map(m => (
              <div key={m.name} style={{ padding: 16, borderRadius: 12, border: `1px solid ${T.border}`, background: T.card }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: m.roleColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{m.initials}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${m.roleColor}15`, color: m.roleColor }}>{m.role}</span>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.success }} />
                  <span style={{ fontSize: 12, color: T.textMuted }}>{m.status}</span>
                </div>
                <div style={{ fontSize: 12, color: T.text, marginBottom: 10, fontStyle: "italic" }}>{m.activity}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ cursor: "pointer", color: T.primary }}>{Ico.messages(14)}</span>
                  <span style={{ cursor: "pointer", color: T.primary }}>{Ico.user(14)}</span>
                </div>
                {m.role !== "BDM" && (
                  <div style={{ marginTop: 10 }}>
                    <Btn small ghost icon="assign">Reassign</Btn>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: `1px solid ${T.border}` }}>
        {tabs.map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            padding: "10px 20px", cursor: "pointer", fontSize: 13, fontWeight: 600,
            color: tab === t ? T.primary : T.textMuted,
            borderBottom: tab === t ? `2px solid ${T.primary}` : "2px solid transparent",
            transition: "all 0.15s",
          }}>{t}</div>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "Overview" && (
        <div>
          {/* Details grid */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Enquiry Details</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
              {[
                ["Broker", e.broker],
                ["Customer Type", "Residential"],
                ["Property Type", "3-bed semi-detached"],
                ["Location", "SW1A 1AA"],
                ["Income", "£70,000"],
                ["Property Value", `£${e.amount.toLocaleString()}`],
                ["Deposit", "£98,000"],
                ["LTV", `${e.ltv}%`],
                ["Employment", "Employed"],
                ["Flags", "None"],
                ["Notes", "Standard residential case"],
                ["Created", "4 Apr 2026"],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{val}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Assessment */}
          <Card style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              {Ico.sparkle(18)}
              <span style={{ fontSize: 15, fontWeight: 700 }}>AI Assessment</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ padding: "6px 16px", borderRadius: 8, fontSize: 14, fontWeight: 700, background: aiResultStyle.bg, color: aiResultStyle.color, border: `1px solid ${aiResultStyle.border}` }}>{e.aiResult}</span>
              <span style={{ fontSize: 13, color: T.textMuted }}>4 products matched</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { name: "Afin Fix 2yr 75%", rate: "4.49%" },
                { name: "Afin Fix 5yr 75%", rate: "4.29%" },
                { name: "Afin Tracker 75%", rate: "4.19%" },
                { name: "Afin Fix 2yr 85%", rate: "4.89%" },
              ].map(p => (
                <div key={p.name} style={{ padding: "10px 14px", borderRadius: 8, border: `1px solid ${T.successBorder}`, background: T.successBg, fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span> &middot; {p.rate}
                </div>
              ))}
            </div>
          </Card>

          {/* Conversion Tracker */}
          <Card>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Conversion Tracker</div>
            <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {conversionSteps.map((step, i) => (
                <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700,
                      background: i <= currentStep ? T.primary : T.borderLight,
                      color: i <= currentStep ? "#fff" : T.textMuted,
                    }}>
                      {i < currentStep ? <span style={{ color: "#fff" }}>{Ico.check(14)}</span> : i + 1}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: i <= currentStep ? T.primary : T.textMuted, marginTop: 6 }}>{step}</div>
                  </div>
                  {i < conversionSteps.length - 1 && (
                    <div style={{ flex: 1, height: 2, background: i < currentStep ? T.primary : T.borderLight, margin: "0 -8px", marginBottom: 20 }} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Timeline Tab */}
      {tab === "Timeline" && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Activity Timeline</div>
          {timelineEvents.map((ev, i) => (
            <div key={i} style={{ display: "flex", gap: 14, marginBottom: 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: T.primaryLight, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {Ico[ev.icon]?.(14)}
                </div>
                {i < timelineEvents.length - 1 && <div style={{ width: 2, flex: 1, background: T.borderLight, minHeight: 20 }} />}
              </div>
              <div style={{ paddingBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>{ev.text}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{ev.time}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Documents Tab */}
      {tab === "Documents" && (
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Documents</span>
            <Btn small icon="upload">Upload Document</Btn>
          </div>
          {documents.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < documents.length - 1 ? `1px solid ${T.borderLight}` : "none" }}>
              <div style={{ color: T.primary }}>{Ico[d.icon]?.(18)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{d.date}</div>
              </div>
              <span style={{
                padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                background: d.status === "Pending" ? T.warningBg : T.successBg,
                color: d.status === "Pending" ? "#92400E" : T.success,
              }}>{d.status}</span>
              {d.status !== "Pending" && <span style={{ cursor: "pointer", color: T.primary }}>{Ico.download(16)}</span>}
            </div>
          ))}
        </Card>
      )}

      {/* Communications Tab */}
      {tab === "Communications" && (
        <Card>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Communications</div>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 12, background: m.role === "Broker" ? T.bg : T.primaryLight, border: `1px solid ${T.borderLight}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{m.from}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, background: T.border, color: T.textMuted }}>{m.role}</span>
                </div>
                <span style={{ fontSize: 11, color: T.textMuted }}>{m.time}</span>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: T.text }}>{m.text}</div>
            </div>
          ))}
          {/* Reply box */}
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            <input placeholder="Type a message..." style={{ flex: 1, padding: "10px 14px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, outline: "none" }} />
            <Btn primary small icon="send">Send</Btn>
          </div>
        </Card>
      )}
    </div>
  );
}

export default EnquiryDetail;
