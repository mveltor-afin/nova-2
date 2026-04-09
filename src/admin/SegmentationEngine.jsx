import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { CUSTOMERS } from "../data/customers";

const SEGMENTS = [
  {
    name: "Platinum", color: "#E5E4E2", accent: "#8B8B8B",
    rules: ["Relationship Value > \u00a315k", "Products > 3", "NPS > 8"],
    customers: ["David Chen", "Maria Santos"],
    benefits: ["VIP processing", "Named RM", "All fees waived"],
  },
  {
    name: "Premier", color: "#FFD700", accent: "#B8860B",
    rules: ["Relationship Value > \u00a38k", "Products > 1"],
    customers: ["Emma Wilson", "Aisha Patel"],
    benefits: ["Priority processing", "Dedicated handler"],
  },
  {
    name: "Standard", color: "#31B897", accent: "#1A8A6E",
    rules: ["Default segment"],
    customers: ["James Mitchell", "Priya Sharma"],
    benefits: ["Standard processing"],
  },
  {
    name: "At Risk", color: "#FF6B61", accent: "#CC4444",
    rules: ["Risk Score > 70", "OR Arrears > 0", "OR NPS < 5"],
    customers: ["Robert Hughes", "Tom Brennan"],
    benefits: ["Proactive outreach", "Retention offers"],
  },
];

const BAR_COLORS = ["#8B8B8B", "#FFD700", "#31B897", "#FF6B61"];

export default function SegmentationEngine() {
  const [rerunning, setRerunning] = useState(false);
  const [rerunDone, setRerunDone] = useState(false);

  const handleRerun = () => {
    setRerunning(true);
    setRerunDone(false);
    setTimeout(() => {
      setRerunning(false);
      setRerunDone(true);
    }, 2000);
  };

  const totalCustomers = CUSTOMERS.length;

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.navy }}>Customer Segmentation Engine</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn onClick={handleRerun} icon="zap" disabled={rerunning}>
            {rerunning ? "Re-running..." : "Re-run Segmentation"}
          </Btn>
          <Btn primary icon="plus">Add Segment</Btn>
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Total Segments" value="4" color={T.primary} sub="Active definitions" />
        <KPICard label="Customers Segmented" value={`${totalCustomers}/${totalCustomers}`} color={T.success} sub="100% coverage" />
        <KPICard label="Auto-Assigned" value="6" color="#3B82F6" sub="Rules-based" />
        <KPICard label="Manual Override" value="2" color={T.warning} sub="Admin adjusted" />
      </div>

      {rerunDone && (
        <Card style={{ marginBottom: 20, background: T.successBg, border: `1px solid ${T.successBorder}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {Ico.check(18)}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.success }}>Segmentation complete</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>{totalCustomers} customers evaluated. 0 segment changes detected. All assignments confirmed.</div>
            </div>
          </div>
        </Card>
      )}

      {/* Segment distribution bar */}
      <Card style={{ marginBottom: 24 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{Ico.chart(18)} Segment Distribution</h3>
        <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", height: 36, marginBottom: 12 }}>
          {SEGMENTS.map((seg, i) => (
            <div key={i} style={{
              flex: seg.customers.length,
              background: BAR_COLORS[i],
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: i === 0 ? "#333" : "#fff",
            }}>
              {seg.name} ({seg.customers.length})
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {SEGMENTS.map((seg, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: BAR_COLORS[i] }} />
              <span style={{ fontWeight: 600 }}>{seg.name}:</span>
              <span style={{ color: T.textMuted }}>{seg.customers.length} customers ({Math.round(seg.customers.length / totalCustomers * 100)}%)</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Segment cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        {SEGMENTS.map((seg, i) => (
          <Card key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: BAR_COLORS[i] }} />
                <span style={{ fontSize: 16, fontWeight: 700 }}>{seg.name}</span>
              </div>
              <Btn small ghost>Edit Rules</Btn>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Rules</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {seg.rules.map((r, ri) => (
                  <div key={ri} style={{ fontSize: 12, color: T.text, padding: "4px 8px", background: "#F8F7F4", borderRadius: 4, fontFamily: "monospace" }}>{r}</div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Customers ({seg.customers.length})</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {seg.customers.map((c, ci) => (
                  <span key={ci} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 6, background: BAR_COLORS[i] + "22", color: seg.accent, border: `1px solid ${BAR_COLORS[i]}44` }}>{c}</span>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Benefits</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {seg.benefits.map((b, bi) => (
                  <span key={bi} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: T.successBg, color: T.success, fontWeight: 600 }}>{b}</span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* AI Insight */}
      <Card style={{ background: "linear-gradient(135deg, rgba(26,74,84,0.04), rgba(49,184,151,0.04))", border: `1px solid ${T.primary}22` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ padding: 8, borderRadius: 8, background: T.primaryLight, flexShrink: 0 }}>{Ico.sparkle(20)}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 4 }}>AI Segmentation Insight</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>
              2 customers (Emma Wilson, Aisha Patel) are borderline Premier/Platinum. If Emma's deposit renews, her LTV crosses the \u00a315k threshold — auto-upgrade. Aisha Patel currently holds 3 products with an NPS of 7; a one-point NPS improvement would trigger Platinum eligibility.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
