import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";

/* ── data ── */
const APPLICATIONS = [
  {
    id: "BRK-001", firm: "Watson & Partners", contact: "John Watson", fca: "123456",
    applied: "05 Apr 2026", statusLabel: "FCA Verification",
    checks: [true, false, false, false, false, false, false, false],
  },
  {
    id: "BRK-002", firm: "Apex Mortgages Ltd", contact: "Sarah Thompson", fca: "789012",
    applied: "03 Apr 2026", statusLabel: "Panel Agreement Pending",
    checks: [true, true, true, false, false, true, false, false],
  },
  {
    id: "BRK-003", firm: "Prime Financial", contact: "Mark Davies", fca: "345678",
    applied: "01 Apr 2026", statusLabel: "Documents Required",
    checks: [true, true, false, false, false, false, false, false],
  },
];

const CHECK_LABELS = [
  "FCA Register Verification — auto-checked against FCA register",
  "Company verification (Companies House)",
  "PI Insurance confirmation — minimum \u00a31M cover",
  "Panel agreement signed",
  "Terms and conditions accepted",
  "Anti-money laundering training certificate",
  "System access credentials issued",
  "Welcome pack sent",
];

const ACTIVE_BROKERS = [
  { firm: "Sterling Mortgages", contact: "Anna Price", fca: "112233", joined: "12 Jan 2024", casesYTD: 38, volumeYTD: "\u00a312.4M", quality: 94, status: "Active" },
  { firm: "Horizon Finance", contact: "Peter Clarke", fca: "223344", joined: "08 Mar 2024", casesYTD: 27, volumeYTD: "\u00a38.9M", quality: 91, status: "Active" },
  { firm: "Blue Sky Lending", contact: "Rachel Adams", fca: "334455", joined: "15 Jun 2024", casesYTD: 45, volumeYTD: "\u00a315.1M", quality: 97, status: "Active" },
  { firm: "Pacific Brokers", contact: "Simon Lee", fca: "445566", joined: "22 Sep 2024", casesYTD: 19, volumeYTD: "\u00a36.2M", quality: 88, status: "Active" },
  { firm: "Maple Financial", contact: "Karen White", fca: "556677", joined: "01 Nov 2024", casesYTD: 31, volumeYTD: "\u00a310.5M", quality: 92, status: "Active" },
  { firm: "Crest Mortgages", contact: "David O'Brien", fca: "667788", joined: "14 Feb 2025", casesYTD: 12, volumeYTD: "\u00a34.1M", quality: 90, status: "Active" },
  { firm: "Summit Advisors", contact: "Laura Chen", fca: "778899", joined: "30 Apr 2025", casesYTD: 22, volumeYTD: "\u00a37.8M", quality: 95, status: "Active" },
  { firm: "Pinnacle Finance", contact: "James Murray", fca: "889900", joined: "18 Jul 2025", casesYTD: 9, volumeYTD: "\u00a33.0M", quality: 87, status: "Active" },
];

const SUSPENDED_BROKERS = [
  { firm: "Northern Lending Co", contact: "Craig Foster", fca: "901122", reason: "FCA investigation — pending outcome", suspendedDate: "28 Mar 2026" },
  { firm: "QuickLoans Direct", contact: "Tony Marsh", fca: "102233", reason: "Quality score below threshold (3 consecutive months)", suspendedDate: "15 Mar 2026" },
];

const OFFBOARDED = [
  { firm: "Legacy Brokers Ltd", contact: "Margaret Hill", fca: "203344", exitDate: "01 Feb 2026", reason: "Voluntary withdrawal — firm ceased trading" },
];

/* ── styles ── */
const thStyle = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, borderBottom: `2px solid ${T.border}` };
const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };
const tabStyle = (active) => ({
  padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", borderRadius: "8px 8px 0 0",
  background: active ? T.card : "transparent", color: active ? T.primary : T.textMuted,
  border: active ? `1px solid ${T.border}` : "1px solid transparent", borderBottom: active ? `1px solid ${T.card}` : "none",
  marginBottom: -1,
});

