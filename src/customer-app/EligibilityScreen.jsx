import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { getBucketEligibleProducts, calcMonthlyPayment, CREDIT_PROFILES } from "../data/pricing";

// ─────────────────────────────────────────────
// ELIGIBILITY SCREEN
// Mortgage eligibility checker with product results
// ─────────────────────────────────────────────

const EMPLOYMENT_OPTIONS = [
  { value: "Employed", label: "Employed" },
  { value: "Self-Employed", label: "Self-Employed" },
  { value: "Contractor", label: "Contractor" },
];

export default function EligibilityScreen({ onBack }) {
  const [income, setIncome] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [deposit, setDeposit] = useState("");
  const [employment, setEmployment] = useState("Employed");
  const [credit, setCredit] = useState("clean");
  const [checking, setChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const numVal = (v) => Number(String(v).replace(/[^0-9.]/g, "")) || 0;
  const pv = numVal(propertyValue);
  const dep = numVal(deposit);
  const loanAmount = Math.max(0, pv - dep);
  const ltv = pv > 0 ? Math.round((loanAmount / pv) * 100) : 0;

  const canCheck = numVal(income) > 0 && pv > 0 && dep > 0 && dep < pv;

  const runCheck = () => {
    setChecking(true);
    setProgress(0);
    setResults(null);
    const steps = [10, 25, 45, 65, 80, 95, 100];
    steps.forEach((p, i) => {
      setTimeout(() => setProgress(p), (i + 1) * 200);
    });
    setTimeout(() => {
      const products = getBucketEligibleProducts({
        ltv, credit, employment, property: "Standard", epc: "D", loanAmount, termYears: 25,
      });
      setResults(products);
      setChecking(false);
    }, 1500);
  };

  const inputStyle = {
    width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}`,
    fontSize: 14, fontFamily: T.font, color: T.text, background: "#fff", outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = { fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6, display: "block" };

  const eligible = results?.filter(r => r.available) || [];
  const ineligible = results?.filter(r => !r.available) || [];

  return (
    <div style={{ padding: "0 20px 20px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: "#fff", border: `1px solid ${T.borderLight}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {Ico.arrowLeft(18)}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>Eligibility Check</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>See which products you qualify for</div>
        </div>
      </div>

      {/* Form */}
      {!results && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Annual Income</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 14 }}>£</span>
              <input type="text" value={income} onChange={e => setIncome(e.target.value)} placeholder="65,000" style={{ ...inputStyle, paddingLeft: 28 }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Property Value</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 14 }}>£</span>
              <input type="text" value={propertyValue} onChange={e => setPropertyValue(e.target.value)} placeholder="350,000" style={{ ...inputStyle, paddingLeft: 28 }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Deposit</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: T.textMuted, fontSize: 14 }}>£</span>
              <input type="text" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="50,000" style={{ ...inputStyle, paddingLeft: 28 }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Employment Status</label>
            <select value={employment} onChange={e => setEmployment(e.target.value)} style={{ ...inputStyle, appearance: "auto" }}>
              {EMPLOYMENT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Credit Profile</label>
            <select value={credit} onChange={e => setCredit(e.target.value)} style={{ ...inputStyle, appearance: "auto" }}>
              {CREDIT_PROFILES.map(c => <option key={c.id} value={c.id}>{c.label} — {c.desc}</option>)}
            </select>
          </div>

          {/* Auto-calculated metrics */}
          {pv > 0 && dep > 0 && (
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <div style={{ flex: 1, padding: "12px 14px", borderRadius: 12, background: ltv <= 75 ? T.successBg : ltv <= 90 ? T.warningBg : T.dangerBg, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>LTV</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: ltv <= 75 ? T.success : ltv <= 90 ? T.warning : T.danger }}>{ltv}%</div>
              </div>
              <div style={{ flex: 1, padding: "12px 14px", borderRadius: 12, background: T.primaryLight, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Loan Amount</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: T.primary }}>£{loanAmount.toLocaleString()}</div>
              </div>
            </div>
          )}

          <Btn primary style={{ width: "100%", justifyContent: "center", padding: "14px 20px", borderRadius: 14, fontSize: 15 }} disabled={!canCheck || checking} onClick={runCheck}>
            {checking ? "Checking..." : "Check Eligibility"}
          </Btn>
        </Card>
      )}

      {/* Progress */}
      {checking && (
        <Card style={{ marginBottom: 16, textAlign: "center" }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.navy, marginBottom: 4 }}>Checking eligibility...</div>
            <div style={{ fontSize: 12, color: T.textMuted }}>Analysing {Object.keys(getBucketEligibleProducts({ ltv: 60 })).length}+ products across all buckets</div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`, width: `${progress}%`, transition: "width 0.3s ease" }} />
          </div>
          <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6 }}>{progress}%</div>
        </Card>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Summary */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, padding: "14px", borderRadius: 14, background: T.successBg, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: T.success }}>{eligible.length}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.success }}>Eligible</div>
            </div>
            <div style={{ flex: 1, padding: "14px", borderRadius: 14, background: T.dangerBg, textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: T.danger }}>{ineligible.length}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.danger }}>Not Available</div>
            </div>
          </div>

          {/* Eligible products */}
          {eligible.map((p, i) => {
            const monthly = p.rate ? calcMonthlyPayment(loanAmount, p.rate, 25) : 0;
            return (
              <div key={i} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${T.borderLight}`, padding: "16px", marginBottom: 10, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: p.bucketColor || T.accent }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.navy }}>{p.product}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: p.bucketColor + "18", color: p.bucketColor }}>{p.bucket}</span>
                      {p.tier && p.tier !== "Base" && (
                        <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 600, background: T.primaryLight, color: T.primary }}>{p.tier}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 8, background: T.successBg }}>
                    {Ico.check(14)}
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.success }}>Eligible</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Rate</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.primary }}>{p.rate}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>Monthly</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: T.navy }}>£{monthly.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, textTransform: "uppercase" }}>ERC</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginTop: 4 }}>{p.erc}</div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Ineligible products (collapsed) */}
          {ineligible.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, marginBottom: 8 }}>Not Available ({ineligible.length})</div>
              {ineligible.slice(0, 4).map((p, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${T.borderLight}`, padding: "12px 14px", marginBottom: 6, opacity: 0.6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{p.product}</span>
                      <span style={{ fontSize: 10, color: T.textMuted, marginLeft: 8 }}>{p.bucket}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {Ico.x(12)}
                      <span style={{ fontSize: 10, color: T.danger }}>{p.reason}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Re-check */}
          <div style={{ marginTop: 16 }}>
            <Btn ghost style={{ width: "100%", justifyContent: "center" }} onClick={() => setResults(null)}>
              {Ico.arrowLeft(14)} Adjust & Re-check
            </Btn>
          </div>
        </>
      )}
    </div>
  );
}
