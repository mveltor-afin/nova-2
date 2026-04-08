import React from 'react';
import { T, Ico } from './tokens';

export const Btn = ({ children, primary, small, danger, ghost, disabled, onClick, icon, iconNode, style: sx }) => (
  <button disabled={disabled} onClick={onClick} style={{
    display: "inline-flex", alignItems: "center", gap: 7,
    padding: small ? "7px 14px" : "9px 20px",
    borderRadius: 9, fontFamily: T.font,
    border: primary || danger ? "none" : ghost ? "none" : `1px solid ${T.border}`,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
    background: danger ? T.danger : primary ? `linear-gradient(135deg,${T.primary},${T.primaryDark})` : ghost ? "transparent" : T.card,
    color: primary || danger ? "#fff" : ghost ? T.primary : T.text,
    fontSize: small ? 12 : 13, fontWeight: 600,
    boxShadow: primary ? `0 2px 10px ${T.primaryGlow}` : "none",
    transition: "all 0.15s", ...sx,
  }}>
    {iconNode}{icon && Ico[icon]?.(small ? 14 : 16)}{children}
  </button>
);

export const Input = ({ label, value, onChange, placeholder, prefix, suffix, type = "text", hint, required, readOnly, confidence, aiSource }) => (
  <div style={{ marginBottom: 16 }}>
    {label && (
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>
        {label}{required && <span style={{ color: T.danger }}>*</span>}
        {confidence != null && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4, marginLeft: "auto",
            background: confidence > 90 ? T.successBg : confidence > 70 ? T.warningBg : T.dangerBg,
            color: confidence > 90 ? T.success : confidence > 70 ? T.warning : T.danger }}>
            AI {confidence}%
          </span>
        )}
      </label>
    )}
    <div style={{ display: "flex", alignItems: "center", borderRadius: 9, border: `1px solid ${T.border}`, background: readOnly ? "#F8FAFC" : T.card, overflow: "hidden" }}>
      {prefix && <span style={{ padding: "0 0 0 12px", fontSize: 13, color: T.textMuted }}>{prefix}</span>}
      <input type={type} value={value || ""} onChange={e => onChange?.(e.target.value)} placeholder={placeholder} readOnly={readOnly}
        style={{ flex: 1, padding: "10px 12px", border: "none", outline: "none", fontSize: 13, fontFamily: T.font, background: "transparent", color: T.text }} />
      {suffix && <span style={{ padding: "0 12px 0 0", fontSize: 12, color: T.textMuted }}>{suffix}</span>}
    </div>
    {aiSource && <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>Source: {aiSource}</div>}
    {hint && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 3 }}>{hint}</div>}
  </div>
);

export const Select = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>{label}{required && <span style={{ color: T.danger }}>*</span>}</label>}
    <select value={value || ""} onChange={e => onChange?.(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 9, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font, color: T.text, background: T.card, outline: "none" }}>
      {options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
    </select>
  </div>
);

export const Card = ({ children, style: sx, noPad }) => (
  <div style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: noPad ? 0 : 24, ...sx }}>{children}</div>
);

export const SectionLabel = ({ icon, text, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 700, color: T.text }}>{icon}{text}</div>
    {sub && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4, marginLeft: 26 }}>{sub}</div>}
  </div>
);

export const KPICard = ({ label, value, sub, color, onClick }) => (
  <div onClick={onClick} style={{ background: T.card, borderRadius: 12, padding: "18px 20px", flex: 1, minWidth: 160, border: `1px solid ${T.border}`, position: "relative", overflow: "hidden", cursor: onClick ? "pointer" : "default" }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color }} />
    <div style={{ fontSize: 11, color: "#8B95A5", fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
    <div style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: -0.5 }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>{sub}</div>}
  </div>
);
