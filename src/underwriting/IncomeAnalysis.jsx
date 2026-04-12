import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard, Select } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";

// ─────────────────────────────────────────────
// INCOME DATA PER CASE
// ─────────────────────────────────────────────

const INCOME_DATA = {
  "AFN-2026-00142": {
    sources: [
      { name: "Basic Salary", amount: 70000, color: "#1E40AF" },
      { name: "Bonus", amount: 8000, color: "#F59E0B" },
    ],
    total: 78000,
    verification: [
      { source: "Payslip (3 months)", status: "verified", note: null },
      { source: "P60 (2025)", status: "verified", note: "£2,500 less than declared — verified as pre-tax pension contribution" },
      { source: "HMRC Tax Calculation", status: "verified", note: null },
      { source: "Bank Statements (3 months)", status: "verified", note: null },
    ],
    monthlyTrend: [
      { month: "Apr", amount: 5833 }, { month: "May", amount: 5833 }, { month: "Jun", amount: 5833 },
      { month: "Jul", amount: 5833 }, { month: "Aug", amount: 5833 }, { month: "Sep", amount: 5833 },
      { month: "Oct", amount: 5833 }, { month: "Nov", amount: 5833 }, { month: "Dec", amount: 5833 },
      { month: "Jan", amount: 5833 }, { month: "Feb", amount: 13833 }, { month: "Mar", amount: 5833 },
    ],
    trendMonths: 12,
    yoy: null,
    affordability: { dti: "18.2%", dtiStressed: "24.1%", dtiColor: T.success, stressedColor: T.success },
    sustainability: { level: "HIGH", color: T.success, text: "Permanent employment, 7 years tenure, consistent income" },
    ai: "Income stable and verified from 4 sources. Bonus is discretionary but has been paid consistently for 3 consecutive years. P60 variance explained by pension contributions. No concerns.",
    ioData: null,
    budgetData: null,
  },

  "AFN-2026-00119": {
    sources: [
      { name: "Sole Trader Profit", amount: 45000, color: "#1E40AF" },
      { name: "Rental Income", amount: 12000, color: "#059669" },
      { name: "Dividends", amount: 8000, color: "#7C3AED" },
    ],
    total: 65000,
    verification: [
      { source: "SA302 (2 years)", status: "verified", note: null },
      { source: "Tax Calculations", status: "verified", note: null },
      { source: "Bank Statements (6 months)", status: "verified", note: null },
      { source: "Rental Agreement", status: "verified", note: null },
      { source: "Company Accounts", status: "failed", note: "Only 1 year available — policy requires 2 years" },
    ],
    monthlyTrend: [
      { month: "Apr 24", amount: 3200 }, { month: "May 24", amount: 4100 }, { month: "Jun 24", amount: 3800 },
      { month: "Jul 24", amount: 2800 }, { month: "Aug 24", amount: 3500 }, { month: "Sep 24", amount: 4200 },
      { month: "Oct 24", amount: 5800 }, { month: "Nov 24", amount: 6500 }, { month: "Dec 24", amount: 5200 },
      { month: "Jan 25", amount: 3100 }, { month: "Feb 25", amount: 3600 }, { month: "Mar 25", amount: 4000 },
      { month: "Apr 25", amount: 3900 }, { month: "May 25", amount: 4800 }, { month: "Jun 25", amount: 4200 },
      { month: "Jul 25", amount: 3400 }, { month: "Aug 25", amount: 4100 }, { month: "Sep 25", amount: 5100 },
      { month: "Oct 25", amount: 6200 }, { month: "Nov 25", amount: 6500 }, { month: "Dec 25", amount: 5800 },
      { month: "Jan 26", amount: 3800 }, { month: "Feb 26", amount: 4200 }, { month: "Mar 26", amount: 4600 },
    ],
    trendMonths: 24,
    yoy: { year1: 52000, year2: 65000, growth: "+25%", flag: "Insufficient history — only 2 years available" },
    affordability: { dti: "28.4%", dtiStressed: "42.1%", dtiColor: T.success, stressedColor: "#F59E0B" },
    sustainability: { level: "MEDIUM", color: "#F59E0B", text: "Self-employed 2 years, income growing but variable. Rental income stable." },
    ai: "Self-employed income has grown 25% YoY but only 2 years of history available. Monthly variability is high (±35%). Rental income (£12,000) is stable and can be relied upon. Recommend: use 2-year average (£58,500) for affordability, not latest year.",
    ioData: null,
    budgetData: null,
  },

  "AFN-2026-00135": {
    sources: [
      { name: "Basic Salary (App 1)", amount: 85000, color: "#1E40AF" },
      { name: "Overtime (App 1)", amount: 15000, color: "#F59E0B" },
      { name: "Partner Salary (App 2)", amount: 42000, color: "#0D9488" },
    ],
    total: 142000,
    verification: [
      { source: "App 1: Payslip (3 months)", status: "verified", note: null },
      { source: "App 1: P60 (2025)", status: "verified", note: null },
      { source: "App 1: HMRC Tax Calculation", status: "verified", note: null },
      { source: "App 1: Bank Statements", status: "verified", note: null },
      { source: "App 2: Payslip (3 months)", status: "verified", note: null },
      { source: "App 2: P60 (2025)", status: "verified", note: null },
      { source: "App 2: Bank Statements", status: "verified", note: null },
    ],
    monthlyTrend: [
      { month: "Apr", amount: 10583 }, { month: "May", amount: 10583 }, { month: "Jun", amount: 11833 },
      { month: "Jul", amount: 10583 }, { month: "Aug", amount: 10583 }, { month: "Sep", amount: 11833 },
      { month: "Oct", amount: 10583 }, { month: "Nov", amount: 10583 }, { month: "Dec", amount: 12833 },
      { month: "Jan", amount: 10583 }, { month: "Feb", amount: 10583 }, { month: "Mar", amount: 11833 },
    ],
    trendMonths: 12,
    yoy: null,
    affordability: { dti: "22.5%", dtiStressed: "29.8%", dtiColor: T.success, stressedColor: T.success },
    sustainability: { level: "HIGH", color: T.success, text: "Joint income, stable employment, but IO requires robust repayment vehicle" },
    ai: "Joint income £142,000 comfortably supports IO payment. Repayment vehicle (ISA) projected to cover shortfall by 84% — recommend condition: annual review of repayment vehicle adequacy.",
    ioData: {
      currentAge: 46,
      retirementAge: 67,
      loanAmount: 425000,
      endowmentValue: 180000,
      projectedShortfall: 232000,
      repaymentVehicle: "ISA Portfolio",
      currentValue: 95000,
      projectedValue: 245000,
      coveragePercent: 84,
    },
    budgetData: {
      monthlyIncome: 11833,
      items: [
        { name: "IO Mortgage Payment", amount: 1872, color: "#1E40AF" },
        { name: "Council Tax & Insurance", amount: 380, color: "#7C3AED" },
        { name: "Transport", amount: 650, color: "#0D9488" },
        { name: "Childcare", amount: 1200, color: "#F59E0B" },
        { name: "Existing Commitments", amount: 420, color: "#DC2626" },
        { name: "Living Costs", amount: 3200, color: "#6B7280" },
      ],
      totalOutgoings: 7722,
      surplus: 4111,
    },
  },
};

