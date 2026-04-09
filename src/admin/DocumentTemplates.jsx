import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const TEMPLATES = [
  { id: 1,  name: "Mortgage Offer Letter",       type: "Offer",      format: "PDF",  updated: "01 Apr 2026", uses: 42,  status: "Active", mergeFields: ["customer_name", "loan_amount", "property_address", "rate", "term_years", "monthly_payment", "offer_expiry"] },
  { id: 2,  name: "ESIS Document",                type: "Compliance", format: "PDF",  updated: "15 Mar 2026", uses: 38,  status: "Active", mergeFields: ["customer_name", "loan_amount", "rate", "aprc", "total_payable", "term_years", "erc_schedule"] },
  { id: 3,  name: "DIP Confirmation",             type: "Compliance", format: "PDF",  updated: "01 Mar 2026", uses: 156, status: "Active", mergeFields: ["customer_name", "dip_amount", "property_type", "ltv", "valid_until"] },
  { id: 4,  name: "KYC Confirmation Letter",      type: "Customer",   format: "PDF",  updated: "01 Feb 2026", uses: 89,  status: "Active", mergeFields: ["customer_name", "kyc_date", "id_type", "next_review_date"] },
  { id: 5,  name: "Payment Holiday Confirmation", type: "Customer",   format: "PDF",  updated: "15 Jan 2026", uses: 12,  status: "Active", mergeFields: ["customer_name", "account_number", "holiday_start", "holiday_end", "revised_payment"] },
  { id: 6,  name: "Rate Switch Confirmation",     type: "Customer",   format: "PDF",  updated: "01 Jan 2026", uses: 23,  status: "Active", mergeFields: ["customer_name", "old_rate", "new_rate", "new_payment", "effective_date"] },
  { id: 7,  name: "Settlement Quote",             type: "Customer",   format: "PDF",  updated: "01 Dec 2025", uses: 8,   status: "Active", mergeFields: ["customer_name", "account_number", "outstanding_balance", "erc_amount", "total_settlement", "valid_until"] },
  { id: 8,  name: "Annual Statement",             type: "Customer",   format: "PDF",  updated: "01 Apr 2026", uses: 400, status: "Active", mergeFields: ["customer_name", "account_number", "opening_balance", "closing_balance", "interest_charged", "payments_made"] },
  { id: 9,  name: "Arrears Notice (Stage 1)",     type: "Compliance", format: "PDF",  updated: "01 Mar 2026", uses: 6,   status: "Active", mergeFields: ["customer_name", "arrears_amount", "months_in_arrears", "required_payment", "deadline"] },
  { id: 10, name: "Arrears Notice (Stage 2)",     type: "Compliance", format: "PDF",  updated: "01 Mar 2026", uses: 2,   status: "Active", mergeFields: ["customer_name", "arrears_amount", "months_in_arrears", "legal_warning", "deadline"] },
  { id: 11, name: "Internal Case Summary",        type: "Internal",   format: "PDF",  updated: "01 Apr 2026", uses: 45,  status: "Active", mergeFields: ["case_id", "customer_name", "loan_amount", "ltv", "status", "underwriter", "risk_score"] },
  { id: 12, name: "Board Report Template",        type: "Internal",   format: "XLSX", updated: "01 Apr 2026", uses: 4,   status: "Active", mergeFields: ["report_date", "total_applications", "approval_rate", "pipeline_value", "arrears_rate"] },
];

const RECENT_GENERATIONS = [
  { template: "Annual Statement", user: "System (batch)", date: "06 Apr 2026, 02:00", count: 400 },
  { template: "Mortgage Offer Letter", user: "Sarah Mitchell", date: "05 Apr 2026, 16:32", count: 1 },
  { template: "DIP Confirmation", user: "Tom Davies", date: "05 Apr 2026, 15:10", count: 1 },
  { template: "ESIS Document", user: "Sarah Mitchell", date: "05 Apr 2026, 14:55", count: 1 },
  { template: "Internal Case Summary", user: "David Park", date: "05 Apr 2026, 11:20", count: 3 },
];

