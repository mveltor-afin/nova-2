import { useState } from "react";
import { T, Ico, StatusBadge } from "../shared/tokens";
import { Btn, KPICard, Input, Select } from "../shared/primitives";

// ─── Firm ────────────────────────────────────────────────────────────────────
const FIRM = {
  trading:  "Watson & Partners",
  fullName: "Watson & Partners Mortgage Solutions Ltd",
  fca:      "123456",
  fcaType:  "Directly Authorised",
  address:  "12 High Street, Bristol, BS1 4AA",
  formed:   "14 Mar 2019",
  initials: "W&P",
};

// ─── Organisation relationships ───────────────────────────────────────────────
// A DA firm can hold:
//   1 Network  (FCA AR umbrella — only one allowed by FCA)
//   N Clubs    (volume aggregators for better proc fees — multiple allowed)
//   N Packagers (specialist intermediaries for complex cases — multiple allowed)
const RELATIONSHIPS = [
  {
    id: "R1", type: "Network", shortName: "Primis",
    name: "Primis Mortgage Network",
    fca: "823651", tier: "Gold",
    joined: "01 Jan 2020", renewalDate: "31 Dec 2026",
    agreementRef: "PMN-2020-0142",
    procFeeBase: "0.35%", procFeeBonus: "+0.05% (Gold tier)",
    procFeeSummary: "0.35% + bonus",
    status: "Active", casesRouted: 22, volRouted: 8200000,
    panel: ["Barclays", "HSBC", "NatWest", "Santander", "Halifax", "Leeds BS", "Nationwide", "TSB", "Accord", "Virgin Money"],
    contact: { name: "Claire Henderson", role: "Network Development Manager", email: "c.henderson@primis.co.uk", phone: "0800 321 0987" },
    compliance: { status: "Compliant", lastReview: "15 Jan 2026", nextReview: "15 Jan 2027", notes: "Annual review complete. No outstanding actions." },
    note: "FCA umbrella — firm operates as AR under Primis's permissions. Provides compliance oversight, PI insurance, and mandatory CPD framework.",
    color: "#6D28D9", bg: "#F5F3FF", border: "#DDD6FE", text: "#4C1D95",
    dash: "",
  },
  {
    id: "R2", type: "Club", shortName: "L&G Club",
    name: "Legal & General Mortgage Club",
    fca: "652332", tier: "Platinum",
    joined: "15 Mar 2021", renewalDate: "31 Mar 2027",
    agreementRef: "LG-MC-2021-0891",
    procFeeBase: "0.40%", procFeeBonus: "+0.03% (Platinum)",
    procFeeSummary: "0.40% + bonus",
    status: "Active", casesRouted: 14, volRouted: 5100000,
    panel: ["Barclays", "Halifax", "HSBC", "Nationwide", "NatWest", "Coventry BS", "Metro Bank"],
    contact: { name: "David Park", role: "Club Relationship Manager", email: "d.park@lgmortgageclub.co.uk", phone: "0345 602 0677" },
    compliance: { status: "Compliant", lastReview: "—", nextReview: "—", notes: "Clubs do not provide FCA oversight — compliance remains with Primis." },
    note: "Volume aggregator for mainstream lenders. Platinum tier gives better proc fees than direct or via Primis for Barclays and Halifax. No membership fee — club earns a proc fee split.",
    color: "#1D4ED8", bg: "#DBEAFE", border: "#BFDBFE", text: "#1E3A8A",
    dash: "",
  },
  {
    id: "R3", type: "Club", shortName: "Paradigm",
    name: "Paradigm Mortgage Club",
    fca: "489132", tier: "Standard",
    joined: "22 Jul 2022", renewalDate: "22 Jul 2027",
    agreementRef: "PAR-2022-0044",
    procFeeBase: "0.37%", procFeeBonus: "—",
    procFeeSummary: "0.37%",
    status: "Active", casesRouted: 8, volRouted: 2800000,
    panel: ["Accord", "Precise Mortgages", "Kensington", "Aldermore", "Kent Reliance", "Together Money"],
    contact: { name: "Fiona Walsh", role: "Broker Services", email: "brokers@paradigm.co.uk", phone: "01268 290 690" },
    compliance: { status: "N/A", lastReview: "—", nextReview: "—", notes: "Club membership only — no FCA compliance scope." },
    note: "Access to specialist BTL and near-prime lenders not on the Primis panel. Cases that don't fit mainstream criteria are routed here for Accord, Precise, or Kensington.",
    color: "#1D4ED8", bg: "#DBEAFE", border: "#BFDBFE", text: "#1E3A8A",
    dash: "",
  },
  {
    id: "R4", type: "Packager", shortName: "Brightstar",
    name: "Brightstar Financial",
    fca: "211814", tier: "Preferred",
    joined: "10 Oct 2020", renewalDate: "Rolling",
    agreementRef: "BSF-2020-0210",
    procFeeBase: "0.30%", procFeeBonus: "+ 0.50% packaging fee",
    procFeeSummary: "0.30% net",
    status: "Active", casesRouted: 5, volRouted: 1900000,
    panel: ["Precise Mortgages", "Kensington", "Together Money", "Pepper Money", "Bluestone"],
    specialisms: ["Adverse credit", "Complex income", "Near-prime", "Large HMO"],
    contact: { name: "Ryan Archer", role: "Case Manager", email: "r.archer@brightstarfinancial.co.uk", phone: "01277 500 900" },
    compliance: { status: "N/A", lastReview: "—", nextReview: "—", notes: "Packager manages lender relationship directly. Firm retains FCA responsibility for advice." },
    note: "Specialist packaging for adverse credit and complex income cases. Exclusive lender access for near-prime borrowers. Packager prepares the full case submission.",
    color: "#D97706", bg: "#FEF3C7", border: "#FCD34D", text: "#92400E",
    dash: "6 3",
  },
  {
    id: "R5", type: "Packager", shortName: "Crystal SF",
    name: "Crystal Specialist Finance",
    fca: "636885", tier: "Preferred",
    joined: "05 Feb 2023", renewalDate: "Rolling",
    agreementRef: "CSF-2023-0088",
    procFeeBase: "0.25%", procFeeBonus: "+ 0.75% packaging fee",
    procFeeSummary: "0.25% net",
    status: "Active", casesRouted: 3, volRouted: 2400000,
    panel: ["Shawbrook Bank", "Octane Capital", "MT Finance", "West One Loans", "LendInvest"],
    specialisms: ["Bridging finance", "Development finance", "HNW", "Semi-commercial"],
    contact: { name: "Michelle Fox", role: "Senior BDM", email: "m.fox@crystalspecialist.co.uk", phone: "01827 66244" },
    compliance: { status: "N/A", lastReview: "—", nextReview: "—", notes: "Packager manages lender relationship. FCA regulated advice remains with Watson & Partners." },
    note: "Bridging, development finance, and HNW cases. Exclusive access to short-term specialist lenders not accessible via clubs or the Primis panel.",
    color: "#D97706", bg: "#FEF3C7", border: "#FCD34D", text: "#92400E",
    dash: "6 3",
  },
];

