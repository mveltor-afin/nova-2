import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────
function loadBuckets() {
  try {
    const s = localStorage.getItem("savings_buckets_v2");
    return s ? JSON.parse(s) : DEFAULT_BUCKETS;
  } catch { return DEFAULT_BUCKETS; }
}
function saveBuckets(b) {
  try { localStorage.setItem("savings_buckets_v2", JSON.stringify(b)); } catch {}
}

// ─────────────────────────────────────────────
// COLOUR PRESETS
// ─────────────────────────────────────────────
const COLOUR_PRESETS = [
  { label: "Green", value: "#059669" },
  { label: "Teal", value: "#31B897" },
  { label: "Blue", value: "#3B82F6" },
  { label: "Purple", value: "#8B5CF6" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Sky", value: "#0EA5E9" },
  { label: "Red", value: "#DC2626" },
];

const INTEREST_FREQ = ["Monthly", "Annually", "At Maturity"];

// ─────────────────────────────────────────────
// TIER COLOURS
// ─────────────────────────────────────────────
const TIER_COLORS = ["#059669", "#8B5CF6", "#F59E0B", "#E03A3A", "#0EA5E9"];

// ─────────────────────────────────────────────
// DEFAULT BUCKETS — each bucket is a TERM type
// Products within are different offerings at that term
// ─────────────────────────────────────────────
const DEFAULT_BUCKETS = [
  {
    name: "1 Year Fixed",
    color: "#059669",
    desc: "Fixed rate for 12 months · No withdrawals until maturity",
    depositBands: ["£1k–£200k", "£200k+"],
    minDeposit: "£1,000",
    maxBalance: "£1,000,000",
    fscsProtected: true,
    interestPayment: "At Maturity",
    withdrawalRules: "No withdrawals before maturity. Early closure penalty: 90 days interest.",
    tiers: [
      { name: "Loyalty Bonus", conditions: { loyalty: ["Existing", "Multi-Product"] }, flatAdj: 0.15 },
    ],
    products: [
      { name: "Standard 1yr Fixed", code: "FTD1-S", rates: { "£1k–£200k": 4.50, "£200k+": 4.80 } },
      { name: "ISA 1yr Fixed", code: "FTD1-I", wrapper: "Cash ISA", rates: { "£1k–£200k": 4.10, "£200k+": 4.10 } },
      { name: "Business 1yr Fixed", code: "FTD1-B", eligibility: "Ltd companies, sole traders", rates: { "£1k–£200k": 4.30, "£200k+": 4.90 } },
    ],
  },
  {
    name: "2 Year Fixed",
    color: "#3B82F6",
    desc: "Fixed rate for 24 months · Higher rates for longer commitment",
    depositBands: ["£1k–£200k", "£200k+"],
    minDeposit: "£1,000",
    maxBalance: "£1,000,000",
    fscsProtected: true,
    interestPayment: "Annually",
    withdrawalRules: "No withdrawals before maturity. Early closure penalty: 180 days interest.",
    tiers: [
      { name: "Loyalty Bonus", conditions: { loyalty: ["Existing"] }, flatAdj: 0.15 },
    ],
    products: [
      { name: "Standard 2yr Fixed", code: "FTD2-S", rates: { "£1k–£200k": 4.85, "£200k+": 5.15 } },
      { name: "ISA 2yr Fixed", code: "FTD2-I", wrapper: "Cash ISA", rates: { "£1k–£200k": 4.45, "£200k+": 4.45 } },
      { name: "Business 2yr Fixed", code: "FTD2-B", eligibility: "Ltd companies, sole traders", rates: { "£1k–£200k": 4.65, "£200k+": 5.25 } },
    ],
  },
  {
    name: "3 Year Fixed",
    color: "#8B5CF6",
    desc: "Fixed rate for 36 months · Best fixed rates",
    depositBands: ["£1k–£200k", "£200k+"],
    minDeposit: "£1,000",
    maxBalance: "£1,000,000",
    fscsProtected: true,
    interestPayment: "Annually",
    withdrawalRules: "No withdrawals before maturity. Early closure penalty: 270 days interest.",
    tiers: [],
    products: [
      { name: "Standard 3yr Fixed", code: "FTD3-S", rates: { "£1k–£200k": 5.10, "£200k+": 5.40 } },
      { name: "ISA 3yr Fixed", code: "FTD3-I", wrapper: "Cash ISA", rates: { "£1k–£200k": 4.70, "£200k+": 4.70 } },
    ],
  },
  {
    name: "5 Year Fixed",
    color: "#0EA5E9",
    desc: "Fixed rate for 60 months · Highest fixed rates available",
    depositBands: ["£1k–£200k", "£200k+"],
    minDeposit: "£5,000",
    maxBalance: "£500,000",
    fscsProtected: true,
    interestPayment: "Annually",
    withdrawalRules: "No withdrawals before maturity. Early closure penalty: 365 days interest.",
    tiers: [],
    products: [
      { name: "Standard 5yr Fixed", code: "FTD5-S", rates: { "£1k–£200k": 5.25, "£200k+": 5.55 } },
    ],
  },
  {
    name: "90-Day Notice",
    color: "#F59E0B",
    desc: "Variable rate · 90 days notice to withdraw",
    depositBands: ["£1k–£50k", "£50k–£200k", "£200k+"],
    minDeposit: "£1,000",
    maxBalance: "£500,000",
    fscsProtected: true,
    interestPayment: "Monthly",
    withdrawalRules: "Give 90 days written notice. Instant access incurs 90-day interest penalty.",
    tiers: [
      { name: "Loyalty", conditions: { loyalty: ["Existing"] }, flatAdj: 0.10 },
      { name: "Premier", conditions: { loyalty: ["Premier"] }, flatAdj: 0.25 },
    ],
    products: [
      { name: "90-Day Notice Saver", code: "NA90-S", rates: { "£1k–£50k": 3.65, "£50k–£200k": 3.90, "£200k+": 4.05 } },
      { name: "Business 90-Day", code: "NA90-B", eligibility: "Ltd companies", rates: { "£1k–£50k": 3.40, "£50k–£200k": 3.70, "£200k+": 4.00 } },
    ],
  },
  {
    name: "Easy Access",
    color: "#DC2626",
    desc: "Instant withdrawals · Variable rate · No penalties",
    depositBands: ["£1k–£200k", "£200k+"],
    minDeposit: "£1",
    maxBalance: "£250,000",
    fscsProtected: true,
    interestPayment: "Monthly",
    withdrawalRules: "Unlimited instant withdrawals. No penalties.",
    tiers: [
      { name: "Premier", conditions: { loyalty: ["Premier"] }, flatAdj: 0.25 },
    ],
    products: [
      { name: "Easy Access Saver", code: "EA01", rates: { "£1k–£200k": 1.75, "£200k+": 2.15 } },
      { name: "Easy Access ISA", code: "EA-ISA", wrapper: "Cash ISA", rates: { "£1k–£200k": 3.25, "£200k+": 3.25 } },
    ],
  },
  {
    name: "LISA",
    color: "#8B5CF6",
    desc: "Lifetime ISA · 25% government bonus · Age 18–39 · First home or retirement",
    depositBands: ["£1–£4,000"],
    minDeposit: "£1",
    maxBalance: "£4,000 per year",
    fscsProtected: true,
    interestPayment: "Annually",
    withdrawalRules: "25% penalty on early withdrawal (except first home purchase or age 60+). Government bonus paid monthly.",
    tiers: [],
    products: [
      { name: "LISA Fixed 1yr", code: "LISA-F1", rates: { "£1–£4,000": 3.90 } },
      { name: "LISA Easy Access", code: "LISA-EA", rates: { "£1–£4,000": 3.40 } },
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

const emptyProduct = (bands) => ({
  name: "", code: "", wrapper: "", eligibility: "",
  rates: Object.fromEntries(bands.map(b => [b, ""])),
});

// ─────────────────────────────────────────────
// INLINE PRODUCT WIZARD
// ─────────────────────────────────────────────
function ProductWizard({ product, bands, onSave, onCancel }) {
  const [form, setForm] = useState(product ? { ...product, rates: { ...product.rates } } : emptyProduct(bands));

  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const labelSt = { display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 };

  return (
    <div style={{ padding: "16px 18px", background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>{product ? "Edit Product" : "Add New Product"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div>
          <label style={labelSt}>Product Name</label>
          <input style={inputSt} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Standard 1yr Fixed" />
        </div>
        <div>
          <label style={labelSt}>Code</label>
          <input style={inputSt} value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="FTD1-S" />
        </div>
        <div>
          <label style={labelSt}>Wrapper</label>
          <select style={inputSt} value={form.wrapper || ""} onChange={e => setForm({ ...form, wrapper: e.target.value })}>
            <option value="">None</option>
            <option value="Cash ISA">Cash ISA</option>
            <option value="LISA">LISA</option>
          </select>
        </div>
        <div>
          <label style={labelSt}>Eligibility</label>
          <input style={inputSt} value={form.eligibility || ""} onChange={e => setForm({ ...form, eligibility: e.target.value })} placeholder="e.g. Ltd companies" />
        </div>
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Rates (AER %)</div>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        {bands.map(band => (
          <div key={band} style={{ flex: 1 }}>
            <label style={{ ...labelSt, fontSize: 10 }}>{band}</label>
            <input
              style={{ ...inputSt, textAlign: "center" }}
              type="number" step="0.01"
              value={form.rates[band] != null ? form.rates[band] : ""}
              placeholder="—"
              onChange={e => {
                const v = parseFloat(e.target.value);
                setForm({ ...form, rates: { ...form.rates, [band]: isNaN(v) ? "" : v } });
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn primary onClick={() => { if (!form.name.trim()) return; onSave(form); }} disabled={!form.name.trim()}>
          {product ? "Save Changes" : "Add Product"}
        </Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BUCKET FORM MODAL (for creating/editing the bucket itself)
// ─────────────────────────────────────────────
function BucketFormModal({ bucket, onSave, onCancel }) {
  const [form, setForm] = useState(bucket
    ? JSON.parse(JSON.stringify(bucket))
    : { name: "", color: "#059669", desc: "", depositBands: ["£1k–£200k", "£200k+"], minDeposit: "£1,000", maxBalance: "£1,000,000", fscsProtected: true, interestPayment: "At Maturity", withdrawalRules: "", tiers: [], products: [] }
  );
  const [bandsText, setBandsText] = useState((form.depositBands || []).join(", "));

  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const labelSt = { display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }} onClick={onCancel}>
      <div style={{ width: 620, maxHeight: "85vh", overflow: "auto", background: T.card, borderRadius: 16, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: T.font }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 16 }}>{bucket ? "Edit Bucket" : "Create Savings Bucket"}</div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelSt}>Bucket Name (term type)</label>
            <input style={inputSt} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 1 Year Fixed" />
          </div>
          <div>
            <label style={labelSt}>Colour</label>
            <select style={inputSt} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}>
              {COLOUR_PRESETS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelSt}>Description</label>
          <input style={inputSt} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} placeholder="Short description" />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelSt}>Deposit Bands (comma-separated)</label>
          <input style={inputSt} value={bandsText} onChange={e => setBandsText(e.target.value)} placeholder="£1k–£200k, £200k+" />
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 3 }}>Use a single band like "£1k–£200k" for a flat rate across all amounts, or split into multiple bands.</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelSt}>Min Deposit</label>
            <input style={inputSt} value={form.minDeposit} onChange={e => setForm({ ...form, minDeposit: e.target.value })} />
          </div>
          <div>
            <label style={labelSt}>Max Balance</label>
            <input style={inputSt} value={form.maxBalance} onChange={e => setForm({ ...form, maxBalance: e.target.value })} />
          </div>
          <div>
            <label style={labelSt}>Interest Payment</label>
            <select style={inputSt} value={form.interestPayment} onChange={e => setForm({ ...form, interestPayment: e.target.value })}>
              {INTEREST_FREQ.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={form.fscsProtected} onChange={e => setForm({ ...form, fscsProtected: e.target.checked })} />
          <label style={{ fontSize: 12, fontWeight: 600, color: T.text }}>FSCS Protected (up to £85,000)</label>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelSt}>Withdrawal Rules</label>
          <textarea style={{ ...inputSt, height: 60, resize: "vertical" }} value={form.withdrawalRules} onChange={e => setForm({ ...form, withdrawalRules: e.target.value })} placeholder="Describe withdrawal rules and penalties" />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: `1px solid ${T.borderLight}` }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={() => {
            if (!form.name.trim()) return;
            const bands = bandsText.split(",").map(b => b.trim()).filter(Boolean);
            onSave({ ...form, depositBands: bands.length > 0 ? bands : ["£1k–£200k"] });
          }}>Save Bucket</Btn>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function SavingsBuckets() {
  const [buckets, setBuckets] = useState(loadBuckets);
  const [selected, setSelected] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBucketIdx, setEditingBucketIdx] = useState(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [editingProductIdx, setEditingProductIdx] = useState(null);

  useEffect(() => { saveBuckets(buckets); }, [buckets]);

  const bucket = buckets[selected] || buckets[0];
  const bands = bucket?.depositBands || ["£1k–£200k"];

  const handleSaveBucket = (form) => {
    if (editingBucketIdx != null) {
      setBuckets(prev => prev.map((b, i) => i === editingBucketIdx ? { ...b, ...form } : b));
      setEditingBucketIdx(null);
    } else {
      setBuckets(prev => [...prev, form]);
      setSelected(buckets.length);
      setShowCreateModal(false);
    }
  };

  const handleDeleteBucket = (idx) => {
    if (!confirm(`Delete "${buckets[idx].name}"? This cannot be undone.`)) return;
    setBuckets(prev => prev.filter((_, i) => i !== idx));
    if (selected >= buckets.length - 1) setSelected(Math.max(0, selected - 1));
  };

  const handleSaveProduct = (product) => {
    setBuckets(prev => prev.map((b, i) => {
      if (i !== selected) return b;
      if (editingProductIdx != null) {
        return { ...b, products: b.products.map((p, pi) => pi === editingProductIdx ? product : p) };
      }
      return { ...b, products: [...(b.products || []), product] };
    }));
    setAddingProduct(false);
    setEditingProductIdx(null);
  };

  const handleDeleteProduct = (pIdx) => {
    setBuckets(prev => prev.map((b, i) => i !== selected ? b : { ...b, products: b.products.filter((_, pi) => pi !== pIdx) }));
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: T.textMuted }}>Each bucket represents a term type. Products within each bucket are different offerings at that term.</div>
        <Btn primary onClick={() => setShowCreateModal(true)}>+ Create Bucket</Btn>
      </div>

      {/* Bucket selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {buckets.map((b, i) => (
          <div
            key={i}
            onClick={() => { setSelected(i); setAddingProduct(false); setEditingProductIdx(null); }}
            style={{
              flex: "0 0 auto", padding: "10px 16px", borderRadius: 10, cursor: "pointer",
              border: selected === i ? `2px solid ${b.color}` : `1px solid ${T.borderLight}`,
              background: selected === i ? b.color + "08" : T.card,
              transition: "all 0.2s", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: 4, background: b.color }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{b.name}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: b.color + "14", color: b.color }}>{(b.products || []).length}</span>
            {/* Edit / Delete */}
            <span
              onClick={e => { e.stopPropagation(); setEditingBucketIdx(i); }}
              style={{ cursor: "pointer", color: T.textMuted, marginLeft: 4 }}
              title="Edit bucket"
            >{Ico.settings(12)}</span>
            <span
              onClick={e => { e.stopPropagation(); handleDeleteBucket(i); }}
              style={{ cursor: "pointer", color: T.textMuted }}
              title="Delete bucket"
            >{Ico.x(12)}</span>
          </div>
        ))}
      </div>

      {/* Selected bucket detail */}
      {bucket && (
        <div>
          {/* Info bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ padding: "5px 10px", borderRadius: 8, background: bucket.color + "0A", border: `1px solid ${bucket.color}20`, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Min Deposit</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{bucket.minDeposit}</span>
            </div>
            <div style={{ padding: "5px 10px", borderRadius: 8, background: "#F1F5F9", border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Max Balance</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{bucket.maxBalance}</span>
            </div>
            <div style={{ padding: "5px 10px", borderRadius: 8, background: "#F1F5F9", border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Interest Paid</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{bucket.interestPayment}</span>
            </div>
            <div style={{ padding: "5px 10px", borderRadius: 8, background: "#F1F5F9", border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>Bands</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{bands.join(" · ")}</span>
            </div>
            {bucket.fscsProtected && (
              <div style={{ padding: "5px 10px", borderRadius: 8, background: "#ECFDF5", border: "1px solid #A7F3D0", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#065F46" }}>FSCS Protected</span>
              </div>
            )}
            {bucket.withdrawalRules && (
              <div style={{ padding: "5px 10px", borderRadius: 8, background: "#FEF3C7", border: "1px solid #FDE68A", display: "flex", alignItems: "center", gap: 5, maxWidth: 350 }}>
                <span style={{ fontSize: 10, color: "#92400E", lineHeight: 1.3 }}>{bucket.withdrawalRules}</span>
              </div>
            )}
          </div>

          {/* Products grid — this IS the bucket content */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Products in {bucket.name}</span>
              {!addingProduct && editingProductIdx == null && (
                <Btn small primary onClick={() => setAddingProduct(true)}>+ Add Product</Btn>
              )}
            </div>

            {/* Rate table */}
            {(bucket.products || []).length > 0 && (
              <div style={{ overflowX: "auto", marginBottom: 12 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                      <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", minWidth: 200 }}>Product</th>
                      <th style={{ textAlign: "left", padding: "8px 8px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", width: 70 }}>Code</th>
                      {bands.map(b => (
                        <th key={b} style={{ textAlign: "center", padding: "8px 6px", fontSize: 10, fontWeight: 700, color: T.navy, minWidth: 90 }}>{b}</th>
                      ))}
                      <th style={{ width: 60 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {(bucket.products || []).map((prod, pIdx) => {
                      // Show base row + tier rows
                      const allTiers = [{ name: "Base", _isBase: true }, ...(bucket.tiers || [])];
                      return allTiers.map((tier, tIdx) => {
                        const isBase = tier._isBase;
                        const adj = isBase ? 0 : (parseFloat(tier.flatAdj) || 0);
                        const tierColor = isBase ? T.navy : TIER_COLORS[(tIdx - 1) % 5];
                        const isLastTier = tIdx === allTiers.length - 1;
                        return (
                          <tr key={`${pIdx}-${tIdx}`} style={{
                            borderBottom: isLastTier ? `2px solid ${T.border}` : `1px solid ${T.borderLight}`,
                            background: isBase ? "#FAFAF8" : "#FFF",
                          }}>
                            <td style={{ padding: isBase ? "10px 10px" : "5px 10px 5px 22px" }}>
                              {isBase ? (
                                <div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <span style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{prod.name}</span>
                                    <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: "#F1F5F9", color: T.textMuted }}>BASE</span>
                                  </div>
                                  {(prod.wrapper || prod.eligibility) && (
                                    <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                                      {prod.wrapper && <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: "#EDE9FE", color: "#6D28D9" }}>{prod.wrapper}</span>}
                                      {prod.eligibility && <span style={{ fontSize: 9, color: T.textMuted }}>{prod.eligibility}</span>}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ width: 3, height: 16, borderRadius: 2, background: tierColor, flexShrink: 0 }} />
                                  <span style={{ fontWeight: 600, fontSize: 11, color: tierColor }}>{tier.name}</span>
                                  <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 5, background: tierColor + "14", color: tierColor }}>T{tIdx}</span>
                                  <span style={{ fontSize: 9, color: T.textMuted }}>({adj >= 0 ? "+" : ""}{adj.toFixed(2)}%)</span>
                                </div>
                              )}
                            </td>
                            <td style={{ padding: "8px 8px", fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>{isBase ? prod.code : ""}</td>
                            {bands.map(band => {
                              const baseRate = prod.rates?.[band];
                              if (baseRate == null || baseRate === "") return <td key={band} style={{ textAlign: "center", padding: "7px 6px", color: "#CBD5E1" }}>—</td>;
                              const finalRate = Math.round((parseFloat(baseRate) + (isBase ? 0 : adj)) * 100) / 100;
                              return (
                                <td key={band} style={{ textAlign: "center", padding: "7px 6px" }}>
                                  <span style={{ fontWeight: 700, fontSize: 13, color: rateColor(finalRate) }}>{finalRate.toFixed(2)}%</span>
                                  {!isBase && adj !== 0 && <div style={{ fontSize: 8, color: adj > 0 ? "#059669" : "#B07A00", fontWeight: 600 }}>{adj >= 0 ? "+" : ""}{adj.toFixed(2)}%</div>}
                                </td>
                              );
                            })}
                            <td style={{ padding: "6px 6px" }}>
                              {isBase && (
                                <div style={{ display: "flex", gap: 4 }}>
                                  <span onClick={() => setEditingProductIdx(pIdx)} style={{ cursor: "pointer", color: T.textMuted }} title="Edit">{Ico.settings(12)}</span>
                                  <span onClick={() => handleDeleteProduct(pIdx)} style={{ cursor: "pointer", color: T.danger }} title="Delete">{Ico.x(12)}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      });
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {(bucket.products || []).length === 0 && !addingProduct && (
              <div style={{ padding: "28px 0", textAlign: "center", color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>
                No products in this bucket. Click "+ Add Product" to create one.
              </div>
            )}

            {/* Inline product wizard */}
            {addingProduct && (
              <ProductWizard bands={bands} onSave={handleSaveProduct} onCancel={() => setAddingProduct(false)} />
            )}
            {editingProductIdx != null && (
              <ProductWizard product={bucket.products[editingProductIdx]} bands={bands} onSave={handleSaveProduct} onCancel={() => setEditingProductIdx(null)} />
            )}
          </div>

          {/* Tiers section — inline below products */}
          {(bucket.tiers || []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Pricing Tiers</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {bucket.tiers.map((tier, tIdx) => {
                  const tc = TIER_COLORS[tIdx % 5];
                  const condEntries = Object.entries(tier.conditions || {}).filter(([, v]) => v?.length);
                  return (
                    <div key={tIdx} style={{ padding: "8px 14px", borderRadius: 8, background: T.card, border: `1px solid ${T.borderLight}`, borderLeft: `3px solid ${tc}`, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: tc }}>{tier.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: tier.flatAdj > 0 ? "#D1FAE5" : "#FEF3C7", color: tier.flatAdj > 0 ? "#065F46" : "#92400E" }}>
                        {tier.flatAdj >= 0 ? "+" : ""}{Number(tier.flatAdj).toFixed(2)}%
                      </span>
                      {condEntries.map(([dim, vals]) =>
                        vals.map(v => (
                          <span key={`${dim}-${v}`} style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 6, background: tc + "14", color: tc }}>{v}</span>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: `1px solid ${T.borderLight}`, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#059669" }} /> ≥ 5.00% AER
            </span>
            <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#D97706" }} /> 3.50% – 4.99%
            </span>
            <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: "#DC2626" }} /> {"< 3.50%"}
            </span>
            <span style={{ fontSize: 10, color: T.textMuted, marginLeft: "auto" }}>All rates AER (gross)</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <BucketFormModal onSave={handleSaveBucket} onCancel={() => setShowCreateModal(false)} />}
      {editingBucketIdx != null && <BucketFormModal bucket={buckets[editingBucketIdx]} onSave={handleSaveBucket} onCancel={() => setEditingBucketIdx(null)} />}
    </div>
  );
}
