// ─────────────────────────────────────────────
// NOVA 2.0 — CUSTOMER & PRODUCT DATA
// Customers are the center of everything
// ─────────────────────────────────────────────

export const CUSTOMERS = [
  // ── Consumer Customers ──
  { id:"CUS-001", customerType:"consumer", name:"Emma Wilson", dob:"12/04/1988", email:"emma.wilson@gmail.com", phone:"+44 7700 900123",
    address:"22 Maple Road, Bristol BS2 8NQ", since:"Mar 2020", segment:"Premier", kyc:"Verified", kycExpiry:"Mar 2027",
    risk:"Low", riskScore:14, vuln:false, nps:9, ltv:"£18,400",
    products:["MTG-001","SAV-001","SAV-002"], pendingProducts:[], gamification:{ streak:24, tier:"Gold", points:4820, badges:["First Home","2yr Streak","Saver"] }},
  { id:"CUS-002", customerType:"consumer", name:"James & Sarah Mitchell", dob:"15/03/1984", email:"j.mitchell@outlook.com", phone:"+44 7700 900456",
    address:"14 Oak Lane, Bristol BS1 4NZ", since:"Feb 2024", segment:"Standard", kyc:"Verified", kycExpiry:"Feb 2027",
    risk:"Low", riskScore:18, vuln:false, nps:8, ltv:"£6,200",
    products:["MTG-002","SAV-003"], pendingProducts:["INS-001"], gamification:{ streak:14, tier:"Silver", points:2140, badges:["First Home"] }},
  { id:"CUS-003", customerType:"consumer", name:"Priya Sharma", dob:"22/09/1991", email:"priya.sharma@hotmail.com", phone:"+44 7700 900789",
    address:"8 Cedar Close, Manchester M1 3FG", since:"Jun 2022", segment:"Standard", kyc:"Verified", kycExpiry:"Jun 2025",
    risk:"High", riskScore:78, vuln:true, nps:4, ltv:"£7,800",
    products:["MTG-003"], pendingProducts:[], gamification:{ streak:0, tier:"Bronze", points:380, badges:[] }},
  { id:"CUS-004", customerType:"consumer", name:"David Chen", dob:"03/11/1979", email:"d.chen@gmail.com", phone:"+44 7700 900321",
    address:"45 Birch Avenue, London SE15 4TH", since:"Jan 2023", segment:"Premier", kyc:"Verified", kycExpiry:"Jan 2026",
    risk:"Low", riskScore:12, vuln:false, nps:10, ltv:"£14,100",
    products:["MTG-004","SAV-004","SAV-005","CA-001"], pendingProducts:["SO-001"], gamification:{ streak:36, tier:"Platinum", points:8900, badges:["First Home","3yr Streak","Saver","Referrer"] }},
  { id:"CUS-005", customerType:"consumer", name:"Aisha Patel", dob:"17/06/1986", email:"aisha.p@yahoo.com", phone:"+44 7700 900654",
    address:"31 Elm Street, Birmingham B1 2NN", since:"Nov 2021", segment:"Standard", kyc:"Verified", kycExpiry:"Nov 2026",
    risk:"Low", riskScore:22, vuln:false, nps:7, ltv:"£9,300",
    products:["MTG-005","SAV-006","INS-002"], pendingProducts:[], gamification:{ streak:18, tier:"Gold", points:3600, badges:["First Home","Saver","Insured"] }},
  { id:"CUS-006", customerType:"consumer", name:"Robert Hughes", dob:"28/02/1975", email:"r.hughes@btinternet.com", phone:"+44 7700 900987",
    address:"7 Pine Court, Leeds LS1 5AB", since:"Aug 2023", segment:"At Risk", kyc:"Expired", kycExpiry:"Aug 2025",
    risk:"High", riskScore:82, vuln:false, nps:3, ltv:"£1,900",
    products:["MTG-006"], pendingProducts:[], gamification:{ streak:0, tier:"Bronze", points:120, badges:[] }},
  { id:"CUS-007", customerType:"consumer", name:"Tom & Lucy Brennan", dob:"14/08/1990", email:"brennans@gmail.com", phone:"+44 7700 900111",
    address:"9 Willow Gardens, Oxford OX1 2AB", since:"Jan 2026", segment:"New", kyc:"Pending", kycExpiry:null,
    risk:"Medium", riskScore:45, vuln:false, nps:null, ltv:"£0",
    products:[], pendingProducts:["MTG-007","SAV-007"], gamification:{ streak:0, tier:"Bronze", points:0, badges:[] }},
  { id:"CUS-008", customerType:"consumer", name:"Maria Santos", dob:"05/12/1983", email:"maria.santos@proton.me", phone:"+44 7700 900222",
    address:"15 Cherry Walk, Edinburgh EH1 3QR", since:"Sep 2021", segment:"Premier", kyc:"Verified", kycExpiry:"Sep 2026",
    risk:"Low", riskScore:8, vuln:false, nps:10, ltv:"£22,600",
    products:["MTG-008","SAV-008","SAV-009","CA-002","INS-003"], pendingProducts:["SO-002"],
    gamification:{ streak:48, tier:"Platinum", points:12400, badges:["First Home","4yr Streak","Saver","Referrer","Multi-Product","Insured"] }},
  // ── Business Customers ──
  { id:"CUS-009", customerType:"business", name:"GreenLeaf Properties Ltd", tradingName:"GreenLeaf Properties", companyNumber:"12345678", companyType:"Ltd",
    registeredAddress:"100 King Street, London EC2V 8QN", tradingAddress:"100 King Street, London EC2V 8QN",
    directors:[{ name:"Mark Thompson", role:"Director", dob:"15/06/1975" }, { name:"Sarah Thompson", role:"Director & Secretary", dob:"22/11/1978" }],
    since:"Apr 2024", segment:"Business", kyc:"Verified", kycExpiry:"Apr 2027",
    risk:"Medium", riskScore:38, vuln:false, nps:8, ltv:"£32,500",
    industry:"Property Investment", turnover:"£420,000", tradingYears:6,
    email:"mark@greenleafproperties.co.uk", phone:"+44 7700 900333", dob:null,
    address:"100 King Street, London EC2V 8QN",
    products:["MTG-BTL-001","MTG-BTL-002","CA-003"], pendingProducts:["MTG-BTL-003"],
    gamification:{ streak:12, tier:"Silver", points:1800, badges:["Portfolio Landlord"] }},
  { id:"CUS-010", customerType:"business", name:"Bright Futures Consulting Ltd", tradingName:"Bright Futures", companyNumber:"98765432", companyType:"Ltd",
    registeredAddress:"42 Innovation Park, Manchester M1 7ED", tradingAddress:"42 Innovation Park, Manchester M1 7ED",
    directors:[{ name:"Fatima Al-Rashid", role:"Director", dob:"08/03/1982" }],
    since:"Nov 2025", segment:"Business", kyc:"Verified", kycExpiry:"Nov 2028",
    risk:"Low", riskScore:15, vuln:false, nps:9, ltv:"£8,200",
    industry:"Consulting", turnover:"£680,000", tradingYears:4,
    email:"fatima@brightfutures.co.uk", phone:"+44 7700 900444", dob:null,
    address:"42 Innovation Park, Manchester M1 7ED",
    products:["MTG-COM-001","SAV-010","CA-004"], pendingProducts:[],
    gamification:{ streak:5, tier:"Bronze", points:620, badges:[] }},
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
  // Business Products
  { id:"MTG-BTL-001", customerId:"CUS-009", type:"Mortgage", product:"Afin BTL Tracker", status:"Active", balance:"£185,000", rate:"5.99%", payment:"£1,110", nextPayment:"01 May 2026", rateEnd:"Tracker", ltv:"72%", origRef:"AFN-2024-00801", term:"20 yrs" },
  { id:"MTG-BTL-002", customerId:"CUS-009", type:"Mortgage", product:"Afin BTL Tracker", status:"Active", balance:"£220,000", rate:"5.99%", payment:"£1,320", nextPayment:"01 May 2026", rateEnd:"Tracker", ltv:"68%", origRef:"AFN-2025-00102", term:"25 yrs" },
  { id:"MTG-BTL-003", customerId:"CUS-009", type:"Mortgage", product:"Afin BTL Tracker", status:"Application", balance:"—", rate:"5.99%", payment:"—", nextPayment:"—", rateEnd:"—", ltv:"75%", origRef:"AFN-2026-00210", term:"20 yrs" },
  { id:"CA-003", customerId:"CUS-009", type:"Current Account", product:"Afin Business Current", status:"Active", balance:"£18,400", rate:"0.00%", sortCode:"20-45-69", accountNo:"33445566" },
  { id:"MTG-COM-001", customerId:"CUS-010", type:"Mortgage", product:"Afin Commercial Fix 3yr", status:"Active", balance:"£340,000", rate:"5.49%", payment:"£2,050", nextPayment:"15 May 2026", rateEnd:"15 Nov 2028", ltv:"65%", origRef:"AFN-2025-00445", term:"15 yrs" },
  { id:"SAV-010", customerId:"CUS-010", type:"Fixed Term Deposit", product:"1yr Business Fixed @ 4.75%", status:"Active", balance:"£105,000", rate:"4.75%", principal:"£100,000", maturity:"15 Nov 2026", daysToMaturity:213, interestEarned:"£5,000" },
  { id:"CA-004", customerId:"CUS-010", type:"Current Account", product:"Afin Business Premier", status:"Active", balance:"£42,300", rate:"0.50%", sortCode:"20-45-70", accountNo:"77889900" },
];

