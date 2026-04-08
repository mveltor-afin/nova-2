// ─────────────────────────────────────────────
// NOVA 2.0 — CUSTOMER & PRODUCT DATA
// Customers are the center of everything
// ─────────────────────────────────────────────

export const CUSTOMERS = [
  { id:"CUS-001", name:"Emma Wilson", dob:"12/04/1988", email:"emma.wilson@gmail.com", phone:"+44 7700 900123",
    address:"22 Maple Road, Bristol BS2 8NQ", since:"Mar 2020", segment:"Premier", kyc:"Verified", kycExpiry:"Mar 2027",
    risk:"Low", riskScore:14, vuln:false, nps:9, ltv:"£18,400",
    products:["MTG-001","SAV-001","SAV-002"], pendingProducts:[], gamification:{ streak:24, tier:"Gold", points:4820, badges:["First Home","2yr Streak","Saver"] }},
  { id:"CUS-002", name:"James & Sarah Mitchell", dob:"15/03/1984", email:"j.mitchell@outlook.com", phone:"+44 7700 900456",
    address:"14 Oak Lane, Bristol BS1 4NZ", since:"Feb 2024", segment:"Standard", kyc:"Verified", kycExpiry:"Feb 2027",
    risk:"Low", riskScore:18, vuln:false, nps:8, ltv:"£6,200",
    products:["MTG-002","SAV-003"], pendingProducts:["INS-001"], gamification:{ streak:14, tier:"Silver", points:2140, badges:["First Home"] }},
  { id:"CUS-003", name:"Priya Sharma", dob:"22/09/1991", email:"priya.sharma@hotmail.com", phone:"+44 7700 900789",
    address:"8 Cedar Close, Manchester M1 3FG", since:"Jun 2022", segment:"Standard", kyc:"Verified", kycExpiry:"Jun 2025",
    risk:"High", riskScore:78, vuln:true, nps:4, ltv:"£7,800",
    products:["MTG-003"], pendingProducts:[], gamification:{ streak:0, tier:"Bronze", points:380, badges:[] }},
  { id:"CUS-004", name:"David Chen", dob:"03/11/1979", email:"d.chen@gmail.com", phone:"+44 7700 900321",
    address:"45 Birch Avenue, London SE15 4TH", since:"Jan 2023", segment:"Premier", kyc:"Verified", kycExpiry:"Jan 2026",
    risk:"Low", riskScore:12, vuln:false, nps:10, ltv:"£14,100",
    products:["MTG-004","SAV-004","SAV-005","CA-001"], pendingProducts:["SO-001"], gamification:{ streak:36, tier:"Platinum", points:8900, badges:["First Home","3yr Streak","Saver","Referrer"] }},
  { id:"CUS-005", name:"Aisha Patel", dob:"17/06/1986", email:"aisha.p@yahoo.com", phone:"+44 7700 900654",
    address:"31 Elm Street, Birmingham B1 2NN", since:"Nov 2021", segment:"Standard", kyc:"Verified", kycExpiry:"Nov 2026",
    risk:"Low", riskScore:22, vuln:false, nps:7, ltv:"£9,300",
    products:["MTG-005","SAV-006","INS-002"], pendingProducts:[], gamification:{ streak:18, tier:"Gold", points:3600, badges:["First Home","Saver","Insured"] }},
  { id:"CUS-006", name:"Robert Hughes", dob:"28/02/1975", email:"r.hughes@btinternet.com", phone:"+44 7700 900987",
    address:"7 Pine Court, Leeds LS1 5AB", since:"Aug 2023", segment:"At Risk", kyc:"Expired", kycExpiry:"Aug 2025",
    risk:"High", riskScore:82, vuln:false, nps:3, ltv:"£1,900",
    products:["MTG-006"], pendingProducts:[], gamification:{ streak:0, tier:"Bronze", points:120, badges:[] }},
  { id:"CUS-007", name:"Tom & Lucy Brennan", dob:"14/08/1990", email:"brennans@gmail.com", phone:"+44 7700 900111",
    address:"9 Willow Gardens, Oxford OX1 2AB", since:"Jan 2026", segment:"New", kyc:"Pending", kycExpiry:null,
    risk:"Medium", riskScore:45, vuln:false, nps:null, ltv:"£0",
    products:[], pendingProducts:["MTG-007","SAV-007"], gamification:{ streak:0, tier:"Bronze", points:0, badges:[] }},
  { id:"CUS-008", name:"Maria Santos", dob:"05/12/1983", email:"maria.santos@proton.me", phone:"+44 7700 900222",
    address:"15 Cherry Walk, Edinburgh EH1 3QR", since:"Sep 2021", segment:"Premier", kyc:"Verified", kycExpiry:"Sep 2026",
    risk:"Low", riskScore:8, vuln:false, nps:10, ltv:"£22,600",
    products:["MTG-008","SAV-008","SAV-009","CA-002","INS-003"], pendingProducts:["SO-002"],
    gamification:{ streak:48, tier:"Platinum", points:12400, badges:["First Home","4yr Streak","Saver","Referrer","Multi-Product","Insured"] }},
];

