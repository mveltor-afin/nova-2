import React, { useState, useMemo } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS, PRODUCTS, PRODUCT_TYPES } from "../data/customers";

// ─────────────────────────────────────────────
// NOVA 2.0 — Customer Lifecycle Predictor
// AI-powered forward-looking timeline view
// ─────────────────────────────────────────────

/* helper: parse "Mar 2020" or "15 Jun 2026" style dates */
const parseLooseDate = (str) => {
  if (!str || str === "—" || str === "SVR") return null;
  const d = new Date(str);
  if (!isNaN(d)) return d;
  return null;
};

const fmtShortDate = (d) => {
  if (!d) return "";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

const fmtMonthYear = (d) => {
  if (!d) return "";
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${d.getDate()} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
};

const monthsDiff = (a, b) => (b - a) / (1000 * 60 * 60 * 24 * 30.44);

const tierThresholds = { Bronze: 1000, Silver: 3000, Gold: 7000, Platinum: Infinity };
const nextTier = (tier) => ({ Bronze: "Silver", Silver: "Gold", Gold: "Platinum", Platinum: null }[tier]);

const COL = { green: "#31B897", amber: "#FFBF00", red: "#FF6B61", blue: "#0EA5E9" };

export default function LifecyclePredictor({ customerId }) {
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const customer = useMemo(
    () => CUSTOMERS.find((c) => c.id === customerId) || CUSTOMERS[0],
    [customerId]
  );

  const customerProducts = useMemo(
    () => PRODUCTS.filter((p) => p.customerId === customer.id),
    [customer]
  );

  const today = new Date(2026, 3, 10); // 10 Apr 2026

  // ─── Derive KPI values ─────────────────────
  const kpis = useMemo(() => {
    const rs = customer.riskScore;
    const churnPct = Math.min(100, Math.round(rs * 1.1 + (customer.nps != null ? (10 - customer.nps) * 2 : 10)));
    const churnLabel = churnPct < 25 ? "Low" : churnPct < 55 ? "Medium" : "High";
    const churnColor = churnPct < 25 ? COL.green : churnPct < 55 ? COL.amber : COL.red;

    const hasMortgage = customerProducts.some((p) => p.type === "Mortgage");
    const hasSavings = customerProducts.some((p) => p.type === "Fixed Term Deposit" || p.type === "Notice Account");
    const hasInsurance = customerProducts.some((p) => p.type === "Insurance");
    const rateEndingSoon = customerProducts.some((p) => {
      const re = parseLooseDate(p.rateEnd);
      return re && (re - today) / (1000*60*60*24) < 180;
    });

    let nba = "Schedule annual review";
    if (rateEndingSoon) nba = "Rate switch conversation";
    else if (hasMortgage && !hasInsurance) nba = "Cross-sell insurance";
    else if (hasMortgage && !hasSavings) nba = "Cross-sell savings";
    else if (rs > 60) nba = "Retention outreach";

    const ltvNum = parseInt(String(customer.ltv).replace(/[^0-9]/g, "")) || 0;
    const ltvGrowth = Math.round(ltvNum * 0.12);

    const engagement = customer.nps != null
      ? Math.min(10, Math.round((customer.nps * 0.5) + (customer.gamification.streak > 0 ? 2 : 0) + (customerProducts.length * 0.6)))
      : Math.min(10, Math.round(customerProducts.length * 1.5 + (customer.gamification.streak > 0 ? 1 : 0)));

    return { churnPct, churnLabel, churnColor, nba, ltvGrowth, engagement };
  }, [customer, customerProducts, today]);

  // ─── Build timeline events ─────────────────
  const { pastEvents, futureEvents, timelineRange } = useMemo(() => {
    const past = [];
    const future = [];

    // Past events
    const sinceDate = parseLooseDate(customer.since);
    if (sinceDate) past.push({ label: "Became customer", date: sinceDate, color: COL.green });

    // KYC verified
    if (customer.kyc === "Verified") {
      const kycDate = sinceDate ? new Date(sinceDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null;
      if (kycDate) past.push({ label: "KYC verified", date: kycDate, color: COL.blue });
    }

    // Products
    customerProducts.forEach((p) => {
      if (p.type === "Mortgage" && (p.status === "Active" || p.status === "Active in Arrears")) {
        const mDate = sinceDate ? new Date(sinceDate.getTime() + 60 * 24 * 60 * 60 * 1000) : null;
        if (mDate && mDate < today) past.push({ label: "Mortgage completed", date: mDate, color: COL.green });
      }
      if ((p.type === "Fixed Term Deposit" || p.type === "Notice Account") && p.status === "Active") {
        const sDate = sinceDate ? new Date(sinceDate.getTime() + 120 * 24 * 60 * 60 * 1000) : null;
        if (sDate && sDate < today) past.push({ label: "Savings account opened", date: sDate, color: COL.green });
      }
      if (p.type === "Insurance" && p.status === "Active") {
        const iDate = sinceDate ? new Date(sinceDate.getTime() + 200 * 24 * 60 * 60 * 1000) : null;
        if (iDate && iDate < today) past.push({ label: "Insurance activated", date: iDate, color: COL.blue });
      }
    });

    // Rate review (simulate 6 months ago for active mortgage customers)
    if (customerProducts.some((p) => p.type === "Mortgage" && p.status === "Active")) {
      past.push({ label: "Rate review", date: new Date(today.getTime() - 180 * 24 * 60 * 60 * 1000), color: COL.blue });
    }

    // Tier upgrade
    if (customer.gamification.tier !== "Bronze") {
      const tierDate = sinceDate ? new Date((sinceDate.getTime() + today.getTime()) / 2) : null;
      if (tierDate) past.push({ label: `Tier upgraded to ${customer.gamification.tier}`, date: tierDate, color: COL.green });
    }

    // Sort past and keep up to 8
    past.sort((a, b) => a.date - b.date);
    const pastCapped = past.slice(0, 8);

    // Future events
    customerProducts.forEach((p) => {
      const rateEnd = parseLooseDate(p.rateEnd);
      if (rateEnd && rateEnd > today) {
        future.push({ label: "Rate switch window opens", date: rateEnd, color: COL.amber });
      }
      const maturity = parseLooseDate(p.maturity);
      if (maturity && maturity > today) {
        future.push({ label: "Fixed deposit matures", date: maturity, color: COL.blue });
      }
      const renewal = parseLooseDate(p.renewal);
      if (renewal && renewal > today) {
        future.push({ label: "Insurance renewal due", date: renewal, color: COL.blue });
      }
    });

    // Cross-sell opportunity if no insurance
    if (!customerProducts.some((p) => p.type === "Insurance")) {
      future.push({ label: "Cross-sell opportunity: Insurance", date: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000), color: COL.green });
    }

    // KYC renewal
    const kycExp = parseLooseDate(customer.kycExpiry);
    if (kycExp) {
      if (kycExp > today) {
        future.push({ label: "KYC renewal due", date: kycExp, color: COL.amber });
      } else {
        future.push({ label: "KYC renewal OVERDUE", date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), color: COL.red });
      }
    }

    // Arrears risk
    if (customer.riskScore > 60) {
      future.push({ label: "Potential arrears risk", date: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000), color: COL.red });
    }

    // Tier upgrade predicted
    const nt = nextTier(customer.gamification.tier);
    if (nt) {
      const needed = tierThresholds[customer.gamification.tier];
      const remaining = needed - customer.gamification.points;
      if (remaining > 0 && remaining < needed * 0.5) {
        future.push({ label: `Tier upgrade predicted: ${nt}`, date: new Date(today.getTime() + 150 * 24 * 60 * 60 * 1000), color: COL.green });
      }
    }

    // Cross-sell current account
    if (!customerProducts.some((p) => p.type === "Current Account")) {
      future.push({ label: "Cross-sell opportunity: Current Account", date: new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000), color: COL.green });
    }

    future.sort((a, b) => a.date - b.date);
    const futureCapped = future.slice(0, 6);

    // Timeline range
    const allDates = [...pastCapped.map((e) => e.date), ...futureCapped.map((e) => e.date), today];
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));
    // Add padding
    const pad = (maxDate - minDate) * 0.08;
    return {
      pastEvents: pastCapped,
      futureEvents: futureCapped,
      timelineRange: { min: new Date(minDate.getTime() - pad), max: new Date(maxDate.getTime() + pad) },
    };
  }, [customer, customerProducts, today]);

  // ─── Churn risk factors ────────────────────
  const riskFactors = useMemo(() => {
    const factors = [];
    const rateEndingSoon = customerProducts.some((p) => {
      const re = parseLooseDate(p.rateEnd);
      return re && (re - today) / (1000*60*60*24) < 180;
    });
    if (rateEndingSoon) factors.push({ name: "Rate end approaching", impact: 35, color: COL.red });
    if (customerProducts.length <= 1) factors.push({ name: "Single product customer", impact: 25, color: COL.amber });
    if (customer.nps != null && customer.nps < 6) factors.push({ name: "NPS declining", impact: 20, color: COL.red });
    if (customer.gamification.streak === 0) factors.push({ name: "No engagement streak", impact: 15, color: COL.amber });

    const kycExp = parseLooseDate(customer.kycExpiry);
    if (kycExp && kycExp < today) factors.push({ name: "KYC expired", impact: 30, color: COL.red });
    if (customer.riskScore > 60) factors.push({ name: "High risk score", impact: 28, color: COL.red });
    if (customer.vuln) factors.push({ name: "Vulnerability flag active", impact: 18, color: COL.amber });

    // Fill to at least 3
    if (factors.length < 3) factors.push({ name: "Market rate sensitivity", impact: 10, color: COL.blue });
    if (factors.length < 3) factors.push({ name: "Competitor offers in market", impact: 8, color: COL.blue });

    return factors.slice(0, 4);
  }, [customer, customerProducts, today]);

  // ─── Cross-sell opportunities ──────────────
  const crossSell = useMemo(() => {
    const held = new Set(customerProducts.map((p) => p.type));
    const opps = [];
    if (!held.has("Insurance")) opps.push({ name: "Life Insurance", prob: 78, revenue: "£456/yr", reason: "Mortgage balance unprotected", type: "Insurance" });
    if (!held.has("Fixed Term Deposit")) opps.push({ name: "Fixed Term Deposit", prob: 72, revenue: "£1,200/yr", reason: "High savings propensity detected", type: "Fixed Term Deposit" });
    if (!held.has("Current Account")) opps.push({ name: "Current Account", prob: 65, revenue: "£180/yr", reason: "Salary credit opportunity", type: "Current Account" });
    if (!held.has("Notice Account")) opps.push({ name: "Notice Saver", prob: 61, revenue: "£680/yr", reason: "Complements existing portfolio", type: "Notice Account" });
    if (!held.has("Shared Ownership")) opps.push({ name: "Shared Ownership", prob: 34, revenue: "£2,400/yr", reason: "Property ladder progression", type: "Shared Ownership" });
    // If they have everything, show generic
    if (opps.length === 0) {
      opps.push({ name: "Premium Rate Switch", prob: 88, revenue: "£960/yr", reason: "Loyalty rate eligible", type: "Mortgage" });
      opps.push({ name: "Referral Programme", prob: 75, revenue: "£500 bonus", reason: "High NPS — likely to refer", type: "Mortgage" });
    }
    return opps.slice(0, 4).sort((a, b) => b.prob - a.prob);
  }, [customerProducts]);

  // ─── Affordability projections ─────────────
  const affordability = useMemo(() => {
    const mortgage = customerProducts.find((p) => p.type === "Mortgage");
    const paymentStr = mortgage?.payment || "£1,200";
    const paymentNum = parseInt(paymentStr.replace(/[^0-9]/g, "")) || 1200;
    const rateStr = mortgage?.rate || "5.00%";
    const rateNum = parseFloat(rateStr) || 5.0;

    // Assume income is ~3.5x mortgage payment
    const baseIncome = paymentNum * 3.5;
    const growthRate = 0.03;

    const points = [];
    for (let y = 0; y <= 4; y++) {
      const income = Math.round(baseIncome * Math.pow(1 + growthRate, y));
      const payment = paymentNum;
      const stressedRate = rateNum + 3;
      const stressedPayment = Math.round(paymentNum * (stressedRate / rateNum));
      points.push({ year: y, income, payment, stressedPayment });
    }
    return points;
  }, [customerProducts]);

  // ─── Churn gauge SVG ──────────────────────
  const gaugeRadius = 70;
  const gaugeAngle = (kpis.churnPct / 100) * Math.PI;

  // ─── Render ────────────────────────────────
  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard
          label="Churn Risk"
          value={`${kpis.churnPct}%`}
          sub={kpis.churnLabel}
          color={kpis.churnColor}
        />
        <KPICard
          label="Next Best Action"
          value={kpis.nba}
          sub="AI recommendation"
          color={T.primary}
        />
        <KPICard
          label="Predicted LTV Growth"
          value={`+\u00A3${kpis.ltvGrowth.toLocaleString()}`}
          sub="over 12 months"
          color={COL.green}
        />
        <KPICard
          label="Engagement Score"
          value={`${kpis.engagement}/10`}
          sub={kpis.engagement >= 7 ? "Highly engaged" : kpis.engagement >= 4 ? "Moderate" : "Low engagement"}
          color={kpis.engagement >= 7 ? COL.green : kpis.engagement >= 4 ? COL.amber : COL.red}
        />
      </div>

      {/* Main Timeline — horizontal card rail */}
      <Card style={{ marginBottom: 28, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ color: T.primary }}>{Ico.clock(18)}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Lifecycle Timeline</span>
          <div style={{ display: "flex", gap: 14, marginLeft: "auto", fontSize: 11, color: T.textMuted }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: T.primary }} /> Past</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 5, background: "#fff", border: `2px dashed ${T.primary}` }} /> Predicted</span>
          </div>
        </div>

        {/* Horizontal scroll container */}
        <div style={{ position: "relative", overflowX: "auto", paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "stretch", minWidth: "max-content" }}>
            {/* Past events */}
            {pastEvents.map((evt, i) => (
              <div key={`past-${i}`} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 32, height: 2, background: `${evt.color}60`, flexShrink: 0 }} />}
                <div style={{
                  minWidth: 140, maxWidth: 180, padding: "10px 14px", borderRadius: 10,
                  background: T.card, border: `1.5px solid ${evt.color}40`,
                  borderLeft: `4px solid ${evt.color}`, flexShrink: 0,
                }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: evt.color, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                    {fmtShortDate(evt.date)}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.4 }}>{evt.label}</div>
                </div>
              </div>
            ))}

            {/* Today divider */}
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0, margin: "0 4px" }}>
              <div style={{ width: 32, height: 2, background: T.borderLight }} />
              <div style={{
                padding: "6px 16px", borderRadius: 20, fontWeight: 800, fontSize: 11,
                background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark || T.primary})`,
                color: "#fff", whiteSpace: "nowrap", letterSpacing: 0.5, flexShrink: 0,
              }}>
                TODAY
              </div>
              <div style={{ width: 32, height: 2, background: T.borderLight, borderStyle: "dashed" }} />
            </div>

            {/* Future events */}
            {futureEvents.map((evt, i) => {
              const maxFuture = futureEvents.length > 0 ? futureEvents[futureEvents.length - 1].date - today : 1;
              const dist = evt.date - today;
              const opacity = Math.max(0.45, 1 - (dist / maxFuture) * 0.55);
              return (
                <div key={`future-${i}`} style={{ display: "flex", alignItems: "center", opacity }}>
                  {i > 0 && <div style={{ width: 32, height: 2, borderTop: `2px dashed ${evt.color}40`, flexShrink: 0 }} />}
                  <div style={{
                    minWidth: 140, maxWidth: 180, padding: "10px 14px", borderRadius: 10,
                    background: `${evt.color}08`, border: `1.5px dashed ${evt.color}50`,
                    borderLeft: `4px solid ${evt.color}`, flexShrink: 0,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: evt.color, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                      {fmtShortDate(evt.date)} <span style={{ fontStyle: "italic", fontWeight: 500, fontSize: 9 }}>predicted</span>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: T.text, lineHeight: 1.4, fontStyle: "italic" }}>{evt.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Three columns below timeline */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
        {/* ─── Column 1: Churn Risk Analysis ────── */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ color: T.danger }}>{Ico.alert(18)}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Churn Risk Analysis</span>
          </div>

          {/* Semi-circular gauge */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <svg width={180} height={100} viewBox="0 0 180 100">
              {/* Background arc */}
              <path
                d={`M ${90 - gaugeRadius} 90 A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${90 + gaugeRadius} 90`}
                fill="none"
                stroke={T.borderLight}
                strokeWidth={12}
                strokeLinecap="round"
              />
              {/* Value arc */}
              <path
                d={describeArc(90, 90, gaugeRadius, 180, 180 + (kpis.churnPct / 100) * 180)}
                fill="none"
                stroke={kpis.churnColor}
                strokeWidth={12}
                strokeLinecap="round"
              />
              {/* Center text */}
              <text x={90} y={78} textAnchor="middle" fontSize={22} fontWeight={700} fill={T.text} fontFamily={T.font}>
                {kpis.churnPct}%
              </text>
              <text x={90} y={94} textAnchor="middle" fontSize={10} fill={T.textMuted} fontFamily={T.font}>
                churn probability
              </text>
              {/* Scale labels */}
              <text x={90 - gaugeRadius - 4} y={94} textAnchor="end" fontSize={9} fill={T.textMuted} fontFamily={T.font}>0%</text>
              <text x={90 + gaugeRadius + 4} y={94} textAnchor="start" fontSize={9} fill={T.textMuted} fontFamily={T.font}>100%</text>
            </svg>
          </div>

          {/* Risk factors */}
          <div style={{ marginBottom: 16 }}>
            {riskFactors.map((f, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{f.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: f.color }}>{f.impact}%</span>
                </div>
                <div style={{ height: 6, background: T.borderLight, borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${f.impact}%`, background: f.color, borderRadius: 3, transition: "width 0.3s" }} />
                </div>
              </div>
            ))}
          </div>

          {/* AI recommendation */}
          <div style={{ background: T.primaryLight, borderRadius: 10, padding: 14, borderLeft: `3px solid ${T.primary}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span style={{ color: T.primary }}>{Ico.bot(14)}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>AI Recommendation</span>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: T.text, lineHeight: 1.5 }}>
              {kpis.churnPct > 50
                ? `Immediate retention outreach recommended. ${customer.name} shows multiple churn indicators. Prioritise rate review and relationship manager call within 7 days.`
                : kpis.churnPct > 25
                ? `Monitor proactively. Schedule a check-in within 30 days to address emerging risk factors and explore product deepening.`
                : `Low churn risk. Continue engagement programme and consider cross-sell opportunities to deepen the relationship.`
              }
            </p>
          </div>
        </Card>

        {/* ─── Column 2: Cross-Sell Opportunities ─ */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ color: COL.green }}>{Ico.zap(18)}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Cross-Sell Opportunities</span>
          </div>

          {crossSell.map((opp, i) => {
            const ptColor = PRODUCT_TYPES[opp.type]?.color || T.primary;
            return (
              <div
                key={i}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: `1px solid ${T.borderLight}`,
                  marginBottom: i < crossSell.length - 1 ? 12 : 0,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 3, background: ptColor }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{opp.name}</span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                    background: opp.prob > 70 ? T.successBg : opp.prob > 50 ? T.warningBg : T.borderLight,
                    color: opp.prob > 70 ? T.success : opp.prob > 50 ? T.warning : T.textMuted,
                  }}>
                    {opp.prob}% likely
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: T.textMuted }}>Expected revenue</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{opp.revenue}</span>
                </div>
                {/* Probability bar */}
                <div style={{ height: 4, background: T.borderLight, borderRadius: 2, marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${opp.prob}%`, background: ptColor, borderRadius: 2 }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: T.primary }}>{Ico.bot(12)}</span>
                  <span style={{ fontSize: 11, color: T.textMuted, fontStyle: "italic" }}>{opp.reason}</span>
                </div>
              </div>
            );
          })}
        </Card>

        {/* ─── Column 3: Income & Affordability ─── */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <span style={{ color: T.primary }}>{Ico.chart(18)}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Income & Affordability Trajectory</span>
          </div>

          {/* Mini SVG chart */}
          <div style={{ marginBottom: 16 }}>
            <svg viewBox="0 0 280 160" style={{ width: "100%", height: 160, display: "block" }}>
              {(() => {
                const chartL = 40;
                const chartR = 260;
                const chartT = 15;
                const chartB = 130;
                const chartW = chartR - chartL;
                const chartH = chartB - chartT;

                const maxVal = Math.max(...affordability.map((p) => Math.max(p.income, p.stressedPayment))) * 1.1;
                const minVal = 0;

                const xScale = (i) => chartL + (i / 4) * chartW;
                const yScale = (v) => chartB - ((v - minVal) / (maxVal - minVal)) * chartH;

                const incomeLine = affordability.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(p.income)}`).join(" ");
                const paymentY = yScale(affordability[0].payment);
                const stressedLine = affordability.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(p.stressedPayment)}`).join(" ");

                // Affordability gap fill
                const gapPath = affordability.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(i)},${yScale(p.income)}`).join(" ")
                  + affordability.slice().reverse().map((p, i) => `L${xScale(4 - i)},${yScale(p.payment)}`).join(" ")
                  + " Z";

                return (
                  <>
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line key={`grid-${i}`} x1={xScale(i)} y1={chartT} x2={xScale(i)} y2={chartB} stroke={T.borderLight} strokeWidth={0.5} />
                    ))}
                    {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
                      <line key={`hgrid-${i}`} x1={chartL} y1={chartB - f * chartH} x2={chartR} y2={chartB - f * chartH} stroke={T.borderLight} strokeWidth={0.5} />
                    ))}

                    {/* Affordability gap fill */}
                    <path d={gapPath} fill={COL.green} opacity={0.08} />

                    {/* Income line (projected) */}
                    <path d={incomeLine} fill="none" stroke={COL.green} strokeWidth={2.5} />
                    {affordability.map((p, i) => (
                      <circle key={`inc-${i}`} cx={xScale(i)} cy={yScale(p.income)} r={3} fill={COL.green} />
                    ))}

                    {/* Current mortgage payment (horizontal) */}
                    <line x1={chartL} y1={paymentY} x2={chartR} y2={paymentY} stroke={COL.blue} strokeWidth={2} />

                    {/* Stressed payment line */}
                    <path d={stressedLine} fill="none" stroke={COL.red} strokeWidth={1.5} strokeDasharray="5,3" />
                    {affordability.map((p, i) => (
                      <circle key={`str-${i}`} cx={xScale(i)} cy={yScale(p.stressedPayment)} r={2.5} fill="#fff" stroke={COL.red} strokeWidth={1.5} />
                    ))}

                    {/* X axis labels */}
                    {affordability.map((p, i) => (
                      <text key={`xl-${i}`} x={xScale(i)} y={chartB + 14} textAnchor="middle" fontSize={9} fill={T.textMuted} fontFamily={T.font}>
                        Yr {p.year}
                      </text>
                    ))}

                    {/* Y axis labels */}
                    <text x={chartL - 5} y={yScale(affordability[0].income) + 3} textAnchor="end" fontSize={8} fill={T.textMuted} fontFamily={T.font}>
                      {`\u00A3${(affordability[0].income / 1000).toFixed(1)}k`}
                    </text>
                    <text x={chartL - 5} y={paymentY + 3} textAnchor="end" fontSize={8} fill={T.textMuted} fontFamily={T.font}>
                      {`\u00A3${(affordability[0].payment / 1000).toFixed(1)}k`}
                    </text>

                    {/* Labels at right */}
                    <text x={chartR + 4} y={yScale(affordability[4].income) + 3} fontSize={8} fontWeight={600} fill={COL.green} fontFamily={T.font}>
                      Income
                    </text>
                    <text x={chartR + 4} y={paymentY + 3} fontSize={8} fontWeight={600} fill={COL.blue} fontFamily={T.font}>
                      Payment
                    </text>
                    <text x={chartR + 4} y={yScale(affordability[4].stressedPayment) + 3} fontSize={8} fontWeight={600} fill={COL.red} fontFamily={T.font}>
                      Stressed
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>

          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div style={{ background: T.successBg, borderRadius: 8, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>Current buffer</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COL.green }}>
                {`\u00A3${(affordability[0].income - affordability[0].payment).toLocaleString()}`}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted }}>per month</div>
            </div>
            <div style={{ background: T.successBg, borderRadius: 8, padding: 10, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 2 }}>Year 4 buffer</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: COL.green }}>
                {`\u00A3${(affordability[4].income - affordability[4].payment).toLocaleString()}`}
              </div>
              <div style={{ fontSize: 10, color: T.textMuted }}>per month</div>
            </div>
          </div>

          <div style={{ background: T.primaryLight, borderRadius: 10, padding: 12, borderLeft: `3px solid ${T.primary}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
              <span style={{ color: T.primary }}>{Ico.bot(12)}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.primary }}>AI Insight</span>
            </div>
            <p style={{ margin: 0, fontSize: 11, color: T.text, lineHeight: 1.5 }}>
              {affordability[0].income > affordability[0].stressedPayment
                ? "Affordability headroom is healthy even under stress scenarios. Income growth at 3% pa widens the buffer over time, reducing long-term risk."
                : "Affordability is tight under stressed rates. Monitor income changes closely and consider restructuring options if rates rise."
              }
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ─── SVG Arc Helper ─────────────────────────── */
function describeArc(cx, cy, r, startAngle, endAngle) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startAngle));
  const y1 = cy + r * Math.sin(rad(startAngle));
  const x2 = cx + r * Math.cos(rad(endAngle));
  const y2 = cy + r * Math.sin(rad(endAngle));
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}
