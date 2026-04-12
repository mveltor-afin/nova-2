import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

// ─────────────────────────────────────────────
// PRE-BUILT THEMES
// ─────────────────────────────────────────────
const THEMES = [
  { name: "Afin Default", primary: "#1A4A54", primaryDark: "#0F2A30", accent: "#31B897", success: "#059669", warning: "#F59E0B", danger: "#DC2626" },
  { name: "Corporate Blue", primary: "#1E40AF", primaryDark: "#1E3A5F", accent: "#3B82F6", success: "#059669", warning: "#F59E0B", danger: "#DC2626" },
  { name: "Fintech Purple", primary: "#7C3AED", primaryDark: "#5B21B6", accent: "#A78BFA", success: "#059669", warning: "#F59E0B", danger: "#DC2626" },
  { name: "Classic Red", primary: "#DC2626", primaryDark: "#991B1B", accent: "#F87171", success: "#059669", warning: "#F59E0B", danger: "#DC2626" },
];

const FONT_OPTIONS = ["Inter", "Helvetica", "SF Pro", "Roboto", "System"];
const SHADOW_OPTIONS = ["None", "Subtle", "Medium", "Dramatic"];
const SIDEBAR_OPTIONS = ["Dark", "Light", "Branded"];

const SHADOW_MAP = {
  None: "none",
  Subtle: "0 1px 3px rgba(0,0,0,0.08)",
  Medium: "0 4px 12px rgba(0,0,0,0.12)",
  Dramatic: "0 8px 30px rgba(0,0,0,0.2)",
};

// ─────────────────────────────────────────────
// COLOUR ROW
// ─────────────────────────────────────────────
const ColourRow = ({ label, value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, width: 100, flexShrink: 0 }}>{label}</span>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: value, border: `1px solid ${T.border}`, flexShrink: 0 }} />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        flex: 1, padding: "7px 10px", borderRadius: 8, border: `1px solid ${T.border}`,
        fontSize: 12, fontFamily: "monospace", color: T.text, background: T.card, outline: "none",
      }}
    />
    <input
      type="color"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ width: 32, height: 32, border: "none", padding: 0, cursor: "pointer", background: "transparent", borderRadius: 6 }}
    />
  </div>
);

// ─────────────────────────────────────────────
// FIELD HELPERS
// ─────────────────────────────────────────────
const FieldLabel = ({ children }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>{children}</label>
);

const TextInput = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 14 }}>
    <FieldLabel>{label}</FieldLabel>
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${T.border}`,
        fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
      }}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    <FieldLabel>{label}</FieldLabel>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${T.border}`,
        fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none",
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
const SectionTitle = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
    <span style={{ color: T.primary }}>{icon}</span>
    <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{title}</span>
  </div>
);

// ─────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────
const DEFAULTS = {
  bankName: "Afin Bank",
  logoUrl: "\u2014",
  tagline: "Intelligent Lending",
  favicon: "",
  primary: "#1A4A54",
  primaryDark: "#0F2A30",
  accent: "#31B897",
  success: "#059669",
  warning: "#F59E0B",
  danger: "#DC2626",
  fontFamily: "Inter",
  baseFontSize: 14,
  borderRadius: 12,
  cardShadow: "Subtle",
  sidebarStyle: "Dark",
};