// All products across all types
export const PRODUCTS = [
  // Mortgages
  { id:"MTG-001", customerId:"CUS-001", type:"Mortgage", product:"Afin Fix 2yr 75%", status:"Active", balance:"£156,200", rate:"4.49%", payment:"£980", nextPayment:"15 May 2026", rateEnd:"20 Aug 2026", ltv:"58%", origRef:"AFN-2026-00128", term:"14 yrs" },
  { id:"MTG-002", customerId:"CUS-002", type:"Mortgage", product:"Afin Fix 2yr 75%", status:"Active", balance:"£285,432", rate:"3.99%", payment:"£1,450", nextPayment:"01 May 2026", rateEnd:"15 Jun 2026", ltv:"72%", origRef:"AFN-2026-00142", term:"22 yrs" },
  { id:"MTG-003", customerId:"CUS-003", type:"Mortgage", product:"Afin Track SVR", status:"Active in Arrears", balance:"£198,750", rate:"7.99%", payment:"£1,180", nextPayment:"OVERDUE", rateEnd:"SVR", ltv:"68%", origRef:"AFN-2025-00891", term:"18 yrs", arrears:"£2,360" },
  { id:"MTG-004", customerId:"CUS-004", type:"Mortgage", product:"Afin Fix 5yr 90%", status:"Active", balance:"£412,000", rate:"5.29%", payment:"£2,100", nextPayment:"05 May 2026", rateEnd:"10 Mar 2029", ltv:"88%", origRef:"AFN-2024-00512", term:"24 yrs" },
  { id:"MTG-005", customerId:"CUS-005", type:"Mortgage", product:"Afin Fix 5yr 75%", status:"Active", balance:"£498,100", rate:"4.89%", payment:"£2,450", nextPayment:"28 Apr 2026", rateEnd:"15 Nov 2028", ltv:"76%", origRef:"AFN-2023-00334", term:"23 yrs" },
  { id:"MTG-006", customerId:"CUS-006", type:"Mortgage", product:"Afin Track SVR", status:"Locked", balance:"£89,400", rate:"7.99%", payment:"—", nextPayment:"SUSPENDED", rateEnd:"SVR", ltv:"45%", origRef:"AFN-2024-00678", term:"8 yrs", arrears:"£1,800" },
  { id:"MTG-007", customerId:"CUS-007", type:"Mortgage", product:"Afin Fix 2yr 90%", status:"Application", balance:"—", rate:"5.29%", payment:"—", nextPayment:"—", rateEnd:"—", ltv:"88%", origRef:"AFN-2026-00201", term:"30 yrs" },
  { id:"MTG-008", customerId:"CUS-008", type:"Mortgage", product:"Afin Fix 2yr 60%", status:"Active", balance:"£220,000", rate:"4.19%", payment:"£1,280", nextPayment:"10 May 2026", rateEnd:"10 Sep 2027", ltv:"42%", origRef:"AFN-2022-00189", term:"15 yrs" },
  // Savings
  { id:"SAV-001", customerId:"CUS-001", type:"Fixed Term Deposit", product:"2yr Fixed @ 4.85%", status:"Active", balance:"£26,824", rate:"4.85%", principal:"£25,000", maturity:"18 May 2026", daysToMaturity:40, interestEarned:"£1,824" },
  { id:"SAV-002", customerId:"CUS-001", type:"Notice Account", product:"90-Day Notice @ 3.20%", status:"Active", balance:"£10,500", rate:"3.20%", noticePeriod:"90 days" },
  { id:"SAV-003", customerId:"CUS-002", type:"Notice Account", product:"30-Day Notice @ 2.95%", status:"Active", balance:"£8,200", rate:"2.95%", noticePeriod:"30 days" },
  { id:"SAV-004", customerId:"CUS-004", type:"Fixed Term Deposit", product:"1yr Fixed @ 4.50%", status:"Active", balance:"£51,350", rate:"4.50%", principal:"£50,000", maturity:"01 Oct 2026", daysToMaturity:177, interestEarned:"£1,350" },
  { id:"SAV-005", customerId:"CUS-004", type:"Notice Account", product:"120-Day Notice @ 3.75%", status:"Active", balance:"£15,000", rate:"3.75%", noticePeriod:"120 days" },
  { id:"SAV-006", customerId:"CUS-005", type:"Fixed Term Deposit", product:"3yr Fixed @ 5.10%", status:"Active", balance:"£32,295", rate:"5.10%", principal:"£30,000", maturity:"15 Mar 2027", daysToMaturity:342, interestEarned:"£2,295" },
  { id:"SAV-007", customerId:"CUS-007", type:"Fixed Term Deposit", product:"1yr Fixed @ 4.50%", status:"Pending", balance:"—", rate:"4.50%", principal:"£10,000", maturity:"—", daysToMaturity:null, interestEarned:"—" },
  { id:"SAV-008", customerId:"CUS-008", type:"Fixed Term Deposit", product:"2yr Fixed @ 4.85%", status:"Active", balance:"£42,100", rate:"4.85%", principal:"£40,000", maturity:"15 Sep 2027", daysToMaturity:526, interestEarned:"£2,100" },
  { id:"SAV-009", customerId:"CUS-008", type:"Notice Account", product:"90-Day Notice @ 3.20%", status:"Active", balance:"£18,500", rate:"3.20%", noticePeriod:"90 days" },
  // Current Accounts
  { id:"CA-001", customerId:"CUS-004", type:"Current Account", product:"Afin Everyday", status:"Active", balance:"£4,230", rate:"0.00%", sortCode:"20-45-67", accountNo:"12345678" },
  { id:"CA-002", customerId:"CUS-008", type:"Current Account", product:"Afin Premier Current", status:"Active", balance:"£12,800", rate:"1.50%", sortCode:"20-45-68", accountNo:"87654321" },
  // Insurance
  { id:"INS-001", customerId:"CUS-002", type:"Insurance", product:"Life Cover — £350k", status:"Pending Quote", premium:"—", cover:"£350,000", term:"25 yrs", provider:"Afin Protect" },
  { id:"INS-002", customerId:"CUS-005", type:"Insurance", product:"Buildings & Contents", status:"Active", premium:"£42/mo", cover:"£500,000 buildings, £75,000 contents", term:"Annual", provider:"Afin Protect", renewal:"15 Nov 2026" },
  { id:"INS-003", customerId:"CUS-008", type:"Insurance", product:"Life Cover — £500k", status:"Active", premium:"£38/mo", cover:"£500,000", term:"15 yrs", provider:"Afin Protect", renewal:"10 Sep 2026" },
  // Shared Ownership
  { id:"SO-001", customerId:"CUS-004", type:"Shared Ownership", product:"Shared Ownership 40%", status:"Application", share:"40%", fullValue:"£320,000", ownedValue:"£128,000", rent:"£480/mo", housingAssoc:"Bristol Housing", staircaseHistory:[] },
  { id:"SO-002", customerId:"CUS-008", type:"Shared Ownership", product:"Shared Ownership 50%", status:"Pre-approval", share:"50%", fullValue:"£280,000", ownedValue:"£140,000", rent:"£350/mo", housingAssoc:"Edinburgh HA", staircaseHistory:[] },
];

