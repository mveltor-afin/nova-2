import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";

// ── Mock Offers Data ──
const OFFERS = [
  { caseId: "AFN-2026-00139", customer: "Priya Sharma", product: "2-Year Tracker", bucket: "Prime", bucketColor: "#059669", amount: "\u00A3275,000", rate: "5.14%", issuedDate: "15 Mar 2026", status: "Issued", esisGenerated: true },
  { caseId: "AFN-2026-00125", customer: "Aisha Patel", product: "2-Year Fixed", bucket: "Professional", bucketColor: "#3B82F6", amount: "\u00A3510,000", rate: "3.69%", issuedDate: "10 Mar 2026", status: "Accepted", esisGenerated: true },
  { caseId: "AFN-2026-00145", customer: "Bright Futures Consulting Ltd", product: "2-Year Fixed", bucket: "Commercial Mortgage", bucketColor: "#6366F1", amount: "\u00A3340,000", rate: "5.49%", issuedDate: "12 Apr 2026", status: "Issued", esisGenerated: true },
  { caseId: "AFN-2026-00128", customer: "Emma Wilson", product: "2-Year Fixed", bucket: "Prime", bucketColor: "#059669", amount: "\u00A3290,000", rate: "4.19%", issuedDate: "01 Dec 2025", status: "Expired", esisGenerated: true },
  { caseId: "AFN-2026-00115", customer: "Sophie & Jack Brown", product: "2-Year Fixed", bucket: "Prime High LTV", bucketColor: "#31B897", amount: "\u00A3320,000", rate: "5.59%", issuedDate: "16 Apr 2026", status: "Issued", esisGenerated: false },
];

// ── Date helpers ──
const MONTHS = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };

