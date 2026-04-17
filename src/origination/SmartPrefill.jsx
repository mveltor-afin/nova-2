import { useState, useEffect, useRef, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input, Select } from "../shared/primitives";
import AutoSaveIndicator from "../shared/AutoSaveIndicator";
import { getBucketEligibleProducts, calcMonthlyPayment } from "../data/pricing";

/* ─── Fallback Product Data ──────────────────── */
const FALLBACK_PRODUCTS = [
  { name: "2-Year Fixed", rate: 4.49, monthly: 1948, status: "eligible", bucket: "Prime", bucketColor: "#059669", tier: "Standard", code: "P2F" },
  { name: "5-Year Fixed", rate: 4.89, monthly: 2019, status: "eligible", bucket: "Prime", bucketColor: "#059669", tier: "Standard", code: "P5F" },
  { name: "2-Year Tracker", rate: 5.14, monthly: 2063, status: "eligible", bucket: "Prime", bucketColor: "#059669", tier: "Standard", code: "PTR" },
];

/* ─── AI Data Pull Steps ────────────────────── */
const DATA_PULL_STEPS = [
  { label: "Searching Land Registry...", result: "14 Oak Lane, BS1 4NZ — Semi-detached, Freehold" },
  { label: "Running Automated Valuation...", result: "£495,000 (87% confidence)" },
  { label: "Pulling credit bureau...", result: "Score: 742 (Good) — No adverse" },
  { label: "Verifying employer (HMRC)...", result: "TechCorp Ltd — Confirmed, PAYE active" },
  { label: "Checking electoral roll...", result: "Registered since 2019 — Match" },
  { label: "Scanning sanctions & PEP...", result: "Clear — No matches" },
];

/* ─── Document Slots ────────────────────────── */
const DOCUMENTS = [
  { name: "Fact Find", status: "uploaded" },
  { name: "Payslip", status: "uploaded" },
  { name: "Bank Statement (x3)", status: "uploaded" },
  { name: "P60", status: "uploaded" },
  { name: "ID (Passport/DL)", status: "required" },
  { name: "Proof of Address", status: "required" },
];

/* ─── Phase Header ──────────────────────────── */
function PhaseHeader({ number, title, status }) {
  const isActive = status === "active";
  const isComplete = status === "complete";
  const isLocked = status === "locked";

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14, marginBottom: 20, paddingBottom: 16,
      borderBottom: `1px solid ${T.borderLight}`,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700,
        background: isComplete ? T.success : isActive ? `linear-gradient(135deg,${T.primary},${T.primaryDark})` : "#E0E0E0",
        color: "#fff",
        boxShadow: isActive ? `0 2px 12px ${T.primaryGlow}` : "none",
        transition: "all 0.4s ease",
      }}>
        {isComplete ? Ico.check(18) : isLocked ? Ico.lock(16) : number}
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: isLocked ? T.textMuted : T.text }}>{title}</div>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
          color: isComplete ? T.success : isActive ? T.primary : T.textMuted,
        }}>
          {isComplete ? "Complete" : isActive ? "Active" : "Locked"}
        </div>
      </div>
    </div>
  );
}

/* ─── LTV Colour Helper ─────────────────────── */
function ltvColor(ltv) {
  if (ltv < 75) return T.success;
  if (ltv <= 85) return T.warning;
  return T.danger;
}

function ltvBg(ltv) {
  if (ltv < 75) return T.successBg;
  if (ltv <= 85) return T.warningBg;
  return T.dangerBg;
}