// Gamification tier definitions
export const TIERS = [
  { name:"Bronze", minPoints:0, color:"#CD7F32", benefits:["Standard processing","Email support"] },
  { name:"Silver", minPoints:1000, color:"#C0C0C0", benefits:["Priority email","Rate match guarantee"] },
  { name:"Gold", minPoints:3000, color:"#FFD700", benefits:["Priority processing","Dedicated handler","Fee waivers"] },
  { name:"Platinum", minPoints:7000, color:"#E5E4E2", benefits:["VIP processing","Named relationship manager","All fees waived","Exclusive rates"] },
];

export const BADGES = [
  { id:"first-home", name:"First Home", icon:"\u{1F3E0}", desc:"Completed first mortgage" },
  { id:"saver", name:"Saver", icon:"\u{1F4B0}", desc:"Opened a savings account" },
  { id:"streak-1yr", name:"1yr Streak", icon:"\u{2B50}", desc:"12 consecutive on-time payments" },
  { id:"streak-2yr", name:"2yr Streak", icon:"\u{1F31F}", desc:"24 consecutive on-time payments" },
  { id:"streak-3yr", name:"3yr Streak", icon:"\u{2728}", desc:"36 consecutive on-time payments" },
  { id:"streak-4yr", name:"4yr Streak", icon:"\u{1F4AB}", desc:"48 consecutive on-time payments" },
  { id:"referrer", name:"Referrer", icon:"\u{1F91D}", desc:"Referred a friend who completed" },
  { id:"multi-product", name:"Multi-Product", icon:"\u{1F4E6}", desc:"Holds 3+ products" },
  { id:"insured", name:"Insured", icon:"\u{1F6E1}\u{FE0F}", desc:"Has active insurance cover" },
];