function parseDate(str) {
  const parts = str.split(" ");
  const day = parseInt(parts[0], 10);
  const mon = MONTHS[parts[1]];
  const yr = parseInt(parts[2], 10);
  return new Date(yr, mon, day);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

function getDaysRemaining(expiresDate) {
  const now = new Date(2026, 3, 17); // 17 Apr 2026
  const diff = Math.ceil((expiresDate - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function getDaysColor(days) {
  if (days > 30) return "#059669";
  if (days >= 14) return "#F59E0B";
  return "#EF4444";
}

// ── Enriched offers ──
const enrichedOffers = OFFERS.map(o => {
  const issued = parseDate(o.issuedDate);
  const expires = addDays(issued, 90);
  const daysRemaining = getDaysRemaining(expires);
  return { ...o, expiresDate: formatDate(expires), daysRemaining };
});

// ── ESIS Modal ──
function ESISModal({ offer, onClose }) {
  const amountNum = parseInt(offer.amount.replace(/[^0-9]/g, ""), 10);
  const rateNum = parseFloat(offer.rate);
  const monthlyRate = rateNum / 100 / 12;
  const termMonths = 300; // 25 years default
  const monthlyPayment = amountNum * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  const totalPayable = monthlyPayment * termMonths;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div style={{ background: T.card, borderRadius: 16, width: 640, maxHeight: "85vh", overflow: "auto", padding: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Header */}
        <div style={{ padding: "24px 28px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>European Standardised Information Sheet (ESIS)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Mortgage Offer - {offer.caseId}</div>
            <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{offer.customer}</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 4 }}>{Ico.x(20)}</button>
        </div>

        <div style={{ padding: "20px 28px 28px" }}>
          {/* Section 1: Lender */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>1. Lender</div>
            <div style={{ fontSize: 13, color: T.text, lineHeight: 1.8 }}>
              <div><strong>Lender:</strong> Helix Bank plc</div>
              <div><strong>Address:</strong> 1 Financial Centre, London EC2R 8AH</div>
              <div><strong>FCA Registration:</strong> FRN 123456</div>
            </div>
          </div>

          {/* Section 2: Key Product Details */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>2. Key Features of the Loan</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                ["Product", offer.product],
                ["Loan Amount", offer.amount],
                ["Interest Rate", offer.rate],
                ["APRC", (rateNum + 0.3).toFixed(1) + "%"],
                ["Term", "25 years"],
                ["Repayment Type", "Capital & Interest"],
              ].map(([label, val]) => (
                <div key={label} style={{ background: T.bg, borderRadius: 8, padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Costs */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>3. Total Cost of the Loan</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ background: T.bg, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>Monthly Payment</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{"\u00A3" + monthlyPayment.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
              </div>
              <div style={{ background: T.bg, borderRadius: 8, padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, marginBottom: 2 }}>Total Amount Payable</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{"\u00A3" + totalPayable.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
              </div>
            </div>
          </div>

          {/* Section 4: Early Repayment Charges */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>4. Early Repayment</div>
            <div style={{ background: T.warningBg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${T.warningBorder}` }}>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Early Repayment Charges (ERC)</div>
                <div>Year 1: 3% of outstanding balance</div>
                <div>Year 2: 2% of outstanding balance</div>
                <div style={{ marginTop: 6, fontSize: 11, color: T.textMuted }}>ERCs apply during the initial product period. You may make overpayments of up to 10% of the outstanding balance per year without incurring ERCs.</div>
              </div>
            </div>
          </div>

          {/* Section 5: Warnings */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.primary, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>5. Important Warnings</div>
            <div style={{ background: T.dangerBg, borderRadius: 8, padding: "12px 14px", border: `1px solid ${T.dangerBorder}` }}>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7 }}>
                <div style={{ fontWeight: 600, color: T.danger, marginBottom: 4 }}>{Ico.alert(14)} Warning</div>
                <div>Your home may be repossessed if you do not keep up repayments on your mortgage.</div>
                <div style={{ marginTop: 6 }}>Think carefully before securing other debts against your home.</div>
                <div style={{ marginTop: 6 }}>The interest rate on this mortgage may change, which could affect your monthly payments.</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
            <Btn small icon="download">Download PDF</Btn>
            <Btn small primary onClick={onClose}>Close</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Filter Tabs ──
const FILTER_TABS = ["All", "Pending", "Accepted", "Expired"];

export default function OffersScreen() {
  const [activeTab, setActiveTab] = useState("All");
  const [esisModal, setEsisModal] = useState(null);

  // Filter offers
  const filtered = enrichedOffers.filter(o => {
    if (activeTab === "All") return true;
    if (activeTab === "Pending") return o.status === "Issued";
    if (activeTab === "Accepted") return o.status === "Accepted";
    if (activeTab === "Expired") return o.status === "Expired";
    return true;
  });

  // KPI calculations
  const totalActive = enrichedOffers.filter(o => o.status !== "Expired").length;
  const accepted = enrichedOffers.filter(o => o.status === "Accepted").length;
  const pending = enrichedOffers.filter(o => o.status === "Issued").length;
  const expiring = enrichedOffers.filter(o => o.status === "Issued" && o.daysRemaining > 0 && o.daysRemaining < 14).length;
  const expired = enrichedOffers.filter(o => o.status === "Expired" || o.daysRemaining <= 0).length;

  const thStyle = { padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, borderBottom: `2px solid ${T.border}`, whiteSpace: "nowrap" };
  const tdStyle = { padding: "12px 12px", fontSize: 13, color: T.text, borderBottom: `1px solid ${T.borderLight}`, whiteSpace: "nowrap" };

  return (
    <div style={{ fontFamily: T.font }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{Ico.file(22)} Offers Management</div>
          <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>Track and manage all mortgage offers across the pipeline</div>
        </div>
      </div>

      {/* KPI Strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
        <KPICard label="Total Active" value={totalActive} color={T.primary} />
        <KPICard label="Accepted" value={accepted} color={T.success} />
        <KPICard label="Pending Response" value={pending} color="#3B82F6" />
        <KPICard label="Expiring (<14d)" value={expiring} color={T.warning} />
        <KPICard label="Expired" value={expired} color={T.danger} />
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {FILTER_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: T.font,
            background: activeTab === tab ? T.primary : "transparent",
            color: activeTab === tab ? "#fff" : T.textMuted,
            transition: "all 0.15s",
          }}>{tab}</button>
        ))}
      </div>

      {/* Table */}
      <Card noPad>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Case ID</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Offer Amount</th>
                <th style={thStyle}>Rate</th>
                <th style={thStyle}>Offer Issued</th>
                <th style={thStyle}>Expires</th>
                <th style={thStyle}>Days Remaining</th>
                <th style={thStyle}>ESIS Status</th>
                <th style={thStyle}>Offer Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(offer => {
                const daysColor = offer.status === "Expired" ? "#EF4444" : getDaysColor(offer.daysRemaining);
                const esisStatus = offer.esisGenerated ? "Generated" : "Pending";
                const isExpiring = offer.status === "Issued" && offer.daysRemaining > 0 && offer.daysRemaining < 14;

                return (
                  <tr key={offer.caseId} style={{ transition: "background 0.1s" }}
                    onMouseEnter={e => e.currentTarget.style.background = T.primaryLight}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={tdStyle}>
                      <span style={{ color: T.primary, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>{offer.caseId}</span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{offer.customer}</td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>{offer.product}</span>
                        <span style={{ background: offer.bucketColor + "18", color: offer.bucketColor, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{offer.bucket}</span>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{offer.amount}</td>
                    <td style={tdStyle}>{offer.rate}</td>
                    <td style={tdStyle}>{offer.issuedDate}</td>
                    <td style={tdStyle}>{offer.expiresDate}</td>
                    <td style={tdStyle}>
                      {offer.status === "Expired" || offer.daysRemaining <= 0 ? (
                        <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 12 }}>Expired</span>
                      ) : (
                        <span style={{ color: daysColor, fontWeight: 700, fontSize: 13 }}>
                          {offer.daysRemaining}d
                        </span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: offer.esisGenerated ? T.successBg : T.warningBg,
                        color: offer.esisGenerated ? T.success : T.warning,
                      }}>{esisStatus}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        padding: "3px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
                        background: offer.status === "Accepted" ? "#D1FAE5" : offer.status === "Expired" ? "#FEE2E2" : "#DBEAFE",
                        color: offer.status === "Accepted" ? "#065F46" : offer.status === "Expired" ? "#991B1B" : "#1D4ED8",
                      }}>{offer.status}</span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {offer.status === "Issued" && !isExpiring && (
                          <Btn small ghost style={{ fontSize: 11, padding: "4px 10px" }}>Chase Customer</Btn>
                        )}
                        {isExpiring && (
                          <Btn small ghost danger style={{ fontSize: 11, padding: "4px 10px", color: T.warning, border: `1px solid ${T.warningBorder}` }}>Extend Offer</Btn>
                        )}
                        {offer.esisGenerated && (
                          <Btn small ghost onClick={() => setEsisModal(offer)} style={{ fontSize: 11, padding: "4px 10px" }}>View ESIS</Btn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: T.textMuted, fontSize: 14 }}>
            No offers found for this filter.
          </div>
        )}
      </Card>

      {/* ESIS Modal */}
      {esisModal && <ESISModal offer={esisModal} onClose={() => setEsisModal(null)} />}
    </div>
  );
}