/* ─── Status Badge for Products ─────────────── */
function EligibilityBadge({ status, reason }) {
  const cfg = {
    eligible: { bg: T.successBg, color: T.success, border: T.successBorder, icon: Ico.check(14), label: "Eligible" },
    conditional: { bg: T.warningBg, color: "#92400E", border: T.warningBorder, icon: Ico.alert(14), label: "Conditional" },
    ineligible: { bg: T.dangerBg, color: T.danger, border: T.dangerBorder, icon: Ico.x(14), label: "Ineligible" },
  }[status];

  return (
    <div>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700,
        padding: "3px 10px", borderRadius: 6, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      }}>
        {cfg.icon} {cfg.label}
      </div>
      {reason && <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>{reason}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
function SmartApply({ onStartApplication }) {
  // Phase 1 state
  const [applicantName, setApplicantName] = useState("James Mitchell");
  const [income, setIncome] = useState("70000");
  const [propertyValue, setPropertyValue] = useState("485000");
  const [deposit, setDeposit] = useState("135000");
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [eligibilityProgress, setEligibilityProgress] = useState(0);
  const [eligibilityDone, setEligibilityDone] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Phase 2 state
  const [dataPullActive, setDataPullActive] = useState(false);
  const [dataPullComplete, setDataPullComplete] = useState([]);
  const [dataPullDone, setDataPullDone] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [dipRunning, setDipRunning] = useState(false);
  const [dipResult, setDipResult] = useState(null);

  // Phase 2 editable fields
  const [personalDetails, setPersonalDetails] = useState({
    title: "Mr", firstName: "James", surname: "Mitchell", dob: "1988-06-14", niNumber: "QQ 12 34 56 C",
  });
  const [addressDetails, setAddressDetails] = useState({
    postcode: "BS1 4NZ", address1: "14 Oak Lane", city: "Bristol", yearsAtAddress: "5",
  });
  const [employmentDetails, setEmploymentDetails] = useState({
    status: "Employed", employer: "TechCorp Ltd", basicSalary: "70000", bonus: "8000", startDate: "03/2019",
  });
  const [propertyDetails, setPropertyDetails] = useState({
    address: "14 Oak Lane, Bristol BS1 4NZ", type: "Semi-Detached", value: "485000", tenure: "Freehold", bedrooms: "3", epc: "C",
  });

  // Phase 3 state
  const [consents, setConsents] = useState({ credit: false, openBanking: false, terms: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const timersRef = useRef([]);
  const phase2Ref = useRef(null);
  const phase3Ref = useRef(null);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Derived calculations
  const numProp = parseFloat(propertyValue) || 0;
  const numDeposit = parseFloat(deposit) || 0;
  const loanAmount = numProp - numDeposit;
  const ltv = numProp > 0 ? ((loanAmount / numProp) * 100) : 0;

  // Dynamic products from bucket engine
  const PRODUCTS = useMemo(() => {
    const bucketResults = getBucketEligibleProducts({
      ltv, credit: "clean", employment: employmentDetails.status === "Self-Employed" ? "Self-Employed" : "Employed",
      property: "Standard", epc: propertyDetails.epc || "C", loanAmount, termYears: 25,
    });
    if (bucketResults.length > 0) {
      return bucketResults.map(bp => ({
        name: bp.product, rate: bp.rate, status: bp.available ? "eligible" : "ineligible",
        reason: bp.reason || null, bucket: bp.bucket, bucketColor: bp.bucketColor,
        tier: bp.tier, code: bp.code, erc: bp.erc, productFee: bp.fees?.productFee,
        monthly: bp.available ? calcMonthlyPayment(loanAmount, bp.rate, 25) : 0,
      }));
    }
    return FALLBACK_PRODUCTS;
  }, [ltv, loanAmount, employmentDetails.status, propertyDetails.epc]);

  // ── Phase status ──
  const phase1Status = eligibilityDone && selectedProduct ? "complete" : "active";
  const phase2Status = selectedProduct ? (dipResult ? "complete" : "active") : "locked";
  const phase3Status = dipResult ? "active" : "locked";

  /* ─── Phase 1: Eligibility Check ──────────── */
  const handleCheckEligibility = () => {
    setCheckingEligibility(true);
    setEligibilityProgress(0);

    const interval = setInterval(() => {
      setEligibilityProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + Math.random() * 18 + 5;
      });
    }, 150);
    timersRef.current.push(interval);

    const t = setTimeout(() => {
      clearInterval(interval);
      setEligibilityProgress(100);
      setCheckingEligibility(false);
      setEligibilityDone(true);
    }, 1500);
    timersRef.current.push(t);
  };

  /* ─── Phase 2: Select Product & Start AI Pull */
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setDataPullActive(true);
    setDataPullComplete([]);
    setDataPullDone(false);
    setReviewVisible(false);

    setTimeout(() => {
      phase2Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    DATA_PULL_STEPS.forEach((_, i) => {
      const t = setTimeout(() => {
        setDataPullComplete(prev => [...prev, i]);
        if (i === DATA_PULL_STEPS.length - 1) {
          const t2 = setTimeout(() => {
            setDataPullDone(true);
            setDataPullActive(false);
            const t3 = setTimeout(() => setReviewVisible(true), 400);
            timersRef.current.push(t3);
          }, 400);
          timersRef.current.push(t2);
        }
      }, 300 * (i + 1));
      timersRef.current.push(t);
    });
  };

  /* ─── Phase 2: Run DIP ────────────────────── */
  const handleRunDip = () => {
    setDipRunning(true);
    const t = setTimeout(() => {
      setDipRunning(false);
      setDipResult({ approved: true, ref: "DIP-2026-04872" });
      setTimeout(() => {
        phase3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    }, 1800);
    timersRef.current.push(t);
  };

  /* ─── Phase 3: Submit ─────────────────────── */
  const handleSubmit = () => {
    setSubmitting(true);
    const t = setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1600);
    timersRef.current.push(t);
  };

  const handleReset = () => {
    timersRef.current.forEach(clearTimeout);
    setApplicantName("James Mitchell"); setIncome("70000"); setPropertyValue("485000"); setDeposit("135000");
    setCheckingEligibility(false); setEligibilityProgress(0); setEligibilityDone(false); setSelectedProduct(null);
    setDataPullActive(false); setDataPullComplete([]); setDataPullDone(false); setReviewVisible(false);
    setDipRunning(false); setDipResult(null);
    setConsents({ credit: false, openBanking: false, terms: false });
    setSubmitting(false); setSubmitted(false);
  };

  const fmt = (n) => "£" + Number(n).toLocaleString("en-GB");

  /* ═══════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: 32, background: T.bg, minHeight: "100vh" }}>

      {/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
          PHASE 1: QUICK CHECK
         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <PhaseHeader number={1} title="Quick Check" status={phase1Status} />

        {/* If phase 1 is complete, show collapsed summary */}
        {phase1Status === "complete" ? (
          <Card style={{ marginBottom: 32, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
              <span style={{ color: T.success }}>{Ico.check(20)}</span>
              <span style={{ fontWeight: 600 }}>{applicantName}</span>
              <span style={{ color: T.textMuted }}>|</span>
              <span>{fmt(loanAmount)} loan at {ltv.toFixed(0)}% LTV</span>
              <span style={{ color: T.textMuted }}>|</span>
              <span style={{ fontWeight: 600, color: T.primary }}>{selectedProduct.name} @ {selectedProduct.rate}%</span>
            </div>
          </Card>
        ) : (
          <>
            {/* Hero Card */}
            <Card style={{ marginBottom: 24, position: "relative", overflow: "hidden" }}>
              {/* Decorative gradient strip */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />

              {/* Auto-save badge (top-right of form) */}
              <div style={{ position: "absolute", top: 14, right: 14, zIndex: 2 }}>
                <AutoSaveIndicator value={`${applicantName}|${income}|${propertyValue}|${deposit}`} />
              </div>

              <div style={{ textAlign: "center", marginBottom: 24, paddingTop: 8 }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ color: T.accent }}>{Ico.sparkle(24)}</span>
                  <span style={{ fontSize: 22, fontWeight: 700, color: T.text }}>Smart Apply — AI-Powered Application</span>
                </div>
                <p style={{ fontSize: 14, color: T.textMuted, margin: 0 }}>Tell us the basics. Nova will do the rest.</p>
              </div>

              {/* 2x2 Input Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                <Input label="Applicant Name" value={applicantName} onChange={setApplicantName} placeholder="Full name" required />
                <Input label="Gross Annual Income" value={income} onChange={setIncome} prefix="£" placeholder="70,000" required />
                <Input label="Property Value" value={propertyValue} onChange={setPropertyValue} prefix="£" placeholder="485,000" required />
                <Input label="Deposit Amount" value={deposit} onChange={setDeposit} prefix="£" placeholder="135,000" required />
              </div>

              {/* Live LTV Indicator */}
              {numProp > 0 && numDeposit > 0 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 20, padding: "14px 18px", marginTop: 4, marginBottom: 8,
                  borderRadius: 10, background: ltvBg(ltv), border: `1px solid ${ltv < 75 ? T.successBorder : ltv <= 85 ? T.warningBorder : T.dangerBorder}`,
                  transition: "all 0.3s ease",
                }}>
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>Loan Amount: </span>
                    <span style={{ fontWeight: 700 }}>{fmt(loanAmount)}</span>
                  </div>
                  <div style={{ width: 1, height: 20, background: T.border }} />
                  <div style={{ fontSize: 13 }}>
                    <span style={{ fontWeight: 600 }}>LTV: </span>
                    <span style={{ fontWeight: 700, color: ltvColor(ltv) }}>{ltv.toFixed(1)}%</span>
                  </div>
                  <div style={{
                    marginLeft: "auto", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 6,
                    background: ltvColor(ltv), color: "#fff",
                  }}>
                    {ltv < 75 ? "Low Risk" : ltv <= 85 ? "Medium Risk" : "High Risk"}
                  </div>
                </div>
              )}

              {/* Loading Bar */}
              {checkingEligibility && (
                <div style={{ marginTop: 12, marginBottom: 8 }}>
                  <div style={{ height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3, width: `${Math.min(eligibilityProgress, 100)}%`,
                      background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`,
                      transition: "width 0.15s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 12, color: T.textMuted, textAlign: "center", marginTop: 6 }}>Analysing eligibility...</div>
                </div>
              )}

              {!eligibilityDone && (
                <Btn primary onClick={handleCheckEligibility}
                  disabled={checkingEligibility || !applicantName.trim() || !income || !propertyValue || !deposit}
                  style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center", marginTop: 8 }}>
                  {checkingEligibility ? "Checking..." : "Check Eligibility →"}
                </Btn>
              )}
            </Card>

            {/* ── Eligibility Results ──────────────── */}
            {eligibilityDone && (
              <div style={{ animation: "slideDown 0.4s ease" }}>
                {/* KPI Strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 20 }}>
                  <KPICard label="Loan Amount" value={fmt(loanAmount)} color={T.primary} />
                  <KPICard label="LTV" value={`${ltv.toFixed(0)}%`} sub={ltv < 75 ? "Within limits" : "Elevated"} color={ltvColor(ltv)} />
                  <KPICard label="Max Borrowing" value="£540,000" sub="4.5x income multiple" color={T.accent} />
                  <KPICard label="DTI Estimate" value="18.2%" sub="Below 45% threshold" color={T.success} />
                </div>

                {/* Product Cards Grid */}
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Product Matches</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginBottom: 20 }}>
                  {PRODUCTS.map((p, i) => (
                    <Card key={i} style={{
                      position: "relative", overflow: "hidden",
                      boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                      border: selectedProduct?.name === p.name ? `2px solid ${T.primary}` : `1px solid ${T.border}`,
                      transition: "all 0.2s ease",
                    }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                        background: p.status === "eligible" ? T.success : p.status === "conditional" ? T.warning : T.danger,
                      }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{p.name}</div>
                          <div style={{ display: "flex", gap: 4, marginTop: 3 }}>
                            {p.bucket && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 5, background: (p.bucketColor || T.primary) + "14", color: p.bucketColor || T.primary }}>{p.bucket}</span>}
                            {p.tier && p.tier !== "Standard" && p.tier !== "Base" && <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 5, background: "#EDE9FE", color: "#6D28D9" }}>{p.tier}</span>}
                            {p.code && <span style={{ fontSize: 9, color: T.textMuted, fontFamily: "monospace", padding: "1px 4px" }}>{p.code}</span>}
                          </div>
                        </div>
                        <EligibilityBadge status={p.status} />
                      </div>
                      <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Rate</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: T.primary }}>{p.rate != null ? p.rate + "%" : "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Monthly</div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{p.monthly ? fmt(p.monthly) : "—"}</div>
                        </div>
                        {p.productFee && (
                          <div>
                            <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.3 }}>Fee</div>
                            <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{p.productFee}</div>
                          </div>
                        )}
                      </div>
                      {p.reason && <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 10, fontStyle: "italic" }}>{p.reason}</div>}
                      {p.status === "eligible" && (
                        <Btn primary onClick={() => handleSelectProduct(p)}
                          style={{ width: "100%", justifyContent: "center", padding: "10px 16px", fontSize: 13 }}>
                          Select & Continue →
                        </Btn>
                      )}
                      {p.status === "conditional" && (
                        <Btn onClick={() => handleSelectProduct(p)}
                          style={{ width: "100%", justifyContent: "center", padding: "10px 16px", fontSize: 13, border: `1px solid ${T.warning}`, color: "#92400E" }}>
                          Select (Conditions Apply) →
                        </Btn>
                      )}
                    </Card>
                  ))}
                </div>

                {/* AI Insight */}
                <Card style={{ marginBottom: 32, background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.06))", border: `1px solid ${T.primaryGlow}` }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ color: T.accent, flexShrink: 0, marginTop: 2 }}>{Ico.sparkle(20)}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.3 }}>Nova AI Insight</div>
                      <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
                        Based on {fmt(income)} income, max borrowing is ~£540,000 at 4.5x multiple.
                        At {ltv.toFixed(0)}% LTV, 4 standard products available.{" "}
                        <span style={{ fontWeight: 700 }}>Recommended: Afin Fix 2yr 75%</span> — best rate for this profile.
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
            PHASE 2: SMART APPLICATION
           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
        {selectedProduct && (
          <div ref={phase2Ref} style={{ paddingTop: 8 }}>
            <PhaseHeader number={2} title="Smart Application" status={phase2Status} />

            {/* Collapsed summary when phase 2 is complete */}
            {phase2Status === "complete" ? (
              <Card style={{ marginBottom: 32, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                  <span style={{ color: T.success }}>{Ico.check(20)}</span>
                  <span style={{ fontWeight: 600 }}>Application built</span>
                  <span style={{ color: T.textMuted }}>|</span>
                  <span>38/52 fields auto-populated</span>
                  <span style={{ color: T.textMuted }}>|</span>
                  <span style={{ fontWeight: 600, color: T.success }}>DIP Approved — {dipResult?.ref}</span>
                </div>
              </Card>
            ) : (
              <>
                {/* Step 2a: AI Data Pull */}
                <Card style={{ marginBottom: 20, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})` }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, paddingTop: 4 }}>
                    <span style={{
                      color: T.accent, display: "inline-flex",
                      animation: dataPullActive ? "spin 1.5s linear infinite" : "none",
                    }}>{Ico.sparkle(22)}</span>
                    <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>
                      {dataPullDone ? "Data pull complete" : "Nova is building your application..."}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {DATA_PULL_STEPS.map((step, i) => {
                      const complete = dataPullComplete.includes(i);
                      return (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 12, fontSize: 13,
                          opacity: complete ? 1 : 0.3,
                          transform: complete ? "translateX(0)" : "translateX(-10px)",
                          transition: "all 0.4s ease",
                        }}>
                          <span style={{
                            width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                            background: complete ? T.success : T.borderLight, color: "#fff", flexShrink: 0,
                            transition: "all 0.3s ease",
                          }}>
                            {complete ? Ico.check(13) : <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.textMuted }} />}
                          </span>
                          <span style={{ fontWeight: 600, minWidth: 220 }}>{step.label}</span>
                          <span style={{
                            fontSize: 12, color: T.textMuted, fontStyle: "italic",
                            opacity: complete ? 1 : 0, transition: "opacity 0.5s ease 0.2s",
                          }}>{step.result}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary after data pull */}
                  {dataPullDone && (
                    <div style={{ marginTop: 20, padding: "16px 18px", borderRadius: 10, background: T.bg }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>38 of 52 fields auto-populated</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: T.success }}>73%</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: T.borderLight, overflow: "hidden", marginBottom: 10 }}>
                        <div style={{
                          height: "100%", width: "73%", borderRadius: 4,
                          background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`,
                          transition: "width 1s ease",
                        }} />
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                        <span style={{ color: "#92400E" }}>{Ico.alert(15)}</span>
                        <span style={{ color: "#92400E", fontWeight: 600 }}>2 items need your attention</span>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Step 2b: Review & Verify */}
                {reviewVisible && (
                  <div style={{ animation: "slideDown 0.5s ease" }}>
                    {/* Personal Details */}
                    <Card style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        {Ico.user(18)} Personal Details
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
                        <Select label="Title" value={personalDetails.title} onChange={v => setPersonalDetails(p => ({ ...p, title: v }))}
                          options={["Mr", "Mrs", "Ms", "Dr", "Prof"]} />
                        <Input label="First Name" value={personalDetails.firstName}
                          onChange={v => setPersonalDetails(p => ({ ...p, firstName: v }))} confidence={98} />
                        <Input label="Surname" value={personalDetails.surname}
                          onChange={v => setPersonalDetails(p => ({ ...p, surname: v }))} confidence={98} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Input label="Date of Birth" value={personalDetails.dob}
                          onChange={v => setPersonalDetails(p => ({ ...p, dob: v }))} confidence={97} />
                        <Input label="NI Number" value={personalDetails.niNumber}
                          onChange={v => setPersonalDetails(p => ({ ...p, niNumber: v }))} confidence={92} />
                      </div>
                    </Card>

                    {/* Address */}
                    <Card style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        {Ico.loans(18)} Address
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Input label="Postcode" value={addressDetails.postcode}
                          onChange={v => setAddressDetails(p => ({ ...p, postcode: v }))} confidence={99} aiSource="Land Registry" />
                        <Input label="Address Line 1" value={addressDetails.address1}
                          onChange={v => setAddressDetails(p => ({ ...p, address1: v }))} confidence={99} aiSource="Land Registry" />
                        <Input label="City" value={addressDetails.city}
                          onChange={v => setAddressDetails(p => ({ ...p, city: v }))} confidence={98} />
                        <Input label="Years at Address" value={addressDetails.yearsAtAddress}
                          onChange={v => setAddressDetails(p => ({ ...p, yearsAtAddress: v }))} confidence={88} />
                      </div>
                    </Card>

                    {/* Employment & Income */}
                    <Card style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        {Ico.products(18)} Employment & Income
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
                        <Input label="Status" value={employmentDetails.status}
                          onChange={v => setEmploymentDetails(p => ({ ...p, status: v }))} confidence={96} />
                        <Input label="Employer" value={employmentDetails.employer}
                          onChange={v => setEmploymentDetails(p => ({ ...p, employer: v }))} confidence={96} aiSource="HMRC" />
                        <Input label="Basic Salary" value={employmentDetails.basicSalary}
                          onChange={v => setEmploymentDetails(p => ({ ...p, basicSalary: v }))} prefix="£" confidence={97} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <div>
                          <Input label="Bonus" value={employmentDetails.bonus}
                            onChange={v => setEmploymentDetails(p => ({ ...p, bonus: v }))} prefix="£" confidence={85}
                            hint="Verify against employer letter" />
                        </div>
                        <Input label="Employment Start" value={employmentDetails.startDate}
                          onChange={v => setEmploymentDetails(p => ({ ...p, startDate: v }))} confidence={90} />
                      </div>
                    </Card>

                    {/* Property */}
                    <Card style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        {Ico.dashboard(18)} Property
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                        <Input label="Address" value={propertyDetails.address}
                          onChange={v => setPropertyDetails(p => ({ ...p, address: v }))} confidence={99} aiSource="Land Registry" />
                        <Input label="Type" value={propertyDetails.type}
                          onChange={v => setPropertyDetails(p => ({ ...p, type: v }))} confidence={95} />
                        <Input label="Value" value={propertyDetails.value}
                          onChange={v => setPropertyDetails(p => ({ ...p, value: v }))} prefix="£" confidence={87} aiSource="AVM" />
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 5 }}>LTV</div>
                            <div style={{
                              padding: "10px 12px", borderRadius: 9, fontSize: 15, fontWeight: 700,
                              background: ltvBg(ltv), color: ltvColor(ltv), border: `1px solid ${ltv < 75 ? T.successBorder : T.warningBorder}`,
                            }}>{ltv.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
                        <Input label="Tenure" value={propertyDetails.tenure}
                          onChange={v => setPropertyDetails(p => ({ ...p, tenure: v }))} confidence={99} />
                        <Input label="Bedrooms" value={propertyDetails.bedrooms}
                          onChange={v => setPropertyDetails(p => ({ ...p, bedrooms: v }))} confidence={90} />
                        <Input label="EPC Rating" value={propertyDetails.epc}
                          onChange={v => setPropertyDetails(p => ({ ...p, epc: v }))} confidence={85} />
                      </div>
                    </Card>

                    {/* Documents */}
                    <Card style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                        {Ico.file(18)} Documents
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                        {DOCUMENTS.map((doc, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 9,
                            background: doc.status === "uploaded" ? T.successBg : T.warningBg,
                            border: `1px solid ${doc.status === "uploaded" ? T.successBorder : T.warningBorder}`,
                          }}>
                            <span style={{ color: doc.status === "uploaded" ? T.success : "#92400E" }}>
                              {doc.status === "uploaded" ? Ico.check(16) : Ico.upload(16)}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 600 }}>{doc.name}</div>
                              <div style={{ fontSize: 11, color: doc.status === "uploaded" ? T.success : "#92400E" }}>
                                {doc.status === "uploaded" ? "Uploaded & Parsed" : "Required"}
                              </div>
                            </div>
                            {doc.status === "required" && (
                              <Btn small style={{ fontSize: 11, padding: "5px 10px" }}>Upload</Btn>
                            )}
                          </div>
                        ))}
                      </div>
                      <Card style={{ background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.06))", border: `1px solid ${T.primaryGlow}`, padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: T.accent }}>{Ico.sparkle(16)}</span>
                          <span style={{ fontSize: 12, color: T.text, flex: 1 }}>
                            4 documents auto-categorised. 2 outstanding — send request to applicant?
                          </span>
                          <Btn small primary style={{ fontSize: 11, padding: "6px 12px" }}>Auto-Chase Missing Docs</Btn>
                        </div>
                      </Card>
                    </Card>

                    {/* Confidence Summary & DIP Button */}
                    <Card style={{ marginBottom: 20, background: T.bg, border: `1px solid ${T.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, fontWeight: 700 }}>Overall application confidence: 94%</span>
                        <span style={{ fontSize: 12, color: T.textMuted }}>2 items flagged for manual review</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "94%", borderRadius: 3, background: `linear-gradient(90deg, ${T.success}, ${T.accent})` }} />
                      </div>
                    </Card>

                    {/* DIP Button / Loading / Result */}
                    {!dipResult && (
                      <div style={{ marginBottom: 32 }}>
                        {dipRunning ? (
                          <Card style={{ textAlign: "center", padding: 32 }}>
                            <span style={{ color: T.primary, display: "inline-flex", animation: "spin 1.2s linear infinite" }}>{Ico.sparkle(28)}</span>
                            <div style={{ fontSize: 15, fontWeight: 600, color: T.primary, marginTop: 12 }}>Running Decision in Principle...</div>
                            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Checking affordability, credit policy, and product rules</div>
                          </Card>
                        ) : (
                          <Btn primary onClick={handleRunDip}
                            style={{ width: "100%", padding: "16px 24px", fontSize: 15, justifyContent: "center" }}>
                            Run DIP & Continue →
                          </Btn>
                        )}
                      </div>
                    )}

                    {dipResult && (
                      <Card style={{
                        marginBottom: 32, textAlign: "center", position: "relative", overflow: "hidden",
                        boxShadow: "0 4px 24px rgba(49,184,151,0.15)",
                      }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: dipResult.approved ? T.success : T.danger }} />
                        <div style={{
                          width: 56, height: 56, borderRadius: "50%", margin: "8px auto 16px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: dipResult.approved ? T.successBg : T.dangerBg,
                          border: `2px solid ${dipResult.approved ? T.success : T.danger}`,
                        }}>
                          <span style={{ color: dipResult.approved ? T.success : T.danger }}>
                            {dipResult.approved ? Ico.check(28) : Ico.x(28)}
                          </span>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: dipResult.approved ? T.success : T.danger, marginBottom: 4 }}>
                          {dipResult.approved ? "DIP Approved" : "DIP Declined"}
                        </div>
                        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>Reference: {dipResult.ref}</div>
                        <div style={{ display: "flex", justifyContent: "center", gap: 24, fontSize: 13, marginBottom: 20 }}>
                          <div><span style={{ color: T.textMuted }}>Product:</span> <span style={{ fontWeight: 600 }}>{selectedProduct.name}</span></div>
                          <div><span style={{ color: T.textMuted }}>Rate:</span> <span style={{ fontWeight: 600 }}>{selectedProduct.rate}%</span></div>
                          <div><span style={{ color: T.textMuted }}>Loan:</span> <span style={{ fontWeight: 600 }}>{fmt(loanAmount)}</span></div>
                          <div><span style={{ color: T.textMuted }}>LTV:</span> <span style={{ fontWeight: 600 }}>{ltv.toFixed(0)}%</span></div>
                        </div>
                        {dipResult.approved && (
                          <Btn primary style={{ padding: "12px 28px", fontSize: 14 }}
                            onClick={() => phase3Ref.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                            Continue to Submit →
                          </Btn>
                        )}
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
            PHASE 3: REVIEW & SUBMIT
           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */}
        {dipResult?.approved && (
          <div ref={phase3Ref} style={{ paddingTop: 8 }}>
            <PhaseHeader number={3} title="Review & Submit" status={submitted ? "complete" : phase3Status} />

            {submitted ? (
              /* Success State */
              <Card style={{ textAlign: "center", padding: 48, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: T.success }} />
                <div style={{
                  width: 72, height: 72, borderRadius: "50%", margin: "0 auto 20px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: T.successBg, border: `3px solid ${T.success}`,
                  animation: "scaleIn 0.5s ease",
                }}>
                  <span style={{ color: T.success }}>{Ico.check(36)}</span>
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: T.success, marginBottom: 8 }}>Application Submitted</div>
                <div style={{ fontSize: 14, color: T.text, marginBottom: 4 }}>
                  Application <span style={{ fontWeight: 700, fontFamily: "monospace", letterSpacing: 0.5 }}>AFN-2026-00201</span> submitted successfully.
                </div>
                <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 28 }}>
                  It will appear in the Intake Queue within 60 seconds.
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 14 }}>
                  <Btn onClick={handleReset} style={{ padding: "12px 24px", fontSize: 14 }}>Submit Another</Btn>
                  <Btn primary onClick={() => onStartApplication?.()} style={{ padding: "12px 24px", fontSize: 14 }}>View Application</Btn>
                </div>
              </Card>
            ) : (
              <>
                {/* Summary Card */}
                <Card style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Application Summary</div>

                  {/* Applicant */}
                  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                    <span style={{ color: T.primary, flexShrink: 0 }}>{Ico.user(16)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>Applicant</div>
                      <div style={{ fontSize: 13 }}>{personalDetails.title} {personalDetails.firstName} {personalDetails.surname} | DOB: {personalDetails.dob} | NI: {personalDetails.niNumber}</div>
                    </div>
                  </div>

                  {/* Property */}
                  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                    <span style={{ color: T.primary, flexShrink: 0 }}>{Ico.dashboard(16)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>Property</div>
                      <div style={{ fontSize: 13 }}>{propertyDetails.address} | {propertyDetails.type}, {propertyDetails.tenure} | {propertyDetails.bedrooms} bed, EPC {propertyDetails.epc}</div>
                    </div>
                  </div>

                  {/* Loan Details */}
                  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                    <span style={{ color: T.primary, flexShrink: 0 }}>{Ico.dollar(16)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>Loan Details</div>
                      <div style={{ fontSize: 13 }}>
                        {selectedProduct.name} @ {selectedProduct.rate}% | {fmt(loanAmount)} loan | {ltv.toFixed(0)}% LTV | 25yr term | {fmt(selectedProduct.monthly)}/mo
                      </div>
                    </div>
                  </div>

                  {/* DIP Result */}
                  <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.borderLight}` }}>
                    <span style={{ color: T.success, flexShrink: 0 }}>{Ico.check(16)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>DIP Result</div>
                      <div style={{ fontSize: 13 }}>
                        <span style={{ fontWeight: 700, color: T.success }}>Approved</span> — {dipResult.ref}
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div style={{ display: "flex", gap: 12, padding: "10px 0" }}>
                    <span style={{ color: T.primary, flexShrink: 0 }}>{Ico.file(16)}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>Documents</div>
                      <div style={{ fontSize: 13 }}>4 of 6 uploaded and parsed | 2 outstanding (ID, Proof of Address)</div>
                    </div>
                  </div>
                </Card>

                {/* Consent Section */}
                <Card style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Consent & Declarations</div>
                  {[
                    { key: "credit", label: "I consent to a hard credit search being performed" },
                    { key: "openBanking", label: "I consent to Open Banking verification (optional)", optional: true },
                    { key: "terms", label: "I confirm all information is accurate and agree to the Terms and Conditions" },
                  ].map((c) => (
                    <label key={c.key} style={{
                      display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", cursor: "pointer",
                      borderBottom: c.key !== "terms" ? `1px solid ${T.borderLight}` : "none",
                    }}>
                      <input type="checkbox" checked={consents[c.key]}
                        onChange={() => setConsents(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                        style={{ marginTop: 2, accentColor: T.primary, width: 16, height: 16 }} />
                      <span style={{ fontSize: 13, color: T.text }}>
                        {c.label}
                        {c.optional && <span style={{ fontSize: 11, color: T.textMuted, marginLeft: 6 }}>(optional)</span>}
                      </span>
                    </label>
                  ))}
                </Card>

                {/* Submit Button */}
                {submitting ? (
                  <Card style={{ textAlign: "center", padding: 32 }}>
                    <span style={{ color: T.primary, display: "inline-flex", animation: "spin 1.2s linear infinite" }}>{Ico.sparkle(28)}</span>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.primary, marginTop: 12 }}>Submitting application...</div>
                  </Card>
                ) : (
                  <Btn primary onClick={handleSubmit}
                    disabled={!consents.credit || !consents.terms}
                    style={{ width: "100%", padding: "18px 24px", fontSize: 16, justifyContent: "center", borderRadius: 12 }}>
                    Submit Application →
                  </Btn>
                )}
              </>
            )}
          </div>
        )}

        {/* Locked Phase Indicators */}
        {phase2Status === "locked" && eligibilityDone && (
          <div style={{ opacity: 0.5, marginTop: 8 }}>
            <PhaseHeader number={2} title="Smart Application" status="locked" />
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 32, marginLeft: 50 }}>Select a product above to continue</div>
          </div>
        )}
        {phase3Status === "locked" && selectedProduct && !dipResult && (
          <div style={{ opacity: 0.5, marginTop: 8 }}>
            <PhaseHeader number={3} title="Review & Submit" status="locked" />
            <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 32, marginLeft: 50 }}>Complete DIP to continue</div>
          </div>
        )}
      </div>

      {/* ── CSS Keyframes ────────────────────────── */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default SmartApply;