// Product type colours and icons
export const PRODUCT_TYPES = {
  "Mortgage":           { color:"#1A4A54", icon:"loans",    label:"Mortgage" },
  "Fixed Term Deposit": { color:"#FFBF00", icon:"dollar",   label:"Fixed Term" },
  "Notice Account":     { color:"#31B897", icon:"wallet",   label:"Notice Account" },
  "Current Account":    { color:"#8B5CF6", icon:"products", label:"Current Account" },
  "Insurance":          { color:"#FF6B61", icon:"shield",   label:"Insurance" },
  "Shared Ownership":   { color:"#0EA5E9", icon:"assign",   label:"Shared Ownership" },
};

// AI next-best-actions per customer
export const AI_ACTIONS = {
  "CUS-001": [
    { priority:"High", action:"Fixed deposit SA-001 matures in 40 days. Rate expires on mortgage in 4 months. Schedule single retention call.", impact:"£37k deposit at risk + mortgage retention", type:"retention" },
    { priority:"Medium", action:"Cross-sell: apply matured £25k as mortgage overpayment — saves £8,200 interest, reduces term 14 months.", impact:"£8,200 interest saving", type:"cross-sell" },
    { priority:"Low", action:"No life insurance on file. Mortgage balance £156k — recommend cover.", impact:"£156k exposure", type:"cross-sell" },
  ],
  "CUS-002": [
    { priority:"High", action:"Mortgage rate expires 15 Jun 2026. Current rate 3.99% will revert to SVR 7.99%. Initiate rate switch.", impact:"£730/mo payment increase if no action", type:"retention" },
    { priority:"Medium", action:"Life cover quote pending (INS-001). Follow up — application started but not completed.", impact:"£350k cover gap", type:"follow-up" },
  ],
  "CUS-003": [
    { priority:"Critical", action:"Account in arrears (£2,360). Vulnerability flag active. 3 missed payments. Initiate collections with vulnerability protocol.", impact:"£2,360 arrears + welfare risk", type:"collections" },
    { priority:"High", action:"KYC verification expires Jun 2025 — already expired. Mandatory re-verification required.", impact:"Regulatory non-compliance", type:"compliance" },
  ],
  "CUS-004": [
    { priority:"Medium", action:"Shared ownership application (SO-001) pending. Housing association checks outstanding.", impact:"New product revenue", type:"follow-up" },
    { priority:"Low", action:"LTV at 88% — approaching product boundary. If property value drops 3%, exceeds 90% threshold.", impact:"Product eligibility risk", type:"risk" },
  ],
  "CUS-006": [
    { priority:"Critical", action:"Account locked. £1,800 arrears. KYC expired Aug 2025. No contact in 60 days. Escalate to collections manager.", impact:"£89,400 exposure", type:"collections" },
  ],
  "CUS-007": [
    { priority:"High", action:"New customer — KYC pending. Mortgage and savings applications waiting. Complete onboarding to unlock products.", impact:"2 pending products", type:"onboarding" },
  ],
  "CUS-008": [
    { priority:"Low", action:"Top customer (Platinum, £22.6k LTV). Shared ownership pre-approval in progress. Ensure white-glove experience.", impact:"Highest value relationship", type:"retention" },
  ],
};
