export const MOCK_MI_BROKER = {
  pipeline:[{label:"DIP",v:12},{label:"Submitted",v:8},{label:"KYC",v:5},{label:"Underwriting",v:4},{label:"Offer",v:3},{label:"Completion",v:2}],
  conversionRate:"31%", dipTime:"4.2 min", avgLoanSize:"£335k", completionsYTD:"£2.1M",
  products:[{name:"Fix 2yr 75%",v:6},{name:"Fix 5yr 75%",v:4},{name:"Tracker SVR",v:3},{name:"Fix 2yr 90%",v:2}],
};

export const MOCK_MI_UW = {
  queue:[{label:"Mon",v:8},{label:"Tue",v:12},{label:"Wed",v:7},{label:"Thu",v:10},{label:"Fri",v:5}],
  approved:74, declined:14, referred:12, avgDecisionHours:3.2, overturnRate:"4%",
  byMandate:[{label:"L1 <£250k",v:18},{label:"L2 £250–500k",v:9},{label:"L3 >£500k",v:3}],
};

export const MOCK_MI_OPS = {
  kycPassRate:88, kycFirstTime:72, avgDocVerifyHours:1.4, slaCompliance:94,
  byStage:[{label:"KYC",v:5},{label:"Doc Review",v:3},{label:"Valuation",v:2},{label:"Completion",v:1}],
  docQuality:[{broker:"John Watson",score:96},{broker:"Emma Roberts",score:71},{broker:"Apex Mortgages",score:84}],
};

export const MOCK_MI_FINANCE = {
  disbursedMTD:"£1.87M", pendingAuth:"£510k", failedDD:"2.5%", arrearsProvision:"£46,200",
  rateExpiry:[{label:"<30d",v:1},{label:"30–60d",v:2},{label:"60–90d",v:1},{label:">90d",v:3}],
  weekly:[{label:"W1",v:420},{label:"W2",v:510},{label:"W3",v:290},{label:"W4",v:660}],
};

export const MOCK_MI_ADMIN = {
  activeUsers:18, aiAutoRate:73, avgResponseTime:"2.1h", auditFlags:3,
  volumeByPersona:[{label:"Broker",v:142},{label:"Ops",v:8},{label:"UW",v:5},{label:"Finance",v:3}],
  slaByStage:[{label:"KYC",pct:91},{label:"UW",pct:96},{label:"Offer",pct:88},{label:"Disburse",pct:99}],
};
