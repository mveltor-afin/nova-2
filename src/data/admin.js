import { T } from '../shared/tokens';

export const MOCK_USERS = [
  { id:"U001", name:"Sarah Chen",      email:"s.chen@afinbank.com",     role:"Admin",       team:"Operations",  status:"Active",    last:"2m ago",   mfa:true  },
  { id:"U002", name:"James Mitchell",  email:"j.mitchell@afinbank.com", role:"Underwriter", team:"Credit Risk", status:"Active",    last:"1h ago",   mfa:true  },
  { id:"U003", name:"Priya Patel",     email:"p.patel@afinbank.com",    role:"Finance",     team:"Treasury",    status:"Active",    last:"3h ago",   mfa:true  },
  { id:"U004", name:"Tom Walker",      email:"t.walker@afinbank.com",   role:"Ops",         team:"Operations",  status:"Active",    last:"Yesterday",mfa:false },
  { id:"U005", name:"John Watson",     email:"j.watson@brokers.com",    role:"Broker",      team:"External",    status:"Active",    last:"5m ago",   mfa:true  },
  { id:"U006", name:"Emma Roberts",    email:"e.roberts@brokers.com",   role:"Broker",      team:"External",    status:"Suspended", last:"8d ago",   mfa:false },
  { id:"U007", name:"Amir Hassan",     email:"a.hassan@afinbank.com",   role:"Underwriter", team:"Credit Risk", status:"Active",    last:"30m ago",  mfa:true  },
  { id:"U008", name:"Lucy Fernández",  email:"l.fernandez@afinbank.com",role:"Ops",         team:"Compliance",  status:"Active",    last:"2h ago",   mfa:true  },
];

export const MOCK_ROLES = [
  { id:"R01", name:"Admin",       users:2,   desc:"Full platform access — user management, config, reporting.", color:T.danger  },
  { id:"R02", name:"Underwriter", users:5,   desc:"View & process loan applications, DIP, credit decisions.",  color:T.primary },
  { id:"R03", name:"Finance",     users:3,   desc:"Disbursements, payment runs, treasury views.",               color:T.warning },
  { id:"R04", name:"Ops",        users:8,   desc:"Document review, KYC, general casework.",                   color:T.accent  },
  { id:"R05", name:"Broker",      users:142, desc:"External portal — submit applications, view own pipeline.", color:"#8B5CF6" },
  { id:"R06", name:"Read Only",   users:4,   desc:"View-only access across the entire platform.",              color:T.textMuted },
];

export const MOCK_TEAM = [
  { id:"T1", name:"Afin Bank",       role:"Organisation",       parent:null, head:"Sarah Chen",     members:24 },
  { id:"T2", name:"Credit Risk",     role:"Division",           parent:"T1", head:"James Mitchell", members:6  },
  { id:"T3", name:"Operations",      role:"Division",           parent:"T1", head:"Tom Walker",     members:8  },
  { id:"T4", name:"Treasury",        role:"Division",           parent:"T1", head:"Priya Patel",    members:3  },
  { id:"T5", name:"Compliance",      role:"Division",           parent:"T1", head:"Lucy Fernández", members:4  },
  { id:"T6", name:"Senior UW Team",  role:"Team",               parent:"T2", head:"Amir Hassan",   members:3  },
  { id:"T7", name:"Junior UW Team",  role:"Team",               parent:"T2", head:"—",             members:3  },
  { id:"T8", name:"KYC Team",        role:"Team",               parent:"T3", head:"—",             members:4  },
];

export const MOCK_MANDATES = [
  { id:"M001", name:"Max Single Exposure",    scope:"Per Borrower",   limit:"£2,000,000", current:"£890,000",  approver:"Admin + Credit Risk Head", status:"Active",  updated:"01 Apr 2026" },
  { id:"M002", name:"Max LTV — Residential", scope:"Product Level",  limit:"90%",         current:"88%",       approver:"Underwriter L2",           status:"Active",  updated:"15 Mar 2026" },
  { id:"M003", name:"Max LTV — BTL",         scope:"Product Level",  limit:"75%",         current:"72%",       approver:"Underwriter L2",           status:"Active",  updated:"15 Mar 2026" },
  { id:"M004", name:"Referral Threshold",    scope:"Application",    limit:"£750,000",    current:"—",         approver:"Senior Underwriter",        status:"Active",  updated:"10 Mar 2026" },
  { id:"M005", name:"Bulk Disbursement Cap", scope:"Daily Batch",    limit:"£5,000,000",  current:"£1.2M",     approver:"Finance Director",         status:"Active",  updated:"28 Feb 2026" },
  { id:"M006", name:"Holiday Let Max LTV",   scope:"Product Level",  limit:"65%",         current:"—",         approver:"Credit Risk Head",         status:"Draft",   updated:"05 Apr 2026" },
];