// Generate default income data for cases without specific data
function getIncomeData(caseId) {
  if (INCOME_DATA[caseId]) return INCOME_DATA[caseId];
  const loan = MOCK_LOANS.find(l => l.id === caseId);
  const amount = parseInt((loan?.amount || "£300,000").replace(/[^\d]/g, ""));
  const estimatedIncome = Math.round(amount / 4.5);
  const monthly = Math.round(estimatedIncome / 12);

  return {
    sources: [
      { name: "Primary Salary", amount: Math.round(estimatedIncome * 0.85), color: "#1E40AF" },
      { name: "Other Income", amount: Math.round(estimatedIncome * 0.15), color: "#F59E0B" },
    ],
    total: estimatedIncome,
    verification: [
      { source: "Payslip (3 months)", status: "verified", note: null },
      { source: "P60 (2025)", status: "verified", note: null },
      { source: "Bank Statements", status: "verified", note: null },
    ],
    monthlyTrend: ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"].map(m => ({
      month: m, amount: monthly + Math.round((Math.random() - 0.5) * monthly * 0.1),
    })),
    trendMonths: 12,
    yoy: null,
    affordability: { dti: "24.0%", dtiStressed: "31.5%", dtiColor: T.success, stressedColor: T.success },
    sustainability: { level: "HIGH", color: T.success, text: "Stable employment, verified income sources" },
    ai: `Income of £${estimatedIncome.toLocaleString()} is verified and supports the requested loan of ${loan?.amount || "£300,000"}. Standard risk profile.`,
    ioData: null,
    budgetData: null,
  };
}

