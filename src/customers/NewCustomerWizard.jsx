import React, { useState, useEffect } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";

// ─────────────────────────────────────────────
// PRODUCT CATALOGUE
// ─────────────────────────────────────────────
const PRODUCTS = [
  { id: "mortgage",       name: "Mortgage",           desc: "Residential or buy-to-let lending",    color: "#1A4A54", icon: "loans"    },
  { id: "fixed_deposit",  name: "Fixed Term Deposit",  desc: "Earn competitive fixed rates",          color: "#31B897", icon: "lock"     },
  { id: "notice_account", name: "Notice Account",      desc: "Higher rates with notice period",       color: "#6366F1", icon: "clock"    },
  { id: "current",        name: "Current Account",     desc: "Everyday banking with Helix",           color: "#0EA5E9", icon: "wallet"   },
  { id: "insurance",      name: "Insurance",           desc: "Life, home & income protection",        color: "#F59E0B", icon: "shield"   },
  { id: "shared_own",     name: "Shared Ownership",    desc: "Step onto the property ladder",         color: "#EC4899", icon: "products" },
];

const ID_TYPES = [
  { id: "passport",    name: "Passport",         icon: "file"   },
  { id: "driving",     name: "Driving Licence",  icon: "wallet" },
  { id: "national_id", name: "National ID",       icon: "shield" },
];