export const MOCK_SESSIONS = [
  { id:"S001", user:"Sarah Chen",     role:"Admin",       device:"Chrome / macOS",       ip:"192.168.1.10", location:"London, UK",    started:"Today 08:42", idle:"2m",  current:true  },
  { id:"S002", user:"James Mitchell", role:"Underwriter", device:"Firefox / Windows 11", ip:"10.0.0.44",    location:"Manchester, UK", started:"Today 09:01", idle:"18m", current:false },
  { id:"S003", user:"Priya Patel",    role:"Finance",     device:"Safari / macOS",       ip:"10.0.0.61",    location:"London, UK",    started:"Today 07:55", idle:"5m",  current:false },
  { id:"S004", user:"John Watson",    role:"Broker",      device:"Chrome / iOS",         ip:"82.45.12.200", location:"Bristol, UK",   started:"Today 10:15", idle:"1m",  current:false },
  { id:"S005", user:"Amir Hassan",    role:"Underwriter", device:"Edge / Windows 11",    ip:"10.0.0.53",    location:"London, UK",    started:"Today 09:30", idle:"32m", current:false },
  { id:"S006", user:"Emma Roberts",   role:"Broker",      device:"Chrome / Android",     ip:"91.200.14.5",  location:"Unknown",       started:"8 days ago",  idle:"—",   current:false, suspended:true },
];

export const MOCK_FEATURES = [
  { id:"FF01", name:"AI Document Parsing",      desc:"GPT-4o powered extraction from uploaded PDFs.",        env:"Production", enabled:true,  rollout:100, owner:"Platform" },
  { id:"FF02", name:"Nova AI Chatbot",          desc:"Broker-facing assistant for eligibility queries.",      env:"Production", enabled:true,  rollout:100, owner:"Product"  },
  { id:"FF03", name:"DIP Automated Approval",   desc:"Auto-approve DIPs below £250k at ≤75% LTV.",          env:"Production", enabled:false, rollout:0,   owner:"Credit"   },
  { id:"FF04", name:"Bulk Upload (CSV)",         desc:"Batch broker case import via CSV.",                    env:"Staging",    enabled:true,  rollout:25,  owner:"Ops"      },
  { id:"FF05", name:"Open Banking Integration", desc:"Real-time income verification via open banking.",       env:"Staging",    enabled:true,  rollout:50,  owner:"Credit"   },
  { id:"FF06", name:"E-Signature (Docusign)",   desc:"Send offer letters for digital signature.",            env:"Staging",    enabled:false, rollout:0,   owner:"Ops"      },
  { id:"FF07", name:"Multi-Currency Loans",     desc:"Support for EUR and USD denominated products.",        env:"Development",enabled:false, rollout:0,   owner:"Product"  },
  { id:"FF08", name:"Broker Referral Portal",   desc:"Refer a broker — commission tracking dashboard.",      env:"Development",enabled:false, rollout:0,   owner:"Sales"    },
];

export const MOCK_AUDIT = [
  { id:"A001", ts:"06 Apr 2026, 10:14", actor:"Sarah Chen",     role:"Admin",       action:"User Suspended",      target:"Emma Roberts (U006)",       ip:"192.168.1.10", cat:"User Mgmt"    },
  { id:"A002", ts:"06 Apr 2026, 09:55", actor:"James Mitchell", role:"Underwriter", action:"Status Changed",      target:"AFN-2026-00142 → Underwriting",ip:"10.0.0.44",  cat:"Loan"        },
  { id:"A003", ts:"06 Apr 2026, 09:32", actor:"System",         role:"System",      action:"OTP Sent",            target:"j.watson@brokers.com",      ip:"—",            cat:"Auth"         },
  { id:"A004", ts:"06 Apr 2026, 09:31", actor:"John Watson",    role:"Broker",      action:"Login",               target:"Session S004",              ip:"82.45.12.200", cat:"Auth"         },
  { id:"A005", ts:"06 Apr 2026, 09:15", actor:"Priya Patel",    role:"Finance",     action:"Disbursement Queued", target:"AFN-2026-00128 — £290,000", ip:"10.0.0.61",    cat:"Finance"      },
  { id:"A006", ts:"06 Apr 2026, 08:50", actor:"Amir Hassan",    role:"Underwriter", action:"DIP Executed",        target:"AFN-2026-00135 — Declined", ip:"10.0.0.53",    cat:"Loan"         },
  { id:"A007", ts:"06 Apr 2026, 08:42", actor:"Sarah Chen",     role:"Admin",       action:"Login (SSO)",         target:"Session S001",              ip:"192.168.1.10", cat:"Auth"         },
  { id:"A008", ts:"05 Apr 2026, 17:30", actor:"Sarah Chen",     role:"Admin",       action:"Feature Flag Toggled",target:"FF03 DIP Automated Approval → OFF",ip:"192.168.1.10",cat:"Config" },
  { id:"A009", ts:"05 Apr 2026, 16:10", actor:"Tom Walker",     role:"Ops",         action:"Document Verified",   target:"AFN-2026-00139 — Bank Statement",ip:"10.0.0.77",cat:"Loan"     },
  { id:"A010", ts:"05 Apr 2026, 14:45", actor:"Sarah Chen",     role:"Admin",       action:"Role Assigned",       target:"Amir Hassan → Underwriter", ip:"192.168.1.10", cat:"User Mgmt"    },
  { id:"A011", ts:"05 Apr 2026, 11:00", actor:"System",         role:"System",      action:"Session Expired",     target:"Session S006 (Emma Roberts)",ip:"—",            cat:"Auth"         },
  { id:"A012", ts:"04 Apr 2026, 15:20", actor:"James Mitchell", role:"Underwriter", action:"Offer Issued",        target:"AFN-2026-00125 — £510,000", ip:"10.0.0.44",    cat:"Loan"         },
];
