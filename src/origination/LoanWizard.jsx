import { useState, useEffect, useRef } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Input, Select, Card, SectionLabel, KPICard } from "../shared/primitives";
import { WIZARD_STEPS, WIZARD_PRODUCTS } from "../data/loans";

function LoanWizard({ onCancel, onComplete }) {
  const [step, setStep] = useState(0);
  const [joint, setJoint] = useState(null);
  const [creditStatus, setCreditStatus] = useState(null);
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiComplete, setAiComplete] = useState(false);
  const [dipRunning, setDipRunning] = useState(null);
  const [dipResults, setDipResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [expandedDip, setExpandedDip] = useState(null);
  const [docs, setDocs] = useState([]);
  const scrollRef = useRef(null);

  const activeSteps = WIZARD_STEPS.filter(s => !(s.id === "applicant2" && !joint));
  const currentStep = activeSteps[step];

  useEffect(() => { scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const next = () => { if (step < activeSteps.length - 1) setStep(step + 1); };
  const prev = () => { if (step > 0) setStep(step - 1); };
  const goTo = (idx) => { if (idx <= step) setStep(idx); };

  const runCredit = () => { setCreditStatus("loading"); setTimeout(() => setCreditStatus("approve"), 2200); };
  const simulateAI = () => { setAiProcessing(true); setTimeout(() => { setAiProcessing(false); setAiComplete(true); }, 3000); };

  const runDip = (idx) => {
    setDipRunning(idx);
    setTimeout(() => {
      const outcomes = ["Approved","Approved","Approved","Approved","Approved","Approved","Declined","Declined"];
      setDipResults(prev => [{
        idx, date: "22 Feb 2026, " + (14 + Math.floor(Math.random() * 5)) + ":" + String(Math.floor(Math.random() * 60)).padStart(2, "0"),
        product: WIZARD_PRODUCTS[idx], outcome: outcomes[idx] || "Approved",
        inputs: { amount: "£350,000", ltv: "72%", term: "25 yrs", income: "£122,000", expenditure: "£3,240/mo", stress: "7.49%", stressPayment: "£2,620/mo", score: "742" },
        reasons: idx >= 6 ? (idx === 6 ? "LTV 72% exceeds maximum 60%" : "Property type not accepted") : null,
      }, ...prev]);
      setDipRunning(null);
    }, 1800);
  };

  // ── STEP RENDERERS ──
  const StepType = () => (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <SectionLabel icon={Ico.users(22)} text="How many applicants?" sub="Single or joint application" />
      <div style={{ display: "flex", gap: 16 }}>
        {[{ val: false, label: "Single Applicant", desc: "One borrower on the mortgage", icon: Ico.user(36) },
          { val: true,  label: "Joint Applicants", desc: "Two borrowers on the mortgage", icon: Ico.users(36) }].map(opt => (
          <div key={String(opt.val)} onClick={() => setJoint(opt.val)} style={{
            flex: 1, padding: 28, borderRadius: 14, cursor: "pointer", textAlign: "center", transition: "all 0.2s",
            border: `2px solid ${joint === opt.val ? T.primary : T.border}`,
            background: joint === opt.val ? T.primaryLight : T.card,
          }}>
            <div style={{ color: joint === opt.val ? T.primary : T.textMuted, marginBottom: 12 }}>{opt.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
            <div style={{ fontSize: 12, color: T.textSecondary }}>{opt.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const ApplicantForm = ({ num }) => (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionLabel icon={Ico.user(22)} text={`Applicant ${num} Details`} sub="All fields required for the credit check" />
      <Card>
        <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr", gap: "0 16px" }}>
          <Select label="Title" options={["Select…","Mr","Mrs","Ms","Miss","Dr"]} required />
          <Input label="First Name" placeholder="James" required />
          <Input label="Surname" placeholder="Mitchell" required />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Input label="Middle Name(s)" placeholder="Optional" />
          <Input label="Date of Birth" placeholder="DD/MM/YYYY" required />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: "20px 0 12px", paddingTop: 16, borderTop: `1px solid ${T.borderLight}` }}>Current Address</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0 12px", alignItems: "end" }}>
          <Input label="Postcode" placeholder="SW19 3PQ" required />
          <Btn primary small iconNode={Ico.search(14)} style={{ marginBottom: 16 }}>Find Address</Btn>
        </div>
        <Input label="Address Line 1" placeholder="14 Oak Lane" required />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Input label="City" placeholder="Bristol" required />
          <Input label="Years at Address" placeholder="3" required />
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: T.text, margin: "20px 0 12px", paddingTop: 16, borderTop: `1px solid ${T.borderLight}` }}>Employment</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Select label="Employment Status" options={["Select…","Employed","Self-Employed","Contract","Retired"]} required />
          <Input label="Employer Name" placeholder="TechCorp Ltd" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 16px" }}>
          <Input label="Basic Salary" placeholder="70,000" prefix="£" required />
          <Input label="Bonus / Other" placeholder="8,000" prefix="£" />
          <Input label="Employment Start" placeholder="03/2019" />
        </div>
      </Card>
    </div>
  );

  const StepCredit = () => (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <SectionLabel icon={Ico.shield(22)} text="Credit Check" sub="Soft search — no credit file impact" />
      {!creditStatus && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ color: T.textMuted, marginBottom: 16 }}>{Ico.shield(48)}</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Ready to run soft credit search</div>
          <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 24 }}>This will not impact the applicant's credit score</div>
          <Btn primary onClick={runCredit} iconNode={Ico.shield(16)}>Run Credit Check</Btn>
        </Card>
      )}
      {creditStatus === "loading" && (
        <Card style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 22, border: `3px solid ${T.border}`, borderTopColor: T.primary, animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: T.primary }}>Checking credit…</div>
        </Card>
      )}
      {creditStatus === "approve" && (
        <Card style={{ background: T.successBg, border: `1px solid ${T.successBorder}` }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: T.success, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", flexShrink: 0 }}>{Ico.check(24)}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.success, marginBottom: 4 }}>Credit Check: Approved</div>
              <div style={{ fontSize: 13, color: T.textSecondary, marginBottom: 16 }}>Equifax score 742 — Good. Proceed to document upload.</div>
              {[["Score","742 — Good"],["Open Accounts","4"],["Adverse","None"],["Search Footprint","Soft (no impact)"]].map(([k,v],i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderTop: i ? `1px solid ${T.successBorder}` : "none", fontSize: 13 }}>
                  <span style={{ color: T.textSecondary }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const StepDocuments = () => {
    const handleDrop = (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
      setDocs(prev => [...prev, ...files.map(f => ({ name: f.name, size: `${(f.size / 1024).toFixed(0)} KB` }))]);
    };
    return (
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <SectionLabel icon={Ico.upload(22)} text="Document Upload" sub="Upload supporting documents. AI will categorise and extract data automatically." />
        <div onDragOver={e => e.preventDefault()} onDrop={handleDrop}
          style={{ border: `2px dashed ${T.border}`, borderRadius: 14, padding: 40, textAlign: "center", marginBottom: 20, background: "#FAFBFC", cursor: "pointer" }}
          onClick={() => document.getElementById("fileInput").click()}>
          <input id="fileInput" type="file" multiple style={{ display: "none" }} onChange={handleDrop} />
          <div style={{ color: T.textMuted, marginBottom: 12 }}>{Ico.upload(36)}</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Drop files here or click to browse</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>PDF, JPG, PNG — max 20MB each</div>
          <Btn primary small style={{ marginTop: 16 }}>Browse Files</Btn>
        </div>
        {docs.length > 0 && (
          <Card noPad>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{docs.length} files uploaded</span>
              <span style={{ fontSize: 12, color: T.success, fontWeight: 600 }}>✓ All uploads complete</span>
            </div>
            {docs.map((doc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", borderTop: i ? `1px solid ${T.borderLight}` : "none" }}>
                <div style={{ color: T.textMuted }}>{Ico.file(16)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13 }}>{doc.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>{doc.size}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: T.success, background: T.successBg, padding: "2px 8px", borderRadius: 4 }}>Uploaded</span>
              </div>
            ))}
            {!aiComplete && (
              <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, textAlign: "center" }}>
                {!aiProcessing
                  ? <Btn primary onClick={simulateAI} iconNode={Ico.sparkle(16)}>Process with AI</Btn>
                  : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 10, border: `2px solid ${T.border}`, borderTopColor: T.primary, animation: "spin 0.8s linear infinite" }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.primary }}>AI processing documents…</span>
                    </div>
                }
              </div>
            )}
            {aiComplete && (
              <div style={{ padding: "16px 20px", borderTop: `1px solid ${T.border}`, background: T.successBg, textAlign: "center", borderRadius: "0 0 14px 14px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.success }}>✓ AI complete — 42 fields populated, 6 documents categorised, 2 flags raised</span>
              </div>
            )}
          </Card>
        )}
      </div>
    );
  };

  const StepAIReview = () => {
    const sections = [
      { section: "Personal Details", items: [
        { label: "Full Name", value: "James Robert Mitchell", conf: 98, src: "Fact_Find_Mitchell.pdf" },
        { label: "Date of Birth", value: "14/03/1988", conf: 97, src: "Passport_James.jpg" },
        { label: "National Insurance", value: "QQ 12 34 56 C", conf: 92, src: "P60_James_2025.pdf" },
        { label: "Dependants", value: "1", conf: 88, src: "Fact_Find_Mitchell.pdf" },
      ]},
      { section: "Employment & Income", items: [
        { label: "Employer", value: "TechCorp Ltd", conf: 96, src: "Payslip_James_Mar2026.pdf" },
        { label: "Basic Salary", value: "£70,000", conf: 97, src: "Payslip_James_Mar2026.pdf" },
        { label: "Bonus", value: "£8,000", conf: 85, src: "Fact_Find_Mitchell.pdf", flag: "Verify against employer letter" },
      ]},
      { section: "Monthly Expenditure", items: [
        { label: "Housing Costs", value: "£1,200", conf: 88, src: "BankStatement_HSBC_Feb.pdf" },
        { label: "Council Tax", value: "£180", conf: 72, src: "Fact_Find_Mitchell.pdf", flag: "Low confidence — please verify" },
        { label: "Credit Commitments", value: "£320", conf: 94, src: "BankStatement_HSBC_Feb.pdf" },
      ]},
    ];
    return (
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <SectionLabel icon={Ico.sparkle(22)} text="AI Review" sub="Review AI-extracted data. Correct any errors before proceeding." />
        <Card style={{ marginBottom: 20, background: `linear-gradient(135deg,${T.primaryLight},${T.successBg})`, border: `1px solid ${T.primary}22` }}>
          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[{ n: "42", l: "Fields Populated" },{ n: "94%", l: "Avg Confidence" },{ n: "6", l: "Docs Categorised" },{ n: "2", l: "Flags Raised", warn: true }].map((m,i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: m.warn ? T.warning : T.primary }}>{m.n}</div>
                <div style={{ fontSize: 11, color: T.textSecondary }}>{m.l}</div>
              </div>
            ))}
          </div>
        </Card>
        {sections.map((sec, si) => (
          <div key={si} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottom: `1px solid ${T.borderLight}` }}>{sec.section}</div>
            <Card>{sec.items.map((f, fi) => <Input key={fi} label={f.label} value={f.value} confidence={f.conf} aiSource={f.src} hint={f.flag ? `⚠ ${f.flag}` : null} />)}</Card>
          </div>
        ))}
      </div>
    );
  };

  const StepAdditional = () => (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <SectionLabel icon={Ico.zap(22)} text="Additional Information" sub="Determines eligibility for specialist products" />
      <Card>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Professional Qualification</div>
        <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>Does the applicant hold a professional qualification (law, medicine, accountancy, engineering)?</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          {["Yes", "No"].map(opt => (
            <div key={opt} style={{ flex: 1, padding: "14px 20px", borderRadius: 10, border: `2px solid ${T.border}`, cursor: "pointer", textAlign: "center", fontSize: 14, fontWeight: 600 }}>{opt}</div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Net Assets (Optional)</div>
          <div style={{ background: T.primaryLight, borderRadius: 10, padding: 14, marginBottom: 16, border: `1px solid ${T.primary}22` }}>
            <div style={{ fontSize: 12, color: T.primary, fontWeight: 600, marginBottom: 4 }}>Why provide net assets?</div>
            <div style={{ fontSize: 11, color: T.textSecondary, lineHeight: 1.5 }}>Enables assessment for HNW products under FCA MCOB 1.2 exclusions — typically better rates.</div>
          </div>
          <Input label="Applicant 1 — Net Assets" placeholder="e.g. £500,000" prefix="£" />
        </div>
      </Card>
    </div>
  );

  const StepProducts = () => (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <SectionLabel icon={Ico.dollar(22)} text="Product Selection" sub="Colour-coded by eligibility. Run a DIP on any eligible product." />
      <Card noPad>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr style={{ background: T.navy }}>
            {["Product","Type","Repayment","Rate","Monthly","ERC","Notes","Actions"].map(h => (
              <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {WIZARD_PRODUCTS.map((p, i) => {
              const bg = p.elig === "green" ? T.successBg : p.elig === "yellow" ? T.warningBg : "#FFF5F5";
              const running = dipRunning === i;
              return (
                <tr key={i} style={{ background: bg, opacity: p.elig === "red" ? 0.55 : 1, borderTop: `1px solid ${T.borderLight}` }}>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{p.name}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.type}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12 }}>{p.repay}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{p.rate}</td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{p.monthly}</td>
                  <td style={{ padding: "12px 14px", fontSize: 11, color: T.textMuted }}>{p.erc}</td>
                  <td style={{ padding: "12px 14px", fontSize: 11, color: p.elig === "red" ? T.danger : T.warning, maxWidth: 180 }}>{p.note || "—"}</td>
                  <td style={{ padding: "12px 14px" }}>
                    {p.elig !== "red"
                      ? <Btn small primary disabled={running} onClick={() => runDip(i)} iconNode={running ? null : Ico.shield(14)}>{running ? "Running…" : "Run DIP"}</Btn>
                      : <span style={{ fontSize: 11, color: T.textMuted }}>Ineligible</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const StepDip = () => {
    if (!dipResults.length) return (
      <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", padding: "40px 0" }}>
        <div style={{ color: T.textMuted, marginBottom: 16 }}>{Ico.shield(48)}</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>No DIPs run yet</div>
        <div style={{ fontSize: 13, color: T.textSecondary, margin: "8px 0 24px" }}>Go back to Product Selection and run a DIP on your preferred product.</div>
        <Btn ghost onClick={prev} iconNode={Ico.arrowLeft(16)}>Back to Products</Btn>
      </div>
    );
    const latest = dipResults[0];
    const approved = latest.outcome === "Approved";
    return (
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <SectionLabel icon={Ico.shield(22)} text="DIP Result" />
        <Card style={{ textAlign: "center" }}>
          <div style={{ width: 72, height: 72, borderRadius: 36, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
            background: approved ? T.successBg : T.dangerBg, border: `2px solid ${approved ? T.successBorder : T.dangerBorder}`,
            color: approved ? T.success : T.danger }}>{approved ? Ico.check(36) : Ico.x(36)}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: approved ? T.success : T.danger }}>{latest.outcome}</div>
          <div style={{ fontSize: 14, color: T.textSecondary, marginTop: 4, fontWeight: 500 }}>{latest.product.name}</div>
          {latest.reasons && <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: T.dangerBg, fontSize: 12, color: T.danger }}>{latest.reasons}</div>}
          {approved && (
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
              <Btn small iconNode={Ico.download(14)}>DIP Letter</Btn>
              <Btn small iconNode={Ico.download(14)}>ESIS</Btn>
              <Btn primary small onClick={() => { setSelectedProduct(latest.product); next(); }} iconNode={Ico.arrow(14)}>Apply with this Product</Btn>
            </div>
          )}
        </Card>
      </div>
    );
  };

  const StepDipHistory = () => (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <SectionLabel icon={Ico.clock(22)} text="DIP History" sub={`${dipResults.length} assessment${dipResults.length !== 1 ? "s" : ""} recorded`} />
      {!dipResults.length
        ? <Card style={{ textAlign: "center", padding: 40, color: T.textMuted }}>No DIPs recorded yet.</Card>
        : <Card noPad>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: T.navy }}>
                {["Date/Time","Product","Amount","LTV","Rate","Term","Result",""].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#fff", letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {dipResults.map((dip, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${T.borderLight}` }}>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>{dip.date}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600 }}>{dip.product.name}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>{dip.inputs.amount}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13 }}>{dip.inputs.ltv}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700 }}>{dip.product.rate}</td>
                    <td style={{ padding: "12px 14px", fontSize: 12, color: T.textMuted }}>{dip.inputs.term}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5,
                        background: dip.outcome === "Approved" ? T.successBg : T.dangerBg,
                        color: dip.outcome === "Approved" ? T.success : T.danger }}>{dip.outcome}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn small ghost onClick={() => setExpandedDip(expandedDip === i ? null : i)}>▾ Inputs</Btn>
                        {dip.outcome === "Approved" && <Btn small iconNode={Ico.download(12)}>DIP</Btn>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
      }
    </div>
  );

  const StepConsent = () => (
    <div style={{ maxWidth: 580, margin: "0 auto" }}>
      <SectionLabel icon={Ico.lock(22)} text="Consents" sub="Required before submitting" />
      <Card>
        <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 10, background: T.bg, marginBottom: 20 }}>
          <div style={{ color: T.primary, flexShrink: 0, marginTop: 2 }}>{Ico.shield(20)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Hard Credit Check Consent</div>
            <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>By proceeding, you confirm that applicant(s) have given explicit consent for a full credit search. This will leave a footprint on their credit file.</div>
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", marginBottom: 24 }}>
          <input type="checkbox" style={{ accentColor: T.primary, marginTop: 3 }} />
          <span style={{ fontSize: 13 }}>I confirm all applicants have given explicit consent for a hard credit search.</span>
        </label>
        <div style={{ borderTop: `1px solid ${T.borderLight}`, paddingTop: 20 }}>
          <div style={{ display: "flex", gap: 12, padding: 16, borderRadius: 10, background: T.primaryLight, marginBottom: 20, border: `1px solid ${T.primary}22` }}>
            <div style={{ color: T.primary }}>{Ico.dollar(20)}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Open Banking (Optional)</div>
              <div style={{ fontSize: 12, color: T.textSecondary, lineHeight: 1.5 }}>Connect bank accounts to speed up verification with live income and expenditure data.</div>
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <input type="checkbox" style={{ accentColor: T.primary, marginTop: 3 }} />
            <span style={{ fontSize: 13 }}>The applicant(s) would like to connect via open banking.</span>
          </label>
        </div>
      </Card>
    </div>
  );

  const StepSubmit = () => (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <SectionLabel icon={Ico.send(22)} text="Review & Submit" sub="Review your application summary before submitting" />
      <Card style={{ marginBottom: 20 }}>
        {[
          { s: "Applicants", items: [["Applicant 1","James Mitchell"],...(joint?[["Applicant 2","Sarah Mitchell"]]:[]),["Combined Income","£122,000"]] },
          { s: "Property", items: [["Address","12 Willow Drive, Guildford GU1 2AB"],["Type","Semi-detached, Freehold"],["Value","£485,000"]] },
          { s: "Loan", items: [["Amount","£350,000"],["LTV","72%"],["Term","25 years"]] },
          { s: "Product", items: [["Product",selectedProduct?.name||"Afin Fix 2yr 75%"],["Rate",selectedProduct?.rate||"4.49%"],["Monthly",selectedProduct?.monthly||"£1,948"]] },
          { s: "DIPs", items: [["DIPs Run",`${dipResults.length}`],["DIP Result","Approved"]] },
          { s: "Consents", items: [["Hard Credit","✓ Consented"],["Open Banking","✓ Consented"]] },
        ].map((section, si, arr) => (
          <div key={si} style={{ marginBottom: si < arr.length-1 ? 16 : 0, paddingBottom: si < arr.length-1 ? 16 : 0, borderBottom: si < arr.length-1 ? `1px solid ${T.borderLight}` : "none" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{section.s}</div>
            {section.items.map(([k,v],i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                <span style={{ color: T.textMuted }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </Card>
      <Btn primary style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 15 }} onClick={onComplete} iconNode={Ico.send(18)}>
        Submit Application
      </Btn>
      <div style={{ textAlign: "center", fontSize: 11, color: T.textMuted, marginTop: 10 }}>Application will be assigned to an Afin team member for processing.</div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep?.id) {
      case "type":        return <StepType />;
      case "applicant1":  return <ApplicantForm num={1} />;
      case "applicant2":  return <ApplicantForm num={2} />;
      case "credit":      return <StepCredit />;
      case "documents":   return <StepDocuments />;
      case "aiReview":    return <StepAIReview />;
      case "additional":  return <StepAdditional />;
      case "products":    return <StepProducts />;
      case "dip":         return <StepDip />;
      case "dipHistory":  return <StepDipHistory />;
      case "consent":     return <StepConsent />;
      case "submit":      return <StepSubmit />;
      default:            return null;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: T.font, background: T.bg, color: T.text, overflow: "hidden" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Step sidebar */}
      <div style={{ width: 256, background: `linear-gradient(180deg,${T.navy},#0C1829)`, color: "#fff", display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.primary},${T.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>N</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Create Loan</div>
              <div style={{ fontSize: 10, color: T.textMuted, letterSpacing: 0.5 }}>AFN-2026-00143</div>
            </div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "10px 8px", overflow: "auto" }}>
          {activeSteps.map((s, i) => {
            const isCurrent = i === step, isPast = i < step;
            return (
              <div key={s.id} onClick={() => goTo(i)} style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8,
                cursor: isPast ? "pointer" : "default", marginBottom: 2,
                background: isCurrent ? "rgba(14,165,233,0.12)" : "transparent",
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 13, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                  background: isPast ? T.success : isCurrent ? T.primary : "rgba(255,255,255,0.06)",
                  color: (isPast || isCurrent) ? "#fff" : "#5D6D7E",
                  border: isCurrent ? `2px solid ${T.primary}` : "none" }}>
                  {isPast ? Ico.check(14) : i + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: isCurrent ? 600 : 400, color: isCurrent ? "#fff" : isPast ? "#94A3B8" : "#5D6D7E" }}>{s.label}</span>
              </div>
            );
          })}
        </nav>
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
            <div style={{ height: 4, borderRadius: 2, background: T.primary, width: `${((step+1)/activeSteps.length)*100}%`, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 5 }}>Step {step+1} of {activeSteps.length}</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "11px 28px", borderBottom: `1px solid ${T.border}`, background: T.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13, color: T.textMuted }}>
            <span style={{ color: T.primary, cursor: "pointer", fontWeight: 500 }} onClick={onCancel}>← Back to Pipeline</span>
            <span style={{ margin: "0 8px" }}>/</span>
            <span>Create New Loan</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: T.textMuted }}>Auto-saved</span>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: T.success }} />
          </div>
        </div>
        <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>{renderStep()}</div>
        <div style={{ padding: "14px 28px", borderTop: `1px solid ${T.border}`, background: T.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && <Btn ghost onClick={prev} iconNode={Ico.arrowLeft(16)}>Back</Btn>}
            <Btn ghost onClick={onCancel}>Cancel</Btn>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn ghost>Save Draft</Btn>
            {step < activeSteps.length - 1 && (
              <Btn primary onClick={next}
                disabled={(currentStep?.id === "type" && joint === null) || (currentStep?.id === "credit" && creditStatus !== "approve")}
                iconNode={Ico.arrow(16)}>
                Continue
              </Btn>
            )}
          </div>
        </div>
      </div>

      {/* AI Chatbot FAB */}
      <div onClick={() => setShowChatbot(!showChatbot)} style={{ position: "fixed", bottom: 20, right: 20, width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg,${T.primary},${T.accent})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: `0 4px 16px ${T.primaryGlow}`, zIndex: 100 }}>
        {Ico.bot(22)}
      </div>
      {showChatbot && (
        <div style={{ position: "fixed", bottom: 78, right: 20, width: 340, height: 400, background: T.card, borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", border: `1px solid ${T.border}`, zIndex: 100, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", background: `linear-gradient(135deg,${T.primary},${T.accent})`, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div style={{ fontSize: 14, fontWeight: 700 }}>Nova AI Assistant</div><div style={{ fontSize: 11, opacity: 0.8 }}>Ask about products & criteria</div></div>
            <span onClick={() => setShowChatbot(false)} style={{ cursor: "pointer", fontSize: 20, opacity: 0.8 }}>×</span>
          </div>
          <div style={{ flex: 1, padding: 14, overflow: "auto", background: T.bg }}>
            <div style={{ background: T.card, padding: "10px 14px", borderRadius: "12px 12px 12px 4px", maxWidth: "85%", fontSize: 13, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
              Hi! I can help with product criteria, eligibility, and application guidance. What would you like to know?
            </div>
          </div>
          <div style={{ padding: "10px 12px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 8 }}>
            <input placeholder="Ask about products…" style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${T.border}`, fontSize: 13, outline: "none", fontFamily: T.font }} />
            <Btn primary small iconNode={Ico.send(14)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanWizard;