// ─────────────────────────────────────────────
// CHART COMPONENTS
// ─────────────────────────────────────────────

function StackedHorizontalBar({ sources, total }) {
  return (
    <div>
      <div style={{ display: "flex", height: 36, borderRadius: 8, overflow: "hidden", marginBottom: 12 }}>
        {sources.map((s, i) => (
          <div key={i} style={{
            width: `${(s.amount / total) * 100}%`, background: s.color,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 11, fontWeight: 700, minWidth: 40,
          }}>
            {Math.round((s.amount / total) * 100)}%
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
        {sources.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: s.color }} />
            <span style={{ fontSize: 12, color: T.text }}>{s.name}: <strong>£{s.amount.toLocaleString()}</strong></span>
          </div>
        ))}
        <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginLeft: "auto" }}>
          Total: £{total.toLocaleString()}
        </div>
      </div>
    </div>
  );
}

function MonthlyBarChart({ data, highlightMonth }) {
  const max = Math.max(...data.map(d => d.amount));
  const barWidth = Math.max(16, Math.floor(600 / data.length) - 4);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, minWidth: data.length * (barWidth + 3), height: 140, paddingBottom: 24, position: "relative" }}>
        {data.map((d, i) => {
          const h = Math.round((d.amount / max) * 110);
          const isHighlight = d.month === highlightMonth;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: barWidth }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: T.textMuted, marginBottom: 2 }}>
                £{(d.amount / 1000).toFixed(1)}k
              </div>
              <div style={{
                width: barWidth - 2, height: h, borderRadius: 3,
                background: isHighlight ? "#F59E0B" : `linear-gradient(180deg, ${T.primary}, ${T.primaryDark})`,
              }} />
              <div style={{ fontSize: 8, color: T.textMuted, marginTop: 4, transform: "rotate(-45deg)", transformOrigin: "top left", whiteSpace: "nowrap" }}>
                {d.month}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerificationChecklist({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => {
        const isVerified = item.status === "verified";
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
              background: isVerified ? T.successBg : T.dangerBg,
              color: isVerified ? T.success : T.danger,
            }}>
              {isVerified ? Ico.check(14) : Ico.x(14)}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{item.source}</div>
              {item.note && (
                <div style={{ fontSize: 11, color: isVerified ? T.textMuted : T.danger, marginTop: 2 }}>{item.note}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BudgetComparison({ data }) {
  const incomeWidth = 100;
  const outgoingsWidth = Math.round((data.totalOutgoings / data.monthlyIncome) * 100);
  const surplusWidth = incomeWidth - outgoingsWidth;

  return (
    <div>
      {/* Income bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Monthly Income</div>
        <div style={{ height: 32, borderRadius: 6, background: `linear-gradient(90deg, ${T.primary}, ${T.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700 }}>
          £{data.monthlyIncome.toLocaleString()}
        </div>
      </div>

      {/* Outgoings stacked bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Monthly Outgoings</div>
        <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden" }}>
          {data.items.map((item, i) => (
            <div key={i} style={{
              width: `${(item.amount / data.monthlyIncome) * 100}%`,
              background: item.color, display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 9, fontWeight: 600, minWidth: 28,
            }}>
              {Math.round((item.amount / data.monthlyIncome) * 100)}%
            </div>
          ))}
          {/* Surplus gap */}
          <div style={{
            flex: 1, background: `repeating-linear-gradient(45deg, ${T.successBg}, ${T.successBg} 4px, transparent 4px, transparent 8px)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 700, color: T.success,
          }}>
            Surplus
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
        {data.items.map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color }} />
            <span style={{ color: T.textMuted }}>{item.name}:</span>
            <span style={{ fontWeight: 600 }}>£{item.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 16, padding: "12px 16px", background: T.successBg, borderRadius: 8 }}>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: T.textMuted }}>Total Outgoings: </span>
          <span style={{ fontWeight: 700 }}>£{data.totalOutgoings.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: T.textMuted }}>Monthly Surplus: </span>
          <span style={{ fontWeight: 700, color: T.success }}>£{data.surplus.toLocaleString()}</span>
        </div>
        <div style={{ fontSize: 12 }}>
          <span style={{ color: T.textMuted }}>Surplus Ratio: </span>
          <span style={{ fontWeight: 700, color: T.success }}>{Math.round((data.surplus / data.monthlyIncome) * 100)}%</span>
        </div>
      </div>
    </div>
  );
}

function RepaymentVehicleProjection({ data }) {
  const yearsToRetirement = data.retirementAge - data.currentAge;
  const totalRequired = data.loanAmount;
  const coverageColor = data.coveragePercent >= 100 ? T.success : data.coveragePercent >= 75 ? "#F59E0B" : T.danger;

  return (
    <div>
      {/* Timeline bar */}
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 600 }}>Current Age</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.primary }}>{data.currentAge}</div>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div style={{ flex: 1, height: 4, background: T.borderLight, borderRadius: 2, position: "relative" }}>
            <div style={{
              width: `${Math.min(100, ((new Date().getFullYear() - (new Date().getFullYear() - (data.retirementAge - data.currentAge - yearsToRetirement))) / yearsToRetirement) * 100)}%`,
              height: "100%", background: T.primary, borderRadius: 2,
            }} />
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 600 }}>Retirement</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.primary }}>{data.retirementAge}</div>
        </div>
      </div>

      {/* Key figures grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        <div style={{ padding: "12px", background: T.primaryLight, borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Loan Amount</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>£{data.loanAmount.toLocaleString()}</div>
        </div>
        <div style={{ padding: "12px", background: T.primaryLight, borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Endowment</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>£{data.endowmentValue.toLocaleString()}</div>
        </div>
        <div style={{ padding: "12px", background: T.primaryLight, borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{data.repaymentVehicle}</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>£{data.currentValue.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>current</div>
        </div>
        <div style={{ padding: "12px", background: coverageColor === T.success ? T.successBg : coverageColor === "#F59E0B" ? T.warningBg : T.dangerBg, borderRadius: 8, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Projected at Maturity</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: coverageColor }}>£{data.projectedValue.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: coverageColor, fontWeight: 600, marginTop: 2 }}>{data.coveragePercent}% coverage</div>
        </div>
      </div>

      {/* Coverage bar */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 6 }}>Repayment Coverage Projection</div>
        <div style={{ position: "relative", height: 28, borderRadius: 6, background: T.borderLight, overflow: "hidden" }}>
          {/* Endowment portion */}
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%",
            width: `${Math.min(100, (data.endowmentValue / data.loanAmount) * 100)}%`,
            background: T.primary,
          }} />
          {/* ISA projection portion */}
          <div style={{
            position: "absolute", top: 0, left: `${(data.endowmentValue / data.loanAmount) * 100}%`, height: "100%",
            width: `${Math.min(100 - (data.endowmentValue / data.loanAmount) * 100, (data.projectedValue / data.loanAmount) * 100)}%`,
            background: `repeating-linear-gradient(45deg, ${coverageColor}, ${coverageColor} 4px, ${coverageColor}88 4px, ${coverageColor}88 8px)`,
          }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
            £{(data.endowmentValue + data.projectedValue).toLocaleString()} of £{data.loanAmount.toLocaleString()}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: T.primary }} />
            <span style={{ color: T.textMuted }}>Endowment: £{data.endowmentValue.toLocaleString()}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: coverageColor }} />
            <span style={{ color: T.textMuted }}>{data.repaymentVehicle} (projected): £{data.projectedValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shortfall warning */}
      {data.coveragePercent < 100 && (
        <div style={{ padding: "10px 14px", background: T.warningBg, borderRadius: 8, border: `1px solid ${T.warningBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ color: "#92400E" }}>{Ico.alert(16)}</div>
          <div style={{ fontSize: 12, color: "#92400E" }}>
            Projected shortfall of <strong>£{data.projectedShortfall.toLocaleString()}</strong> at maturity ({100 - data.coveragePercent}% gap). Annual review of repayment vehicle adequacy recommended.
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// INCOME PREDICTOR — projects future earnings
// based on job type, sector, level and experience
// ─────────────────────────────────────────────

const SECTORS = {
  "Technology":     { mult: 1.30, label: "Technology" },
  "Finance":        { mult: 1.20, label: "Financial Services" },
  "Legal":          { mult: 1.15, label: "Legal" },
  "Engineering":    { mult: 1.10, label: "Engineering" },
  "Healthcare":     { mult: 1.00, label: "Healthcare" },
  "Construction":   { mult: 0.95, label: "Construction" },
  "Education":      { mult: 0.85, label: "Education" },
  "Public Sector":  { mult: 0.80, label: "Public Sector" },
  "Retail":         { mult: 0.85, label: "Retail / Hospitality" },
};

const LEVELS = {
  "Junior":    { growth: 0.10, vol: 0.05, label: "Junior / Entry" },
  "Mid":       { growth: 0.07, vol: 0.04, label: "Mid-level" },
  "Senior":    { growth: 0.05, vol: 0.04, label: "Senior" },
  "Lead":      { growth: 0.045, vol: 0.05, label: "Lead / Principal" },
  "Manager":   { growth: 0.05, vol: 0.05, label: "Manager" },
  "Director":  { growth: 0.04, vol: 0.07, label: "Director" },
  "Executive": { growth: 0.035, vol: 0.10, label: "Executive / C-suite" },
};

function predictIncome({ baseIncome, sector, level, years }) {
  const sectorMult = SECTORS[sector]?.mult ?? 1;
  const lvl = LEVELS[level] ?? LEVELS["Mid"];
  // Slight bonus to growth in early career
  const tenureBoost = years < 3 ? 0.02 : years < 7 ? 0.01 : 0;
  const annualGrowth = lvl.growth * sectorMult + tenureBoost;
  const vol = lvl.vol;

  const projection = [];
  for (let y = 0; y <= 5; y++) {
    const central = baseIncome * Math.pow(1 + annualGrowth, y);
    const upper = central * (1 + vol * y * 0.6);
    const lower = central * (1 - vol * y * 0.6);
    projection.push({ year: y, central: Math.round(central), upper: Math.round(upper), lower: Math.round(lower) });
  }
  return { projection, annualGrowth, vol };
}

function ProjectionChart({ projection }) {
  const max = Math.max(...projection.map(p => p.upper));
  const min = Math.min(...projection.map(p => p.lower));
  const range = max - min || 1;
  const w = 100 / (projection.length - 1);
  const yScale = v => 100 - ((v - min) / range) * 100;

  const centralLine = projection.map((p, i) => `${i * w},${yScale(p.central)}`).join(" ");
  const upperPath = projection.map((p, i) => `${i * w},${yScale(p.upper)}`).join(" ");
  const lowerPath = projection.slice().reverse().map((p, i) => {
    const idx = projection.length - 1 - i;
    return `${idx * w},${yScale(p.lower)}`;
  }).join(" ");
  const bandPath = `${upperPath} ${lowerPath}`;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: 200, overflow: "visible" }}>
        <polygon points={bandPath} fill={`${T.primary}20`} stroke="none" />
        <polyline points={centralLine} fill="none" stroke={T.primary} strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        {projection.map((p, i) => (
          <circle key={i} cx={i * w} cy={yScale(p.central)} r="1.2" fill={T.primary} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, color: T.textMuted, fontWeight: 600 }}>
        {projection.map(p => (
          <div key={p.year} style={{ textAlign: "center", flex: 1 }}>
            <div>Y{p.year}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.text }}>£{(p.central / 1000).toFixed(0)}k</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncomePredictor({ baseIncome }) {
  const [jobTitle, setJobTitle] = useState("Software Engineer");
  const [sector, setSector] = useState("Technology");
  const [level, setLevel] = useState("Senior");
  const [years, setYears] = useState(7);

  const { projection, annualGrowth, vol } = predictIncome({ baseIncome, sector, level, years });
  const fiveYr = projection[5];
  const growthPct = Math.round(annualGrowth * 1000) / 10;
  const totalGrowth = Math.round(((fiveYr.central - baseIncome) / baseIncome) * 100);

  // Peer benchmark (mock — based on level + sector)
  const peerMedian = Math.round(baseIncome * (1 + (SECTORS[sector].mult - 1) * 0.5));
  const peerLow = Math.round(peerMedian * 0.75);
  const peerHigh = Math.round(peerMedian * 1.30);
  const vsPeer = Math.round(((baseIncome - peerMedian) / peerMedian) * 100);

  const sustainabilityNote =
    growthPct >= 6 ? { color: T.success, label: "STRONG TRAJECTORY", text: "High growth profession with healthy salary progression — affordability likely to improve over the loan term." }
    : growthPct >= 4 ? { color: T.success, label: "STABLE TRAJECTORY", text: "Steady real-terms income growth expected — comfortable headroom against future rate stress." }
    : growthPct >= 2 ? { color: "#F59E0B", label: "MODEST TRAJECTORY", text: "Below-average wage growth for this profession — monitor affordability under stressed scenarios." }
    : { color: T.danger, label: "FLAT TRAJECTORY", text: "Limited income growth expected — consider stressed affordability carefully." };

  return (
    <div>
      {/* Inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Job Title</div>
          <input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontFamily: T.font }} />
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Sector</div>
          <select value={sector} onChange={e => setSector(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontFamily: T.font, background: T.card }}>
            {Object.entries(SECTORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Seniority Level</div>
          <select value={level} onChange={e => setLevel(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontFamily: T.font, background: T.card }}>
            {Object.entries(LEVELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, marginBottom: 4 }}>Years in Profession</div>
          <input type="number" min="0" max="50" value={years} onChange={e => setYears(parseInt(e.target.value) || 0)}
            style={{ width: "100%", padding: "8px 10px", border: `1px solid ${T.border}`, borderRadius: 6, fontSize: 13, fontFamily: T.font }} />
        </div>
      </div>

      {/* Headline metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 18 }}>
        <div style={{ padding: 14, background: T.primaryLight, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Predicted in 5 Years</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.primary }}>£{fiveYr.central.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>£{fiveYr.lower.toLocaleString()} – £{fiveYr.upper.toLocaleString()}</div>
        </div>
        <div style={{ padding: 14, background: T.successBg, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Annual Growth</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: T.success }}>{growthPct}%</div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>+{totalGrowth}% over 5 yrs</div>
        </div>
        <div style={{ padding: 14, background: "#F3E8FF", borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Peer Median</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#7C3AED" }}>£{peerMedian.toLocaleString()}</div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>{vsPeer >= 0 ? "+" : ""}{vsPeer}% vs you</div>
        </div>
        <div style={{ padding: 14, background: T.warningBg, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.textMuted, textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>Volatility</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#92400E" }}>±{Math.round(vol * 100)}%</div>
          <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>year-on-year</div>
        </div>
      </div>

      {/* Projection chart */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text }}>5-Year Income Projection</div>
          <div style={{ display: "flex", gap: 14, fontSize: 11, color: T.textMuted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 3, background: T.primary }} /> Central
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 12, height: 8, background: `${T.primary}20` }} /> Confidence band
            </span>
          </div>
        </div>
        <ProjectionChart projection={projection} />
      </div>

      {/* Peer benchmark range */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: 8 }}>
          Peer Benchmark — {jobTitle}, {LEVELS[level].label}, {SECTORS[sector].label}
        </div>
        <div style={{ position: "relative", height: 36, background: T.borderLight, borderRadius: 6, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "10%", right: "10%", top: 0, bottom: 0, background: `linear-gradient(90deg, ${T.successBg}, #F3E8FF, ${T.warningBg})` }} />
          <div style={{ position: "absolute", left: `${Math.max(2, Math.min(96, ((baseIncome - peerLow) / (peerHigh - peerLow)) * 100))}%`, top: -2, bottom: -2, width: 3, background: T.primary, transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px", fontSize: 10, fontWeight: 700, color: T.textMuted }}>
            <span>£{peerLow.toLocaleString()}</span>
            <span>median £{peerMedian.toLocaleString()}</span>
            <span>£{peerHigh.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Sustainability badge */}
      <div style={{ padding: "12px 16px", borderRadius: 10, background: sustainabilityNote.color === T.success ? T.successBg : sustainabilityNote.color === "#F59E0B" ? T.warningBg : T.dangerBg, border: `1px solid ${sustainabilityNote.color}30` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 800, color: "#fff", background: sustainabilityNote.color }}>
            {sustainabilityNote.label}
          </span>
          <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
            Nova AI · trained on 4.2M UK earnings records (ONS ASHE 2018–2025)
          </span>
        </div>
        <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5, marginTop: 6 }}>
          {sustainabilityNote.text}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function IncomeAnalysis({ loan }) {
  const selectedCase = loan?.id || MOCK_LOANS[0].id;
  const currentLoan = loan || MOCK_LOANS[0];
  const incomeData = getIncomeData(selectedCase);

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <KPICard label="Total Income" value={`£${incomeData.total.toLocaleString()}`} color={T.primary} sub="per annum" />
        <KPICard label="Income Sources" value={incomeData.sources.length} color="#7C3AED" sub={`${incomeData.verification.filter(v => v.status === "verified").length} verified`} />
        <KPICard label="DTI Ratio" value={incomeData.affordability.dti} color={incomeData.affordability.dtiColor} sub="current" />
        <KPICard label="Stressed DTI" value={incomeData.affordability.dtiStressed} color={incomeData.affordability.stressedColor} sub="SVR + 3%" />
        <KPICard label="Sustainability" value={incomeData.sustainability.level} color={incomeData.sustainability.color} />
      </div>

      {/* Income Sources */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          {Ico.chart(18)} Income Sources Breakdown
        </div>
        <StackedHorizontalBar sources={incomeData.sources} total={incomeData.total} />
      </Card>

      {/* Verification Status */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          {Ico.shield(18)} Verification Status
        </div>
        <VerificationChecklist items={incomeData.verification} />
      </Card>

      {/* Monthly Income Trend */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          {Ico.chart(18)} {incomeData.trendMonths}-Month Income Trend
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
          Net monthly income received
        </div>
        <MonthlyBarChart data={incomeData.monthlyTrend} highlightMonth="Feb" />
      </Card>

      {/* Income Predictor */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
          {Ico.sparkle(18)} AI Income Predictor
        </div>
        <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 16 }}>
          Project future earnings based on job type, sector, seniority and experience — used to assess long-term affordability.
        </div>
        <IncomePredictor baseIncome={incomeData.total} />
      </Card>

      {/* Year-over-Year (self-employed) */}
      {incomeData.yoy && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.chart(18)} Year-over-Year Comparison
          </div>
          <div style={{ display: "flex", gap: 24, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Year 1</div>
              <div style={{ height: 32, borderRadius: 6, background: T.borderLight, position: "relative", overflow: "hidden" }}>
                <div style={{ width: `${(incomeData.yoy.year1 / incomeData.yoy.year2) * 100}%`, height: "100%", background: T.primary, borderRadius: 6, display: "flex", alignItems: "center", paddingLeft: 12 }}>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>£{incomeData.yoy.year1.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Year 2</div>
              <div style={{ height: 32, borderRadius: 6, background: T.primary, display: "flex", alignItems: "center", paddingLeft: 12 }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>£{incomeData.yoy.year2.toLocaleString()}</span>
                <span style={{ color: T.successBg, fontSize: 11, fontWeight: 700, marginLeft: 8 }}>{incomeData.yoy.growth}</span>
              </div>
            </div>
          </div>
          {incomeData.yoy.flag && (
            <div style={{ padding: "8px 12px", background: T.warningBg, borderRadius: 6, border: `1px solid ${T.warningBorder}`, fontSize: 12, color: "#92400E", display: "flex", alignItems: "center", gap: 6 }}>
              {Ico.alert(14)} {incomeData.yoy.flag}
            </div>
          )}
        </Card>
      )}

      {/* Affordability at different income levels (self-employed) */}
      {incomeData.affordability.stressedColor === "#F59E0B" && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.dollar(18)} Affordability Sensitivity
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ padding: "16px", background: T.successBg, borderRadius: 10, border: `1px solid ${T.successBorder}` }}>
              <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>At Average Income</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.success }}>{incomeData.affordability.dti}</div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>Within comfortable limits</div>
            </div>
            <div style={{ padding: "16px", background: T.warningBg, borderRadius: 10, border: `1px solid ${T.warningBorder}` }}>
              <div style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>At Lowest Month</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#92400E" }}>{incomeData.affordability.dtiStressed}</div>
              <div style={{ fontSize: 12, color: "#92400E", marginTop: 4 }}>Close to 45% limit — amber</div>
            </div>
          </div>
        </Card>
      )}

      {/* Budget Visualisation (IO cases) */}
      {incomeData.budgetData && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.wallet(18)} Monthly Budget Analysis
          </div>
          <BudgetComparison data={incomeData.budgetData} />
        </Card>
      )}

      {/* Interest Only Repayment Vehicle (IO cases) */}
      {incomeData.ioData && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            {Ico.clock(18)} Interest Only — Repayment Vehicle Projection
          </div>
          <RepaymentVehicleProjection data={incomeData.ioData} />
        </Card>
      )}

      {/* Sustainability */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          {Ico.shield(18)} Sustainability Assessment
        </div>
        <div style={{
          padding: "14px 18px", borderRadius: 10,
          background: incomeData.sustainability.color === T.success ? T.successBg : incomeData.sustainability.color === "#F59E0B" ? T.warningBg : T.dangerBg,
          border: `1px solid ${incomeData.sustainability.color === T.success ? T.successBorder : incomeData.sustainability.color === "#F59E0B" ? T.warningBorder : T.dangerBorder}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{
              display: "inline-block", padding: "2px 10px", borderRadius: 4,
              fontSize: 12, fontWeight: 800, color: "#fff",
              background: incomeData.sustainability.color,
            }}>
              {incomeData.sustainability.level}
            </span>
          </div>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.5, marginTop: 6 }}>
            {incomeData.sustainability.text}
          </div>
        </div>
      </Card>

      {/* AI Insight */}
      <Card style={{ marginBottom: 24, background: T.primaryLight, border: `1px solid ${T.primary}22` }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ color: T.primary, flexShrink: 0, marginTop: 2 }}>{Ico.sparkle(20)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 6 }}>AI Income Assessment</div>
            <div style={{ fontSize: 13, lineHeight: 1.6, color: T.text }}>{incomeData.ai}</div>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <Btn primary icon="file">Generate Income Report</Btn>
        <Btn icon="download">Export to PDF</Btn>
      </div>
    </div>
  );
}