// ─── Team ────────────────────────────────────────────────────────────────────
const INITIAL_TEAM = [
  { id:"ADV-001", name:"John Watson",    email:"j.watson@watsonpartners.co.uk",    fca:"123456", fcaAuth:"CeMAP + DA",    role:"Principal",      status:"Active",    casesMTD:8,  caseLimit:null, volumeMTD:2800000, volumeLimit:null,    joined:"14 Mar 2019", mfa:true,  lastActive:"Today, 10:32", canViewAllCases:true  },
  { id:"ADV-002", name:"Sarah Mitchell", email:"s.mitchell@watsonpartners.co.uk",  fca:"234567", fcaAuth:"CeMAP Level 3", role:"Adviser",        status:"Active",    casesMTD:6,  caseLimit:10,   volumeMTD:2100000, volumeLimit:3000000, joined:"12 Jan 2021", mfa:true,  lastActive:"Today, 09:15", canViewAllCases:false },
  { id:"ADV-003", name:"Mark Davies",    email:"m.davies@watsonpartners.co.uk",    fca:"345678", fcaAuth:"CeMAP Level 3", role:"Adviser",        status:"Active",    casesMTD:4,  caseLimit:8,    volumeMTD:1400000, volumeLimit:2500000, joined:"03 Jun 2022", mfa:false, lastActive:"Yesterday",    canViewAllCases:false },
  { id:"ADV-004", name:"Emma Clarke",    email:"e.clarke@watsonpartners.co.uk",    fca:null,     fcaAuth:"CeMAP Pending", role:"Para Planner",   status:"Active",    casesMTD:2,  caseLimit:5,    volumeMTD:600000,  volumeLimit:1500000, joined:"15 Sep 2023", mfa:true,  lastActive:"Today, 08:44", canViewAllCases:false },
  { id:"ADV-005", name:"Tom O'Brien",    email:"t.obrien@watsonpartners.co.uk",    fca:"456789", fcaAuth:"CeMAP Level 3", role:"Adviser",        status:"Suspended", casesMTD:0,  caseLimit:6,    volumeMTD:0,       volumeLimit:2000000, joined:"20 Feb 2023", mfa:false, lastActive:"3 days ago",   canViewAllCases:false, suspendReason:"Pending CPD completion — overdue 14 days" },
  { id:"ADV-006", name:"Rachel Patel",   email:"r.patel@watsonpartners.co.uk",     fca:null,     fcaAuth:"—",             role:"Admin",          status:"Invited",   casesMTD:0,  caseLimit:0,    volumeMTD:0,       volumeLimit:null,    joined:null,          mfa:false, lastActive:"—",            canViewAllCases:false, invitedDate:"19 Apr 2026" },
];

// ─── Team cases ───────────────────────────────────────────────────────────────
const TEAM_CASES = [
  { ref:"AFN-2026-00188", advId:"ADV-002", borrower:"Mr & Mrs Brown",    product:"2-Year Fixed",     amount:"£385,000", status:"Submitted",      updated:"Today" },
  { ref:"AFN-2026-00185", advId:"ADV-001", borrower:"Ms Sarah Jenkins",  product:"5-Year Fixed",     amount:"£510,000", status:"Underwriting",   updated:"Yesterday" },
  { ref:"AFN-2026-00181", advId:"ADV-003", borrower:"Mr Singh",          product:"Tracker",          amount:"£210,000", status:"DIP_Approved",   updated:"Yesterday" },
  { ref:"AFN-2026-00179", advId:"ADV-002", borrower:"Mr & Mrs Patel",    product:"2-Yr Fixed BTL",   amount:"£320,000", status:"KYC_In_Progress",updated:"18 Apr" },
  { ref:"AFN-2026-00176", advId:"ADV-001", borrower:"Mr Taylor",         product:"5-Year Fixed",     amount:"£275,000", status:"Offer_Issued",   updated:"17 Apr" },
  { ref:"AFN-2026-00171", advId:"ADV-004", borrower:"Ms Rodriguez",      product:"2-Year Fixed",     amount:"£155,000", status:"Submitted",      updated:"15 Apr" },
  { ref:"AFN-2026-00168", advId:"ADV-003", borrower:"Mr & Mrs Wilson",   product:"10-Year Fixed",    amount:"£425,000", status:"Approved",       updated:"14 Apr" },
  { ref:"AFN-2026-00162", advId:"ADV-002", borrower:"Dr Harrington",     product:"Tracker",          amount:"£895,000", status:"Offer_Accepted", updated:"10 Apr" },
  { ref:"AFN-2026-00158", advId:"ADV-001", borrower:"Mr & Mrs Clarke",   product:"5-Year Fixed",     amount:"£340,000", status:"Disbursed",      updated:"08 Apr" },
  { ref:"AFN-2026-00151", advId:"ADV-004", borrower:"Ms Thompson",       product:"2-Year Fixed",     amount:"£198,000", status:"Draft",          updated:"Today" },
];