function BrokerOnboarding() {
  const [tab, setTab] = useState("Applications");
  const [expanded, setExpanded] = useState(null);
  const [checks, setChecks] = useState(() => APPLICATIONS.reduce((acc, a) => ({ ...acc, [a.id]: [...a.checks] }), {}));

  const tabs = ["Applications", "Active Panel", "Suspended", "Offboarded"];

  const toggleCheck = (appId, idx) => {
    setChecks((prev) => {
      const next = { ...prev, [appId]: [...prev[appId]] };
      next[appId][idx] = !next[appId][idx];
      return next;
    });
  };

  const allPassed = (appId) => checks[appId]?.every(Boolean);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 700, color: T.text }}>{Ico.users(22)} Broker Onboarding</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4, marginLeft: 32 }}>Manage broker registration, verification, and panel membership</div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Pending Applications" value="3" color={T.warning} />
        <KPICard label="Active Brokers" value="142" color={T.success} />
        <KPICard label="Suspended" value="2" color={T.danger} />
        <KPICard label="Avg Onboarding Time" value="2.4 days" color={T.primary} />
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, borderBottom: `1px solid ${T.border}`, marginBottom: 24 }}>
        {tabs.map((t) => <div key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>{t}</div>)}
      </div>

      {/* ── Applications ── */}
      {tab === "Applications" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {APPLICATIONS.map((app) => (
            <Card key={app.id}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: T.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: T.primary }}>{Ico.user(20)}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{app.firm}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{app.contact} &middot; FCA: {app.fca} &middot; Applied: {app.applied}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: T.warningBg, color: T.warning }}>{app.statusLabel}</span>
                  <span style={{ fontSize: 18, color: T.textMuted, transform: expanded === app.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>\u25BE</span>
                </div>
              </div>

              {expanded === app.id && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${T.borderLight}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14, color: T.textSecondary }}>Onboarding Checklist</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {CHECK_LABELS.map((label, idx) => {
                      const done = checks[app.id][idx];
                      return (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => toggleCheck(app.id, idx)}>
                          <div style={{
                            width: 22, height: 22, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
                            background: done ? T.success : "transparent", border: done ? "none" : `2px solid ${T.border}`,
                            color: "#fff", transition: "all 0.15s",
                          }}>
                            {done && Ico.check(14)}
                          </div>
                          <span style={{ fontSize: 13, color: done ? T.textMuted : T.text, textDecoration: done ? "line-through" : "none" }}>{label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <Btn primary disabled={!allPassed(app.id)} icon="check">Approve</Btn>
                    <Btn danger disabled={!allPassed(app.id)} icon="x">Reject</Btn>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* ── Active Panel ── */}
      {tab === "Active Panel" && (
        <Card noPad>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Firm", "Contact", "FCA Ref", "Joined", "Cases YTD", "Volume YTD", "Quality Score", "Status", "Actions"].map((h) => (
                    <th key={h} style={thStyle}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ACTIVE_BROKERS.map((b) => (
                  <tr key={b.fca} style={{ transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = T.primaryLight)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{b.firm}</td>
                    <td style={tdStyle}>{b.contact}</td>
                    <td style={tdStyle}>{b.fca}</td>
                    <td style={tdStyle}>{b.joined}</td>
                    <td style={tdStyle}>{b.casesYTD}</td>
                    <td style={tdStyle}>{b.volumeYTD}</td>
                    <td style={tdStyle}>
                      <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700, background: b.quality >= 90 ? T.successBg : T.warningBg, color: b.quality >= 90 ? T.success : T.warning }}>{b.quality}%</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: T.successBg, color: T.success }}>{b.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small icon="eye">View</Btn>
                        <Btn small danger>Suspend</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Suspended ── */}
      {tab === "Suspended" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {SUSPENDED_BROKERS.map((b) => (
            <Card key={b.fca}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: T.dangerBg, display: "flex", alignItems: "center", justifyContent: "center", color: T.danger }}>{Ico.alert(20)}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{b.firm}</div>
                    <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{b.contact} &middot; FCA: {b.fca}</div>
                    <div style={{ fontSize: 12, color: T.danger, marginTop: 4 }}>Reason: {b.reason}</div>
                    <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Suspended: {b.suspendedDate}</div>
                  </div>
                </div>
                <Btn primary icon="check">Reactivate</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Offboarded ── */}
      {tab === "Offboarded" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {OFFBOARDED.map((b) => (
            <Card key={b.fca}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F3E8FF", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C3AED" }}>{Ico.user(20)}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{b.firm}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{b.contact} &middot; FCA: {b.fca}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Exit date: {b.exitDate}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>Reason: {b.reason}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrokerOnboarding;
