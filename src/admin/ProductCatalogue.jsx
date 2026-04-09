import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";

const LENDING = [
  { id: 1, name: "Afin Fix 2yr 75%", type: "Lending", rate: "4.49%", maxLTV: "75%", minTerm: "5yr", maxTerm: "35yr", erc: "3% / 2%", eligibility: "All", status: "Active" },
  { id: 2, name: "Afin Fix 5yr 75%", type: "Lending", rate: "4.89%", maxLTV: "75%", minTerm: "5yr", maxTerm: "35yr", erc: "5/4/3/2/1%", eligibility: "All", status: "Active" },
  { id: 3, name: "Afin Track SVR 75%", type: "Lending", rate: "5.14%", maxLTV: "75%", minTerm: "5yr", maxTerm: "35yr", erc: "None", eligibility: "All", status: "Active" },
  { id: 4, name: "Afin Fix 2yr 90%", type: "Lending", rate: "5.29%", maxLTV: "90%", minTerm: "5yr", maxTerm: "35yr", erc: "4% / 3%", eligibility: "All", status: "Active" },
  { id: 5, name: "Afin Pro Fix 2yr", type: "Lending", rate: "3.99%", maxLTV: "75%", minTerm: "5yr", maxTerm: "35yr", erc: "3% / 2%", eligibility: "Professional only", status: "Active" },
  { id: 6, name: "Afin HNW Fix 5yr", type: "Lending", rate: "4.29%", maxLTV: "85%", minTerm: "5yr", maxTerm: "35yr", erc: "5/4/3/2/1%", eligibility: "HNW only", status: "Active" },
  { id: 7, name: "Afin BTL Tracker", type: "Lending", rate: "5.99%", maxLTV: "75%", minTerm: "5yr", maxTerm: "25yr", erc: "3%", eligibility: "BTL only", status: "Active" },
  { id: 8, name: "Afin Shared Ownership", type: "Lending", rate: "5.49%", maxLTV: "95% of share", minTerm: "5yr", maxTerm: "35yr", erc: "3% / 2%", eligibility: "All", status: "Active" },
];

const SAVINGS = [
  { id: 9,  name: "1yr Fixed Deposit", type: "Savings", rate: "4.50%", keyTerms: "Min \u00a31,000 \u2014 Max \u00a3500,000", eligibility: "All", status: "Active" },
  { id: 10, name: "2yr Fixed Deposit", type: "Savings", rate: "4.85%", keyTerms: "Min \u00a31,000 \u2014 Max \u00a3500,000", eligibility: "All", status: "Active" },
  { id: 11, name: "3yr Fixed Deposit", type: "Savings", rate: "5.10%", keyTerms: "Min \u00a35,000 \u2014 Max \u00a3500,000", eligibility: "All", status: "Active" },
  { id: 12, name: "90-Day Notice", type: "Savings", rate: "3.20%", keyTerms: "Min \u00a31,000 \u2014 No Max", eligibility: "All", status: "Active" },
];

const INSURANCE = [
  { id: 13, name: "Life Cover", type: "Insurance", rate: "via Afin Protect", keyTerms: "Underwritten by partner", eligibility: "All", status: "Active" },
  { id: 14, name: "Buildings & Contents", type: "Insurance", rate: "via Afin Protect", keyTerms: "Underwritten by partner", eligibility: "All", status: "Active" },
];

const ALL_PRODUCTS = [...LENDING, ...SAVINGS, ...INSURANCE];

const typeBadge = (type) => {
  const colors = { Lending: { bg: "#DBEAFE", text: "#1E40AF" }, Savings: { bg: "#D1FAE5", text: "#065F46" }, Insurance: { bg: "#EDE9FE", text: "#5B21B6" } };
  const c = colors[type] || { bg: T.borderLight, text: T.textMuted };
  return <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{type}</span>;
};

const statusBadge = (status) => {
  const isActive = status === "Active";
  return <span style={{ background: isActive ? T.successBg : T.borderLight, color: isActive ? T.success : T.textMuted, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5 }}>{status}</span>;
};