// ─── Activity ─────────────────────────────────────────────────────────────────
const ACTIVITY = [
  { ts:"Today 10:45",     actor:"Sarah Mitchell", action:"Submitted application",  detail:"AFN-2026-00188 — £385,000 — Mr & Mrs Brown",        type:"case" },
  { ts:"Today 09:30",     actor:"John Watson",    action:"Added team member",       detail:"Rachel Patel invited as Admin",                     type:"team" },
  { ts:"Yesterday 16:12", actor:"Mark Davies",    action:"DIP approved",            detail:"AFN-2026-00181 — £210,000 — Mr Singh",              type:"case" },
  { ts:"Yesterday 14:00", actor:"System",         action:"Limit alert",             detail:"Sarah Mitchell at 60% of monthly case limit",        type:"alert" },
  { ts:"18 Apr 2026",     actor:"John Watson",    action:"Suspended adviser",       detail:"Tom O'Brien — CPD overdue",                         type:"team" },
  { ts:"15 Apr 2026",     actor:"Emma Clarke",    action:"Submitted application",   detail:"AFN-2026-00171 — £155,000 — Ms Rodriguez",          type:"case" },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const thSt = { padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:T.textMuted, textTransform:"uppercase", letterSpacing:0.4, borderBottom:`2px solid ${T.border}` };
const tdSt = { padding:"12px 14px", fontSize:13, color:T.text, borderBottom:`1px solid ${T.borderLight}` };
const tabSt = (active) => ({
  padding:"10px 22px", fontSize:13, fontWeight:600, cursor:"pointer", borderRadius:"8px 8px 0 0",
  background: active ? T.card : "transparent", color: active ? T.primary : T.textMuted,
  border: active ? `1px solid ${T.border}` : "1px solid transparent",
  borderBottom: active ? `1px solid ${T.card}` : "none", marginBottom:-1, userSelect:"none",
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtVol      = (n) => n >= 1_000_000 ? `£${(n/1_000_000).toFixed(1)}M` : `£${(n/1_000).toFixed(0)}k`;
const pctUsed     = (val, lim) => lim ? Math.min(Math.round((val/lim)*100), 100) : 0;
const barColor    = (p) => p >= 90 ? T.danger : p >= 70 ? T.warning : T.success;
const statusChip  = (s) => ({ Active:{bg:T.successBg,text:T.success}, Suspended:{bg:T.dangerBg,text:T.danger}, Invited:{bg:T.warningBg,text:"#B45309"} }[s] || {bg:T.bg,text:T.textMuted});
const MEMBER_ROLES = ["Principal","Adviser","Para Planner","Admin","Trainee Adviser"];
const BLANK_FORM   = { name:"", email:"", role:"Adviser", fcaAuth:"", fca:"", caseLimit:"", volumeLimit:"", mfa:true, canViewAllCases:false };
const PRODUCT_TYPES = ["Residential","BTL","Commercial","Bridging","Development","Shared Ownership"];

// ─── LimitBar ─────────────────────────────────────────────────────────────────
function LimitBar({ val, limit, fmt }) {
  if (!limit) return <span style={{ fontSize:12, color:T.textMuted }}>No limit</span>;
  const p = pctUsed(val, limit);
  const c = barColor(p);
  return (
    <div style={{ minWidth:110 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:T.textMuted, marginBottom:3 }}>
        <span>{fmt ? fmt(val) : val}</span><span>{fmt ? fmt(limit) : limit} max</span>
      </div>
      <div style={{ background:T.border, borderRadius:4, height:5, overflow:"hidden" }}>
        <div style={{ width:`${p}%`, height:"100%", background:c, borderRadius:4, transition:"width 0.3s" }} />
      </div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }) {
  return (
    <div onClick={onToggle} style={{ width:40, height:22, borderRadius:11, flexShrink:0, cursor:"pointer", position:"relative", background:on?T.success:T.border, transition:"background 0.2s" }}>
      <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left:on?20:2, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );
}

// ─── SVG Graph ────────────────────────────────────────────────────────────────
// Visualises the firm-to-organisation relationship graph.
// Network (1): purple — provides FCA umbrella, mandatory
// Clubs (n): blue  — volume aggregators, multiple allowed
// Packagers (n): amber, dashed — specialist case routing, multiple allowed
function OrgGraph({ relationships, selectedId, onSelect }) {
  const firmCx = 88;
  const firmCy = 245;
  const firmR  = 46;

  const nodeX   = 246;
  const nodeW   = 185;
  const nodeH   = 58;
  const nodeRx  = 10;
  const n       = relationships.length;
  const spacing = Math.min(84, (440 / Math.max(n - 1, 1)));
  const startY  = firmCy - ((n - 1) / 2) * spacing - nodeH / 2;
  const svgH    = Math.max(startY + n * spacing + nodeH + 40, firmCy * 2 + 40);

  const nodeTop = (i) => startY + i * spacing;
  const nodeMid = (i) => nodeTop(i) + nodeH / 2;

  // Bezier from firm right-edge to org left-edge (mid height)
  const edgePath = (i) => {
    const cy = nodeMid(i);
    return `M${firmCx + firmR},${firmCy} C${firmCx + firmR + 55},${firmCy} ${nodeX - 45},${cy} ${nodeX},${cy}`;
  };

  // Midpoint of cubic bezier at t=0.5: x≈230, y≈(firmCy+cy)/2
  const edgeMid = (i) => ({ x: 188, y: (firmCy + nodeMid(i)) / 2 });

  return (
    <svg viewBox={`0 0 620 ${svgH}`} style={{ width:"100%", height:"auto", display:"block" }}>
      <defs>
        <linearGradient id="firmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#225F6E" />
          <stop offset="100%" stopColor={T.primaryDark} />
        </linearGradient>
      </defs>

      {/* ── Edges ── */}
      {relationships.map((rel, i) => {
        const dimmed = selectedId && selectedId !== rel.id;
        return (
          <path key={`e-${rel.id}`}
            d={edgePath(i)}
            fill="none"
            stroke={rel.color}
            strokeWidth={selectedId === rel.id ? 3 : 2}
            strokeDasharray={rel.dash || "none"}
            opacity={dimmed ? 0.15 : 0.65}
            style={{ transition:"opacity 0.2s,stroke-width 0.2s" }}
          />
        );
      })}

      {/* ── Proc fee labels on edges ── */}
      {relationships.map((rel, i) => {
        const { x, y } = edgeMid(i);
        const dimmed = selectedId && selectedId !== rel.id;
        return (
          <g key={`fee-${rel.id}`} opacity={dimmed ? 0.1 : 1} style={{ transition:"opacity 0.2s" }}>
            <rect x={x - 20} y={y - 9} width={40} height={16} rx={8} fill={rel.bg} stroke={rel.border} strokeWidth={1} />
            <text x={x} y={y + 4} textAnchor="middle" fill={rel.color} fontSize={9} fontWeight="800" fontFamily={T.font}>
              {rel.procFeeBase}
            </text>
          </g>
        );
      })}

      {/* ── Firm node ── */}
      <circle cx={firmCx} cy={firmCy} r={firmR + 6} fill={T.primaryLight} opacity={0.35} />
      <circle cx={firmCx} cy={firmCy} r={firmR} fill="url(#firmGrad)" />
      <circle cx={firmCx} cy={firmCy} r={firmR} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={1.5} />
      <text x={firmCx} y={firmCy - 10} textAnchor="middle" fill="white" fontSize={14} fontWeight="800" fontFamily={T.font}>{FIRM.initials}</text>
      <text x={firmCx} y={firmCy + 7}  textAnchor="middle" fill="rgba(255,255,255,0.65)" fontSize={9}  fontFamily={T.font}>DA Firm</text>
      <text x={firmCx} y={firmCy + 19} textAnchor="middle" fill="rgba(255,255,255,0.4)"  fontSize={8}  fontFamily={T.font}>FCA {FIRM.fca}</text>

      {/* ── Org nodes ── */}
      {relationships.map((rel, i) => {
        const y   = nodeTop(i);
        const mid = nodeMid(i);
        const sel = selectedId === rel.id;
        const dimmed = selectedId && !sel;

        // Type pill width
        const pillW = rel.type === "Network" ? 54 : rel.type === "Club" ? 34 : 62;

        return (
          <g key={rel.id} onClick={() => onSelect(sel ? null : rel.id)} style={{ cursor:"pointer" }}
             opacity={dimmed ? 0.3 : 1}>
            {/* Selection glow */}
            {sel && <rect x={nodeX-5} y={y-5} width={nodeW+10} height={nodeH+10} rx={nodeRx+5} fill={rel.bg} opacity={0.45} />}
            {/* Node body */}
            <rect x={nodeX} y={y} width={nodeW} height={nodeH} rx={nodeRx}
              fill={rel.bg} stroke={rel.color} strokeWidth={sel ? 2.5 : 1.5} />
            {/* Type pill */}
            <rect x={nodeX+10} y={y+10} width={pillW} height={15} rx={7} fill={rel.color} />
            <text x={nodeX+10+pillW/2} y={y+21} textAnchor="middle" fill="white" fontSize={8} fontWeight="800" fontFamily={T.font} letterSpacing={0.8}>
              {rel.type.toUpperCase()}
            </text>
            {/* Short name */}
            <text x={nodeX+10+pillW+8} y={y+22} fill={rel.text} fontSize={12} fontWeight="700" fontFamily={T.font}>
              {rel.shortName}
            </text>
            {/* Stats row */}
            <text x={nodeX+10} y={y+43} fill={rel.color} fontSize={9} fontFamily={T.font} opacity={0.8}>
              {rel.casesRouted} cases · {fmtVol(rel.volRouted)} · {rel.panel.length} lenders
            </text>
            {/* Caret */}
            <text x={nodeX+nodeW-14} y={mid+5} textAnchor="middle" fill={rel.color} fontSize={16} fontFamily={T.font} opacity={sel ? 1 : 0.4}>
              {sel ? "›" : "›"}
            </text>
          </g>
        );
      })}

      {/* ── Legend ── */}
      <g transform={`translate(14,${svgH - 20})`}>
        {[
          { label:"Network — FCA umbrella (1 max)", color:"#6D28D9", dash:"" },
          { label:"Club — proc fee aggregator",     color:"#1D4ED8", dash:"",   x:205 },
          { label:"Packager — specialist routing",  color:"#D97706", dash:"6 3",x:375 },
        ].map(({ label, color, dash, x = 0 }) => (
          <g key={label} transform={`translate(${x},0)`}>
            <line x1={0} y1={7} x2={20} y2={7} stroke={color} strokeWidth={1.8} strokeDasharray={dash || "none"} />
            <text x={25} y={11} fill={T.textMuted} fontSize={9} fontFamily={T.font}>{label}</text>
          </g>
        ))}
      </g>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function BrokerAdminDashboard() {
  const [tab, setTab]         = useState("Overview");
  const [team, setTeam]       = useState(INITIAL_TEAM);
  const [showModal, setShowModal]           = useState(false);
  const [editing, setEditing]               = useState(null);
  const [form, setForm]                     = useState(BLANK_FORM);
  const [confirmSuspend, setConfirmSuspend] = useState(null);
  const [showTeamCases, setShowTeamCases]   = useState(false);
  const [caseFilter, setCaseFilter]         = useState("all");
  const [selectedOrg, setSelectedOrg]       = useState(null);
  const [settings, setSettings] = useState({ mfaRequired:true, principalSignoff:false, limitAlerts:true });
  const [enabledProducts, setEnabledProducts] = useState(["Residential","BTL"]);

  const tabs = ["Overview","My Team","Organisation","Settings"];
  const activeTeam  = team.filter(m => m.status === "Active");
  const totalCases  = activeTeam.reduce((s, m) => s + m.casesMTD, 0);
  const totalVolume = activeTeam.reduce((s, m) => s + m.volumeMTD, 0);
  const totalRelVol = RELATIONSHIPS.reduce((s, r) => s + r.volRouted, 0);

  // Modal helpers
  const openAdd  = () => { setEditing(null); setForm(BLANK_FORM); setShowModal(true); };
  const openEdit = (m) => {
    setEditing(m);
    setForm({ name:m.name, email:m.email||"", role:m.role, fcaAuth:m.fcaAuth==="—"?"":m.fcaAuth, fca:m.fca||"",
      caseLimit:m.caseLimit!=null?String(m.caseLimit):"",
      volumeLimit:m.volumeLimit!=null?String(m.volumeLimit/1000):"", mfa:m.mfa, canViewAllCases:m.canViewAllCases||false });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); setForm(BLANK_FORM); };

  const handleSave = () => {
    const patch = {
      name:m=>m, email:m=>m, role:m=>m, fcaAuth:m=>m||"—", fca:m=>m||null,
      caseLimit:m=>m?parseInt(m,10):null, volumeLimit:m=>m?parseInt(m,10)*1000:null, mfa:m=>m, canViewAllCases:m=>m,
    };
    const p = Object.fromEntries(Object.entries(patch).map(([k,fn]) => [k, fn(form[k])]));
    if (editing) {
      setTeam(t => t.map(m => m.id === editing.id ? { ...m, ...p } : m));
    } else {
      const id = `ADV-${String(team.length+1).padStart(3,"0")}`;
      setTeam(t => [...t, { id, ...p, casesMTD:0, volumeMTD:0, joined:null, status:"Invited", lastActive:"—", invitedDate:"Today" }]);
    }
    closeModal();
  };

  const toggleSuspend = (m) => {
    setTeam(t => t.map(x => x.id === m.id ? { ...x, status:x.status==="Active"?"Suspended":"Active", suspendReason:x.status==="Active"?"Suspended by firm admin":undefined } : x));
    setConfirmSuspend(null);
  };

  // Team cases filtered view
  const visibleCases = caseFilter === "all"
    ? TEAM_CASES
    : TEAM_CASES.filter(c => c.advId === caseFilter);
  const memberById = (id) => team.find(m => m.id === id);

  // Selected org detail
  const activeOrg = selectedOrg ? RELATIONSHIPS.find(r => r.id === selectedOrg) : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth:1120, margin:"0 auto", padding:"32px 24px 64px", fontFamily:T.font }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:28 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
              <h1 style={{ fontSize:22, fontWeight:800, color:T.navy, margin:0 }}>{FIRM.trading}</h1>
              <span style={{ background:"#EDE9FE", color:"#6D28D9", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:0.4 }}>
                {RELATIONSHIPS.filter(r=>r.type==="Network").length} Network · {RELATIONSHIPS.filter(r=>r.type==="Club").length} Clubs · {RELATIONSHIPS.filter(r=>r.type==="Packager").length} Packagers
              </span>
              <span style={{ background:T.successBg, color:T.success, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20 }}>Active</span>
            </div>
            <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
              <span style={{ fontSize:13, color:T.textMuted }}>FCA <strong style={{ color:T.text }}>{FIRM.fca}</strong></span>
              <span style={{ fontSize:13, color:T.textMuted }}>{FIRM.fcaType}</span>
              <span style={{ fontSize:13, color:T.textMuted }}>{FIRM.address}</span>
              <span style={{ fontSize:13, color:T.textMuted }}>Est. {FIRM.formed}</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <Btn ghost icon="download" small>Export Report</Btn>
            <Btn primary icon="assign" small onClick={openAdd}>Add Team Member</Btn>
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:16, marginBottom:28 }}>
        <KPICard label="Active Advisers"     value={activeTeam.length}       sub={`${team.filter(m=>m.status==="Suspended").length} suspended · ${team.filter(m=>m.status==="Invited").length} invited`} color={T.primary} />
        <KPICard label="Cases MTD"           value={totalCases}              sub="Across all active advisers"       color={T.accent}  />
        <KPICard label="Volume MTD"          value={fmtVol(totalVolume)}     sub="All active advisers"              color={T.success} />
        <KPICard label="Routed via Orgs"     value={fmtVol(totalRelVol)}     sub={`${RELATIONSHIPS.length} active relationships`} color="#6D28D9" />
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:"flex", gap:4, borderBottom:`1px solid ${T.border}` }}>
        {tabs.map(t => <div key={t} style={tabSt(tab===t)} onClick={()=>setTab(t)}>{t}</div>)}
      </div>

      <div style={{ background:T.card, border:`1px solid ${T.border}`, borderTop:"none", borderRadius:"0 8px 8px 8px", padding:24 }}>

        {/* ══════════ OVERVIEW ══════════ */}
        {tab === "Overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 310px", gap:28 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:T.navy, marginBottom:16 }}>Recent Activity</div>
              {ACTIVITY.map((a,i) => {
                const tc = {case:T.primary,team:"#6D28D9",alert:T.warning}[a.type]||T.textMuted;
                const tb = {case:T.primaryLight,team:"#EDE9FE",alert:T.warningBg}[a.type]||T.bg;
                return (
                  <div key={i} style={{ display:"flex", gap:14, padding:"14px 0", borderBottom:i<ACTIVITY.length-1?`1px solid ${T.borderLight}`:"none" }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:tb, display:"flex", alignItems:"center", justifyContent:"center", color:tc, flexShrink:0 }}>
                      {a.type==="case"?Ico.loans(14):a.type==="alert"?Ico.alert(14):Ico.users(14)}
                    </div>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{a.action}</div>
                      <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{a.detail}</div>
                      <div style={{ fontSize:11, color:T.textMuted, marginTop:3 }}>{a.actor} · {a.ts}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={{ background:T.warningBg, border:`1px solid ${T.warningBorder}`, borderRadius:10, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#92400E", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>{Ico.alert(15)} Alerts</div>
                <div style={{ fontSize:12, color:"#92400E", marginBottom:8, lineHeight:1.5 }}><strong>Tom O'Brien</strong> — CPD overdue 14 days. Adviser suspended.</div>
                <div style={{ fontSize:12, color:"#92400E", lineHeight:1.5 }}><strong>Sarah Mitchell</strong> — 60% monthly case limit (6/10 cases).</div>
              </div>
              <div style={{ background:"#F5F3FF", border:"1px solid #DDD6FE", borderRadius:10, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#6D28D9", marginBottom:10 }}>Org Relationships</div>
                {RELATIONSHIPS.map(r => (
                  <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div>
                      <span style={{ fontSize:10, fontWeight:800, color:r.color, textTransform:"uppercase", letterSpacing:0.5, marginRight:6 }}>{r.type}</span>
                      <span style={{ fontSize:12, color:r.text, fontWeight:500 }}>{r.shortName}</span>
                    </div>
                    <span style={{ fontSize:11, color:r.color }}>{r.casesRouted} cases</span>
                  </div>
                ))}
              </div>
              <div style={{ background:T.successBg, border:`1px solid ${T.successBorder}`, borderRadius:10, padding:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:T.success, marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>{Ico.shield(15)} FCA Status</div>
                <div style={{ fontSize:12, color:"#065F46", marginBottom:3 }}><strong>Firm:</strong> Active · {FIRM.fca} ({FIRM.fcaType})</div>
                <div style={{ fontSize:12, color:"#065F46", marginBottom:3 }}><strong>AR under:</strong> Primis Mortgage Network</div>
                <div style={{ fontSize:12, color:"#065F46" }}><strong>Compliance review:</strong> 15 Jan 2027</div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ MY TEAM ══════════ */}
        {tab === "My Team" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:T.navy }}>Team Members</div>
                <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{team.length} members · {activeTeam.length} active</div>
              </div>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                {/* Team cases toggle */}
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:9, border:`1px solid ${T.border}`, background:showTeamCases?T.primaryLight:T.bg, cursor:"pointer" }} onClick={()=>setShowTeamCases(v=>!v)}>
                  <Toggle on={showTeamCases} onToggle={()=>{}} />
                  <span style={{ fontSize:12, fontWeight:600, color:showTeamCases?T.primary:T.textMuted, userSelect:"none" }}>Team Pipeline</span>
                </div>
                <Btn primary icon="assign" small onClick={openAdd}>Add Member</Btn>
              </div>
            </div>

            {/* Team member table */}
            <div style={{ overflowX:"auto", marginBottom:showTeamCases?24:0 }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:T.bg }}>
                    <th style={thSt}>Name / Role</th>
                    <th style={thSt}>FCA Auth</th>
                    <th style={thSt}>Cases MTD</th>
                    <th style={thSt}>Volume MTD</th>
                    <th style={thSt}>Status</th>
                    <th style={thSt}>Last Active</th>
                    <th style={{...thSt,textAlign:"right"}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map(m => {
                    const chip = statusChip(m.status);
                    return (
                      <tr key={m.id} style={{ background:m.status==="Suspended"?"#FFF8F8":"transparent" }}>
                        <td style={tdSt}>
                          <div style={{ fontWeight:600 }}>{m.name}</div>
                          <div style={{ fontSize:11, color:T.textMuted, marginTop:1 }}>{m.role}</div>
                          <div style={{ fontSize:11, color:T.textMuted }}>{m.email}</div>
                          {m.status==="Suspended"&&m.suspendReason&&<div style={{ fontSize:11, color:T.danger, marginTop:3, fontWeight:500 }}>⚠ {m.suspendReason}</div>}
                          {m.status==="Invited"&&<div style={{ fontSize:11, color:"#B45309", marginTop:3 }}>Invited {m.invitedDate}</div>}
                        </td>
                        <td style={tdSt}>
                          <div style={{ fontSize:12 }}>{m.fcaAuth}</div>
                          {m.fca&&<div style={{ fontSize:11, color:T.textMuted }}>#{m.fca}</div>}
                        </td>
                        <td style={tdSt}><LimitBar val={m.casesMTD} limit={m.caseLimit} /></td>
                        <td style={tdSt}><LimitBar val={m.volumeMTD} limit={m.volumeLimit} fmt={fmtVol} /></td>
                        <td style={tdSt}>
                          <span style={{ background:chip.bg, color:chip.text, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>{m.status}</span>
                          {m.mfa&&<div style={{ fontSize:10, color:T.success, marginTop:3 }}>MFA ✓</div>}
                          {m.canViewAllCases&&<div style={{ fontSize:10, color:T.primary, marginTop:2 }}>Team cases ✓</div>}
                        </td>
                        <td style={{...tdSt,fontSize:12,color:T.textMuted}}>{m.lastActive}</td>
                        <td style={{...tdSt,textAlign:"right"}}>
                          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
                            <Btn ghost small onClick={()=>openEdit(m)}>Edit</Btn>
                            {m.role!=="Principal"&&m.status!=="Invited"&&(
                              <button onClick={()=>setConfirmSuspend(m)} style={{ padding:"7px 14px", borderRadius:9, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:T.font, background:m.status==="Suspended"?T.successBg:T.dangerBg, color:m.status==="Suspended"?T.success:T.danger, border:`1px solid ${m.status==="Suspended"?T.successBorder:T.dangerBorder}` }}>
                                {m.status==="Suspended"?"Reinstate":"Suspend"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Limit legend */}
            {!showTeamCases && (
              <div style={{ marginTop:16, padding:12, background:T.bg, borderRadius:8, display:"flex", gap:20, flexWrap:"wrap", alignItems:"center" }}>
                <span style={{ fontSize:11, color:T.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.4 }}>Limits:</span>
                {[["< 70%",T.success],["70–90%",T.warning],["> 90%",T.danger]].map(([l,c])=>(
                  <div key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.textMuted }}>
                    <div style={{ width:12, height:12, borderRadius:3, background:c }} />{l}
                  </div>
                ))}
                <span style={{ fontSize:12, color:T.textMuted, marginLeft:"auto" }}>Resets 1st of each month</span>
              </div>
            )}

            {/* ── Team Pipeline ── */}
            {showTeamCases && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:T.navy }}>Team Pipeline</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:12, color:T.textMuted }}>Filter by adviser:</span>
                    <select
                      value={caseFilter}
                      onChange={e=>setCaseFilter(e.target.value)}
                      style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${T.border}`, fontSize:12, fontFamily:T.font, color:T.text, background:T.card, outline:"none" }}>
                      <option value="all">All advisers ({TEAM_CASES.length} cases)</option>
                      {team.filter(m=>m.status==="Active"&&m.role!=="Admin").map(m=>(
                        <option key={m.id} value={m.id}>{m.name} ({TEAM_CASES.filter(c=>c.advId===m.id).length})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse" }}>
                    <thead>
                      <tr style={{ background:T.bg }}>
                        <th style={thSt}>Case Ref</th>
                        <th style={thSt}>Adviser</th>
                        <th style={thSt}>Borrower</th>
                        <th style={thSt}>Product</th>
                        <th style={thSt}>Amount</th>
                        <th style={thSt}>Status</th>
                        <th style={thSt}>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleCases.map(c => {
                        const adv = memberById(c.advId);
                        return (
                          <tr key={c.ref}>
                            <td style={tdSt}><span style={{ fontFamily:"monospace", fontSize:12, color:T.primary, fontWeight:600 }}>{c.ref}</span></td>
                            <td style={tdSt}>
                              <div style={{ fontSize:13, fontWeight:600 }}>{adv?.name||"—"}</div>
                              <div style={{ fontSize:11, color:T.textMuted }}>{adv?.role}</div>
                            </td>
                            <td style={{...tdSt,fontWeight:500}}>{c.borrower}</td>
                            <td style={{...tdSt,fontSize:12,color:T.textMuted}}>{c.product}</td>
                            <td style={{...tdSt,fontWeight:600}}>{c.amount}</td>
                            <td style={tdSt}><StatusBadge status={c.status} /></td>
                            <td style={{...tdSt,fontSize:12,color:T.textMuted}}>{c.updated}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {visibleCases.length === 0 && (
                  <div style={{ textAlign:"center", padding:32, color:T.textMuted, fontSize:13 }}>No cases for this adviser.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════ ORGANISATION ══════════ */}
        {tab === "Organisation" && (
          <div>
            {/* Graph header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:T.navy, marginBottom:4 }}>Relationship Graph</div>
                <div style={{ fontSize:12, color:T.textMuted }}>
                  {FIRM.trading} holds <strong>{RELATIONSHIPS.filter(r=>r.type==="Network").length} Network</strong>, <strong>{RELATIONSHIPS.filter(r=>r.type==="Club").length} Club</strong>, and <strong>{RELATIONSHIPS.filter(r=>r.type==="Packager").length} Packager</strong> relationships.
                  Click a node to view details.
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <Btn ghost small icon="plus">Add Relationship</Btn>
              </div>
            </div>

            {/* SVG graph */}
            <div style={{ border:`1px solid ${T.border}`, borderRadius:12, background:T.bg, padding:"8px 0 4px", marginBottom:20 }}>
              <OrgGraph
                relationships={RELATIONSHIPS}
                selectedId={selectedOrg}
                onSelect={setSelectedOrg}
              />
            </div>

            {/* Org type explainer bar */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
              {[
                { type:"Network", color:"#6D28D9", bg:"#F5F3FF", border:"#DDD6FE", desc:"Provides FCA AR permissions. One per firm (FCA rule). Sets compliance standards, PI requirements, and CPD obligations." },
                { type:"Club",    color:"#1D4ED8", bg:"#DBEAFE", border:"#BFDBFE", desc:"Volume aggregator for better proc fees. No FCA oversight role. Multiple memberships allowed simultaneously." },
                { type:"Packager",color:"#D97706", bg:"#FEF3C7", border:"#FCD34D", desc:"Specialist case routing for complex borrowers. Accesses niche lenders. Charges a packaging fee on top of proc." },
              ].map(({ type, color, bg, border, desc }) => (
                <div key={type} style={{ padding:14, background:bg, border:`1px solid ${border}`, borderRadius:10 }}>
                  <div style={{ fontSize:11, fontWeight:800, color, textTransform:"uppercase", letterSpacing:0.8, marginBottom:6 }}>{type}</div>
                  <div style={{ fontSize:12, color, lineHeight:1.6 }}>{desc}</div>
                </div>
              ))}
            </div>

            {/* Selected org detail */}
            {activeOrg ? (
              <div style={{ border:`2px solid ${activeOrg.border}`, borderRadius:14, background:activeOrg.bg, overflow:"hidden" }}>
                <div style={{ padding:"18px 22px", borderBottom:`1px solid ${activeOrg.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:activeOrg.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:15 }}>
                      {activeOrg.type[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:15, color:activeOrg.text }}>{activeOrg.name}</div>
                      <div style={{ fontSize:12, color:activeOrg.color }}>{activeOrg.type} · FCA {activeOrg.fca} · {activeOrg.tier} tier</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <span style={{ fontSize:12, color:activeOrg.color }}>Agreement: <strong>{activeOrg.agreementRef}</strong></span>
                    <button onClick={()=>setSelectedOrg(null)} style={{ background:"transparent", border:"none", cursor:"pointer", color:activeOrg.color, fontSize:18, lineHeight:1, padding:4 }}>×</button>
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
                  {/* Col 1: Stats + proc fee */}
                  <div style={{ padding:20, borderRight:`1px solid ${activeOrg.border}` }}>
                    <div style={{ fontSize:12, fontWeight:700, color:activeOrg.text, textTransform:"uppercase", letterSpacing:0.4, marginBottom:14 }}>Relationship</div>
                    {[
                      ["Member since",  activeOrg.joined],
                      ["Renewal",       activeOrg.renewalDate],
                      ["Cases routed",  `${activeOrg.casesRouted} (MTD)`],
                      ["Vol routed",    fmtVol(activeOrg.volRouted)+" (MTD)"],
                      ["Base proc fee", activeOrg.procFeeBase],
                      ["Bonus / fee",   activeOrg.procFeeBonus],
                    ].map(([l,v]) => (
                      <div key={l} style={{ marginBottom:10 }}>
                        <div style={{ fontSize:10, color:activeOrg.color, textTransform:"uppercase", letterSpacing:0.4, opacity:0.7, marginBottom:2 }}>{l}</div>
                        <div style={{ fontSize:13, fontWeight:600, color:activeOrg.text }}>{v}</div>
                      </div>
                    ))}
                    {activeOrg.specialisms && (
                      <>
                        <div style={{ fontSize:10, color:activeOrg.color, textTransform:"uppercase", letterSpacing:0.4, opacity:0.7, marginBottom:6, marginTop:4 }}>Specialisms</div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {activeOrg.specialisms.map(s=>(
                            <span key={s} style={{ background:activeOrg.color, color:"#fff", fontSize:10, fontWeight:600, padding:"3px 8px", borderRadius:20 }}>{s}</span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Col 2: Panel */}
                  <div style={{ padding:20, borderRight:`1px solid ${activeOrg.border}` }}>
                    <div style={{ fontSize:12, fontWeight:700, color:activeOrg.text, textTransform:"uppercase", letterSpacing:0.4, marginBottom:14 }}>
                      Lender Panel ({activeOrg.panel.length})
                    </div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                      {activeOrg.panel.map(l=>(
                        <span key={l} style={{ background:"rgba(255,255,255,0.7)", color:activeOrg.text, fontSize:11, fontWeight:500, padding:"4px 10px", borderRadius:6, border:`1px solid ${activeOrg.border}` }}>{l}</span>
                      ))}
                    </div>
                    <div style={{ marginTop:16, padding:12, background:"rgba(255,255,255,0.5)", borderRadius:8, fontSize:12, color:activeOrg.color, lineHeight:1.6 }}>
                      <strong>How cases are routed:</strong> {activeOrg.note}
                    </div>
                  </div>

                  {/* Col 3: Contact + compliance */}
                  <div style={{ padding:20 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:activeOrg.text, textTransform:"uppercase", letterSpacing:0.4, marginBottom:14 }}>Key Contact</div>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                      <div style={{ width:38, height:38, borderRadius:"50%", background:activeOrg.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14, flexShrink:0 }}>
                        {activeOrg.contact.name.split(" ").map(n=>n[0]).join("")}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:activeOrg.text }}>{activeOrg.contact.name}</div>
                        <div style={{ fontSize:11, color:activeOrg.color, opacity:0.8 }}>{activeOrg.contact.role}</div>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:activeOrg.text, marginBottom:6 }}>{activeOrg.contact.email}</div>
                    <div style={{ fontSize:12, color:activeOrg.text, marginBottom:16 }}>{activeOrg.contact.phone}</div>
                    <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                      <Btn ghost small>Message</Btn>
                      <Btn primary small>Request Support</Btn>
                    </div>
                    <div style={{ fontSize:12, fontWeight:700, color:activeOrg.text, textTransform:"uppercase", letterSpacing:0.4, marginBottom:10 }}>Compliance</div>
                    <div style={{ fontSize:12, color:activeOrg.color, marginBottom:4 }}>Status: <strong>{activeOrg.compliance.status}</strong></div>
                    {activeOrg.compliance.lastReview !== "—" && (
                      <>
                        <div style={{ fontSize:12, color:activeOrg.color, marginBottom:4 }}>Last review: {activeOrg.compliance.lastReview}</div>
                        <div style={{ fontSize:12, color:activeOrg.color, marginBottom:8 }}>Next review: {activeOrg.compliance.nextReview}</div>
                      </>
                    )}
                    <div style={{ fontSize:11, color:activeOrg.color, opacity:0.75, lineHeight:1.5 }}>{activeOrg.compliance.notes}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign:"center", padding:"28px 20px", background:T.bg, borderRadius:12, border:`1px dashed ${T.border}` }}>
                <div style={{ fontSize:13, color:T.textMuted }}>Click any node in the graph above to view relationship details.</div>
              </div>
            )}
          </div>
        )}

        {/* ══════════ SETTINGS ══════════ */}
        {tab === "Settings" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:T.navy, marginBottom:4 }}>Default Application Limits</div>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:24, lineHeight:1.6 }}>Applied to new team members on invitation. Override per individual in the My Team tab.</div>
              <Input label="Monthly case limit"       value="10"        onChange={()=>{}} placeholder="e.g. 10"      hint="Leave blank for no limit" />
              <Input label="Monthly volume limit"     value="3,000,000" onChange={()=>{}} placeholder="e.g. 3000000" hint="Max £ volume per calendar month" prefix="£" />
              <Input label="Quarterly case limit"     value="25"        onChange={()=>{}} placeholder="e.g. 25"      hint="Leave blank for no limit" />
              <Input label="Quarterly volume limit"   value="8,000,000" onChange={()=>{}} placeholder="e.g. 8000000" hint="Max £ volume per quarter" prefix="£" />
              <Btn primary>Save Default Limits</Btn>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:T.navy, marginBottom:4 }}>Firm Settings</div>
              <div style={{ fontSize:12, color:T.textMuted, marginBottom:24 }}>Platform-wide configuration for {FIRM.trading}.</div>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { key:"mfaRequired",      label:"Require MFA for all team members",          sub:"New members must enable 2FA before platform access." },
                  { key:"principalSignoff", label:"Require principal sign-off on submissions",  sub:"Applications need approval before lender submission." },
                  { key:"limitAlerts",      label:"Limit threshold alerts (70%)",               sub:"Notify admin when a member reaches 70% of their limit." },
                ].map(({ key, label, sub }) => (
                  <div key={key} style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:16, borderRadius:10, border:`1px solid ${T.border}`, background:T.card }}>
                    <div style={{ flex:1, paddingRight:16 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:T.text }}>{label}</div>
                      <div style={{ fontSize:12, color:T.textMuted, marginTop:3 }}>{sub}</div>
                    </div>
                    <Toggle on={settings[key]} onToggle={()=>setSettings(s=>({...s,[key]:!s[key]}))} />
                  </div>
                ))}
                <div style={{ padding:16, borderRadius:10, border:`1px solid ${T.border}`, background:T.card }}>
                  <div style={{ fontSize:13, fontWeight:600, color:T.text, marginBottom:4 }}>Permitted product types</div>
                  <div style={{ fontSize:12, color:T.textMuted, marginBottom:14 }}>Restrict which products advisers can submit for.</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                    {PRODUCT_TYPES.map(pt => {
                      const on = enabledProducts.includes(pt);
                      return (
                        <div key={pt} onClick={()=>setEnabledProducts(p=>p.includes(pt)?p.filter(x=>x!==pt):[...p,pt])}
                          style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:7, cursor:"pointer", background:on?T.primaryLight:T.bg, border:`1px solid ${on?T.primary:T.border}` }}>
                          <div style={{ width:14, height:14, borderRadius:3, border:`2px solid ${on?T.primary:T.border}`, background:on?T.primary:"transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
                            {on&&<div style={{ color:"#fff", fontSize:10, fontWeight:700, lineHeight:1 }}>✓</div>}
                          </div>
                          <span style={{ fontSize:12, fontWeight:500, color:on?T.primary:T.textMuted }}>{pt}</span>
                        </div>
                      );
                    })}
                  </div>
                  <Btn primary small>Save Restrictions</Btn>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          ADD / EDIT MODAL
      ══════════════════════════════════════ */}
      {showModal && (
        <div onClick={closeModal} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:T.card, borderRadius:16, padding:32, width:"100%", maxWidth:540, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 64px rgba(0,0,0,0.24)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h2 style={{ margin:0, fontSize:17, fontWeight:800, color:T.navy }}>{editing?"Edit Team Member":"Add Team Member"}</h2>
              <span onClick={closeModal} style={{ cursor:"pointer", color:T.textMuted, display:"flex" }}>{Ico.x(20)}</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Input label="Full name"     value={form.name}  onChange={v=>setForm(f=>({...f,name:v}))}  placeholder="e.g. Jane Smith"   required />
              <Input label="Email address" value={form.email} onChange={v=>setForm(f=>({...f,email:v}))} placeholder="jane@firm.co.uk"   required />
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              <Select label="Role" value={form.role} onChange={v=>setForm(f=>({...f,role:v}))} options={MEMBER_ROLES} />
              <Input  label="FCA qualification" value={form.fcaAuth} onChange={v=>setForm(f=>({...f,fcaAuth:v}))} placeholder="e.g. CeMAP Level 3" />
            </div>
            <Input label="FCA register number (if applicable)" value={form.fca} onChange={v=>setForm(f=>({...f,fca:v}))} placeholder="e.g. 234567" hint="Leave blank for admin and para planner roles" />
            <div style={{ background:T.bg, borderRadius:10, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, color:T.navy, marginBottom:12 }}>Application Limits</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <Input label="Monthly case limit"        value={form.caseLimit}   onChange={v=>setForm(f=>({...f,caseLimit:v}))}   placeholder="e.g. 10"   hint="Leave blank for no limit" type="number" />
                <Input label="Monthly volume (£000s)"    value={form.volumeLimit} onChange={v=>setForm(f=>({...f,volumeLimit:v}))} placeholder="e.g. 3000" hint="Enter thousands — 3000 = £3M" type="number" />
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:28 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <Toggle on={form.mfa} onToggle={()=>setForm(f=>({...f,mfa:!f.mfa}))} />
                <span style={{ fontSize:13, color:T.text }}>Require MFA for this member</span>
              </div>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 14px", borderRadius:9, border:`1px solid ${form.canViewAllCases?T.primary:T.border}`, background:form.canViewAllCases?T.primaryLight:T.bg }}>
                <Toggle on={form.canViewAllCases} onToggle={()=>setForm(f=>({...f,canViewAllCases:!f.canViewAllCases}))} />
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:form.canViewAllCases?T.primary:T.text }}>Can view all team cases</div>
                  <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>When enabled, this member can see every case submitted by the whole team, not just their own.</div>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
              <Btn ghost onClick={closeModal}>Cancel</Btn>
              <Btn primary onClick={handleSave} disabled={!form.name||!form.email}>{editing?"Save Changes":"Send Invitation"}</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════
          CONFIRM SUSPEND / REINSTATE
      ══════════════════════════════════════ */}
      {confirmSuspend && (
        <div onClick={()=>setConfirmSuspend(null)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:T.card, borderRadius:16, padding:32, maxWidth:420, width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.24)" }}>
            <div style={{ textAlign:"center", marginBottom:24 }}>
              <div style={{ width:52, height:52, borderRadius:"50%", margin:"0 auto 16px", background:confirmSuspend.status==="Suspended"?T.successBg:T.dangerBg, display:"flex", alignItems:"center", justifyContent:"center", color:confirmSuspend.status==="Suspended"?T.success:T.danger }}>
                {confirmSuspend.status==="Suspended"?Ico.check(24):Ico.alert(24)}
              </div>
              <h3 style={{ margin:"0 0 10px", fontSize:16, fontWeight:700, color:T.navy }}>
                {confirmSuspend.status==="Suspended"?"Reinstate":"Suspend"} {confirmSuspend.name}?
              </h3>
              <p style={{ margin:0, fontSize:13, color:T.textMuted, lineHeight:1.6 }}>
                {confirmSuspend.status==="Suspended"
                  ?"This will restore the adviser's access to submit new applications."
                  :"This immediately blocks the adviser from submitting new applications. Existing cases are not affected."}
              </p>
            </div>
            <div style={{ display:"flex", gap:12, justifyContent:"center" }}>
              <Btn ghost onClick={()=>setConfirmSuspend(null)}>Cancel</Btn>
              {confirmSuspend.status==="Suspended"
                ? <Btn primary onClick={()=>toggleSuspend(confirmSuspend)}>Reinstate Access</Btn>
                : <button onClick={()=>toggleSuspend(confirmSuspend)} style={{ padding:"9px 20px", borderRadius:9, fontSize:13, fontWeight:600, cursor:"pointer", background:T.danger, color:"#fff", border:"none", fontFamily:T.font }}>Suspend Access</button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