// ─────────────────────────────────────────────
// LIVE PREVIEW
// ─────────────────────────────────────────────
const LivePreview = ({ cfg }) => {
  const shadow = SHADOW_MAP[cfg.cardShadow] || "none";
  const radius = cfg.borderRadius;
  const sidebarBg = cfg.sidebarStyle === "Light" ? "#F8F9FA" : cfg.sidebarStyle === "Branded" ? cfg.accent : cfg.primaryDark;
  const sidebarText = cfg.sidebarStyle === "Light" ? cfg.primary : "#fff";

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden", background: "#F5F3EE", minHeight: 520 }}>
      {/* Preview label */}
      <div style={{ padding: "8px 14px", background: T.bg, borderBottom: `1px solid ${T.border}`, fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: 0.5, textTransform: "uppercase" }}>
        Live Preview
      </div>

      <div style={{ display: "flex", height: 490 }}>
        {/* Mini sidebar */}
        <div style={{ width: 60, background: sidebarBg, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 16, gap: 14 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: cfg.accent, opacity: 0.9 }} />
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: 6, background: sidebarText, opacity: i === 0 ? 0.9 : 0.3 }} />
          ))}
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Mini header */}
          <div style={{ padding: "10px 16px", background: "#fff", borderBottom: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: cfg.primary, fontFamily: cfg.fontFamily + ", sans-serif" }}>{cfg.bankName}</span>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: cfg.accent }} />
          </div>

          <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
            {/* KPI cards row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[
                { label: "PIPELINE", value: "\u00A3142M", colour: cfg.primary },
                { label: "APPROVED", value: "84", colour: cfg.accent },
                { label: "COMPLETION", value: "92%", colour: cfg.success },
              ].map((k, i) => (
                <div key={i} style={{
                  flex: 1, padding: "10px 10px 8px", background: "#fff", borderRadius: radius,
                  boxShadow: shadow, position: "relative", overflow: "hidden",
                }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: k.colour }} />
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#8B95A5", letterSpacing: 0.4, textTransform: "uppercase", marginBottom: 4 }}>{k.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: cfg.primaryDark }}>{k.value}</div>
                </div>
              ))}
            </div>

            {/* Mini table */}
            <div style={{ background: "#fff", borderRadius: radius, boxShadow: shadow, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ display: "flex", padding: "8px 10px", background: cfg.primary, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 0.3 }}>
                <span style={{ flex: 2 }}>CASE</span>
                <span style={{ flex: 2 }}>APPLICANT</span>
                <span style={{ flex: 1, textAlign: "right" }}>STATUS</span>
              </div>
              {[
                { id: "NV-1042", name: "J. Thompson", status: "Approved", statusBg: cfg.success },
                { id: "NV-1043", name: "S. Patel", status: "In Review", statusBg: cfg.accent },
                { id: "NV-1044", name: "M. Williams", status: "Declined", statusBg: cfg.danger },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", padding: "7px 10px", borderTop: `1px solid ${T.borderLight}`, fontSize: 10, color: T.text, alignItems: "center" }}>
                  <span style={{ flex: 2, fontWeight: 600 }}>{r.id}</span>
                  <span style={{ flex: 2 }}>{r.name}</span>
                  <span style={{ flex: 1, textAlign: "right" }}>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 4, background: r.statusBg + "22", color: r.statusBg }}>{r.status}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Button row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <div style={{
                padding: "6px 14px", borderRadius: radius, fontSize: 10, fontWeight: 700, color: "#fff", cursor: "default",
                background: `linear-gradient(135deg, ${cfg.primary}, ${cfg.primaryDark})`,
                boxShadow: `0 2px 8px ${cfg.primary}33`,
              }}>
                Submit Application
              </div>
              <div style={{
                padding: "6px 14px", borderRadius: radius, fontSize: 10, fontWeight: 700, color: cfg.primary, cursor: "default",
                border: `1px solid ${cfg.primary}44`, background: "transparent",
              }}>
                Save Draft
              </div>
            </div>

            {/* Warning alert */}
            <div style={{
              padding: "8px 12px", borderRadius: radius, marginBottom: 10,
              background: cfg.warning + "18", border: `1px solid ${cfg.warning}44`,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: cfg.warning, flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: T.text, fontWeight: 500 }}>Income verification pending for 3 cases</span>
            </div>

            {/* Success badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                background: cfg.success + "22", color: cfg.success,
              }}>
                All checks passed
              </span>
              <span style={{
                fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                background: cfg.accent + "22", color: cfg.accent,
              }}>
                DIP Approved
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// THEME EDITOR
// ─────────────────────────────────────────────
export default function ThemeEditor() {
  const [bankName, setBankName] = useState(DEFAULTS.bankName);
  const [logoUrl, setLogoUrl] = useState(DEFAULTS.logoUrl);
  const [tagline, setTagline] = useState(DEFAULTS.tagline);
  const [favicon, setFavicon] = useState(DEFAULTS.favicon);

  const [primary, setPrimary] = useState(DEFAULTS.primary);
  const [primaryDark, setPrimaryDark] = useState(DEFAULTS.primaryDark);
  const [accent, setAccent] = useState(DEFAULTS.accent);
  const [success, setSuccess] = useState(DEFAULTS.success);
  const [warning, setWarning] = useState(DEFAULTS.warning);
  const [danger, setDanger] = useState(DEFAULTS.danger);

  const [fontFamily, setFontFamily] = useState(DEFAULTS.fontFamily);
  const [baseFontSize, setBaseFontSize] = useState(DEFAULTS.baseFontSize);
  const [borderRadius, setBorderRadius] = useState(DEFAULTS.borderRadius);
  const [cardShadow, setCardShadow] = useState(DEFAULTS.cardShadow);
  const [sidebarStyle, setSidebarStyle] = useState(DEFAULTS.sidebarStyle);

  const resetDefaults = () => {
    setBankName(DEFAULTS.bankName); setLogoUrl(DEFAULTS.logoUrl);
    setTagline(DEFAULTS.tagline); setFavicon(DEFAULTS.favicon);
    setPrimary(DEFAULTS.primary); setPrimaryDark(DEFAULTS.primaryDark);
    setAccent(DEFAULTS.accent); setSuccess(DEFAULTS.success);
    setWarning(DEFAULTS.warning); setDanger(DEFAULTS.danger);
    setFontFamily(DEFAULTS.fontFamily); setBaseFontSize(DEFAULTS.baseFontSize);
    setBorderRadius(DEFAULTS.borderRadius); setCardShadow(DEFAULTS.cardShadow);
    setSidebarStyle(DEFAULTS.sidebarStyle);
  };

  const applyThemePreset = (theme) => {
    setPrimary(theme.primary); setPrimaryDark(theme.primaryDark);
    setAccent(theme.accent); setSuccess(theme.success);
    setWarning(theme.warning); setDanger(theme.danger);
  };

  const exportJSON = () => {
    const config = {
      brand: { bankName, logoUrl, tagline, favicon },
      colours: { primary, primaryDark, accent, success, warning, danger },
      typography: { fontFamily, baseFontSize, borderRadius, cardShadow, sidebarStyle },
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "nova-theme.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const cfg = { bankName, logoUrl, tagline, favicon, primary, primaryDark, accent, success, warning, danger, fontFamily, baseFontSize, borderRadius, cardShadow, sidebarStyle };

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: "32px 40px", background: T.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          {Ico.sparkle(22)}
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: T.navy }}>White-Label Theme Editor</h1>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, margin: "6px 0 0 32px" }}>
          Customise branding, colours and typography — make Nova yours. Changes preview live.
        </p>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        {/* Left column: Configuration */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Brand Identity */}
          <Card style={{ marginBottom: 20 }}>
            <SectionTitle icon={Ico.shield(18)} title="Brand Identity" />
            <TextInput label="Bank Name" value={bankName} onChange={setBankName} placeholder="Your bank name" />
            <TextInput label="Logo URL" value={logoUrl} onChange={setLogoUrl} placeholder="https://..." />
            <TextInput label="Tagline" value={tagline} onChange={setTagline} placeholder="Your tagline" />
            <TextInput label="Favicon" value={favicon} onChange={setFavicon} placeholder="https://favicon.ico" />
          </Card>

          {/* Colour Palette */}
          <Card style={{ marginBottom: 20 }}>
            <SectionTitle icon={Ico.sparkle(18)} title="Colour Palette" />
            <ColourRow label="Primary" value={primary} onChange={setPrimary} />
            <ColourRow label="Primary Dark" value={primaryDark} onChange={setPrimaryDark} />
            <ColourRow label="Accent" value={accent} onChange={setAccent} />
            <ColourRow label="Success" value={success} onChange={setSuccess} />
            <ColourRow label="Warning" value={warning} onChange={setWarning} />
            <ColourRow label="Danger" value={danger} onChange={setDanger} />
          </Card>

          {/* Typography & Layout */}
          <Card style={{ marginBottom: 20 }}>
            <SectionTitle icon={Ico.settings(18)} title="Typography & Layout" />
            <SelectField label="Font Family" value={fontFamily} onChange={setFontFamily} options={FONT_OPTIONS} />
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Base Font Size</FieldLabel>
              <input
                type="number"
                value={baseFontSize}
                onChange={e => setBaseFontSize(Number(e.target.value))}
                min={10} max={20}
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 9, border: `1px solid ${T.border}`,
                  fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Border Radius ({borderRadius}px)</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, color: T.textMuted }}>0</span>
                <input
                  type="range"
                  min={0} max={20} value={borderRadius}
                  onChange={e => setBorderRadius(Number(e.target.value))}
                  style={{ flex: 1, accentColor: T.primary }}
                />
                <span style={{ fontSize: 11, color: T.textMuted }}>20</span>
              </div>
            </div>
            <SelectField label="Card Shadow" value={cardShadow} onChange={setCardShadow} options={SHADOW_OPTIONS} />
            <SelectField label="Sidebar Style" value={sidebarStyle} onChange={setSidebarStyle} options={SIDEBAR_OPTIONS} />
          </Card>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Btn ghost onClick={resetDefaults}>Reset to Default</Btn>
            <Btn onClick={exportJSON} icon="download">Export JSON</Btn>
            <Btn primary onClick={() => alert("Theme applied successfully!")}>Apply Theme</Btn>
          </div>
        </div>

        {/* Right column: Live Preview */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <LivePreview cfg={cfg} />
        </div>
      </div>

      {/* Pre-built Themes */}
      <div style={{ marginTop: 32 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 14 }}>Pre-built Themes</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {THEMES.map((theme) => {
            const isActive = primary === theme.primary && primaryDark === theme.primaryDark && accent === theme.accent;
            return (
              <Card
                key={theme.name}
                style={{
                  flex: "1 1 200px", maxWidth: 260, cursor: "pointer", transition: "all 0.15s",
                  border: isActive ? `2px solid ${theme.primary}` : `1px solid ${T.border}`,
                  boxShadow: isActive ? `0 0 0 3px ${theme.primary}22` : "none",
                }}
              >
                <div onClick={() => applyThemePreset(theme)}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.primary }} />
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.primaryDark }} />
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: theme.accent }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>{theme.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "monospace" }}>
                    {theme.primary} / {theme.accent}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