// ─────────────────────────────────────────────
// PHASE INDICATOR
// ─────────────────────────────────────────────
const PhaseBar = ({ current, total }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
    {Array.from({ length: total }, (_, i) => {
      const step = i + 1;
      const done = step < current;
      const active = step === current;
      return (
        <React.Fragment key={step}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, fontFamily: T.font,
            background: done ? T.success : active ? `linear-gradient(135deg,${T.primary},${T.primaryDark})` : T.bg,
            color: done || active ? "#fff" : T.textMuted,
            border: active ? "none" : done ? "none" : `1.5px solid ${T.border}`,
            transition: "all 0.3s",
          }}>
            {done ? Ico.check(14) : step}
          </div>
          {i < total - 1 && (
            <div style={{ flex: 1, height: 2, background: done ? T.success : T.border, transition: "all 0.3s", minWidth: 32 }} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────
// COLLAPSED SUMMARY STRIP
// ─────────────────────────────────────────────
const SummaryStrip = ({ label, summary, stepNum, onClick }) => (
  <div onClick={onClick} style={{
    display: "flex", alignItems: "center", gap: 12, padding: "12px 18px", marginBottom: 10,
    borderRadius: 10, background: T.successBg, border: `1px solid ${T.successBorder}`, cursor: "pointer",
    transition: "all 0.2s",
  }}>
    <div style={{
      width: 24, height: 24, borderRadius: "50%", background: T.success,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      {Ico.check(13)}
    </div>
    <div style={{ flex: 1 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{label}</span>
      <span style={{ fontSize: 12, color: T.textMuted, marginLeft: 10 }}>{summary}</span>
    </div>
    <span style={{ fontSize: 11, color: T.textMuted }}>Edit</span>
  </div>
);

// ─────────────────────────────────────────────
// MAIN WIZARD
// ─────────────────────────────────────────────
export function NewCustomerWizard({ onComplete, onCancel }) {
  const [phase, setPhase] = useState(1);

  // Phase 1 state
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [address1, setAddress1] = useState("");
  const [city, setCity] = useState("");
  const [customerType, setCustomerType] = useState("retail");

  // Phase 2 state
  const [idType, setIdType] = useState("passport");
  const [idNumber, setIdNumber] = useState("");
  const [bioLoading, setBioLoading] = useState(false);
  const [bioComplete, setBioComplete] = useState(false);
  const [amlLoading, setAmlLoading] = useState(false);
  const [amlComplete, setAmlComplete] = useState(false);
  const [electoralComplete] = useState(true);

  // Phase 3 state
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Phase 4 state
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const allKycPassed = bioComplete && amlComplete && electoralComplete;
  const kycCount = [bioComplete, amlComplete, electoralComplete].filter(Boolean).length;

  // Handlers
  const runBiometric = () => {
    setBioLoading(true);
    setTimeout(() => { setBioLoading(false); setBioComplete(true); }, 2000);
  };

  const runAml = () => {
    setAmlLoading(true);
    setTimeout(() => { setAmlLoading(false); setAmlComplete(true); }, 1500);
  };

  const toggleProduct = (id) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleCreate = () => {
    setCreating(true);
    setTimeout(() => { setCreating(false); setCreated(true); }, 1800);
    setTimeout(() => { onComplete?.({ id: "CUS-009", firstName, surname }); }, 4000);
  };

  const postcodeLookup = () => {
    if (postcode) {
      setAddress1("12 Victoria Street");
      setCity("London");
    }
  };

  // Phase summaries for collapsed strips
  const phaseSummary = (p) => {
    if (p === 1) return `${title} ${firstName} ${surname} — ${customerType === "retail" ? "Retail" : "Commercial"}`;
    if (p === 2) return `KYC ${kycCount}/3 passed — ${ID_TYPES.find(t => t.id === idType)?.name}`;
    if (p === 3) return `${selectedProducts.length} product${selectedProducts.length !== 1 ? "s" : ""} selected`;
    return "";
  };

  const phaseLabels = ["Customer Details", "Identity & KYC", "Product Selection", "Review & Create"];

  // ─── RENDERING ───
  const sectionStyle = {
    animation: "fadeSlideIn 0.4s ease",
  };

  return (
    <div style={{ fontFamily: T.font, maxWidth: 720, margin: "0 auto" }}>
      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes successPop { 0% { transform:scale(0.8); opacity:0; } 60% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {Ico.plus(20)}
          <span style={{ fontSize: 20, fontWeight: 700, color: T.text }}>New Customer Onboarding</span>
        </div>
        {onCancel && (
          <Btn ghost onClick={onCancel} icon="x" small>Cancel</Btn>
        )}
      </div>

      {/* Phase indicator */}
      <PhaseBar current={phase} total={4} />

      {/* Collapsed strips for completed phases */}
      {Array.from({ length: phase - 1 }, (_, i) => (
        <SummaryStrip
          key={i + 1}
          stepNum={i + 1}
          label={phaseLabels[i]}
          summary={phaseSummary(i + 1)}
          onClick={() => setPhase(i + 1)}
        />
      ))}

      {/* ═══════════ PHASE 1: Customer Details ═══════════ */}
      {phase === 1 && (
        <Card style={{ ...sectionStyle }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            {Ico.user(20)}
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Customer Details</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: "0 16px" }}>
            <Select label="Title" value={title} onChange={setTitle} options={["", "Mr", "Mrs", "Ms", "Miss", "Dr"]} required />
            <Input label="First Name" value={firstName} onChange={setFirstName} placeholder="e.g. James" required />
            <Input label="Surname" value={surname} onChange={setSurname} placeholder="e.g. Whitfield" required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
            <Input label="Date of Birth" value={dob} onChange={setDob} type="date" required />
            <Input label="Email" value={email} onChange={setEmail} type="email" placeholder="james@example.com" />
            <Input label="Phone" value={phone} onChange={setPhone} placeholder="+44 7700 900000" />
          </div>

          <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 16, marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 10 }}>Address</div>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 0 }}>
              <div style={{ flex: 1 }}>
                <Input label="Postcode" value={postcode} onChange={setPostcode} placeholder="SW1A 1AA" />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Btn small onClick={postcodeLookup} icon="search">Lookup</Btn>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
              <Input label="Address Line 1" value={address1} onChange={setAddress1} placeholder="12 Victoria Street" />
              <Input label="City" value={city} onChange={setCity} placeholder="London" />
            </div>
          </div>

          {/* Customer type toggle */}
          <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 16, marginTop: 4 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 10 }}>Customer Type</div>
            <div style={{ display: "flex", gap: 12 }}>
              {[{ id: "retail", label: "Retail", desc: "Individual customer", icon: "user" },
                { id: "commercial", label: "Commercial", desc: "Business / corporate", icon: "products" }].map(ct => (
                <div key={ct.id} onClick={() => setCustomerType(ct.id)} style={{
                  flex: 1, padding: "16px 18px", borderRadius: 10, cursor: "pointer",
                  border: customerType === ct.id ? `2px solid ${T.primary}` : `1.5px solid ${T.border}`,
                  background: customerType === ct.id ? T.primaryLight : T.card,
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ color: customerType === ct.id ? T.primary : T.textMuted }}>{Ico[ct.icon](18)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{ct.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted }}>{ct.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <Btn primary onClick={() => setPhase(2)} icon="arrow" disabled={!firstName || !surname}>
              Continue
            </Btn>
          </div>
        </Card>
      )}

      {/* ═══════════ PHASE 2: Identity & KYC ═══════════ */}
      {phase === 2 && (
        <Card style={{ ...sectionStyle }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            {Ico.shield(20)}
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Identity Verification</span>
          </div>

          {/* ID type selector */}
          <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 10 }}>ID Type</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
            {ID_TYPES.map(idt => (
              <div key={idt.id} onClick={() => setIdType(idt.id)} style={{
                flex: 1, padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                border: idType === idt.id ? `2px solid ${T.primary}` : `1.5px solid ${T.border}`,
                background: idType === idt.id ? T.primaryLight : T.card,
                transition: "all 0.15s",
              }}>
                <div style={{ color: idType === idt.id ? T.primary : T.textMuted, marginBottom: 6 }}>{Ico[idt.icon](22)}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{idt.name}</div>
              </div>
            ))}
          </div>

          <Input label="ID Number" value={idNumber} onChange={setIdNumber} placeholder="e.g. 533401829" />

          {/* Biometric verification */}
          <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${bioComplete ? T.successBorder : T.border}`, background: bioComplete ? T.successBg : T.card, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {bioComplete ? <span style={{ color: T.success }}>{Ico.check(16)}</span> : <span style={{ color: T.textMuted }}>{Ico.eye(16)}</span>}
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Biometric Verification</span>
              </div>
              {!bioComplete && (
                <Btn small primary onClick={runBiometric} disabled={bioLoading || !idNumber}>
                  {bioLoading ? <span style={{ animation: "pulse 1.2s infinite" }}>Verifying...</span> : "Initiate Biometric Verification"}
                </Btn>
              )}
            </div>
            {bioComplete && <div style={{ fontSize: 12, color: T.success, marginTop: 6 }}>Identity Verified — Mitek biometric match confirmed</div>}
          </div>

          {/* AML check */}
          <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${amlComplete ? T.successBorder : T.border}`, background: amlComplete ? T.successBg : T.card, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {amlComplete ? <span style={{ color: T.success }}>{Ico.check(16)}</span> : <span style={{ color: T.textMuted }}>{Ico.shield(16)}</span>}
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Sanctions & PEP Screening</span>
              </div>
              {!amlComplete && (
                <Btn small primary onClick={runAml} disabled={amlLoading}>
                  {amlLoading ? <span style={{ animation: "pulse 1.2s infinite" }}>Screening...</span> : "Run Sanctions & PEP Screening"}
                </Btn>
              )}
            </div>
            {amlComplete && <div style={{ fontSize: 12, color: T.success, marginTop: 6 }}>Clear — No matches found on ComplyAdvantage</div>}
          </div>

          {/* Electoral roll */}
          <div style={{ padding: "14px 16px", borderRadius: 10, border: `1px solid ${T.successBorder}`, background: T.successBg, marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: T.success }}>{Ico.check(16)}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Electoral Roll</span>
            </div>
            <div style={{ fontSize: 12, color: T.success, marginTop: 6 }}>Registered at provided address since 2019</div>
          </div>

          {/* Overall KYC status */}
          <div style={{
            padding: "16px 20px", borderRadius: 12, background: allKycPassed ? T.successBg : T.bg,
            border: `1px solid ${allKycPassed ? T.successBorder : T.border}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{kycCount}/3 checks passed</span>
              {[bioComplete, amlComplete, electoralComplete].map((v, i) => (
                <span key={i} style={{
                  fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: v ? T.successBg : T.bg,
                  color: v ? T.success : T.textMuted,
                  border: `1px solid ${v ? T.successBorder : T.border}`,
                }}>
                  {["Biometric", "AML", "Electoral"][i]}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <Btn ghost onClick={() => setPhase(1)} icon="arrowLeft">Back</Btn>
            <Btn primary onClick={() => setPhase(3)} icon="arrow" disabled={!allKycPassed}>
              Continue
            </Btn>
          </div>
        </Card>
      )}

      {/* ═══════════ PHASE 3: Product Selection ═══════════ */}
      {phase === 3 && (
        <Card style={{ ...sectionStyle }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            {Ico.products(20)}
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Link Products</span>
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Which products is this customer interested in?</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 18 }}>
            {PRODUCTS.map(p => {
              const sel = selectedProducts.includes(p.id);
              return (
                <div key={p.id} onClick={() => toggleProduct(p.id)} style={{
                  padding: "16px 14px", borderRadius: 12, cursor: "pointer", position: "relative",
                  border: sel ? `2px solid ${T.success}` : `1.5px solid ${T.border}`,
                  background: sel ? T.successBg : T.card,
                  transition: "all 0.15s",
                }}>
                  {sel && (
                    <div style={{
                      position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: "50%",
                      background: T.success, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "#fff" }}>{Ico.check(12)}</span>
                    </div>
                  )}
                  <div style={{
                    width: 34, height: 34, borderRadius: 8, marginBottom: 10,
                    background: sel ? `${p.color}22` : `${p.color}11`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: p.color,
                  }}>
                    {Ico[p.icon](18)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 3 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted, lineHeight: 1.3 }}>{p.desc}</div>
                </div>
              );
            })}
          </div>

          {selectedProducts.includes("mortgage") && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8,
              background: "#EDE9FE", border: "1px solid #C4B5FD", marginBottom: 12,
            }}>
              {Ico.loans(15)}
              <span style={{ fontSize: 12, color: "#5B21B6" }}>This will create a lending application in your Smart Apply queue.</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <Btn ghost onClick={() => setPhase(2)} icon="arrowLeft">Back</Btn>
            <Btn primary onClick={() => setPhase(4)} icon="arrow" disabled={selectedProducts.length === 0}>
              Continue
            </Btn>
          </div>
        </Card>
      )}

      {/* ═══════════ PHASE 4: Summary & Create ═══════════ */}
      {phase === 4 && (
        <Card style={{ ...sectionStyle }}>
          {!created ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                {Ico.check(20)}
                <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Review & Create Customer</span>
              </div>

              {/* Details summary */}
              <div style={{ padding: "16px 18px", borderRadius: 10, background: T.bg, border: `1px solid ${T.borderLight}`, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Customer Details</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 24px", fontSize: 13 }}>
                  <div><span style={{ color: T.textMuted }}>Name:</span> <span style={{ fontWeight: 600, color: T.text }}>{title} {firstName} {surname}</span></div>
                  <div><span style={{ color: T.textMuted }}>DOB:</span> <span style={{ fontWeight: 600, color: T.text }}>{dob}</span></div>
                  <div><span style={{ color: T.textMuted }}>Email:</span> <span style={{ fontWeight: 600, color: T.text }}>{email}</span></div>
                  <div><span style={{ color: T.textMuted }}>Phone:</span> <span style={{ fontWeight: 600, color: T.text }}>{phone}</span></div>
                  <div><span style={{ color: T.textMuted }}>Address:</span> <span style={{ fontWeight: 600, color: T.text }}>{address1}, {city} {postcode}</span></div>
                  <div><span style={{ color: T.textMuted }}>Type:</span> <span style={{ fontWeight: 600, color: T.text }}>{customerType === "retail" ? "Retail" : "Commercial"}</span></div>
                </div>
              </div>

              {/* KYC summary */}
              <div style={{ padding: "14px 18px", borderRadius: 10, background: T.successBg, border: `1px solid ${T.successBorder}`, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: T.success }}>{Ico.shield(16)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>KYC Status: All checks passed</span>
                <span style={{ color: T.success, marginLeft: 4 }}>{Ico.check(14)}</span>
              </div>

              {/* Products selected */}
              <div style={{ padding: "14px 18px", borderRadius: 10, background: T.bg, border: `1px solid ${T.borderLight}`, marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Products Selected</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {selectedProducts.map(pid => {
                    const pr = PRODUCTS.find(p => p.id === pid);
                    return (
                      <span key={pid} style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                        background: `${pr.color}15`, color: pr.color, border: `1px solid ${pr.color}33`,
                      }}>
                        {Ico[pr.icon](12)} {pr.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Segment & gamification */}
              <div style={{ padding: "14px 18px", borderRadius: 10, background: T.bg, border: `1px solid ${T.borderLight}`, marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: T.text, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>Segment:</span> Auto-assigned: <strong>Standard</strong>
                  {selectedProducts.length >= 2 && <span style={{ fontSize: 11, color: T.success, marginLeft: 6 }}>(upgrade to Premier with 2+ products)</span>}
                </div>
                <div style={{ fontSize: 13, color: T.text }}>
                  <span style={{ fontWeight: 600 }}>Gamification:</span> Customer will start at <strong>Bronze</strong> tier with <strong>0</strong> points
                </div>
              </div>

              {selectedProducts.includes("mortgage") && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8,
                  background: "#EDE9FE", border: "1px solid #C4B5FD", marginBottom: 14,
                }}>
                  {Ico.loans(15)}
                  <span style={{ fontSize: 12, color: "#5B21B6" }}>A lending application has been created and will appear in your Smart Apply queue.</span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                <Btn ghost onClick={() => setPhase(3)} icon="arrowLeft">Back</Btn>
                <Btn primary onClick={handleCreate} disabled={creating}>
                  {creating ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ animation: "pulse 1.2s infinite" }}>Creating customer...</span>
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>{Ico.check(15)} Create Customer</span>
                  )}
                </Btn>
              </div>
            </>
          ) : (
            /* Success state */
            <div style={{ textAlign: "center", padding: "40px 20px", animation: "successPop 0.5s ease" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: T.successBg,
                border: `2px solid ${T.success}`, display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 18px",
              }}>
                <span style={{ color: T.success }}>{Ico.check(30)}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 8 }}>Customer CUS-009 created successfully</div>
              <div style={{ fontSize: 13, color: T.textMuted }}>Redirecting...</div>
              {selectedProducts.includes("mortgage") && (
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 8,
                  background: "#EDE9FE", border: "1px solid #C4B5FD", marginTop: 18,
                }}>
                  {Ico.loans(15)}
                  <span style={{ fontSize: 12, color: "#5B21B6" }}>A lending application has been created and will appear in your Smart Apply queue.</span>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default NewCustomerWizard;
