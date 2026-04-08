export const MOCK_DISBURSEMENTS = [
  { id:"DSB-001", loanId:"AFN-2026-00128", borrower:"Emma & Tom Wilson",  amount:"£290,000", account:"20-45-67 / 87654321", scheduledDate:"15 Feb 2026",
    maker:"Priya Patel", makerTime:"14 Feb 2026, 15:30", checker:"James Mitchell", checkerTime:"14 Feb 2026, 16:05", status:"Authorised",          notes:"Standard completion disbursement" },
  { id:"DSB-002", loanId:"AFN-2026-00125", borrower:"Aisha Patel",        amount:"£510,000", account:"30-20-10 / 11223344", scheduledDate:"10 Apr 2026",
    maker:"Priya Patel", makerTime:"06 Apr 2026, 09:15", checker:null,            checkerTime:null,                status:"Pending Authorisation", notes:"Offer accepted 05 Apr. Completion confirmed." },
  { id:"DSB-003", loanId:"AFN-2026-00139", borrower:"Priya Sharma",       amount:"£275,000", account:"40-50-60 / 99887766", scheduledDate:"20 Apr 2026",
    maker:null,         makerTime:null,                  checker:null,            checkerTime:null,                status:"Draft",                 notes:"" },
];
