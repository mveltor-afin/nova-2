import { T } from '../shared/tokens';

export const ACCOUNT_STATES = ["Active","Active in Arrears","Locked","Terminated","Closed (Paid off)","Closed (Written off)"];

export const MOCK_SVC_ACCOUNTS = [
  { id:"M-001234", name:"James & Sarah Mitchell", product:"Afin Fix 2yr 75%", balance:"£285,432", payment:"£1,450", rate:"3.99%", term:"22 yrs", state:"Active",           nextPayment:"01 May 2026", ltv:"72%", rateEnd:"15 Jun 2026",  arrears:null,   vuln:false, aiRisk:"low",  originRef:"AFN-2026-00142", squad:{ adviser:"ADV-01", underwriter:"UW-01", ops:"OPS-01" } },
  { id:"M-001891", name:"Priya Sharma",           product:"Afin Track SVR",   balance:"£198,750", payment:"£1,180", rate:"7.99%", term:"18 yrs", state:"Active in Arrears",nextPayment:"OVERDUE",     ltv:"68%", rateEnd:"SVR",           arrears:"£2,360",vuln:true, aiRisk:"high", originRef:"AFN-2026-00139", squad:{ adviser:"ADV-02", underwriter:"UW-03", ops:"OPS-02" } },
  { id:"M-002456", name:"David Chen",             product:"Afin Fix 5yr 90%", balance:"£412,000", payment:"£2,100", rate:"5.29%", term:"24 yrs", state:"Active",           nextPayment:"05 May 2026", ltv:"88%", rateEnd:"10 Mar 2029",  arrears:null,   vuln:false, aiRisk:"low",  originRef:"AFN-2026-00135", squad:{ adviser:"ADV-03", underwriter:"UW-02", ops:"OPS-02" } },
  { id:"M-002891", name:"Emma Wilson",            product:"Afin Fix 2yr 75%", balance:"£156,200", payment:"£980",   rate:"4.49%", term:"14 yrs", state:"Active",           nextPayment:"15 May 2026", ltv:"58%", rateEnd:"20 Aug 2026",  arrears:null,   vuln:false, aiRisk:"medium", originationRef:"AFN-2026-00128", originRef:"AFN-2026-00128", squad:{ adviser:"ADV-01", underwriter:"UW-01", ops:"OPS-01" } },
  { id:"M-003124", name:"Robert Hughes",          product:"Afin Track SVR",   balance:"£89,400",  payment:"—",      rate:"7.99%", term:"8 yrs",  state:"Locked",           nextPayment:"SUSPENDED",   ltv:"45%", rateEnd:"SVR",           arrears:"£1,800",vuln:false,aiRisk:"high", originRef:"AFN-2026-00119", squad:{ adviser:"ADV-02", underwriter:"UW-02", ops:"OPS-01" } },
  { id:"M-003567", name:"Aisha Patel",            product:"Afin Fix 5yr 75%", balance:"£498,100", payment:"£2,450", rate:"4.89%", term:"23 yrs", state:"Active",           nextPayment:"28 Apr 2026", ltv:"76%", rateEnd:"15 Nov 2028",  arrears:null,   vuln:false, aiRisk:"low",  originRef:"AFN-2026-00125", squad:{ adviser:"ADV-03", underwriter:"UW-02", ops:"OPS-03" } },
  { id:"M-003890", name:"Sophie Brown",           product:"Afin Fix 2yr 90%", balance:"£310,500", payment:"£1,720", rate:"5.29%", term:"28 yrs", state:"Active in Arrears",nextPayment:"OVERDUE",     ltv:"89%", rateEnd:"01 Dec 2026",  arrears:"£5,160",vuln:true, aiRisk:"high", originRef:"AFN-2026-00115", squad:{ adviser:"ADV-01", underwriter:"UW-03", ops:"OPS-03" } },
];

export const MOCK_SVC_PAYMENTS = [
  { date:"01 Apr 2026", type:"Standard DD",    amount:"£1,450", status:"Collected",  ref:"DD-9842" },
  { date:"01 Mar 2026", type:"Standard DD",    amount:"£1,450", status:"Collected",  ref:"DD-9714" },
  { date:"01 Feb 2026", type:"Overpayment",    amount:"£2,950", status:"Collected",  ref:"OP-1123" },
  { date:"01 Jan 2026", type:"Standard DD",    amount:"£1,450", status:"Collected",  ref:"DD-9601" },
  { date:"01 Dec 2025", type:"Standard DD",    amount:"£1,450", status:"Failed",     ref:"DD-9502" },
  { date:"06 Dec 2025", type:"Retry",          amount:"£1,450", status:"Collected",  ref:"RT-0045" },
];