const typeBadge = (type) => {
  const colors = {
    Offer: { bg: "#DBEAFE", text: "#1E40AF" },
    Compliance: { bg: "#FEF3C7", text: "#92400E" },
    Customer: { bg: "#D1FAE5", text: "#065F46" },
    Internal: { bg: "#EDE9FE", text: "#5B21B6" },
  };
  const c = colors[type] || { bg: T.borderLight, text: T.textMuted };
  return <span style={{ background: c.bg, color: c.text, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5 }}>{type}</span>;
};

const thStyle = { textAlign: "left", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `1px solid ${T.border}` };
const tdStyle = { padding: "12px 14px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}` };

function DocumentTemplates() {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);

  const filters = ["All", "Offer Letters", "Compliance", "Customer Comms", "Internal"];
  const filterMap = { "All": null, "Offer Letters": "Offer", "Compliance": "Compliance", "Customer Comms": "Customer", "Internal": "Internal" };
  const shown = filter === "All" ? TEMPLATES : TEMPLATES.filter(t => t.type === filterMap[filter]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Document Templates</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Generate branded documents from case data</p>
        </div>
        <Btn primary iconNode={Ico.plus(16)}>Create Template</Btn>
      </div>

      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Active Templates" value="12" sub="in use" color={T.primary} />
        <KPICard label="Generated This Month" value="234" sub="documents" color={T.accent} />
        <KPICard label="Avg Generation Time" value="1.2s" sub="per document" color={T.success} />
        <KPICard label="Pending Review" value="5" sub="drafts awaiting approval" color={T.warning} />
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
              <th style={thStyle}>Template Name</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Format</th>
              <th style={thStyle}>Last Updated</th>
              <th style={thStyle}>Uses (Month)</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(t => (
              <>
                <tr key={t.id} onClick={() => setExpanded(expanded === t.id ? null : t.id)} style={{ cursor: "pointer", background: expanded === t.id ? T.primaryLight : "transparent" }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{t.name}</td>
                  <td style={tdStyle}>{typeBadge(t.type)}</td>
                  <td style={tdStyle}>
                    <span style={{ background: T.borderLight, color: T.textSecondary, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{t.format}</span>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12, color: T.textMuted }}>{t.updated}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{t.uses}</td>
                  <td style={tdStyle}>
                    <span style={{ background: T.successBg, color: T.success, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 5 }}>{t.status}</span>
                  </td>
                </tr>
                {expanded === t.id && (
                  <tr key={`${t.id}-detail`}>
                    <td colSpan={6} style={{ padding: 0 }}>
                      <div style={{ background: T.bg, padding: 24, borderBottom: `1px solid ${T.border}` }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
                          {/* Merge Fields */}
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Merge Fields</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                              {t.mergeFields.map(f => (
                                <span key={f} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontFamily: "monospace", color: T.primary }}>
                                  {"{{" + f + "}}"}
                                </span>
                              ))}
                            </div>
                          </div>
                          {/* Recent Generations */}
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", marginBottom: 8 }}>Last 5 Generations</div>
                            {RECENT_GENERATIONS.filter(g => g.template === t.name).length > 0
                              ? RECENT_GENERATIONS.filter(g => g.template === t.name).slice(0, 5).map((g, i) => (
                                <div key={i} style={{ fontSize: 12, color: T.textSecondary, marginBottom: 4 }}>
                                  {g.date} \u2014 {g.user} ({g.count} doc{g.count > 1 ? "s" : ""})
                                </div>
                              ))
                              : <div style={{ fontSize: 12, color: T.textMuted }}>No recent generations</div>
                            }
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 10 }}>
                          <Btn primary icon="eye">Generate Preview</Btn>
                          <Btn icon="settings">Edit Template</Btn>
                        </div>
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
            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>AI Template Insight</div>
            <div style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.5 }}>
              Most generated template: Annual Statement (400/mo). Consider: auto-generate and email annually instead of on-demand — saves ~18 hours/month of manual triggers.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default DocumentTemplates;
