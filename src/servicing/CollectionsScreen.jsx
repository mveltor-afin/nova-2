import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

/* ── Mock Data ─────────────────────────────────── */
const STAGES = [
  { key: "dd_failed",     label: "DD Failed",     color: T.danger },
  { key: "sms_sent",      label: "SMS Sent",      color: "#F59E0B" },
  { key: "email_sent",    label: "Email Sent",     color: T.warning },
  { key: "phone_queue",   label: "Phone Queue",    color: T.primary },
  { key: "formal_notice", label: "Formal Notice",  color: "#7C3AED" },
  { key: "legal",         label: "Legal",          color: "#DC2626" },
];

const riskBadge = (level) => {
  const m = { High: { bg: T.dangerBg, c: T.danger }, Medium: { bg: T.warningBg, c: T.warning }, Low: { bg: T.successBg, c: T.success } };
  const s = m[level] || m.Medium;
  return { background: s.bg, color: s.c, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 };
};

const ACCOUNTS = [
  { id: "HB-30012", name: "Priya Sharma",      arrears: 2340, daysOverdue: 12, risk: "Medium", stage: "dd_failed",     arrangement: null,
    insight: "High engagement — responded to SMS within 2 hours. Recommend payment arrangement before formal notice." },
  { id: "HB-30045", name: "James O'Brien",      arrears: 5670, daysOverdue: 28, risk: "High",   stage: "dd_failed",     arrangement: null,
    insight: "Second consecutive DD failure. Employer change detected — may indicate income disruption." },
  { id: "HB-30078", name: "Aisha Patel",        arrears: 1890, daysOverdue: 45, risk: "High",   stage: "dd_failed",     arrangement: null,
    insight: "Previously kept arrangement for 4 months then broke. Approach with caution." },
  { id: "HB-30091", name: "David Chen",         arrears: 3210, daysOverdue: 18, risk: "Medium", stage: "sms_sent",      arrangement: null,
    insight: "First-time arrears. Strong payment history — likely temporary issue." },
  { id: "HB-30103", name: "Sarah Williams",     arrears: 4560, daysOverdue: 22, risk: "Medium", stage: "sms_sent",      arrangement: null,
    insight: "Has responded to SMS. Awaiting callback — schedule for afternoon slot." },
  { id: "HB-30124", name: "Mohammed Al-Rashid", arrears: 6780, daysOverdue: 35, risk: "High",   stage: "email_sent",    arrangement: null,
    insight: "No response to SMS or email. Property valuation shows positive equity — low loss risk." },
  { id: "HB-30156", name: "Emma Thompson",      arrears: 2100, daysOverdue: 30, risk: "Low",    stage: "email_sent",    arrangement: null,
    insight: "Responded to email requesting arrangement. Income verified — can afford £350/month." },
  { id: "HB-30189", name: "Robert Singh",       arrears: 8940, daysOverdue: 52, risk: "High",   stage: "phone_queue",   arrangement: null,
    insight: "Multiple contact attempts failed. Consider home visit before escalation." },
  { id: "HB-30201", name: "Lucy Morgan",        arrears: 3450, daysOverdue: 38, risk: "Medium", stage: "phone_queue",   arrangement: { amount: 250, frequency: "Monthly", duration: 12, status: "kept" },
    insight: "Active arrangement in place and being maintained. Monitor closely." },
  { id: "HB-30234", name: "Tom Baker",          arrears: 4200, daysOverdue: 41, risk: "Medium", stage: "phone_queue",   arrangement: { amount: 300, frequency: "Monthly", duration: 6, status: "broken" },
    insight: "Broke arrangement last month. Re-engagement needed — try alternative contact number." },
  { id: "HB-30267", name: "Fatima Hassan",      arrears: 5890, daysOverdue: 60, risk: "High",   stage: "formal_notice", arrangement: null,
    insight: "Formal notice issued 5 days ago. 14-day response window. Previous good payment history — may respond." },
  { id: "HB-30298", name: "William Clarke",     arrears: 12300, daysOverdue: 90, risk: "High",  stage: "legal",         arrangement: null,
    insight: "Solicitors instructed. Court date pending. Property valued at £285k — outstanding balance £195k." },
];

const TIMELINE_TEMPLATE = [
  { day: 0,  label: "DD Failed",              icon: "alert" },
  { day: 1,  label: "Account flagged",        icon: "shield" },
  { day: 3,  label: "SMS sent",               icon: "send" },
  { day: 7,  label: "Email sent",             icon: "file" },
  { day: 10, label: "Follow-up SMS",          icon: "send" },
  { day: 14, label: "Phone queue assigned",   icon: "user" },
  { day: 21, label: "Second call attempt",    icon: "user" },
  { day: 30, label: "Formal notice issued",   icon: "file" },
  { day: 45, label: "Final warning letter",   icon: "alert" },
  { day: 60, label: "Legal referral",         icon: "lock" },
];

