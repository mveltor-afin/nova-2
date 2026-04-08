import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// TOGGLE SWITCH
// ─────────────────────────────────────────────
const Toggle = ({ checked, onChange, label }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
    <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{label}</span>
    <div
      onClick={() => onChange?.(!checked)}
      style={{
        width: 42, height: 24, borderRadius: 12, cursor: "pointer",
        background: checked ? T.accent : T.border, position: "relative",
        transition: "background 0.2s",
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: 9, background: "#fff",
        position: "absolute", top: 3,
        left: checked ? 21 : 3, transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </div>
  </div>
);

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
    <span style={{ color: T.primary }}>{icon}</span>
    <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{title}</span>
  </div>
);

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────
const Badge = ({ text, color, bg }) => (
  <span style={{
    fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
    background: bg, color, letterSpacing: 0.3,
  }}>{text}</span>
);

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const LOGIN_HISTORY = [
  { date: "06 Apr 2026, 09:12", device: "Chrome / macOS", ip: "82.132.41.55", location: "London, UK" },
  { date: "05 Apr 2026, 18:34", device: "Safari / iOS",   ip: "82.132.41.55", location: "London, UK" },
  { date: "04 Apr 2026, 08:51", device: "Chrome / macOS", ip: "82.132.41.55", location: "London, UK" },
  { date: "03 Apr 2026, 14:22", device: "Edge / Windows",  ip: "195.89.102.7", location: "Birmingham, UK" },
  { date: "02 Apr 2026, 09:05", device: "Chrome / macOS", ip: "82.132.41.55", location: "London, UK" },
];

const INTEGRATIONS = [
  { name: "Open Banking",     connected: true },
  { name: "Credit Bureau",    connected: true },
  { name: "Land Registry",    connected: true },
  { name: "Companies House",  connected: false },
  { name: "DocuSign",         connected: true },
  { name: "HMRC",             connected: false },
];

// ─────────────────────────────────────────────
// SETTINGS SCREEN
// ─────────────────────────────────────────────
function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [sidebarPos, setSidebarPos] = useState("left");
  const [emailNotif, setEmailNotif] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [desktopNotif, setDesktopNotif] = useState(true);
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("07:00");
  const [sessionTimeout, setSessionTimeout] = useState("30min");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const thStyle = { textAlign: "left", padding: "8px 12px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.borderLight}` };
  const tdStyle = { padding: "10px 12px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };

  return (
    <div style={{ fontFamily: T.font, maxWidth: 740, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: T.text, margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: T.textMuted, margin: "4px 0 0" }}>Manage your preferences and platform configuration</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Appearance ── */}
        <Card>
          <SectionHeader icon={Ico.sparkle(20)} title="Appearance" />
          <Toggle label="Dark Mode" checked={darkMode} onChange={setDarkMode} />
          <Toggle label="Compact Mode" checked={compactMode} onChange={setCompactMode} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Sidebar Position</span>
            <div style={{ display: "flex", gap: 0 }}>
              {["Left", "Right"].map(pos => (
                <button key={pos} onClick={() => setSidebarPos(pos.toLowerCase())} style={{
                  padding: "6px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${T.border}`, background: sidebarPos === pos.toLowerCase() ? T.primary : T.card,
                  color: sidebarPos === pos.toLowerCase() ? "#fff" : T.text,
                  borderRadius: pos === "Left" ? "7px 0 0 7px" : "0 7px 7px 0",
                  fontFamily: T.font,
                }}>{pos}</button>
              ))}
            </div>
          </div>
        </Card>

        {/* ── Notifications ── */}
        <Card>
          <SectionHeader icon={Ico.bell(20)} title="Notifications" />
          <Toggle label="Email Notifications" checked={emailNotif} onChange={setEmailNotif} />
          <Toggle label="SMS Alerts" checked={smsAlerts} onChange={setSmsAlerts} />
          <Toggle label="Desktop Notifications" checked={desktopNotif} onChange={setDesktopNotif} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Quiet Hours</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, color: T.text, background: T.card }} />
              <span style={{ fontSize: 12, color: T.textMuted }}>to</span>
              <input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)}
                style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font, color: T.text, background: T.card }} />
            </div>
          </div>
        </Card>

        {/* ── Security ── */}
        <Card>
          <SectionHeader icon={Ico.shield(20)} title="Security" />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Multi-Factor Authentication</span>
            <Badge text="Enabled" color={T.success} bg={T.successBg} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Password</span>
            <Btn small icon="lock">Change Password</Btn>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Session Timeout</span>
            <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={{
              padding: "6px 12px", borderRadius: 7, border: `1px solid ${T.border}`,
              fontSize: 12, fontFamily: T.font, color: T.text, background: T.card, cursor: "pointer",
            }}>
              <option value="15min">15 minutes</option>
              <option value="30min">30 minutes</option>
              <option value="1hr">1 hour</option>
              <option value="4hr">4 hours</option>
            </select>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 10 }}>Login History</div>
            <div style={{ overflowX: "auto", borderRadius: 10, border: `1px solid ${T.borderLight}` }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: T.bg }}>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Device</th>
                    <th style={thStyle}>IP</th>
                    <th style={thStyle}>Location</th>
                  </tr>
                </thead>
                <tbody>
                  {LOGIN_HISTORY.map((row, i) => (
                    <tr key={i}>
                      <td style={tdStyle}>{row.date}</td>
                      <td style={tdStyle}>{row.device}</td>
                      <td style={{ ...tdStyle, fontFamily: "monospace", fontSize: 12 }}>{row.ip}</td>
                      <td style={tdStyle}>{row.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {/* ── Integrations ── */}
        <Card>
          <SectionHeader icon={Ico.zap(20)} title="Integrations" />
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {INTEGRATIONS.map((integ, i) => (
              <div key={integ.name} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0",
                borderBottom: i < INTEGRATIONS.length - 1 ? `1px solid ${T.borderLight}` : "none",
              }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{integ.name}</span>
                <Badge
                  text={integ.connected ? "Connected" : "Not Connected"}
                  color={integ.connected ? T.success : T.textMuted}
                  bg={integ.connected ? T.successBg : T.bg}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* ── Data & Privacy ── */}
        <Card>
          <SectionHeader icon={Ico.lock(20)} title="Data & Privacy" />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Export My Data</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Download a copy of all your personal data</div>
            </div>
            <Btn small icon="download">Export</Btn>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>Cookie Preferences</div>
              <div style={{ fontSize: 11, color: T.textMuted, marginTop: 2 }}>Manage cookie consent settings</div>
            </div>
            <Btn small icon="settings">Manage</Btn>
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "14px 16px", marginTop: 10, borderRadius: 10,
            background: T.dangerBg, border: `1px solid ${T.dangerBorder}`,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.danger }}>Delete Account</div>
              <div style={{ fontSize: 11, color: T.danger, opacity: 0.8, marginTop: 2 }}>Permanently delete your account and all data</div>
            </div>
            {!deleteConfirm ? (
              <Btn small danger onClick={() => setDeleteConfirm(true)}>Delete Account</Btn>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Btn small ghost onClick={() => setDeleteConfirm(false)}>Cancel</Btn>
                <Btn small danger>Confirm Delete</Btn>
              </div>
            )}
          </div>
        </Card>

        {/* ── About ── */}
        <Card>
          <SectionHeader icon={Ico.shield(20)} title="About" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Platform",          value: "Nova Platform v2.1.0" },
              { label: "Organisation",      value: "Afin Bank Ltd" },
              { label: "FCA Registration",  value: "FRN 123456" },
              { label: "Support",           value: "support@afinbank.co.uk" },
            ].map(row => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.textMuted }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{row.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ height: 40 }} />
    </div>
  );
}

export default SettingsScreen;