// Gamification tier definitions
export const TIERS = [
  { name:"Bronze", minPoints:0, color:"#CD7F32", benefits:["Standard processing","Email support"] },
  { name:"Silver", minPoints:1000, color:"#C0C0C0", benefits:["Priority email","Rate match guarantee"] },
  { name:"Gold", minPoints:3000, color:"#FFD700", benefits:["Priority processing","Dedicated handler","Fee waivers"] },
  { name:"Platinum", minPoints:7000, color:"#E5E4E2", benefits:["VIP processing","Named relationship manager","All fees waived","Exclusive rates"] },
];

export const BADGES = [
  { id:"first-home", name:"First Home", icoKey:"loans", desc:"Completed first mortgage" },
  { id:"saver", name:"Saver", icoKey:"dollar", desc:"Opened a savings account" },
  { id:"streak-1yr", name:"1yr Streak", icoKey:"check", desc:"12 consecutive on-time payments" },
  { id:"streak-2yr", name:"2yr Streak", icoKey:"check", desc:"24 consecutive on-time payments" },
  { id:"streak-3yr", name:"3yr Streak", icoKey:"sparkle", desc:"36 consecutive on-time payments" },
  { id:"streak-4yr", name:"4yr Streak", icoKey:"sparkle", desc:"48 consecutive on-time payments" },
  { id:"referrer", name:"Referrer", icoKey:"users", desc:"Referred a friend who completed" },
  { id:"multi-product", name:"Multi-Product", icoKey:"products", desc:"Holds 3+ products" },
  { id:"insured", name:"Insured", icoKey:"shield", desc:"Has active insurance cover" },
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

// ─────────────────────────────────────────────
// CONNECTED PARTIES — people & organisations linked to a customer
// (joint applicants, solicitors, brokers, employers, beneficiaries,
// advocates, accountants, housing associations)
// ─────────────────────────────────────────────
export const PARTIES_BY_CUSTOMER = {
  "CUS-001": [
    { id:"P-001-1", name:"Watson & Partners",   type:"broker",     role:"Mortgage Broker",   status:"active",  contact:"hello@watsonpartners.co.uk", linkedProducts:["MTG-001"], since:"Mar 2020" },
    { id:"P-001-2", name:"Greene & Co",         type:"solicitor",  role:"Conveyancer",       status:"active",  contact:"emma@greene.co.uk",          linkedProducts:["MTG-001"], since:"Mar 2020" },
    { id:"P-001-3", name:"TechCo Ltd",          type:"employer",   role:"Employer (PAYE)",   status:"active",  contact:"hr@techco.co.uk",            linkedProducts:["MTG-001"], since:"Jan 2018" },
    { id:"P-001-4", name:"Margaret Wilson",     type:"beneficiary",role:"Beneficiary (mother)",status:"active",contact:"—",                          linkedProducts:["MTG-001","SAV-001"], since:"Mar 2020" },
  ],
  "CUS-002": [
    { id:"P-002-1", name:"Sarah Mitchell",      type:"joint_applicant", role:"Joint Applicant", status:"active", contact:"sarah.m@outlook.com", linkedProducts:["MTG-002","SAV-003","INS-001"], since:"Feb 2024" },
    { id:"P-002-2", name:"Apex Mortgages",      type:"broker",     role:"Mortgage Broker",   status:"active",  contact:"deals@apexmtg.co.uk",        linkedProducts:["MTG-002"], since:"Feb 2024" },
    { id:"P-002-3", name:"Brown LLP",           type:"solicitor",  role:"Conveyancer",       status:"active",  contact:"james@brown-llp.co.uk",      linkedProducts:["MTG-002"], since:"Feb 2024" },
    { id:"P-002-4", name:"City Bank Ltd",       type:"employer",   role:"Employer (James)",  status:"active",  contact:"hr@citybank.co.uk",          linkedProducts:["MTG-002"], since:"Aug 2019" },
    { id:"P-002-5", name:"NHS Bristol Trust",   type:"employer",   role:"Employer (Sarah)",  status:"active",  contact:"payroll@nhsbristol.uk",      linkedProducts:["MTG-002"], since:"Mar 2017" },
  ],
  "CUS-003": [
    { id:"P-003-1", name:"Direct",              type:"broker",     role:"Direct (no broker)",status:"inactive",contact:"—",                          linkedProducts:["MTG-003"], since:"—" },
    { id:"P-003-2", name:"Phillips Solicitors", type:"solicitor",  role:"Conveyancer",       status:"active",  contact:"info@phillipslaw.co.uk",     linkedProducts:["MTG-003"], since:"2020" },
    { id:"P-003-3", name:"On long-term sick",   type:"employer",   role:"Last Employer (off sick)", status:"concern", contact:"—",                  linkedProducts:["MTG-003"], since:"2018" },
    { id:"P-003-4", name:"Citizens Advice",     type:"advocate",   role:"Vulnerability Advocate",   status:"active", contact:"bristol@citizensadvice.org.uk", linkedProducts:["MTG-003"], since:"Feb 2026" },
    { id:"P-003-5", name:"Anil Sharma",         type:"next_of_kin",role:"Next of Kin (brother)",   status:"active", contact:"anil.s@gmail.com",        linkedProducts:[],          since:"2020" },
  ],
  "CUS-004": [
    { id:"P-004-1", name:"Watson & Partners",   type:"broker",     role:"Mortgage Broker",   status:"active",  contact:"hello@watsonpartners.co.uk", linkedProducts:["MTG-004","SO-001"], since:"Jan 2023" },
    { id:"P-004-2", name:"Greene & Co",         type:"solicitor",  role:"Conveyancer",       status:"active",  contact:"david@greene.co.uk",         linkedProducts:["MTG-004","SO-001"], since:"Jan 2023" },
    { id:"P-004-3", name:"Goldman Sachs Intl",  type:"employer",   role:"Employer (PAYE)",   status:"active",  contact:"benefits@gs.com",            linkedProducts:["MTG-004"], since:"Sep 2015" },
    { id:"P-004-4", name:"PWC LLP",             type:"accountant", role:"Tax Accountant",    status:"active",  contact:"chen.team@pwc.co.uk",        linkedProducts:["MTG-004"], since:"2018" },
    { id:"P-004-5", name:"Bristol Housing Assoc", type:"housing_assoc", role:"Housing Association", status:"pending", contact:"shared.ownership@bristolha.org.uk", linkedProducts:["SO-001"], since:"Mar 2026" },
    { id:"P-004-6", name:"Mei Chen",            type:"beneficiary",role:"Beneficiary (daughter)", status:"active", contact:"—",                       linkedProducts:["MTG-004","SAV-004","SAV-005"], since:"Jan 2023" },
  ],
  "CUS-005": [
    { id:"P-005-1", name:"Watson & Partners",   type:"broker",     role:"Mortgage Broker",   status:"active",  contact:"hello@watsonpartners.co.uk", linkedProducts:["MTG-005"], since:"Nov 2021" },
    { id:"P-005-2", name:"Smith & Smith",       type:"solicitor",  role:"Conveyancer",       status:"active",  contact:"info@smithlaw.co.uk",        linkedProducts:["MTG-005"], since:"Nov 2021" },
    { id:"P-005-3", name:"Birmingham City Council", type:"employer", role:"Employer (PAYE)", status:"active",  contact:"payroll@birmingham.gov.uk",  linkedProducts:["MTG-005"], since:"Jun 2014" },
    { id:"P-005-4", name:"Afin Protect",        type:"insurer",    role:"Insurance Provider",status:"active",  contact:"claims@afinprotect.co.uk",   linkedProducts:["INS-002"], since:"Nov 2025" },
  ],
  "CUS-006": [
    { id:"P-006-1", name:"Direct",              type:"broker",     role:"Direct (no broker)",status:"inactive",contact:"—",                          linkedProducts:["MTG-006"], since:"—" },
    { id:"P-006-2", name:"Phillips Solicitors", type:"solicitor",  role:"Conveyancer",       status:"inactive",contact:"info@phillipslaw.co.uk",     linkedProducts:["MTG-006"], since:"2023" },
    { id:"P-006-3", name:"Yorkshire Logistics", type:"employer",   role:"Last Employer (redundant)", status:"concern", contact:"—",                 linkedProducts:["MTG-006"], since:"2020" },
    { id:"P-006-4", name:"Internal Collections",type:"advocate",   role:"Collections Team",  status:"active",  contact:"collections@afin.co.uk",     linkedProducts:["MTG-006"], since:"Aug 2025" },
  ],
  "CUS-007": [
    { id:"P-007-1", name:"Lucy Brennan",        type:"joint_applicant", role:"Joint Applicant", status:"active", contact:"lucy.b@gmail.com",        linkedProducts:["MTG-007","SAV-007"], since:"Jan 2026" },
    { id:"P-007-2", name:"Apex Mortgages",      type:"broker",     role:"Mortgage Broker",   status:"active",  contact:"deals@apexmtg.co.uk",        linkedProducts:["MTG-007"], since:"Jan 2026" },
    { id:"P-007-3", name:"To be appointed",     type:"solicitor",  role:"Conveyancer (TBA)", status:"pending", contact:"—",                          linkedProducts:["MTG-007"], since:"—" },
    { id:"P-007-4", name:"University of Oxford",type:"employer",   role:"Employer Tom (PAYE)", status:"active", contact:"hr@ox.ac.uk",              linkedProducts:["MTG-007"], since:"Sep 2021" },
    { id:"P-007-5", name:"Self-Employed",       type:"employer",   role:"Self-Employed Lucy",status:"pending", contact:"—",                          linkedProducts:["MTG-007"], since:"Jan 2024" },
  ],
  "CUS-008": [
    { id:"P-008-1", name:"Direct",              type:"broker",     role:"Direct VIP",        status:"active",  contact:"vip@afin.co.uk",             linkedProducts:["MTG-008","SO-002"], since:"Sep 2021" },
    { id:"P-008-2", name:"Edinburgh Legal",     type:"solicitor",  role:"Conveyancer",       status:"active",  contact:"maria@edinburghlegal.co.uk", linkedProducts:["MTG-008","SO-002"], since:"Sep 2021" },
    { id:"P-008-3", name:"Self-Employed (consulting)", type:"employer", role:"Self-Employed", status:"active",  contact:"—",                         linkedProducts:["MTG-008"], since:"2018" },
    { id:"P-008-4", name:"KPMG Edinburgh",      type:"accountant", role:"Accountant",        status:"active",  contact:"santos@kpmg.co.uk",          linkedProducts:["MTG-008"], since:"2019" },
    { id:"P-008-5", name:"Edinburgh Housing Assoc", type:"housing_assoc", role:"Housing Association", status:"pending", contact:"so@edinburghha.org.uk", linkedProducts:["SO-002"], since:"Mar 2026" },
    { id:"P-008-6", name:"Carlos Santos",       type:"beneficiary",role:"Beneficiary (husband)", status:"active", contact:"—",                       linkedProducts:["INS-003","MTG-008"], since:"Sep 2021" },
  ],
};

// Party type colours and icons
export const PARTY_TYPES = {
  joint_applicant: { color:"#7C3AED", icon:"users",    label:"Joint Applicant" },
  broker:          { color:"#0EA5E9", icon:"customers",label:"Broker" },
  solicitor:       { color:"#059669", icon:"file",     label:"Solicitor" },
  employer:        { color:"#F59E0B", icon:"products", label:"Employer" },
  beneficiary:     { color:"#EC4899", icon:"shield",   label:"Beneficiary" },
  advocate:        { color:"#DC2626", icon:"alert",    label:"Advocate" },
  accountant:      { color:"#0D9488", icon:"chart",    label:"Accountant" },
  next_of_kin:     { color:"#8B5CF6", icon:"users",    label:"Next of Kin" },
  housing_assoc:   { color:"#6366F1", icon:"loans",    label:"Housing Assoc" },
  insurer:         { color:"#EF4444", icon:"shield",   label:"Insurer" },
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
