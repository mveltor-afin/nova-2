import { useState, useEffect, useRef } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Input } from "../shared/primitives";

const SEARCH_STEPS = [
  { label: "Searching Land Registry...", delay: 400 },
  { label: "Running AVM...", delay: 800 },
  { label: "Checking credit bureau...", delay: 1200 },
  { label: "Scanning Companies House...", delay: 1600 },
  { label: "Verifying electoral roll...", delay: 2000 },
  { label: "Pre-populating application...", delay: 2400 },
];

const FOUND_DATA = {
  property: "14 Oak Lane, Bristol BS1 4NZ — Semi-detached, 3 bed, Freehold",
  avm: "£495,000 (87% confidence)",
  owner: "James R Mitchell — on electoral roll at this address since 2019",
  employer: "TechCorp Ltd — verified via Companies House director search",
  credit: "Soft search: Score 742 (Good), 4 accounts, no adverse",
};

const CONFIDENCE_SECTIONS = [
  { section: "Personal Details", confidence: 96, fields: "12/12", color: T.success },
  { section: "Address History", confidence: 98, fields: "8/8", color: T.success },
  { section: "Employment", confidence: 85, fields: "9/11", color: T.warning },
  { section: "Income & Expenditure", confidence: 78, fields: "9/14", color: T.warning },
];

const FLAGGED_ITEMS = [
  { field: "Secondary employment income", reason: "No Companies House record found — manual payslip verification required" },
  { field: "Monthly childcare costs", reason: "No data source available — broker to confirm with applicant" },
];

