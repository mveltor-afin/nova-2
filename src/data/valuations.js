export const MOCK_SURVEYORS = [
  { id:"SUR001", firm:"Countrywide Surveying",         types:["Desktop","Full"],         coverage:"England & Wales", sla:"3 days", fee:"£250", rating:4.8, active:true  },
  { id:"SUR002", firm:"e.surv Chartered Surveyors",    types:["AVM","Desktop","Full"],   coverage:"Nationwide",      sla:"2 days", fee:"£350", rating:4.9, active:true  },
  { id:"SUR003", firm:"Connells Survey & Valuation",   types:["Desktop","Drive-by","Full"],coverage:"England",       sla:"4 days", fee:"£275", rating:4.6, active:true  },
  { id:"SUR004", firm:"Barker-Mills Crawford",         types:["Full","Structural"],      coverage:"London & SE",     sla:"5 days", fee:"£450", rating:4.7, active:false },
];

export const MOCK_VALUATIONS = {
  "AFN-2026-00142": { status:"Report Received", type:"Full",    surveyorId:"SUR001", instructed:"22 Mar 2026", completed:"25 Mar 2026",
    avm:{ value:"£495,000", confidence:84, range:"£470k–£520k" },
    report:{ value:"£485,000", condition:"Good", type:"Semi-Detached", rooms:3, tenure:"Freehold", restrictions:[], retention:null, downVal:false }},
  "AFN-2026-00139": { status:"Instructed",      type:"Desktop", surveyorId:"SUR002", instructed:"01 Apr 2026", completed:null,
    avm:{ value:"£310,000", confidence:91, range:"£295k–£325k" }, report:null },
  "AFN-2026-00135": { status:"AVM Only",        type:"AVM",     surveyorId:null,     instructed:null,          completed:null,
    avm:{ value:"£475,000", confidence:77, range:"£440k–£510k" }, report:null },
  "AFN-2026-00128": { status:"Report Received", type:"Full",    surveyorId:"SUR002", instructed:"10 Feb 2026", completed:"14 Feb 2026",
    avm:{ value:"£300,000", confidence:89, range:"£285k–£315k" },
    report:{ value:"£291,000", condition:"Good", type:"Terrace", rooms:3, tenure:"Freehold", restrictions:[], retention:null, downVal:false }},
  "AFN-2026-00125": { status:"Down-Valuation",  type:"Full",    surveyorId:"SUR001", instructed:"28 Mar 2026", completed:"31 Mar 2026",
    avm:{ value:"£680,000", confidence:72, range:"£640k–£720k" },
    report:{ value:"£655,000", condition:"Good", type:"Detached", rooms:5, tenure:"Freehold",
      restrictions:["Planning restriction — Grade II listed"], retention:"£5,000 pending listed building consent", downVal:true }},
  "AFN-2026-00119": { status:"Not Instructed",  type:null,      surveyorId:null,     instructed:null,          completed:null,
    avm:{ value:"£220,000", confidence:88, range:"£205k–£235k" }, report:null },
  "AFN-2026-00115": { status:"AVM Only",        type:"AVM",     surveyorId:null,     instructed:null,          completed:null,
    avm:{ value:"£360,000", confidence:80, range:"£340k–£380k" }, report:null },
};