function getTimelineForAccount(acc) {
  const stageIndex = STAGES.findIndex(s => s.key === acc.stage);
  const dayThresholds = [0, 3, 7, 14, 30, 60];
  const maxDay = dayThresholds[stageIndex] ?? 0;
  return TIMELINE_TEMPLATE.filter(t => t.day <= maxDay).map(t => ({
    ...t, completed: t.day <= acc.daysOverdue,
  }));
}

/* ── Component ─────────────────────────────────── */
export default function CollectionsScreen() {
  const [selected, setSelected] = useState(null);
  const [accounts, setAccounts] = useState(ACCOUNTS);
  const [showArrangement, setShowArrangement] = useState(false);
  const [arrForm, setArrForm] = useState({ amount: "", frequency: "Monthly", duration: "6" });
  const [paused, setPaused] = useState({});

  const sel = selected ? accounts.find(a => a.id === selected) : null;

  const totalArrears = accounts.reduce((s, a) => s + a.arrears, 0);
  const avgDays = Math.round(accounts.reduce((s, a) => s + a.daysOverdue, 0) / accounts.length);
  const arrangementsActive = accounts.filter(a => a.arrangement?.status === "kept").length;

  const handleSkipStep = () => {
    if (!sel) return;
    const idx = STAGES.findIndex(s => s.key === sel.stage);
    if (idx < STAGES.length - 1) {
      setAccounts(prev => prev.map(a => a.id === sel.id ? { ...a, stage: STAGES[idx + 1].key } : a));
    }
  };

  const handlePause = () => {
    if (!sel) return;
    setPaused(p => ({ ...p, [sel.id]: !p[sel.id] }));
  };

  const handleSaveArrangement = () => {
    if (!sel || !arrForm.amount) return;
    setAccounts(prev => prev.map(a => a.id === sel.id ? {
      ...a, arrangement: { amount: Number(arrForm.amount), frequency: arrForm.frequency, duration: Number(arrForm.duration), status: "kept" }
    } : a));
    setShowArrangement(false);
    setArrForm({ amount: "", frequency: "Monthly", duration: "6" });
  };

  const handleArrStatus = (status) => {
    if (!sel) return;
    setAccounts(prev => prev.map(a => a.id === sel.id ? { ...a, arrangement: { ...a.arrangement, status } } : a));
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text, background: T.bg, minHeight: "100vh", padding: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `linear-gradient(135deg,${T.primary},${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          {Ico.alert(20)}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: T.navy }}>Collections Workflow</h1>
          <p style={{ margin: 0, fontSize: 13, color: T.textMuted }}>Automated arrears management and recovery pipeline</p>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Active Cases" value={accounts.length} color={T.primary} />
        <KPICard label="Total Arrears" value={`£${totalArrears.toLocaleString()}`} color={T.danger} />
        <KPICard label="Avg Days Overdue" value={avgDays} color={T.warning} />
        <KPICard label="Recovery Rate" value="72%" sub="Last 12 months" color={T.success} />
        <KPICard label="Arrangements Active" value={arrangementsActive} color="#7C3AED" />
      </div>

      {/* Detail or Pipeline */}
      {sel ? (
        /* ── Detail View ── */
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div onClick={() => { setSelected(null); setShowArrangement(false); }} style={{ cursor: "pointer", color: T.primary, display: "flex", alignItems: "center", gap: 4 }}>
              {Ico.arrowLeft(16)} <span style={{ fontSize: 13, fontWeight: 600 }}>Back to pipeline</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {/* Left: Info + Timeline */}
            <div style={{ flex: 2, minWidth: 340 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>{Ico.user(24)}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{sel.name}</div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{sel.id}</div>
                </div>
                <span style={riskBadge(sel.risk)}>{sel.risk} Risk</span>
                {paused[sel.id] && <span style={{ background: T.warningBg, color: T.warning, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>PAUSED</span>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
                <div style={{ background: T.dangerBg, borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Arrears</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.danger }}>£{sel.arrears.toLocaleString()}</div>
                </div>
                <div style={{ background: T.warningBg, borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Days Overdue</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: T.warning }}>{sel.daysOverdue}</div>
                </div>
                <div style={{ background: T.primaryLight, borderRadius: 10, padding: 14 }}>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>Current Stage</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.primary }}>{STAGES.find(s => s.key === sel.stage)?.label}</div>
                </div>
              </div>

              {/* AI Insight */}
              <div style={{ background: "rgba(26,74,84,0.05)", borderRadius: 10, padding: 16, marginBottom: 24, border: `1px solid ${T.borderLight}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  {Ico.sparkle(14)} <span style={{ fontSize: 12, fontWeight: 700, color: T.primary }}>AI Insight</span>
                </div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{sel.insight}</div>
              </div>

              {/* Timeline */}
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.navy }}>Collections Timeline</div>
              <div style={{ position: "relative", paddingLeft: 24 }}>
                <div style={{ position: "absolute", left: 7, top: 4, bottom: 4, width: 2, background: T.borderLight }} />
                {getTimelineForAccount(sel).map((t, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16, position: "relative" }}>
                    <div style={{
                      position: "absolute", left: -20, width: 16, height: 16, borderRadius: "50%",
                      background: t.completed ? T.primary : T.card, border: `2px solid ${t.completed ? T.primary : T.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                      {t.completed && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: t.completed ? T.text : T.textMuted }}>Day {t.day} — {t.label}</div>
                      <div style={{ fontSize: 11, color: T.textMuted }}>{t.completed ? "Completed" : "Pending"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Actions + Arrangement */}
            <div style={{ flex: 1, minWidth: 280 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: T.navy }}>Actions</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                <Btn primary icon="zap" onClick={handleSkipStep}>Override — Skip to Next Step</Btn>
                <Btn danger={!paused[sel.id]} icon="clock" onClick={handlePause} style={paused[sel.id] ? {} : {}}>
                  {paused[sel.id] ? "Resume Collections" : "Pause Collections"}
                </Btn>
                <Btn icon="plus" onClick={() => setShowArrangement(true)}>Set Up Arrangement</Btn>
              </div>

              {/* Arrangement Form */}
              {showArrangement && (
                <Card style={{ background: T.bg, marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Payment Arrangement</div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Amount (£)</label>
                  <input value={arrForm.amount} onChange={e => setArrForm(f => ({ ...f, amount: e.target.value }))} type="number" placeholder="e.g. 350"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, marginBottom: 12, boxSizing: "border-box" }} />
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Frequency</label>
                  <select value={arrForm.frequency} onChange={e => setArrForm(f => ({ ...f, frequency: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, marginBottom: 12 }}>
                    <option>Weekly</option><option>Fortnightly</option><option>Monthly</option>
                  </select>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 4 }}>Duration (months)</label>
                  <input value={arrForm.duration} onChange={e => setArrForm(f => ({ ...f, duration: e.target.value }))} type="number"
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, marginBottom: 14, boxSizing: "border-box" }} />
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn primary small onClick={handleSaveArrangement}>Save Arrangement</Btn>
                    <Btn small onClick={() => setShowArrangement(false)}>Cancel</Btn>
                  </div>
                </Card>
              )}

              {/* Existing Arrangement */}
              {sel.arrangement && (
                <Card style={{ background: sel.arrangement.status === "kept" ? T.successBg : T.dangerBg }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: sel.arrangement.status === "kept" ? T.success : T.danger }}>
                    {sel.arrangement.status === "kept" ? "Arrangement — Kept" : "Arrangement — Broken"}
                  </div>
                  <div style={{ fontSize: 12, color: T.text, marginBottom: 4 }}>£{sel.arrangement.amount}/{sel.arrangement.frequency.toLowerCase()}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>{sel.arrangement.duration} month duration</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn small primary={sel.arrangement.status !== "kept"} onClick={() => handleArrStatus("kept")}>Mark Kept</Btn>
                    <Btn small danger={sel.arrangement.status !== "broken"} onClick={() => handleArrStatus("broken")}>Mark Broken</Btn>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </Card>
      ) : (
        /* ── Pipeline View ── */
        <Card noPad style={{ overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.navy }}>Collections Pipeline</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>{accounts.length} active cases</div>
          </div>
          <div style={{ display: "flex", overflowX: "auto", minHeight: 420 }}>
            {STAGES.map(stage => {
              const stageAccounts = accounts.filter(a => a.stage === stage.key);
              return (
                <div key={stage.key} style={{ flex: 1, minWidth: 210, borderRight: `1px solid ${T.borderLight}`, display: "flex", flexDirection: "column" }}>
                  {/* Column header */}
                  <div style={{ padding: "14px 16px", background: T.bg, borderBottom: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: stage.color }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{stage.label}</span>
                    </div>
                    <span style={{ background: stage.color + "18", color: stage.color, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
                      {stageAccounts.length}
                    </span>
                  </div>
                  {/* Cards */}
                  <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    {stageAccounts.map(acc => (
                      <div key={acc.id} onClick={() => setSelected(acc.id)}
                        style={{
                          background: T.card, borderRadius: 10, padding: 14, border: `1px solid ${T.borderLight}`,
                          cursor: "pointer", transition: "all 0.15s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = T.primary; e.currentTarget.style.boxShadow = `0 2px 8px ${T.primaryGlow}`; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.borderLight; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{acc.name}</div>
                          <span style={riskBadge(acc.risk)}>{acc.risk}</span>
                        </div>
                        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>{acc.id}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: T.danger }}>£{acc.arrears.toLocaleString()}</span>
                          <span style={{ fontSize: 11, color: T.textMuted }}>{acc.daysOverdue}d overdue</span>
                        </div>
                        {paused[acc.id] && (
                          <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: T.warning, background: T.warningBg, padding: "2px 6px", borderRadius: 4, display: "inline-block" }}>PAUSED</div>
                        )}
                        {acc.arrangement && (
                          <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: acc.arrangement.status === "kept" ? T.success : T.danger, background: acc.arrangement.status === "kept" ? T.successBg : T.dangerBg, padding: "2px 6px", borderRadius: 4, display: "inline-block" }}>
                            Arr: {acc.arrangement.status}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
