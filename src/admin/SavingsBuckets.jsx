import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────
function loadBuckets() {
  try {
    const s = localStorage.getItem("savings_buckets");
    return s ? JSON.parse(s) : DEFAULT_BUCKETS;
  } catch { return DEFAULT_BUCKETS; }
}
function saveBuckets(b) {
  try { localStorage.setItem("savings_buckets", JSON.stringify(b)); } catch {}
}

// ─────────────────────────────────────────────
// DEPOSIT BANDS & TERMS
// ─────────────────────────────────────────────
const ALL_DEPOSIT_BANDS = ["£1k–£9.9k", "£10k–£49.9k", "£50k–£249.9k", "£250k+"];
const ALL_TERMS = ["Instant Access", "30-Day Notice", "90-Day Notice", "120-Day Notice", "1 Year Fixed", "2 Year Fixed", "3 Year Fixed", "5 Year Fixed"];
const INTEREST_FREQ = ["Monthly", "Annually", "At Maturity"];
const WRAPPER_TYPES = ["None", "Cash ISA", "Stocks & Shares ISA", "LISA"];

// ─────────────────────────────────────────────
// DEFAULT BUCKETS
// ─────────────────────────────────────────────
const DEFAULT_BUCKETS = [
  {
    name: "Fixed Term Deposits",
    color: "#059669",
    desc: "Fixed rate for a set term · Higher rates for longer terms · No withdrawals until maturity",
    minDeposit: "£1,000",
    maxBalance: "£1,000,000",
    fscsProtected: true,
    interestPayment: "At Maturity",
    withdrawalRules: "No withdrawals before maturity. Early closure penalty: 90 days interest.",
    tiers: [
      { name: "Standard", conditions: { wrapper: ["None"] }, adjustmentType: "flat", flatAdj: 0.00 },
      { name: "ISA Wrapper", conditions: { wrapper: ["Cash ISA"] }, adjustmentType: "flat", flatAdj: -0.10 },
      { name: "Loyalty Bonus", conditions: { loyalty: ["Existing", "Multi-Product"] }, adjustmentType: "flat", flatAdj: 0.15 },
    ],
    products: [
      { term: "1 Year Fixed", code: "FTD1", rates: { "£1k–£9.9k": 4.25, "£10k–£49.9k": 4.50, "£50k–£249.9k": 4.65, "£250k+": 4.80 } },
      { term: "2 Year Fixed", code: "FTD2", rates: { "£1k–£9.9k": 4.60, "£10k–£49.9k": 4.85, "£50k–£249.9k": 5.00, "£250k+": 5.15 } },
      { term: "3 Year Fixed", code: "FTD3", rates: { "£1k–£9.9k": 4.85, "£10k–£49.9k": 5.10, "£50k–£249.9k": 5.25, "£250k+": 5.40 } },
      { term: "5 Year Fixed", code: "FTD5", rates: { "£1k–£9.9k": 5.00, "£10k–£49.9k": 5.25, "£50k–£249.9k": 5.40, "£250k+": 5.55 } },
    ],
  },
  {
    name: "Notice Accounts",
    color: "#3B82F6",
    desc: "Variable rate · Give notice to withdraw · Better rates than easy access",
    minDeposit: "£1,000",
    maxBalance: "£500,000",
    fscsProtected: true,
    interestPayment: "Monthly",
    withdrawalRules: "Give required notice period before withdrawal. Instant access incurs penalty.",
    tiers: [
      { name: "Standard", conditions: {}, adjustmentType: "flat", flatAdj: 0.00 },
      { name: "Loyalty", conditions: { loyalty: ["Existing"] }, adjustmentType: "flat", flatAdj: 0.10 },
    ],
    products: [
      { term: "30-Day Notice", code: "NA30", rates: { "£1k–£9.9k": 2.95, "£10k–£49.9k": 3.20, "£50k–£249.9k": 3.45, "£250k+": 3.60 } },
      { term: "90-Day Notice", code: "NA90", rates: { "£1k–£9.9k": 3.40, "£10k–£49.9k": 3.65, "£50k–£249.9k": 3.90, "£250k+": 4.05 } },
      { term: "120-Day Notice", code: "N120", rates: { "£1k–£9.9k": 3.75, "£10k–£49.9k": 4.00, "£50k–£249.9k": 4.25, "£250k+": 4.40 } },
    ],
  },
  {
    name: "Easy Access",
    color: "#F59E0B",
    desc: "Instant withdrawals · Variable rate · No penalties · Unlimited transactions",
    minDeposit: "£1",
    maxBalance: "£250,000",
    fscsProtected: true,
    interestPayment: "Monthly",
    withdrawalRules: "Unlimited instant withdrawals. No penalties.",
    tiers: [
      { name: "Standard", conditions: {}, adjustmentType: "flat", flatAdj: 0.00 },
      { name: "Premier", conditions: { loyalty: ["Premier"] }, adjustmentType: "flat", flatAdj: 0.25 },
    ],
    products: [
      { term: "Instant Access", code: "EA01", rates: { "£1k–£9.9k": 1.50, "£10k–£49.9k": 1.75, "£50k–£249.9k": 2.00, "£250k+": 2.15 } },
    ],
  },
  {
    name: "ISA Products",
    color: "#8B5CF6",
    desc: "Tax-free savings · £20,000 annual allowance · Cash ISA & LISA",
    minDeposit: "£1",
    maxBalance: "£20,000 per year",
    fscsProtected: true,
    interestPayment: "Annually",
    withdrawalRules: "Flexible ISA: withdraw and replace within same tax year. LISA: 25% penalty on early withdrawal (except first home or age 60+).",
    tiers: [
      { name: "Cash ISA", conditions: { wrapper: ["Cash ISA"] }, adjustmentType: "flat", flatAdj: 0.00 },
      { name: "LISA", conditions: { wrapper: ["LISA"] }, adjustmentType: "flat", flatAdj: -0.20 },
    ],
    products: [
      { term: "1 Year Fixed ISA", code: "ISA1", rates: { "£1k–£9.9k": 4.10, "£10k–£49.9k": 4.10, "£50k–£249.9k": 4.10, "£250k+": 4.10 } },
      { term: "2 Year Fixed ISA", code: "ISA2", rates: { "£1k–£9.9k": 4.45, "£10k–£49.9k": 4.45, "£50k–£249.9k": 4.45, "£250k+": 4.45 } },
      { term: "Easy Access ISA", code: "ISAE", rates: { "£1k–£9.9k": 3.25, "£10k–£49.9k": 3.25, "£50k–£249.9k": 3.25, "£250k+": 3.25 } },
      { term: "LISA (18-39 only)", code: "LISA", rates: { "£1k–£9.9k": 3.90, "£10k–£49.9k": 3.90, "£50k–£249.9k": 3.90, "£250k+": 3.90 } },
    ],
  },
  {
    name: "Business Savings",
    color: "#0EA5E9",
    desc: "For Ltd companies, sole traders & partnerships · Higher deposit bands · Dedicated relationship manager",
    minDeposit: "£10,000",
    maxBalance: "£5,000,000",
    fscsProtected: true,
    interestPayment: "Monthly",
    withdrawalRules: "Notice period applies. Bespoke terms for £500k+.",
    tiers: [
      { name: "Standard", conditions: {}, adjustmentType: "flat", flatAdj: 0.00 },
      { name: "Corporate", conditions: { loyalty: ["Multi-Product"] }, adjustmentType: "flat", flatAdj: 0.20 },
    ],
    products: [
      { term: "90-Day Notice", code: "BN90", rates: { "£1k–£9.9k": 3.10, "£10k–£49.9k": 3.40, "£50k–£249.9k": 3.70, "£250k+": 4.00 } },
      { term: "1 Year Fixed", code: "BF01", rates: { "£1k–£9.9k": 4.00, "£10k–£49.9k": 4.30, "£50k–£249.9k": 4.60, "£250k+": 4.90 } },
      { term: "2 Year Fixed", code: "BF02", rates: { "£1k–£9.9k": 4.35, "£10k–£49.9k": 4.65, "£50k–£249.9k": 4.95, "£250k+": 5.25 } },
    ],
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const rateColor = (r) => {
  if (r == null) return "#CBD5E1";
  if (r >= 5.0) return "#059669";
  if (r >= 3.5) return "#D97706";
  return "#DC2626";
};

const TIER_COLORS = ["#059669", "#8B5CF6", "#F59E0B", "#E03A3A", "#0EA5E9"];

const COLOUR_PRESETS = [
  { label: "Green", value: "#059669" },
  { label: "Teal", value: "#31B897" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Red", value: "#DC2626" },
  { label: "Sky", value: "#0EA5E9" },
];

function emptySavingsProduct() {
  const rates = {};
  ALL_DEPOSIT_BANDS.forEach(b => { rates[b] = ""; });
  return { term: "", code: "", rates };
}

function emptySavingsBucket() {
  return {
    name: "",
    color: "#059669",
    desc: "",
    minDeposit: "",
    maxBalance: "",
    fscsProtected: true,
    interestPayment: "Monthly",
    withdrawalRules: "",
    tiers: [],
    products: [],
  };
}

// ─────────────────────────────────────────────
// SAVINGS BUCKET FORM MODAL
// ─────────────────────────────────────────────
function SavingsBucketFormModal({ bucket, onSave, onCancel }) {
  const [form, setForm] = useState(() => {
    if (!bucket) return emptySavingsBucket();
    return JSON.parse(JSON.stringify(bucket));
  });

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const labelSt = { display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 };
  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const sectionTitleSt = {
    fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12, marginTop: 24,
    paddingBottom: 6, borderBottom: `2px solid ${T.borderLight}`,
  };
  const row2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
  const fieldWrap = { marginBottom: 12 };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div
        style={{ width: 640, maxHeight: "90vh", overflow: "auto", background: T.card, borderRadius: 16, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: T.font }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 4 }}>
          {bucket ? "Edit Savings Bucket" : "Create Savings Bucket"}
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 8 }}>
          {bucket ? "Modify the savings bucket configuration below." : "Fill in the details for the new savings bucket."}
        </div>

        {/* SECTION 1: IDENTITY */}
        <div style={sectionTitleSt}>1. Identity</div>
        <div style={fieldWrap}>
          <label style={labelSt}>Name</label>
          <input style={inputSt} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Fixed Term Deposits" />
        </div>
        <div style={{ ...row2, marginBottom: 12 }}>
          <div>
            <label style={labelSt}>Colour</label>
            <select style={inputSt} value={form.color} onChange={(e) => set("color", e.target.value)}>
              {COLOUR_PRESETS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>Preview</label>
            <div style={{ height: 36, borderRadius: 7, background: form.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
              {form.name || "Bucket"}
            </div>
          </div>
        </div>
        <div style={fieldWrap}>
          <label style={labelSt}>Description</label>
          <input style={inputSt} value={form.desc} onChange={(e) => set("desc", e.target.value)} placeholder="Short description of this bucket" />
        </div>

        {/* SECTION 2: ACCOUNT DETAILS */}
        <div style={sectionTitleSt}>2. Account Details</div>
        <div style={row2}>
          <div style={fieldWrap}>
            <label style={labelSt}>Minimum Deposit</label>
            <input style={inputSt} value={form.minDeposit} onChange={(e) => set("minDeposit", e.target.value)} placeholder="£1,000" />
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>Maximum Balance</label>
            <input style={inputSt} value={form.maxBalance} onChange={(e) => set("maxBalance", e.target.value)} placeholder="£1,000,000" />
          </div>
        </div>
        <div style={row2}>
          <div style={fieldWrap}>
            <label style={labelSt}>Interest Payment Frequency</label>
            <select style={inputSt} value={form.interestPayment} onChange={(e) => set("interestPayment", e.target.value)}>
              {INTEREST_FREQ.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={fieldWrap}>
            <label style={labelSt}>FSCS Protected</label>
            <select style={inputSt} value={form.fscsProtected ? "yes" : "no"} onChange={(e) => set("fscsProtected", e.target.value === "yes")}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
        <div style={fieldWrap}>
          <label style={labelSt}>Withdrawal Rules</label>
          <textarea
            style={{ ...inputSt, minHeight: 60, resize: "vertical" }}
            value={form.withdrawalRules}
            onChange={(e) => set("withdrawalRules", e.target.value)}
            placeholder="Describe withdrawal conditions and penalties..."
          />
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 28, paddingTop: 16, borderTop: `1px solid ${T.borderLight}` }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={() => onSave(form)} disabled={!form.name.trim()}>
            {bucket ? "Save Changes" : "Create Bucket"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DELETE CONFIRMATION DIALOG
// ─────────────────────────────────────────────
function SavingsDeleteConfirmDialog({ bucketName, onConfirm, onCancel }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }}
      onClick={onCancel}
    >
      <div
        style={{ width: 420, background: T.card, borderRadius: 14, padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: T.font, textAlign: "center" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ width: 48, height: 48, borderRadius: 24, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16", color: T.danger }}>
          {Ico.alert(24)}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.navy, marginBottom: 8 }}>
          Delete Savings Bucket
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 24, lineHeight: 1.5 }}>
          Are you sure you want to delete <strong style={{ color: T.text }}>{bucketName}</strong>? This will remove all products and rate configurations. This action cannot be undone.
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn danger onClick={onConfirm}>Delete Bucket</Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SAVINGS PRODUCTS EDIT TAB
// ─────────────────────────────────────────────
function SavingsProductsTab({ bucket, onUpdateProducts }) {
  const [products, setProducts] = useState(bucket.products || []);

  const commit = (next) => { setProducts(next); onUpdateProducts(next); };

  const updateProduct = (idx, field, val) => {
    commit(products.map((p, i) => i === idx ? { ...p, [field]: val } : p));
  };

  const updateRate = (idx, band, val) => {
    const next = products.map((p, i) => {
      if (i !== idx) return p;
      const rates = { ...(p.rates || {}) };
      const v = parseFloat(val);
      if (isNaN(v) || val === "") { delete rates[band]; } else { rates[band] = v; }
      return { ...p, rates };
    });
    commit(next);
  };

  const addProduct = () => commit([...products, emptySavingsProduct()]);
  const removeProduct = (idx) => commit(products.filter((_, i) => i !== idx));

  const inputSt = {
    padding: "7px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const labelSt = { fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, padding: "8px 6px" };
  const rateInputSt = {
    width: 68, padding: "6px 4px", borderRadius: 6, textAlign: "center",
    border: `1px solid ${T.border}`, fontSize: 12, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none",
  };

  return (
    <div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
        Edit product rates per deposit band. Empty cells mean the product is not offered at that band.
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              <th style={labelSt}>Term / Product</th>
              <th style={labelSt}>Code</th>
              {ALL_DEPOSIT_BANDS.map(b => <th key={b} style={{ ...labelSt, textAlign: "center" }}>{b}</th>)}
              <th style={{ width: 32 }} />
            </tr>
          </thead>
          <tbody>
            {products.map((prod, idx) => (
              <tr key={idx} style={{ borderBottom: `1px solid ${T.borderLight}`, background: idx % 2 === 0 ? "#FAFAF8" : "#FFF" }}>
                <td style={{ padding: "6px" }}>
                  <select
                    style={{ ...inputSt, width: "100%", minWidth: 140 }}
                    value={prod.term}
                    onChange={(e) => updateProduct(idx, "term", e.target.value)}
                  >
                    <option value="">Select term...</option>
                    {ALL_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                    {prod.term && !ALL_TERMS.includes(prod.term) && <option value={prod.term}>{prod.term}</option>}
                  </select>
                </td>
                <td style={{ padding: "6px" }}>
                  <input style={{ ...inputSt, width: 64 }} value={prod.code} onChange={(e) => updateProduct(idx, "code", e.target.value)} placeholder="FTD1" />
                </td>
                {ALL_DEPOSIT_BANDS.map(band => (
                  <td key={band} style={{ padding: "6px", textAlign: "center" }}>
                    <input
                      style={rateInputSt}
                      type="number" step="0.01"
                      value={(prod.rates && prod.rates[band] != null) ? prod.rates[band] : ""}
                      placeholder="--"
                      onChange={(e) => updateRate(idx, band, e.target.value)}
                    />
                  </td>
                ))}
                <td style={{ padding: "6px" }}>
                  <span
                    onClick={() => removeProduct(idx)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 6, cursor: "pointer", color: T.danger, background: "transparent", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {Ico.x(14)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div style={{ padding: "24px 0", textAlign: "center", color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>
          No products configured yet. Add a product to get started.
        </div>
      )}

      <Btn small onClick={addProduct} style={{ marginTop: 8 }}>
        + Add Product
      </Btn>
    </div>
  );
}

// ─────────────────────────────────────────────
// RATES TAB — Term × Deposit Band × Tier rows
// ─────────────────────────────────────────────
function SavingsRatesTab({ bucket }) {
  const products = bucket.products || [];
  const tiers = bucket.tiers || [];

  if (products.length === 0) return <div style={{ fontSize: 12, color: T.textMuted, fontStyle: "italic", padding: "20px 0" }}>No products configured.</div>;

  const allTiers = [{ name: "Base", _isBase: true }, ...tiers];
  const visibleBands = ALL_DEPOSIT_BANDS;

  const getTierAdj = (tier) => {
    if (!tier || tier._isBase) return 0;
    return parseFloat(tier.flatAdj) || 0;
  };

  return (
    <div>
      {/* Info bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {bucket.minDeposit && (
          <div style={{ padding: "6px 12px", borderRadius: 8, background: bucket.color + "0A", border: `1px solid ${bucket.color}20`, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Min Deposit</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{bucket.minDeposit}</span>
          </div>
        )}
        {bucket.maxBalance && (
          <div style={{ padding: "6px 12px", borderRadius: 8, background: "#F1F5F9", border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Max Balance</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{bucket.maxBalance}</span>
          </div>
        )}
        {bucket.interestPayment && (
          <div style={{ padding: "6px 12px", borderRadius: 8, background: "#F1F5F9", border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Interest Paid</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{bucket.interestPayment}</span>
          </div>
        )}
        {bucket.fscsProtected && (
          <div style={{ padding: "6px 12px", borderRadius: 8, background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "#065F46" }}>FSCS Protected</span>
          </div>
        )}
      </div>

      {/* Rate grid */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${T.border}` }}>
              <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", minWidth: 200 }}>Product / Tier</th>
              {visibleBands.map(b => (
                <th key={b} style={{ textAlign: "center", padding: "8px 6px", fontSize: 10, fontWeight: 700, color: T.navy, minWidth: 90 }}>{b}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((prod, pIdx) => (
              allTiers.map((tier, tIdx) => {
                const isBase = tier._isBase;
                const tierColor = isBase ? T.navy : TIER_COLORS[(tIdx - 1) % 5];
                const isLastTier = tIdx === allTiers.length - 1;
                const adj = getTierAdj(tier);

                return (
                  <tr key={`${pIdx}-${tIdx}`} style={{
                    borderBottom: isLastTier ? `2px solid ${T.border}` : `1px solid ${T.borderLight}`,
                    background: isBase ? "#FAFAF8" : "#FFF",
                  }}>
                    <td style={{ padding: isBase ? "10px 10px" : "6px 10px 6px 22px" }}>
                      {isBase ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{prod.term}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: "#F1F5F9", color: T.textMuted }}>BASE</span>
                          {prod.code && <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>{prod.code}</span>}
                        </div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ width: 3, height: 18, borderRadius: 2, background: tierColor, flexShrink: 0 }} />
                          <span style={{ fontWeight: 600, fontSize: 12, color: tierColor }}>{tier.name}</span>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: tierColor + "14", color: tierColor }}>T{tIdx}</span>
                          {adj !== 0 && <span style={{ fontSize: 9, color: T.textMuted }}>({adj >= 0 ? "+" : ""}{adj.toFixed(2)}%)</span>}
                        </div>
                      )}
                    </td>
                    {visibleBands.map(band => {
                      const baseRate = prod.rates?.[band];
                      if (baseRate == null) return <td key={band} style={{ textAlign: "center", padding: "7px 6px", color: "#CBD5E1" }}>—</td>;
                      const finalRate = Math.round((baseRate + (isBase ? 0 : adj)) * 100) / 100;
                      return (
                        <td key={band} style={{ textAlign: "center", padding: "7px 6px" }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: rateColor(finalRate) }}>{finalRate.toFixed(2)}%</span>
                          {!isBase && adj !== 0 && <div style={{ fontSize: 8, color: adj > 0 ? "#059669" : "#B07A00", fontWeight: 600 }}>{adj >= 0 ? "+" : ""}{adj.toFixed(2)}%</div>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 14, paddingTop: 10, borderTop: `1px solid ${T.borderLight}`, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#059669" }} /> {"≥ 5.00% AER"}
        </span>
        <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#D97706" }} /> 3.50% – 4.99%
        </span>
        <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: 4, background: "#DC2626" }} /> {"< 3.50%"}
        </span>
        <span style={{ fontSize: 10, color: T.textMuted, marginLeft: "auto" }}>
          All rates are AER (gross)
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CRITERIA TAB
// ─────────────────────────────────────────────
function SavingsCriteriaTab({ bucket }) {
  const sectionHeaderSt = {
    padding: "8px 14px", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: 1, color: bucket.color, background: bucket.color + "14",
    borderBottom: `1px solid ${T.borderLight}`,
  };
  const rowSt = (i) => ({
    display: "flex", borderBottom: `1px solid ${T.borderLight}`,
    background: i % 2 === 0 ? "#FAFAF8" : "#FFFFFF",
  });
  const labelCellSt = { width: "40%", padding: "9px 14px", fontSize: 12, fontWeight: 600, color: T.navy };
  const valueCellSt = { width: "60%", padding: "9px 14px", fontSize: 12, color: T.text };
  let rowIdx = 0;
  const Row = ({ label, value }) => {
    const i = rowIdx++;
    return <div style={rowSt(i)}><div style={labelCellSt}>{label}</div><div style={valueCellSt}>{value}</div></div>;
  };

  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", fontFamily: T.font }}>
      <div style={sectionHeaderSt}>Account Details</div>
      <Row label="Minimum Deposit" value={bucket.minDeposit} />
      <Row label="Maximum Balance" value={bucket.maxBalance} />
      <Row label="Interest Payment" value={bucket.interestPayment} />
      <Row label="FSCS Protected" value={bucket.fscsProtected ? "Yes — up to £85,000 per person" : "No"} />
      <div style={sectionHeaderSt}>Withdrawal Rules</div>
      <Row label="Withdrawal Policy" value={bucket.withdrawalRules} />
      <div style={sectionHeaderSt}>Eligibility</div>
      <Row label="Residency" value="UK resident, aged 18+" />
      <Row label="Tax Wrapper" value={bucket.name.includes("ISA") ? "ISA: £20,000 annual allowance. LISA: £4,000 annual, 25% gov bonus." : "None — interest subject to Personal Savings Allowance"} />
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function SavingsBuckets() {
  const [buckets, setBuckets] = useState(loadBuckets);
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState("rates");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { saveBuckets(buckets); }, [buckets]);

  const handleSaveNew = (form) => {
    setBuckets(prev => [...prev, form]);
    setShowCreateModal(false);
  };

  const handleSaveEdit = (form) => {
    setBuckets(prev => {
      const next = [...prev];
      next[editingIdx] = form;
      return next;
    });
    setEditingIdx(null);
  };

  const handleDelete = (idx) => {
    setBuckets(prev => prev.filter((_, i) => i !== idx));
    setDeleteConfirm(null);
    if (selected === idx) setSelected(0);
    else if (selected > idx) setSelected(s => s - 1);
  };

  const updateBucketProducts = (products) => {
    setBuckets(prev => {
      const next = [...prev];
      next[selected] = { ...next[selected], products };
      return next;
    });
  };

  const bucket = buckets[selected] || buckets[0];
  const TABS = [
    { id: "rates", label: "Rates" },
    { id: "products", label: "Edit Products" },
    { id: "criteria", label: "Criteria & Rules" },
    { id: "tiers", label: "Tiers" },
  ];

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Create button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Btn primary small onClick={() => setShowCreateModal(true)}>
          + Create Bucket
        </Btn>
      </div>

      {/* Bucket selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {buckets.map((b, i) => (
          <div
            key={i}
            onClick={() => { setSelected(i); setTab("rates"); }}
            style={{
              flex: "1 1 0", minWidth: 160, padding: "14px 16px", borderRadius: 12, cursor: "pointer",
              border: selected === i ? `2px solid ${b.color}` : `1px solid ${T.borderLight}`,
              background: selected === i ? b.color + "08" : T.card,
              transition: "all 0.2s", position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: 5, background: b.color }} />
              <span style={{ fontSize: 14, fontWeight: 700, color: T.navy, flex: 1 }}>{b.name}</span>
              {/* Edit button */}
              <span
                title="Edit bucket"
                onClick={(e) => { e.stopPropagation(); setEditingIdx(i); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 5, cursor: "pointer", color: T.textMuted, background: "transparent", transition: "background 0.15s", flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = T.primaryLight)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {Ico.settings(12)}
              </span>
              {/* Delete button */}
              <span
                title="Delete bucket"
                onClick={(e) => { e.stopPropagation(); setDeleteConfirm(i); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 5, cursor: "pointer", color: T.textMuted, background: "transparent", transition: "background 0.15s", flexShrink: 0 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {Ico.x(12)}
              </span>
            </div>
            <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.4 }}>{b.desc}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 6, background: b.color + "14", color: b.color }}>{b.products.length} products</span>
              <span style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: "#F1F5F9", color: T.textMuted }}>{b.tiers.length} tiers</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div style={{ display: "flex", gap: 0, borderBottom: `2px solid ${T.border}`, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 24px", border: "none", background: "none", cursor: "pointer",
            fontSize: 13, fontWeight: tab === t.id ? 700 : 500, fontFamily: T.font,
            color: tab === t.id ? bucket.color : T.textMuted,
            borderBottom: tab === t.id ? `2.5px solid ${bucket.color}` : "2.5px solid transparent",
            marginBottom: -2, transition: "all 0.15s",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "rates" && <SavingsRatesTab bucket={bucket} />}
      {tab === "products" && (
        <SavingsProductsTab
          bucket={bucket}
          onUpdateProducts={updateBucketProducts}
        />
      )}
      {tab === "criteria" && <SavingsCriteriaTab bucket={bucket} />}
      {tab === "tiers" && (
        <div>
          {bucket.tiers.length === 0 ? (
            <div style={{ padding: "28px 0", textAlign: "center", color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>No tiers configured.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {bucket.tiers.map((tier, tIdx) => {
                const tc = TIER_COLORS[tIdx % 5];
                const condEntries = Object.entries(tier.conditions || {}).filter(([,v]) => v?.length);
                return (
                  <div key={tIdx} style={{ border: `1px solid ${T.borderLight}`, borderRadius: 10, borderLeft: `4px solid ${tc}`, background: T.card, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{tier.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: tier.flatAdj > 0 ? "#D1FAE5" : tier.flatAdj < 0 ? "#FEF3C7" : "#F1F5F9", color: tier.flatAdj > 0 ? "#065F46" : tier.flatAdj < 0 ? "#92400E" : "#475569" }}>
                        {tier.flatAdj >= 0 ? "+" : ""}{Number(tier.flatAdj).toFixed(2)}% AER
                      </span>
                    </div>
                    {condEntries.length > 0 ? (
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {condEntries.map(([dim, vals]) =>
                          vals.map(v => (
                            <span key={`${dim}-${v}`} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: tc + "14", color: tc, border: `1px solid ${tc}30` }}>
                              {dim}: {v}
                            </span>
                          ))
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic" }}>Applies to all accounts</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MODALS ── */}
      {showCreateModal && (
        <SavingsBucketFormModal bucket={null} onSave={handleSaveNew} onCancel={() => setShowCreateModal(false)} />
      )}
      {editingIdx !== null && (
        <SavingsBucketFormModal bucket={buckets[editingIdx]} onSave={handleSaveEdit} onCancel={() => setEditingIdx(null)} />
      )}
      {deleteConfirm !== null && (
        <SavingsDeleteConfirmDialog
          bucketName={buckets[deleteConfirm]?.name}
          onConfirm={() => handleDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