function SmartPrefill({ onStartApplication }) {
  const [name, setName] = useState("");
  const [postcode, setPostcode] = useState("");
  const [searching, setSearching] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [done, setDone] = useState(false);
  const timersRef = useRef([]);

  const handleSearch = () => {
    if (!name.trim() || !postcode.trim()) return;
    setSearching(true);
    setCompletedSteps([]);
    setVisibleSteps([]);
    setDone(false);

    // Clear any existing timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    SEARCH_STEPS.forEach((step, i) => {
      // Show the step (visible but not completed)
      const showTimer = setTimeout(() => {
        setVisibleSteps((prev) => [...prev, i]);
      }, step.delay);
      timersRef.current.push(showTimer);

      // Complete the step (add checkmark)
      const completeTimer = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, i]);
      }, step.delay + 350);
      timersRef.current.push(completeTimer);
    });

    // Finish
    const doneTimer = setTimeout(() => {
      setSearching(false);
      setDone(true);
    }, 3000);
    timersRef.current.push(doneTimer);
  };

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const totalFields = 52;
  const filledFields = 38;
  const fillPct = Math.round((filledFields / totalFields) * 100);

  return (
    <div style={{ fontFamily: T.font, color: T.text, padding: 32, background: T.bg, minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ color: T.primary }}>{Ico.sparkle(28)}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.primary, background: T.primaryLight, padding: "4px 14px", borderRadius: 20 }}>Nova AI</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>Start an application in 60 seconds</h1>
        <p style={{ fontSize: 15, color: T.textMuted, margin: 0, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Enter a name and postcode. Nova will search public and credit databases to auto-populate the application form.
        </p>
      </div>

      {/* Step 1: Input */}
      {!done && (
        <Card style={{ maxWidth: 520, margin: "0 auto 28px", textAlign: "center" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 14 }}>Step 1 — Customer Lookup</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px", textAlign: "left" }}>
            <Input label="Customer Full Name" value={name} onChange={setName} placeholder="James Mitchell" required />
            <Input label="Property Postcode" value={postcode} onChange={setPostcode} placeholder="BS1 4NZ" required />
          </div>
          <Btn primary onClick={handleSearch} disabled={searching || !name.trim() || !postcode.trim()}
            style={{ width: "100%", padding: "14px 24px", fontSize: 15, justifyContent: "center", marginTop: 4 }}
            icon="sparkle">
            {searching ? "Nova is searching..." : "Let Nova Find Everything"}
          </Btn>
        </Card>
      )}

      {/* Loading animation */}
      {searching && (
        <Card style={{ maxWidth: 520, margin: "0 auto 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <span style={{ color: T.primary, animation: "spin 2s linear infinite" }}>{Ico.sparkle(20)}</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: T.primary }}>Nova is working...</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SEARCH_STEPS.map((step, i) => {
              const visible = visibleSteps.includes(i);
              const completed = completedSteps.includes(i);
              if (!visible) return null;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, fontSize: 13,
                  opacity: visible ? 1 : 0, transition: "opacity 0.3s",
                }}>
                  {completed ? (
                    <span style={{ color: T.success, fontSize: 16 }}>&#10003;</span>
                  ) : (
                    <span style={{ color: T.textMuted, fontSize: 14 }}>&#9679;</span>
                  )}
                  <span style={{ color: completed ? T.text : T.textMuted, fontWeight: completed ? 600 : 400 }}>{step.label}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Results */}
      {done && (
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {/* Found Data Summary */}
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              {Ico.check(20)}
              <span style={{ fontWeight: 700, fontSize: 15, color: T.success }}>Nova found the following data</span>
            </div>
            {[
              { icon: "loans", label: "Property", value: FOUND_DATA.property },
              { icon: "chart", label: "AVM", value: FOUND_DATA.avm },
              { icon: "user", label: "Owner", value: FOUND_DATA.owner },
              { icon: "products", label: "Employer", value: FOUND_DATA.employer },
              { icon: "shield", label: "Credit", value: FOUND_DATA.credit },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: 12, padding: "12px 0",
                borderBottom: i < 4 ? `1px solid ${T.borderLight}` : "none",
              }}>
                <span style={{ color: T.primary, flexShrink: 0, marginTop: 1 }}>{Ico[item.icon]?.(16)}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* Pre-fill Progress */}
          <Card style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{filledFields} of {totalFields} fields auto-populated</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.success }}>{fillPct}%</span>
            </div>
            {/* Progress bar */}
            <div style={{ height: 8, borderRadius: 4, background: T.borderLight, marginBottom: 20, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${fillPct}%`, borderRadius: 4, background: `linear-gradient(90deg, ${T.primary}, ${T.accent})`, transition: "width 0.8s ease" }} />
            </div>

            {/* Section confidence */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CONFIDENCE_SECTIONS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 140, fontSize: 13, fontWeight: 600 }}>{s.section}</div>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: T.borderLight, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.confidence}%`, borderRadius: 3, background: s.color }} />
                  </div>
                  <div style={{ width: 80, fontSize: 12, color: T.textMuted, textAlign: "right" }}>{s.fields} fields</div>
                  <div style={{
                    width: 48, fontSize: 11, fontWeight: 700, textAlign: "right",
                    color: s.confidence > 90 ? T.success : T.warning,
                  }}>{s.confidence}%</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Flagged Items */}
          <Card style={{ marginBottom: 20, background: T.warningBg, border: `1px solid ${T.warningBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              {Ico.alert(18)}
              <span style={{ fontWeight: 700, fontSize: 14, color: "#92400E" }}>2 items need manual verification</span>
            </div>
            {FLAGGED_ITEMS.map((item, i) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i === 0 ? `1px solid ${T.warningBorder}` : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 3 }}>{item.field}</div>
                <div style={{ fontSize: 12, color: "#92400E" }}>{item.reason}</div>
              </div>
            ))}
          </Card>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <Btn primary onClick={() => onStartApplication?.()}
              style={{ width: "100%", maxWidth: 520, padding: "16px 24px", fontSize: 16, justifyContent: "center" }}
              icon="arrow">
              Continue to Full Application
            </Btn>
            <button onClick={() => { setDone(false); setName(""); setPostcode(""); }}
              style={{
                background: "none", border: "none", cursor: "pointer", fontFamily: T.font,
                fontSize: 13, color: T.textMuted, textDecoration: "underline", padding: 4,
              }}>
              Start from Scratch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartPrefill;
