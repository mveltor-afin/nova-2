import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";
import { MOCK_LOANS } from "../data/loans";

export default function BrokerLoansScreen({ onOpenCase, onNewLoan }) {
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, margin:0 }}>My Applications</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:T.textSecondary }}>Manage your loan applications</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn primary iconNode={Ico.plus(16)} onClick={onNewLoan}>Create Loan</Btn>
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", background:T.card, borderRadius:9, border:`1px solid ${T.border}` }}>
            {Ico.search(15)}<input placeholder="Search\u2026" style={{ border:"none", background:"transparent", outline:"none", fontSize:13, width:160, fontFamily:T.font }} />
          </div>
        </div>
      </div>
      <Card noPad>
        <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}`, display:"flex", gap:6, flexWrap:"wrap" }}>
          {["All","DIP","Submitted","KYC","Underwriting","Offer","Completion","Disbursed"].map((f,i) => (
            <span key={f} style={{ padding:"4px 12px", borderRadius:6, fontSize:12, fontWeight:500, cursor:"pointer", background:i===0?T.navy:T.bg, color:i===0?"#fff":T.textSecondary }}>{f}</span>
          ))}
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:"#F8FAFC" }}>
            {["Case ID","Customer(s)","Product","Amount","Term","Rate","Type","Status","Updated"].map(h => (
              <th key={h} style={{ textAlign:"left", padding:"9px 12px", fontSize:11, fontWeight:600, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4 }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {MOCK_LOANS.map((loan,i) => (
              <tr key={i} onClick={() => onOpenCase(loan)} style={{ cursor:"pointer", borderTop:`1px solid ${T.borderLight}` }}>
                <td style={{ padding:"11px 12px", fontWeight:600, color:T.primary, fontSize:13 }}>{loan.id}</td>
                <td style={{ padding:"11px 12px", fontSize:13 }}>{loan.names}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.product}</td>
                <td style={{ padding:"11px 12px", fontWeight:500 }}>{loan.amount}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.term}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.rate}</td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.type}</td>
                <td style={{ padding:"11px 12px" }}><StatusBadge status={loan.status} /></td>
                <td style={{ padding:"11px 12px", fontSize:12, color:T.textMuted }}>{loan.updated}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