export const MOCK_SVC_TIMELINE = [
  { ts:"06 Apr 2026, 09:12", actor:"System",        cat:"Payment",    text:"DD collected £1,450 — reference DD-9842" },
  { ts:"28 Mar 2026, 14:30", actor:"Emma Chen",     cat:"Servicing",  text:"Rate end reminder sent — fix expires 15 Jun 2026" },
  { ts:"15 Mar 2026, 11:00", actor:"System",        cat:"AI Alert",   text:"AI: No payment risk indicators detected for April" },
  { ts:"01 Mar 2026, 09:05", actor:"System",        cat:"Payment",    text:"DD collected £1,450 — reference DD-9714" },
  { ts:"14 Feb 2026, 10:15", actor:"Amir Hassan",   cat:"Servicing",  text:"Overpayment applied to principal — term reduced 2 months" },
  { ts:"01 Feb 2026, 09:05", actor:"System",        cat:"Payment",    text:"Overpayment £2,950 collected — reference OP-1123" },
];

export const MOCK_VULN_ALERTS = [
  { id:"VA-001", account:"M-001891", name:"Priya Sharma",  trigger:"Email: 'I don't know how I'll cope'", score:87, flag:"Distress language + 3 support calls this week",    status:"Open",     assigned:"Rebecca Lewis" },
  { id:"VA-002", account:"M-003890", name:"Sophie Brown",  trigger:"Searched 'bereavement mortgage'",     score:74, flag:"Life event detected + payment reduction pattern",   status:"Open",     assigned:"Unassigned"   },
  { id:"VA-003", account:"M-002891", name:"Emma Wilson",   trigger:"Sentiment declining over 3 contacts", score:51, flag:"Possible financial difficulty — monitor",           status:"Monitoring",assigned:"Tom Walker"   },
];

export const MOCK_RATE_SWITCH_PRODUCTS = [
  { name:"Afin Fix 2yr",  rate:"4.29%", monthly:"£1,545", erc:"2%/1%",    saving:"£0",   rec:true,  reason:"2yr fix — flexibility to move" },
  { name:"Afin Fix 5yr",  rate:"4.49%", monthly:"£1,580", erc:"5/4/3/2/1%",saving:"-£135/mo",rec:false,reason:"Best long-term security"        },
  { name:"Afin Tracker",  rate:"4.15%", monthly:"£1,520", erc:"None",     saving:"+£70/mo",rec:false,reason:"Lowest now — rate risk"          },
  { name:"SVR (default)", rate:"7.99%", monthly:"£2,180", erc:"None",     saving:"-£730/mo",rec:false,reason:"Do not select — revert if no action" },
];

export const SVC_MODULES = [
  { id:"lifecycle",    label:"Loan Lifecycle",        icon:"loans",     priority:"P2", effort:"1w"   },
  { id:"payments",     label:"Payment Management",    icon:"dollar",    priority:"P0", effort:"2w"   },
  { id:"arrears",      label:"Arrears Management",    icon:"alert",     priority:"P1", effort:"1w"   },
  { id:"holidays",     label:"Payment Holidays",      icon:"clock",     priority:"P1", effort:"1w"   },
  { id:"reschedule",   label:"Loan Rescheduling",     icon:"chart",     priority:"P0", effort:"2w"   },
  { id:"refinance",    label:"Refinance / Further Advance", icon:"plus", priority:"P1", effort:"2w"  },
  { id:"ratechange",   label:"Interest Rate Changes", icon:"zap",       priority:"P1", effort:"1w"   },
  { id:"fees",         label:"Fees & Penalties",      icon:"wallet",    priority:"P2", effort:"1.5w" },
  { id:"offset",       label:"Offset & Credit",       icon:"assign",    priority:"P2", effort:"2w"   },
  { id:"rateswitch",   label:"Rate Switch",           icon:"arrow",     priority:"P0", effort:"2.5w" },
  { id:"redemption",   label:"Redemption",            icon:"shield",    priority:"P1", effort:"2w"   },
  { id:"termination",  label:"Termination",           icon:"x",         priority:"P1", effort:"1w"   },
  { id:"writeoff",     label:"Write-off",             icon:"file",      priority:"P2", effort:"1w"   },
  { id:"txadj",        label:"Transaction Adjustments",icon:"sparkle",  priority:"P0", effort:"3w"   },
  { id:"closure",      label:"Account Closure",       icon:"lock",      priority:"P2", effort:"1w"   },
  { id:"history",      label:"Customer History",      icon:"clock",     priority:"P2", effort:"1w"   },
  { id:"vulnerability",label:"Vulnerability Detection",icon:"eye",      priority:"P0", effort:"1.5w" },
];

export const PRIORITY_COLOR = { P0: T.danger, P1: T.warning, P2: T.accent };