const thStyle = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.border}` };
const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };

function ProductCatalogue() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", type: "Lending", rate: "", status: "Active" });

  const filters = ["All", "Lending", "Savings", "Insurance", "Archived"];
  const shown = filter === "All" ? ALL_PRODUCTS : filter === "Archived" ? [] : ALL_PRODUCTS.filter(p => p.type === filter);

  const activeCount = ALL_PRODUCTS.filter(p => p.status === "Active").length;
  const archivedCount = ALL_PRODUCTS.length - activeCount;

  const keyTermsFor = (p) => {
    if (p.type === "Lending") return `LTV ${p.maxLTV}, ${p.minTerm}\u2013${p.maxTerm}, ERC ${p.erc}`;
    return p.keyTerms || "\u2014";
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Product Catalogue</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Single source of truth for all lending and savings products</p>
        </div>
        <Btn primary iconNode={Ico.plus(16)} onClick={() => setShowModal(true)}>Create Product</Btn>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Total Products" value="14" color={T.primary} />
        <KPICard label="Lending" value="8" color="#1E40AF" />
        <KPICard label="Savings" value="4" color={T.success} />
        <KPICard label="Insurance" value="2" color="#5B21B6" />
        <KPICard label="Active" value={String(activeCount)} color={T.accent} />
        <KPICard label="Archived" value={String(archivedCount)} color={T.textMuted} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {filters.map(f => (
          <div key={f} onClick={() => setFilter(f)} style={{
            padding: "6px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
            background: filter === f ? T.primary : T.card, color: filter === f ? "#fff" : T.textSecondary,
            border: `1px solid ${filter === f ? T.primary : T.border}`,
          }}>{f}</div>
        ))}
      </div>

      <Card noPad>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.font }}>
          <thead>
            <tr>
              <th style={thStyle}>Product Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Rate / Premium</th>
              <th style={thStyle}>Key Terms</th>
              <th style={thStyle}>Eligibility</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(p => (
              <>
                <tr key={p.id} onClick={() => setExpanded(expanded === p.id ? null : p.id)} style={{ cursor: "pointer", background: expanded === p.id ? T.primaryLight : "transparent" }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{p.name}</td>
                  <td style={tdStyle}>{typeBadge(p.type)}</td>
                  <td style={tdStyle}>{p.rate}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{keyTermsFor(p)}</td>
                  <td style={{ ...tdStyle, fontSize: 12 }}>{p.eligibility}</td>
                  <td style={tdStyle}>{statusBadge(p.status)}</td>
                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                      <Btn small ghost icon="settings">Edit</Btn>
                      <Btn small ghost icon="download">Archive</Btn>
                    </div>
                  </td>
                </tr>
                {expanded === p.id && (
                  <tr key={`${p.id}-detail`}>
                    <td colSpan={7} style={{ padding: 0 }}>
                      <div style={{ background: T.bg, padding: 24, borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Product Name</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.name}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Type</div>
                            <div>{typeBadge(p.type)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Rate</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.rate}</div>
                          </div>
                          {p.type === "Lending" && <>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Max LTV</div>
                              <div style={{ fontSize: 14, color: T.text }}>{p.maxLTV}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Term Range</div>
                              <div style={{ fontSize: 14, color: T.text }}>{p.minTerm} \u2013 {p.maxTerm}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>ERC Schedule</div>
                              <div style={{ fontSize: 14, color: T.text }}>{p.erc}</div>
                            </div>
                          </>}
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Eligibility</div>
                            <div style={{ fontSize: 14, color: T.text }}>{p.eligibility}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Status</div>
                            <div>{statusBadge(p.status)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Fee Schedule</div>
                            <div style={{ fontSize: 14, color: T.text }}>{p.type === "Lending" ? "\u00a3999 arrangement, \u00a3250 valuation" : "No fees"}</div>
                          </div>
                        </div>
                        <Btn primary>Save Changes</Btn>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </Card>

      {/* AI Insight */}
      <Card style={{ marginTop: 20, background: `linear-gradient(135deg, ${T.primaryLight}, rgba(49,184,151,0.06))`, border: `1px solid ${T.accent}40` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: `${T.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", color: T.accent, flexShrink: 0 }}>{Ico.sparkle(18)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>AI Product Gap Analysis</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>
              No 10yr fixed rate product. 3 competitor lenders now offer 10yr fixes at 4.6\u20134.8%. Consider adding to retain rate-security-seeking borrowers.
            </div>
          </div>
        </div>
      </Card>

      {/* Create Product Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: T.card, borderRadius: 16, padding: 32, width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px", color: T.text }}>Create New Product</h2>
            <Input label="Product Name" value={newProduct.name} onChange={v => setNewProduct({ ...newProduct, name: v })} placeholder="e.g. Afin Fix 10yr 75%" required />
            <Select label="Product Type" value={newProduct.type} onChange={v => setNewProduct({ ...newProduct, type: v })} options={["Lending", "Savings", "Insurance"]} required />
            <Input label="Rate" value={newProduct.rate} onChange={v => setNewProduct({ ...newProduct, rate: v })} placeholder="e.g. 4.75%" suffix="%" required />
            <Select label="Status" value={newProduct.status} onChange={v => setNewProduct({ ...newProduct, status: v })} options={["Active", "Draft", "Archived"]} />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <Btn onClick={() => setShowModal(false)}>Cancel</Btn>
              <Btn primary onClick={() => setShowModal(false)}>Create Product</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductCatalogue;
