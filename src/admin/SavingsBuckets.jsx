import { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";

// ─────────────────────────────────────────────
// PERSISTENCE
// ─────────────────────────────────────────────
function loadBuckets() {
  try {
    const s = localStorage.getItem("savings_buckets_v3");
    return s ? JSON.parse(s) : DEFAULT_BUCKETS;
  } catch { return DEFAULT_BUCKETS; }
}
function saveBuckets(b) {
  try { localStorage.setItem("savings_buckets_v3", JSON.stringify(b)); } catch {}
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const COLOUR_PRESETS = [
  { label: "Green", value: "#059669" }, { label: "Teal", value: "#31B897" },
  { label: "Blue", value: "#3B82F6" }, { label: "Purple", value: "#8B5CF6" },
  { label: "Amber", value: "#F59E0B" }, { label: "Sky", value: "#0EA5E9" },
  { label: "Red", value: "#DC2626" },
];
const INTEREST_FREQ = ["Monthly", "Annually", "At Maturity"];
const TERM_OPTIONS = ["Instant Access", "30-Day Notice", "60-Day Notice", "90-Day Notice", "120-Day Notice", "1 Year Fixed", "2 Year Fixed", "3 Year Fixed", "5 Year Fixed"];
const TIER_COLORS = ["#059669", "#8B5CF6", "#F59E0B", "#E03A3A", "#0EA5E9"];
const LOYALTY_OPTIONS = ["New", "Existing", "Multi-Product", "Premier", "Switcher"];
const WRAPPER_OPTIONS = ["None", "Cash ISA", "LISA"];

// ─────────────────────────────────────────────
// DEFAULT BUCKETS — category-level, products have term field
// ─────────────────────────────────────────────
const DEFAULT_BUCKETS = [
  {
    name: "Fixed Term Deposit",
    color: "#059669",
    desc: "Fixed rate for a set term · No withdrawals until maturity",
    minDeposit: "£1,000", maxBalance: "£1,000,000", fscsProtected: true,
    interestPayment: "At Maturity",
    withdrawalRules: "No withdrawals before maturity. Early closure penalty applies (90–365 days interest depending on term).",
    // Balance-tier feature
    balanceTiersEnabled: true,
    balanceTiers: [
      { band: "£1k–£9.9k", adj: 0.00 },
      { band: "£10k–£49.9k", adj: 0.25 },
      { band: "£50k–£199.9k", adj: 0.40 },
      { band: "£200k+", adj: 0.55 },
    ],
    // Condition tiers (loyalty, wrapper, etc.)
    tiers: [
      { name: "Loyalty Bonus", conditions: { loyalty: ["Existing", "Multi-Product"] }, flatAdj: 0.15 },
      { name: "ISA Wrapper", conditions: { wrapper: ["Cash ISA"] }, flatAdj: -0.10 },
      { name: "Premier", conditions: { loyalty: ["Premier"] }, flatAdj: 0.30 },
    ],
    products: [
      { name: "1yr Fixed Standard", term: "1 Year Fixed", code: "FTD1-S", baseRate: 4.25 },
      { name: "1yr Fixed ISA", term: "1 Year Fixed", code: "FTD1-I", wrapper: "Cash ISA", baseRate: 4.10 },
      { name: "1yr Fixed Business", term: "1 Year Fixed", code: "FTD1-B", eligibility: "Ltd companies, sole traders", baseRate: 4.00 },
      { name: "2yr Fixed Standard", term: "2 Year Fixed", code: "FTD2-S", baseRate: 4.60 },
      { name: "2yr Fixed ISA", term: "2 Year Fixed", code: "FTD2-I", wrapper: "Cash ISA", baseRate: 4.45 },
      { name: "3yr Fixed Standard", term: "3 Year Fixed", code: "FTD3-S", baseRate: 4.85 },
      { name: "5yr Fixed Standard", term: "5 Year Fixed", code: "FTD5-S", baseRate: 5.00 },
    ],
  },
  {
    name: "Notice Account",
    color: "#3B82F6",
    desc: "Variable rate · Give notice before withdrawal · Better rates than easy access",
    minDeposit: "£1,000", maxBalance: "£500,000", fscsProtected: true,
    interestPayment: "Monthly",
    withdrawalRules: "Give required notice period. Instant access incurs interest penalty equal to notice period.",
    balanceTiersEnabled: true,
    balanceTiers: [
      { band: "£1k–£49.9k", adj: 0.00 },
      { band: "£50k–£199.9k", adj: 0.25 },
      { band: "£200k+", adj: 0.40 },
    ],
    tiers: [
      { name: "Loyalty", conditions: { loyalty: ["Existing"] }, flatAdj: 0.10 },
    ],
    products: [
      { name: "30-Day Notice", term: "30-Day Notice", code: "NA30", baseRate: 2.95 },
      { name: "90-Day Notice", term: "90-Day Notice", code: "NA90", baseRate: 3.40 },
      { name: "120-Day Notice", term: "120-Day Notice", code: "N120", baseRate: 3.75 },
      { name: "Business 90-Day", term: "90-Day Notice", code: "NA90-B", eligibility: "Ltd companies", baseRate: 3.10 },
    ],
  },
  {
    name: "Easy Access",
    color: "#F59E0B",
    desc: "Instant withdrawals · Variable rate · No penalties",
    minDeposit: "£1", maxBalance: "£250,000", fscsProtected: true,
    interestPayment: "Monthly",
    withdrawalRules: "Unlimited instant withdrawals. No penalties.",
    balanceTiersEnabled: false,
    balanceTiers: [],
    tiers: [
      { name: "Premier", conditions: { loyalty: ["Premier"] }, flatAdj: 0.25 },
    ],
    products: [
      { name: "Easy Access Saver", term: "Instant Access", code: "EA01", baseRate: 1.75 },
      { name: "Easy Access ISA", term: "Instant Access", code: "EA-ISA", wrapper: "Cash ISA", baseRate: 3.25 },
    ],
  },
  {
    name: "LISA",
    color: "#8B5CF6",
    desc: "Lifetime ISA · 25% government bonus · Age 18–39 · First home or retirement",
    minDeposit: "£1", maxBalance: "£4,000 per year", fscsProtected: true,
    interestPayment: "Annually",
    withdrawalRules: "25% penalty on early withdrawal (except first home or age 60+). Government bonus paid monthly.",
    balanceTiersEnabled: false,
    balanceTiers: [],
    tiers: [],
    products: [
      { name: "LISA 1yr Fixed", term: "1 Year Fixed", code: "LISA-F1", baseRate: 3.90 },
      { name: "LISA Easy Access", term: "Instant Access", code: "LISA-EA", baseRate: 3.40 },
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

let codeCounter = Date.now();
function generateCode(bucketName, term) {
  codeCounter++;
  const bPrefix = (bucketName || "SAV").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  const tMap = { "Instant Access": "IA", "30-Day Notice": "N30", "60-Day Notice": "N60", "90-Day Notice": "N90", "120-Day Notice": "N12", "1 Year Fixed": "1Y", "2 Year Fixed": "2Y", "3 Year Fixed": "3Y", "5 Year Fixed": "5Y" };
  const tCode = tMap[term] || term.replace(/[^A-Z0-9]/gi, "").slice(0, 3).toUpperCase();
  return `${bPrefix}-${tCode}-${String(codeCounter).slice(-3)}`;
}

// ─────────────────────────────────────────────
// INLINE PRODUCT WIZARD
// ─────────────────────────────────────────────
function ProductWizard({ product, bucketName, onSave, onCancel }) {
  const [form, setForm] = useState(product
    ? { ...product, baseRate: product.baseRate != null ? String(product.baseRate) : "" }
    : { name: "", term: "1 Year Fixed", code: "", wrapper: "", eligibility: "", baseRate: "" }
  );
  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const labelSt = { display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 };

  const canSave = form.name.trim() && form.baseRate !== "" && !isNaN(parseFloat(form.baseRate));

  const doSave = () => {
    if (!canSave) return;
    const code = form.code || generateCode(bucketName || "SAV", form.term);
    onSave({ ...form, baseRate: parseFloat(form.baseRate), code });
  };

  return (
    <div style={{ padding: "16px 18px", background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>{product ? "Edit Product" : "Add New Product"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 10 }}>
        <div>
          <label style={labelSt}>Product Name</label>
          <input style={inputSt} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. 1yr Fixed Standard" />
        </div>
        <div>
          <label style={labelSt}>Term</label>
          <select style={inputSt} value={form.term} onChange={e => setForm({ ...form, term: e.target.value })}>
            {TERM_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelSt}>Base Rate (AER %)</label>
          <input style={inputSt} type="number" step="0.01" value={form.baseRate} onChange={e => setForm({ ...form, baseRate: e.target.value })} placeholder="4.25" />
        </div>
        <div>
          <label style={labelSt}>Wrapper</label>
          <select style={inputSt} value={form.wrapper || ""} onChange={e => setForm({ ...form, wrapper: e.target.value })}>
            {WRAPPER_OPTIONS.map(w => <option key={w} value={w === "None" ? "" : w}>{w}</option>)}
          </select>
        </div>
        <div>
          <label style={labelSt}>Eligibility</label>
          <input style={inputSt} value={form.eligibility || ""} onChange={e => setForm({ ...form, eligibility: e.target.value })} placeholder="e.g. Ltd companies" />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
        {form.code && <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>Code: {form.code}</span>}
        {!form.code && form.name && <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "monospace" }}>Code: {generateCode(bucketName || "SAV", form.term)} (auto)</span>}
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn primary onClick={doSave} disabled={!canSave}>{product ? "Save" : "Add Product"}</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TIER WIZARD — create/edit condition tiers
// ─────────────────────────────────────────────
function TierWizard({ tier, onSave, onCancel }) {
  const [form, setForm] = useState(tier
    ? { ...tier, conditions: { ...tier.conditions } }
    : { name: "", conditions: {}, flatAdj: 0.00 }
  );
  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const labelSt = { display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 };
  const chipSt = (active, color) => ({
    display: "inline-block", padding: "4px 10px", borderRadius: 12,
    fontSize: 11, fontWeight: 600, cursor: "pointer", marginRight: 5, marginBottom: 5,
    border: active ? `2px solid ${color}` : `1px solid ${T.border}`,
    background: active ? color + "14" : T.card,
    color: active ? color : T.textMuted, transition: "all 0.15s", userSelect: "none",
  });

  const toggleCondition = (dim, val) => {
    const conds = { ...form.conditions };
    const arr = [...(conds[dim] || [])];
    const idx = arr.indexOf(val);
    if (idx >= 0) arr.splice(idx, 1); else arr.push(val);
    if (arr.length === 0) delete conds[dim]; else conds[dim] = arr;
    setForm({ ...form, conditions: conds });
  };

  return (
    <div style={{ padding: "16px 18px", background: T.bg, borderRadius: 10, border: `1px solid ${T.border}`, marginBottom: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.navy, marginBottom: 12 }}>{tier ? "Edit Tier" : "Add New Tier"}</div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 14 }}>
        <div>
          <label style={labelSt}>Tier Name</label>
          <input style={inputSt} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Loyalty Bonus" />
        </div>
        <div>
          <label style={labelSt}>Rate Adjustment (%)</label>
          <input style={inputSt} type="number" step="0.01" value={form.flatAdj} onChange={e => setForm({ ...form, flatAdj: parseFloat(e.target.value) || 0 })} />
        </div>
      </div>
      {/* Conditions */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelSt}>Loyalty Condition</label>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {LOYALTY_OPTIONS.map(l => (
            <span key={l} style={chipSt((form.conditions.loyalty || []).includes(l), "#059669")} onClick={() => toggleCondition("loyalty", l)}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={labelSt}>Wrapper Condition</label>
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {["Cash ISA", "LISA"].map(w => (
            <span key={w} style={chipSt((form.conditions.wrapper || []).includes(w), "#8B5CF6")} onClick={() => toggleCondition("wrapper", w)}>{w}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn onClick={onCancel}>Cancel</Btn>
        <Btn primary onClick={() => { if (!form.name.trim()) return; onSave(form); }}>{tier ? "Save" : "Add Tier"}</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BUCKET FORM MODAL
// ─────────────────────────────────────────────
function BucketFormModal({ bucket, onSave, onCancel }) {
  const [form, setForm] = useState(bucket
    ? JSON.parse(JSON.stringify(bucket))
    : { name: "", color: "#059669", desc: "", minDeposit: "£1,000", maxBalance: "£1,000,000", fscsProtected: true, interestPayment: "At Maturity", withdrawalRules: "", balanceTiersEnabled: false, balanceTiers: [], tiers: [], products: [] }
  );
  const inputSt = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: `1px solid ${T.border}`, fontSize: 13, fontFamily: T.font,
    color: T.text, background: T.card, outline: "none", boxSizing: "border-box",
  };
  const labelSt = { display: "block", fontSize: 11, fontWeight: 600, color: T.textSecondary, marginBottom: 4 };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)" }} onClick={onCancel}>
      <div style={{ width: 600, maxHeight: "85vh", overflow: "auto", background: T.card, borderRadius: 16, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", fontFamily: T.font }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 18, fontWeight: 700, color: T.navy, marginBottom: 16 }}>{bucket ? "Edit Bucket" : "Create Savings Bucket"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={labelSt}>Name</label><input style={inputSt} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Fixed Term Deposit" /></div>
          <div><label style={labelSt}>Colour</label><select style={inputSt} value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}>{COLOUR_PRESETS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
        </div>
        <div style={{ marginBottom: 12 }}><label style={labelSt}>Description</label><input style={inputSt} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div><label style={labelSt}>Min Deposit</label><input style={inputSt} value={form.minDeposit} onChange={e => setForm({ ...form, minDeposit: e.target.value })} /></div>
          <div><label style={labelSt}>Max Balance</label><input style={inputSt} value={form.maxBalance} onChange={e => setForm({ ...form, maxBalance: e.target.value })} /></div>
          <div><label style={labelSt}>Interest Payment</label><select style={inputSt} value={form.interestPayment} onChange={e => setForm({ ...form, interestPayment: e.target.value })}>{INTEREST_FREQ.map(f => <option key={f} value={f}>{f}</option>)}</select></div>
        </div>
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <input type="checkbox" checked={form.fscsProtected} onChange={e => setForm({ ...form, fscsProtected: e.target.checked })} />
          <label style={{ fontSize: 12, fontWeight: 600, color: T.text }}>FSCS Protected</label>
        </div>
        <div style={{ marginBottom: 16 }}><label style={labelSt}>Withdrawal Rules</label><textarea style={{ ...inputSt, height: 50, resize: "vertical" }} value={form.withdrawalRules} onChange={e => setForm({ ...form, withdrawalRules: e.target.value })} /></div>

        {/* Balance tiers toggle */}
        <div style={{ marginBottom: 16, padding: "14px 16px", borderRadius: 10, border: `1px solid ${T.border}`, background: form.balanceTiersEnabled ? "#ECFDF5" : T.bg }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: form.balanceTiersEnabled ? 12 : 0 }}>
            <input type="checkbox" checked={form.balanceTiersEnabled} onChange={e => setForm({ ...form, balanceTiersEnabled: e.target.checked })} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>Balance-Based Rate Tiers</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>When enabled, the base rate is adjusted by deposit amount band</div>
            </div>
          </div>
          {form.balanceTiersEnabled && (
            <div>
              {(form.balanceTiers || []).map((bt, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 28px", gap: 8, marginBottom: 6, alignItems: "center" }}>
                  <input style={inputSt} value={bt.band} onChange={e => { const next = [...form.balanceTiers]; next[i] = { ...bt, band: e.target.value }; setForm({ ...form, balanceTiers: next }); }} placeholder="e.g. £1k–£9.9k" />
                  <input style={{ ...inputSt, textAlign: "center" }} type="number" step="0.01" value={bt.adj} onChange={e => { const next = [...form.balanceTiers]; next[i] = { ...bt, adj: parseFloat(e.target.value) || 0 }; setForm({ ...form, balanceTiers: next }); }} />
                  <span onClick={() => setForm({ ...form, balanceTiers: form.balanceTiers.filter((_, j) => j !== i) })} style={{ cursor: "pointer", color: T.danger }}>{Ico.x(14)}</span>
                </div>
              ))}
              <Btn small onClick={() => setForm({ ...form, balanceTiers: [...(form.balanceTiers || []), { band: "", adj: 0.00 }] })}>+ Add Band</Btn>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 16, borderTop: `1px solid ${T.borderLight}` }}>
          <Btn onClick={onCancel}>Cancel</Btn>
          <Btn primary onClick={() => { if (!form.name.trim()) return; onSave(form); }}>Save Bucket</Btn>
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
  const [addingTier, setAddingTier] = useState(false);
  const [editingTierIdx, setEditingTierIdx] = useState(null);

  useEffect(() => { saveBuckets(buckets); }, [buckets]);

  const bucket = buckets[selected] || buckets[0];

  const updateBucket = (fn) => setBuckets(prev => prev.map((b, i) => i === selected ? fn(b) : b));

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
    if (!confirm(`Delete "${buckets[idx].name}"?`)) return;
    setBuckets(prev => prev.filter((_, i) => i !== idx));
    if (selected >= buckets.length - 1) setSelected(Math.max(0, selected - 1));
  };

  const handleSaveProduct = (product) => {
    updateBucket(b => ({
      ...b,
      products: editingProductIdx != null
        ? b.products.map((p, i) => i === editingProductIdx ? product : p)
        : [...(b.products || []), product],
    }));
    setAddingProduct(false);
    setEditingProductIdx(null);
  };

  const handleDeleteProduct = (pIdx) => updateBucket(b => ({ ...b, products: b.products.filter((_, i) => i !== pIdx) }));

  const handleSaveTier = (tier) => {
    updateBucket(b => ({
      ...b,
      tiers: editingTierIdx != null
        ? b.tiers.map((t, i) => i === editingTierIdx ? tier : t)
        : [...(b.tiers || []), tier],
    }));
    setAddingTier(false);
    setEditingTierIdx(null);
  };

  const handleDeleteTier = (tIdx) => updateBucket(b => ({ ...b, tiers: b.tiers.filter((_, i) => i !== tIdx) }));

  // Group products by term for display
  const terms = [...new Set((bucket?.products || []).map(p => p.term))];

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: T.textMuted }}>Each bucket is a product category. Products within have a term and base rate. Balance tiers and condition tiers modify the rate.</div>
        <Btn primary onClick={() => setShowCreateModal(true)}>+ Create Bucket</Btn>
      </div>

      {/* Bucket selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {buckets.map((b, i) => (
          <div key={i} onClick={() => { setSelected(i); setAddingProduct(false); setEditingProductIdx(null); setAddingTier(false); setEditingTierIdx(null); }}
            style={{
              flex: "0 0 auto", padding: "10px 16px", borderRadius: 10, cursor: "pointer",
              border: selected === i ? `2px solid ${b.color}` : `1px solid ${T.borderLight}`,
              background: selected === i ? b.color + "08" : T.card,
              display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
            }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: b.color }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{b.name}</span>
            <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: b.color + "14", color: b.color }}>{(b.products || []).length}</span>
            <span onClick={e => { e.stopPropagation(); setEditingBucketIdx(i); }} style={{ cursor: "pointer", color: T.textMuted, marginLeft: 4 }} title="Edit">{Ico.settings(12)}</span>
            <span onClick={e => { e.stopPropagation(); handleDeleteBucket(i); }} style={{ cursor: "pointer", color: T.textMuted }} title="Delete">{Ico.x(12)}</span>
          </div>
        ))}
      </div>

      {bucket && (
        <div>
          {/* Info bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            {[
              { label: "Min Deposit", value: bucket.minDeposit },
              { label: "Max Balance", value: bucket.maxBalance },
              { label: "Interest", value: bucket.interestPayment },
            ].map(f => (
              <div key={f.label} style={{ padding: "5px 10px", borderRadius: 8, background: "#F1F5F9", border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, textTransform: "uppercase" }}>{f.label}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.text }}>{f.value}</span>
              </div>
            ))}
            {bucket.fscsProtected && <span style={{ padding: "5px 10px", borderRadius: 8, background: "#ECFDF5", border: "1px solid #A7F3D0", fontSize: 11, fontWeight: 700, color: "#065F46" }}>FSCS Protected</span>}
            {bucket.balanceTiersEnabled && <span style={{ padding: "5px 10px", borderRadius: 8, background: "#EDE9FE", border: "1px solid #C7D2FE", fontSize: 11, fontWeight: 700, color: "#6D28D9" }}>Balance Tiers Active</span>}
          </div>

          {/* Balance tiers display */}
          {bucket.balanceTiersEnabled && (bucket.balanceTiers || []).length > 0 && (
            <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#FAFAF8", border: `1px solid ${T.borderLight}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 8 }}>Balance Rate Tiers</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {bucket.balanceTiers.map((bt, i) => (
                  <div key={i} style={{ padding: "6px 12px", borderRadius: 8, background: T.card, border: `1px solid ${T.borderLight}`, textAlign: "center" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.navy }}>{bt.band}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: bt.adj > 0 ? "#059669" : bt.adj < 0 ? "#DC2626" : T.textMuted }}>
                      {bt.adj === 0 ? "Base" : `${bt.adj >= 0 ? "+" : ""}${bt.adj.toFixed(2)}%`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products — grouped by term */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Products</span>
              {!addingProduct && editingProductIdx == null && (
                <Btn small primary onClick={() => setAddingProduct(true)}>+ Add Product</Btn>
              )}
            </div>

            {/* Inline add/edit product wizard */}
            {addingProduct && <ProductWizard bucketName={bucket.name} onSave={handleSaveProduct} onCancel={() => setAddingProduct(false)} />}
            {editingProductIdx != null && <ProductWizard product={bucket.products[editingProductIdx]} bucketName={bucket.name} onSave={handleSaveProduct} onCancel={() => setEditingProductIdx(null)} />}

            {/* Rate table grouped by term */}
            {terms.length > 0 ? terms.map(term => {
              const termProducts = (bucket.products || []).map((p, i) => ({ ...p, _idx: i })).filter(p => p.term === term);
              const condTiers = bucket.tiers || [];
              const balanceTiers = bucket.balanceTiersEnabled ? (bucket.balanceTiers || []) : [];
              const showBalanceCols = balanceTiers.length > 0;

              return (
                <div key={term} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: bucket.color, padding: "6px 12px", background: bucket.color + "0A", borderRadius: "8px 8px 0 0", border: `1px solid ${bucket.color}20`, borderBottom: "none" }}>
                    {term}
                  </div>
                  <div style={{ overflowX: "auto", border: `1px solid ${T.borderLight}`, borderRadius: "0 0 8px 8px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: T.font }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${T.border}` }}>
                          <th style={{ textAlign: "left", padding: "8px 10px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", minWidth: 180 }}>Product / Tier</th>
                          <th style={{ textAlign: "left", padding: "8px 6px", fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", width: 60 }}>Code</th>
                          {showBalanceCols ? (
                            balanceTiers.map(bt => (
                              <th key={bt.band} style={{ textAlign: "center", padding: "8px 6px", fontSize: 10, fontWeight: 700, color: T.navy, minWidth: 80 }}>{bt.band}</th>
                            ))
                          ) : (
                            <th style={{ textAlign: "center", padding: "8px 6px", fontSize: 10, fontWeight: 700, color: T.navy, minWidth: 80 }}>Rate (AER)</th>
                          )}
                          <th style={{ width: 50 }} />
                        </tr>
                      </thead>
                      <tbody>
                        {termProducts.map(prod => {
                          const allTiers = [{ name: "Base", _isBase: true }, ...condTiers];
                          return allTiers.map((tier, tIdx) => {
                            const isBase = tier._isBase;
                            const condAdj = isBase ? 0 : (parseFloat(tier.flatAdj) || 0);
                            const tierColor = isBase ? T.navy : TIER_COLORS[(tIdx - 1) % 5];
                            const isLastTier = tIdx === allTiers.length - 1;
                            return (
                              <tr key={`${prod._idx}-${tIdx}`} style={{
                                borderBottom: isLastTier ? `2px solid ${T.border}` : `1px solid ${T.borderLight}`,
                                background: isBase ? "#FAFAF8" : "#FFF",
                              }}>
                                <td style={{ padding: isBase ? "8px 10px" : "5px 10px 5px 22px" }}>
                                  {isBase ? (
                                    <div>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: T.navy }}>{prod.name}</span>
                                        <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: "#F1F5F9", color: T.textMuted }}>BASE</span>
                                      </div>
                                      {(prod.wrapper || prod.eligibility) && (
                                        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                                          {prod.wrapper && <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 6, background: "#EDE9FE", color: "#6D28D9" }}>{prod.wrapper}</span>}
                                          {prod.eligibility && <span style={{ fontSize: 9, color: T.textMuted }}>{prod.eligibility}</span>}
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <span style={{ width: 3, height: 14, borderRadius: 2, background: tierColor, flexShrink: 0 }} />
                                      <span style={{ fontWeight: 600, fontSize: 11, color: tierColor }}>{tier.name}</span>
                                      <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 5, background: tierColor + "14", color: tierColor }}>T{tIdx}</span>
                                      <span style={{ fontSize: 9, color: T.textMuted }}>({condAdj >= 0 ? "+" : ""}{condAdj.toFixed(2)}%)</span>
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: "6px 6px", fontSize: 10, fontFamily: "monospace", color: isBase ? T.navy : T.textMuted, fontWeight: isBase ? 700 : 500 }}>
                                  {isBase ? prod.code : `${prod.code}-T${tIdx}`}
                                </td>
                                {showBalanceCols ? (
                                  balanceTiers.map(bt => {
                                    const baseRate = parseFloat(prod.baseRate) || 0;
                                    const total = Math.round((baseRate + bt.adj + condAdj) * 100) / 100;
                                    return (
                                      <td key={bt.band} style={{ textAlign: "center", padding: "6px 6px" }}>
                                        <span style={{ fontWeight: 700, fontSize: 13, color: rateColor(total) }}>{total.toFixed(2)}%</span>
                                        {(!isBase && condAdj !== 0) && <div style={{ fontSize: 8, color: condAdj > 0 ? "#059669" : "#B07A00", fontWeight: 600 }}>{condAdj >= 0 ? "+" : ""}{condAdj.toFixed(2)}%</div>}
                                      </td>
                                    );
                                  })
                                ) : (
                                  <td style={{ textAlign: "center", padding: "6px 6px" }}>
                                    {(() => {
                                      const total = Math.round(((parseFloat(prod.baseRate) || 0) + condAdj) * 100) / 100;
                                      return (
                                        <>
                                          <span style={{ fontWeight: 700, fontSize: 13, color: rateColor(total) }}>{total.toFixed(2)}%</span>
                                          {(!isBase && condAdj !== 0) && <div style={{ fontSize: 8, color: condAdj > 0 ? "#059669" : "#B07A00", fontWeight: 600 }}>{condAdj >= 0 ? "+" : ""}{condAdj.toFixed(2)}%</div>}
                                        </>
                                      );
                                    })()}
                                  </td>
                                )}
                                <td style={{ padding: "4px 6px" }}>
                                  {isBase && (
                                    <div style={{ display: "flex", gap: 4 }}>
                                      <span onClick={() => setEditingProductIdx(prod._idx)} style={{ cursor: "pointer", color: T.textMuted }}>{Ico.settings(12)}</span>
                                      <span onClick={() => handleDeleteProduct(prod._idx)} style={{ cursor: "pointer", color: T.danger }}>{Ico.x(12)}</span>
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
                </div>
              );
            }) : (
              !addingProduct && <div style={{ padding: "28px 0", textAlign: "center", color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>No products. Click "+ Add Product" to create one.</div>
            )}
          </div>

          {/* Condition Tiers section — with full CRUD */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>Condition Tiers</span>
                <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 8 }}>Loyalty, wrapper, and other adjustments that apply to all products in this bucket</span>
              </div>
              {!addingTier && editingTierIdx == null && (bucket.tiers || []).length < 5 && (
                <Btn small primary onClick={() => setAddingTier(true)}>+ Add Tier</Btn>
              )}
            </div>

            {/* Inline tier wizard */}
            {addingTier && <TierWizard onSave={handleSaveTier} onCancel={() => setAddingTier(false)} />}
            {editingTierIdx != null && <TierWizard tier={bucket.tiers[editingTierIdx]} onSave={handleSaveTier} onCancel={() => setEditingTierIdx(null)} />}

            {(bucket.tiers || []).length > 0 && !addingTier && editingTierIdx == null && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {bucket.tiers.map((tier, tIdx) => {
                  const tc = TIER_COLORS[tIdx % 5];
                  const condEntries = Object.entries(tier.conditions || {}).filter(([, v]) => v?.length);
                  return (
                    <div key={tIdx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 8, background: T.card, border: `1px solid ${T.borderLight}`, borderLeft: `4px solid ${tc}` }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: tc, minWidth: 120 }}>{tier.name}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 8, background: tier.flatAdj > 0 ? "#D1FAE5" : tier.flatAdj < 0 ? "#FEF3C7" : "#F1F5F9", color: tier.flatAdj > 0 ? "#065F46" : tier.flatAdj < 0 ? "#92400E" : "#475569" }}>
                        {tier.flatAdj >= 0 ? "+" : ""}{Number(tier.flatAdj).toFixed(2)}%
                      </span>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", flex: 1 }}>
                        {condEntries.length > 0 ? condEntries.map(([dim, vals]) =>
                          vals.map(v => (
                            <span key={`${dim}-${v}`} style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, background: tc + "14", color: tc }}>{dim}: {v}</span>
                          ))
                        ) : <span style={{ fontSize: 10, color: T.textMuted, fontStyle: "italic" }}>All accounts</span>}
                      </div>
                      <span onClick={() => setEditingTierIdx(tIdx)} style={{ cursor: "pointer", color: T.textMuted }}>{Ico.settings(14)}</span>
                      <span onClick={() => handleDeleteTier(tIdx)} style={{ cursor: "pointer", color: T.danger }}>{Ico.x(14)}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {(bucket.tiers || []).length === 0 && !addingTier && (
              <div style={{ padding: "16px 0", textAlign: "center", color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>No condition tiers. Add a tier for loyalty bonuses, ISA adjustments, etc.</div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, paddingTop: 10, borderTop: `1px solid ${T.borderLight}`, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "#059669" }} /> ≥ 5.00% AER</span>
            <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "#D97706" }} /> 3.50% – 4.99%</span>
            <span style={{ fontSize: 10, color: T.textMuted, display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: "#DC2626" }} /> {"< 3.50%"}</span>
            <span style={{ fontSize: 10, color: T.textMuted, marginLeft: "auto" }}>All rates AER (gross) · {bucket.balanceTiersEnabled ? "Balance tiers active" : "Flat rate"}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <BucketFormModal onSave={handleSaveBucket} onCancel={() => setShowCreateModal(false)} />}
      {editingBucketIdx != null && <BucketFormModal bucket={buckets[editingBucketIdx]} onSave={handleSaveBucket} onCancel={() => setEditingBucketIdx(null)} />}
    </div>
  );
}
