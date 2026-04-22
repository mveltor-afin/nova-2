import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const BarChart = ({ data, color, height = 80, labelKey = "label", valueKey = "v", unit = "" }) => {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{unit}{d[valueKey]}</div>
          <div style={{ width: "100%", background: `${color}20`, borderRadius: "4px 4px 0 0", position: "relative", height: height - 28 }}>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderRadius: "4px 4px 0 0",
              background: color, height: `${(d[valueKey] / max) * 100}%`, transition: "height 0.4s" }} />
          </div>
          <div style={{ fontSize: 10, color: T.textMuted, textAlign: "center", lineHeight: 1.2 }}>{d[labelKey]}</div>
        </div>
      ))}
    </div>
  );
};

const BROKERS = [
  { rank: 1, firm: "Pinnacle Mortgages Ltd", volume: 4200000, cases: 38, conversion: 42, kycPass: 96, docQuality: 94, quality: 95, trend: "up" },
  { rank: 2, firm: "Sterling Financial Partners", volume: 3850000, cases: 34, conversion: 40, kycPass: 94, docQuality: 91, quality: 92, trend: "up" },
  { rank: 3, firm: "Apex Broker Group", volume: 3200000, cases: 29, conversion: 38, kycPass: 90, docQuality: 88, quality: 88, trend: "same" },
  { rank: 4, firm: "Meridian Home Finance", volume: 2900000, cases: 26, conversion: 36, kycPass: 92, docQuality: 86, quality: 86, trend: "up" },
  { rank: 5, firm: "Hartwell & Co", volume: 2600000, cases: 24, conversion: 35, kycPass: 88, docQuality: 84, quality: 84, trend: "down" },
  { rank: 6, firm: "Crown Mortgage Solutions", volume: 2100000, cases: 22, conversion: 33, kycPass: 85, docQuality: 80, quality: 80, trend: "same" },
  { rank: 7, firm: "Beacon Financial Services", volume: 1800000, cases: 20, conversion: 31, kycPass: 82, docQuality: 78, quality: 76, trend: "down" },
  { rank: 8, firm: "Northstar Lending", volume: 1500000, cases: 18, conversion: 28, kycPass: 78, docQuality: 74, quality: 72, trend: "down" },
  { rank: 9, firm: "Thames Valley Mortgages", volume: 1200000, cases: 16, conversion: 25, kycPass: 74, docQuality: 70, quality: 68, trend: "down" },
  { rank: 10, firm: "Pacific Home Loans", volume: 950000, cases: 14, conversion: 22, kycPass: 70, docQuality: 65, quality: 62, trend: "down" },
  { rank: 11, firm: "Horizon Brokers", volume: 720000, cases: 11, conversion: 18, kycPass: 65, docQuality: 60, quality: 55, trend: "down" },
];

const BROKER_INDIVIDUALS = {
  1: [
    { name: "James Whitfield", firm: "Pinnacle Mortgages Ltd", role: "Senior Adviser", cases: 16, conversion: 50, volume: 1900000, docQuality: 96, trend: "up",
      monthly: [{ label: "Nov", v: 2 }, { label: "Dec", v: 2 }, { label: "Jan", v: 3 }, { label: "Feb", v: 3 }, { label: "Mar", v: 4 }, { label: "Apr", v: 2 }],
      recentCases: [{ ref: "MTG-4821", product: "Fix 5yr", amount: "£480k", status: "Completed" }, { ref: "MTG-4756", product: "Fix 2yr", amount: "£320k", status: "Completed" }, { ref: "MTG-4812", product: "Tracker", amount: "£410k", status: "In Progress" }, { ref: "MTG-4799", product: "Fix 5yr", amount: "£690k", status: "In Progress" }] },
    { name: "Sophie Lane", firm: "Pinnacle Mortgages Ltd", role: "Mortgage Adviser", cases: 13, conversion: 42, volume: 1400000, docQuality: 94, trend: "up",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 2 }, { label: "Feb", v: 3 }, { label: "Mar", v: 3 }, { label: "Apr", v: 3 }],
      recentCases: [{ ref: "MTG-4833", product: "Fix 2yr", amount: "£295k", status: "Completed" }, { ref: "MTG-4808", product: "Fix 5yr", amount: "£380k", status: "In Progress" }, { ref: "MTG-4791", product: "SVR", amount: "£210k", status: "Declined" }, { ref: "MTG-4847", product: "Fix 2yr", amount: "£515k", status: "In Progress" }] },
    { name: "Ryan Okeke", firm: "Pinnacle Mortgages Ltd", role: "Associate Adviser", cases: 9, conversion: 33, volume: 900000, docQuality: 91, trend: "same",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 0 }, { label: "Jan", v: 2 }, { label: "Feb", v: 2 }, { label: "Mar", v: 2 }, { label: "Apr", v: 2 }],
      recentCases: [{ ref: "MTG-4802", product: "Tracker", amount: "£265k", status: "Completed" }, { ref: "MTG-4839", product: "Fix 2yr", amount: "£345k", status: "In Progress" }, { ref: "MTG-4778", product: "Fix 5yr", amount: "£290k", status: "Declined" }, { ref: "MTG-4855", product: "Tracker", amount: "£200k", status: "In Progress" }] },
  ],
  2: [
    { name: "Claire Dunmore", firm: "Sterling Financial Partners", role: "Senior Adviser", cases: 14, conversion: 46, volume: 1600000, docQuality: 95, trend: "up",
      monthly: [{ label: "Nov", v: 2 }, { label: "Dec", v: 2 }, { label: "Jan", v: 2 }, { label: "Feb", v: 3 }, { label: "Mar", v: 3 }, { label: "Apr", v: 2 }],
      recentCases: [{ ref: "MTG-3901", product: "Fix 5yr", amount: "£540k", status: "Completed" }, { ref: "MTG-3887", product: "Fix 2yr", amount: "£390k", status: "Completed" }, { ref: "MTG-3915", product: "Tracker", amount: "£475k", status: "In Progress" }, { ref: "MTG-3922", product: "Fix 5yr", amount: "£195k", status: "In Progress" }] },
    { name: "Marcus Thorn", firm: "Sterling Financial Partners", role: "Mortgage Adviser", cases: 12, conversion: 38, volume: 1350000, docQuality: 90, trend: "up",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 2 }, { label: "Jan", v: 2 }, { label: "Feb", v: 2 }, { label: "Mar", v: 3 }, { label: "Apr", v: 2 }],
      recentCases: [{ ref: "MTG-3895", product: "Fix 2yr", amount: "£280k", status: "Completed" }, { ref: "MTG-3909", product: "SVR", amount: "£165k", status: "In Progress" }, { ref: "MTG-3931", product: "Fix 5yr", amount: "£420k", status: "In Progress" }, { ref: "MTG-3876", product: "Tracker", amount: "£350k", status: "Declined" }] },
    { name: "Priya Mehta", firm: "Sterling Financial Partners", role: "Associate Adviser", cases: 8, conversion: 30, volume: 900000, docQuality: 87, trend: "same",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 2 }, { label: "Mar", v: 2 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-3940", product: "Fix 2yr", amount: "£310k", status: "Completed" }, { ref: "MTG-3927", product: "Tracker", amount: "£240k", status: "In Progress" }, { ref: "MTG-3918", product: "Fix 5yr", amount: "£350k", status: "Declined" }, { ref: "MTG-3948", product: "Fix 2yr", amount: "£200k", status: "In Progress" }] },
  ],
  3: [
    { name: "Tom Harding", firm: "Apex Broker Group", role: "Senior Adviser", cases: 12, conversion: 42, volume: 1300000, docQuality: 90, trend: "same",
      monthly: [{ label: "Nov", v: 2 }, { label: "Dec", v: 1 }, { label: "Jan", v: 2 }, { label: "Feb", v: 2 }, { label: "Mar", v: 3 }, { label: "Apr", v: 2 }],
      recentCases: [{ ref: "MTG-5102", product: "Fix 5yr", amount: "£460k", status: "Completed" }, { ref: "MTG-5088", product: "Fix 2yr", amount: "£320k", status: "In Progress" }, { ref: "MTG-5119", product: "Tracker", amount: "£290k", status: "Completed" }, { ref: "MTG-5131", product: "Fix 5yr", amount: "£230k", status: "In Progress" }] },
    { name: "Naomi Fischer", firm: "Apex Broker Group", role: "Mortgage Adviser", cases: 10, conversion: 36, volume: 1050000, docQuality: 87, trend: "same",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 2 }, { label: "Jan", v: 2 }, { label: "Feb", v: 1 }, { label: "Mar", v: 2 }, { label: "Apr", v: 2 }],
      recentCases: [{ ref: "MTG-5094", product: "SVR", amount: "£185k", status: "Declined" }, { ref: "MTG-5107", product: "Fix 2yr", amount: "£340k", status: "In Progress" }, { ref: "MTG-5124", product: "Tracker", amount: "£270k", status: "Completed" }, { ref: "MTG-5136", product: "Fix 5yr", amount: "£260k", status: "In Progress" }] },
    { name: "Stuart Penney", firm: "Apex Broker Group", role: "Associate Adviser", cases: 7, conversion: 30, volume: 850000, docQuality: 84, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 2 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-5115", product: "Fix 2yr", amount: "£295k", status: "In Progress" }, { ref: "MTG-5099", product: "Tracker", amount: "£315k", status: "Declined" }, { ref: "MTG-5141", product: "Fix 5yr", amount: "£240k", status: "In Progress" }, { ref: "MTG-5083", product: "Fix 2yr", amount: "£200k", status: "Declined" }] },
  ],
  4: [
    { name: "Hannah Blake", firm: "Meridian Home Finance", role: "Senior Adviser", cases: 11, conversion: 40, volume: 1200000, docQuality: 88, trend: "up",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 2 }, { label: "Jan", v: 2 }, { label: "Feb", v: 2 }, { label: "Mar", v: 2 }, { label: "Apr", v: 2 }],
      recentCases: [{ ref: "MTG-6201", product: "Fix 5yr", amount: "£420k", status: "Completed" }, { ref: "MTG-6189", product: "Fix 2yr", amount: "£310k", status: "Completed" }, { ref: "MTG-6214", product: "Tracker", amount: "£370k", status: "In Progress" }, { ref: "MTG-6228", product: "Fix 5yr", amount: "£100k", status: "In Progress" }] },
    { name: "Daniel Rowe", firm: "Meridian Home Finance", role: "Mortgage Adviser", cases: 9, conversion: 34, volume: 1000000, docQuality: 85, trend: "up",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 2 }, { label: "Feb", v: 2 }, { label: "Mar", v: 1 }, { label: "Apr", v: 2 }],
      recentCases: [{ ref: "MTG-6196", product: "Fix 2yr", amount: "£255k", status: "Declined" }, { ref: "MTG-6207", product: "Tracker", amount: "£340k", status: "In Progress" }, { ref: "MTG-6220", product: "SVR", amount: "£190k", status: "Completed" }, { ref: "MTG-6234", product: "Fix 5yr", amount: "£215k", status: "In Progress" }] },
    { name: "Leila Nasser", firm: "Meridian Home Finance", role: "Associate Adviser", cases: 6, conversion: 28, volume: 700000, docQuality: 82, trend: "same",
      monthly: [{ label: "Nov", v: 0 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 2 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-6240", product: "Fix 2yr", amount: "£275k", status: "In Progress" }, { ref: "MTG-6225", product: "Tracker", amount: "£230k", status: "Declined" }, { ref: "MTG-6212", product: "Fix 5yr", amount: "£195k", status: "In Progress" }, { ref: "MTG-6248", product: "Fix 2yr", amount: "£200k", status: "Declined" }] },
  ],
  5: [
    { name: "Owen Carey", firm: "Hartwell & Co", role: "Senior Adviser", cases: 10, conversion: 40, volume: 1100000, docQuality: 86, trend: "down",
      monthly: [{ label: "Nov", v: 2 }, { label: "Dec", v: 2 }, { label: "Jan", v: 2 }, { label: "Feb", v: 2 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-7301", product: "Fix 5yr", amount: "£395k", status: "Completed" }, { ref: "MTG-7288", product: "Fix 2yr", amount: "£280k", status: "In Progress" }, { ref: "MTG-7315", product: "Tracker", amount: "£325k", status: "Declined" }, { ref: "MTG-7328", product: "Fix 5yr", amount: "£100k", status: "In Progress" }] },
    { name: "Fiona Crawford", firm: "Hartwell & Co", role: "Mortgage Adviser", cases: 8, conversion: 33, volume: 900000, docQuality: 83, trend: "down",
      monthly: [{ label: "Nov", v: 2 }, { label: "Dec", v: 2 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-7295", product: "SVR", amount: "£170k", status: "Declined" }, { ref: "MTG-7309", product: "Fix 2yr", amount: "£305k", status: "In Progress" }, { ref: "MTG-7321", product: "Tracker", amount: "£225k", status: "Declined" }, { ref: "MTG-7334", product: "Fix 5yr", amount: "£200k", status: "In Progress" }] },
    { name: "Gavin Lee", firm: "Hartwell & Co", role: "Associate Adviser", cases: 6, conversion: 27, volume: 600000, docQuality: 80, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-7341", product: "Fix 2yr", amount: "£220k", status: "In Progress" }, { ref: "MTG-7316", product: "Tracker", amount: "£180k", status: "Declined" }, { ref: "MTG-7329", product: "Fix 2yr", amount: "£200k", status: "Declined" }, { ref: "MTG-7352", product: "SVR", amount: "£200k", status: "In Progress" }] },
  ],
  6: [
    { name: "Alicia Marsh", firm: "Crown Mortgage Solutions", role: "Senior Adviser", cases: 9, conversion: 36, volume: 900000, docQuality: 82, trend: "same",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 2 }, { label: "Feb", v: 2 }, { label: "Mar", v: 2 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-8401", product: "Fix 5yr", amount: "£360k", status: "Completed" }, { ref: "MTG-8389", product: "Fix 2yr", amount: "£260k", status: "In Progress" }, { ref: "MTG-8414", product: "Tracker", amount: "£280k", status: "Completed" }, { ref: "MTG-8428", product: "Fix 5yr", amount: "£100k", status: "In Progress" }] },
    { name: "Ben Sutton", firm: "Crown Mortgage Solutions", role: "Mortgage Adviser", cases: 8, conversion: 31, volume: 800000, docQuality: 79, trend: "same",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 2 }, { label: "Jan", v: 1 }, { label: "Feb", v: 2 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-8395", product: "Fix 2yr", amount: "£245k", status: "In Progress" }, { ref: "MTG-8408", product: "SVR", amount: "£160k", status: "Declined" }, { ref: "MTG-8421", product: "Tracker", amount: "£295k", status: "In Progress" }, { ref: "MTG-8435", product: "Fix 2yr", amount: "£100k", status: "Declined" }] },
    { name: "Iris Yuen", firm: "Crown Mortgage Solutions", role: "Associate Adviser", cases: 5, conversion: 24, volume: 400000, docQuality: 75, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 0 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-8441", product: "Fix 2yr", amount: "£185k", status: "Declined" }, { ref: "MTG-8429", product: "Tracker", amount: "£215k", status: "In Progress" }, { ref: "MTG-8448", product: "Fix 5yr", amount: "£200k", status: "Declined" }, { ref: "MTG-8456", product: "Fix 2yr", amount: "£200k", status: "In Progress" }] },
  ],
  7: [
    { name: "Chris Nolan", firm: "Beacon Financial Services", role: "Senior Adviser", cases: 8, conversion: 33, volume: 750000, docQuality: 80, trend: "down",
      monthly: [{ label: "Nov", v: 2 }, { label: "Dec", v: 1 }, { label: "Jan", v: 2 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-9501", product: "Fix 2yr", amount: "£305k", status: "In Progress" }, { ref: "MTG-9488", product: "Tracker", amount: "£225k", status: "Declined" }, { ref: "MTG-9514", product: "Fix 5yr", amount: "£220k", status: "Completed" }, { ref: "MTG-9527", product: "Fix 2yr", amount: "£100k", status: "In Progress" }] },
    { name: "Amelia Torres", firm: "Beacon Financial Services", role: "Mortgage Adviser", cases: 7, conversion: 29, volume: 650000, docQuality: 77, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 2 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-9494", product: "SVR", amount: "£155k", status: "Declined" }, { ref: "MTG-9507", product: "Fix 2yr", amount: "£280k", status: "In Progress" }, { ref: "MTG-9521", product: "Tracker", amount: "£215k", status: "Declined" }, { ref: "MTG-9534", product: "Fix 5yr", amount: "£200k", status: "In Progress" }] },
    { name: "Luke Fraser", firm: "Beacon Financial Services", role: "Associate Adviser", cases: 5, conversion: 25, volume: 400000, docQuality: 72, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 0 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-9540", product: "Fix 2yr", amount: "£195k", status: "Declined" }, { ref: "MTG-9528", product: "Tracker", amount: "£205k", status: "In Progress" }, { ref: "MTG-9547", product: "Fix 2yr", amount: "£200k", status: "Declined" }, { ref: "MTG-9555", product: "SVR", amount: "£200k", status: "In Progress" }] },
  ],
  8: [
    { name: "Rachel Kim", firm: "Northstar Lending", role: "Senior Adviser", cases: 8, conversion: 30, volume: 650000, docQuality: 76, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 2 }, { label: "Jan", v: 1 }, { label: "Feb", v: 2 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1061", product: "Fix 2yr", amount: "£285k", status: "In Progress" }, { ref: "MTG-1048", product: "Tracker", amount: "£210k", status: "Declined" }, { ref: "MTG-1074", product: "Fix 5yr", amount: "£155k", status: "Completed" }, { ref: "MTG-1087", product: "Fix 2yr", amount: "£100k", status: "In Progress" }] },
    { name: "Peter Walsh", firm: "Northstar Lending", role: "Mortgage Adviser", cases: 6, conversion: 27, volume: 550000, docQuality: 73, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1055", product: "SVR", amount: "£145k", status: "Declined" }, { ref: "MTG-1068", product: "Fix 2yr", amount: "£265k", status: "In Progress" }, { ref: "MTG-1081", product: "Tracker", amount: "£140k", status: "Declined" }, { ref: "MTG-1093", product: "Fix 5yr", amount: "£200k", status: "In Progress" }] },
    { name: "Sara Ahmed", firm: "Northstar Lending", role: "Associate Adviser", cases: 4, conversion: 20, volume: 300000, docQuality: 70, trend: "down",
      monthly: [{ label: "Nov", v: 0 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 0 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1099", product: "Fix 2yr", amount: "£175k", status: "Declined" }, { ref: "MTG-1086", product: "Tracker", amount: "£125k", status: "In Progress" }, { ref: "MTG-1106", product: "Fix 2yr", amount: "£200k", status: "Declined" }, { ref: "MTG-1113", product: "SVR", amount: "£200k", status: "In Progress" }] },
  ],
  9: [
    { name: "Mark Evans", firm: "Thames Valley Mortgages", role: "Senior Adviser", cases: 7, conversion: 28, volume: 550000, docQuality: 72, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 2 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1201", product: "Fix 2yr", amount: "£260k", status: "In Progress" }, { ref: "MTG-1188", product: "Tracker", amount: "£190k", status: "Declined" }, { ref: "MTG-1214", product: "Fix 5yr", amount: "£100k", status: "Declined" }, { ref: "MTG-1227", product: "Fix 2yr", amount: "£100k", status: "In Progress" }] },
    { name: "Joanne Lim", firm: "Thames Valley Mortgages", role: "Mortgage Adviser", cases: 5, conversion: 22, volume: 400000, docQuality: 69, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 0 }],
      recentCases: [{ ref: "MTG-1195", product: "SVR", amount: "£135k", status: "Declined" }, { ref: "MTG-1208", product: "Fix 2yr", amount: "£245k", status: "In Progress" }, { ref: "MTG-1221", product: "Tracker", amount: "£100k", status: "Declined" }, { ref: "MTG-1234", product: "Fix 2yr", amount: "£100k", status: "Declined" }] },
    { name: "Neil Cooper", firm: "Thames Valley Mortgages", role: "Associate Adviser", cases: 4, conversion: 20, volume: 250000, docQuality: 65, trend: "down",
      monthly: [{ label: "Nov", v: 0 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 0 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1240", product: "Fix 2yr", amount: "£155k", status: "Declined" }, { ref: "MTG-1228", product: "Tracker", amount: "£95k", status: "In Progress" }, { ref: "MTG-1247", product: "Fix 2yr", amount: "£100k", status: "Declined" }, { ref: "MTG-1254", product: "SVR", amount: "£100k", status: "Declined" }] },
  ],
  10: [
    { name: "Vicky Park", firm: "Pacific Home Loans", role: "Senior Adviser", cases: 6, conversion: 25, volume: 420000, docQuality: 67, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1301", product: "Fix 2yr", amount: "£195k", status: "In Progress" }, { ref: "MTG-1288", product: "Tracker", amount: "£165k", status: "Declined" }, { ref: "MTG-1314", product: "Fix 5yr", amount: "£60k", status: "Declined" }, { ref: "MTG-1327", product: "Fix 2yr", amount: "£100k", status: "In Progress" }] },
    { name: "Aaron Mills", firm: "Pacific Home Loans", role: "Mortgage Adviser", cases: 5, conversion: 20, volume: 330000, docQuality: 64, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 0 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1295", product: "SVR", amount: "£125k", status: "Declined" }, { ref: "MTG-1308", product: "Fix 2yr", amount: "£205k", status: "In Progress" }, { ref: "MTG-1321", product: "Tracker", amount: "£100k", status: "Declined" }, { ref: "MTG-1334", product: "Fix 2yr", amount: "£100k", status: "Declined" }] },
    { name: "Kelly Hart", firm: "Pacific Home Loans", role: "Associate Adviser", cases: 3, conversion: 17, volume: 200000, docQuality: 60, trend: "down",
      monthly: [{ label: "Nov", v: 0 }, { label: "Dec", v: 0 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 0 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1340", product: "Fix 2yr", amount: "£100k", status: "Declined" }, { ref: "MTG-1328", product: "Tracker", amount: "£100k", status: "In Progress" }, { ref: "MTG-1347", product: "Fix 2yr", amount: "£100k", status: "Declined" }, { ref: "MTG-1354", product: "SVR", amount: "£100k", status: "Declined" }] },
  ],
  11: [
    { name: "Tim Burgess", firm: "Horizon Brokers", role: "Senior Adviser", cases: 5, conversion: 20, volume: 320000, docQuality: 62, trend: "down",
      monthly: [{ label: "Nov", v: 1 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 0 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1401", product: "Fix 2yr", amount: "£165k", status: "In Progress" }, { ref: "MTG-1388", product: "Tracker", amount: "£155k", status: "Declined" }, { ref: "MTG-1414", product: "SVR", amount: "£100k", status: "Declined" }, { ref: "MTG-1427", product: "Fix 2yr", amount: "£100k", status: "In Progress" }] },
    { name: "Janet Cole", firm: "Horizon Brokers", role: "Mortgage Adviser", cases: 4, conversion: 17, volume: 250000, docQuality: 60, trend: "down",
      monthly: [{ label: "Nov", v: 0 }, { label: "Dec", v: 1 }, { label: "Jan", v: 1 }, { label: "Feb", v: 1 }, { label: "Mar", v: 1 }, { label: "Apr", v: 0 }],
      recentCases: [{ ref: "MTG-1395", product: "SVR", amount: "£115k", status: "Declined" }, { ref: "MTG-1408", product: "Fix 2yr", amount: "£135k", status: "In Progress" }, { ref: "MTG-1421", product: "Tracker", amount: "£100k", status: "Declined" }, { ref: "MTG-1434", product: "Fix 2yr", amount: "£100k", status: "Declined" }] },
    { name: "Greg Mann", firm: "Horizon Brokers", role: "Associate Adviser", cases: 2, conversion: 14, volume: 150000, docQuality: 56, trend: "down",
      monthly: [{ label: "Nov", v: 0 }, { label: "Dec", v: 0 }, { label: "Jan", v: 0 }, { label: "Feb", v: 1 }, { label: "Mar", v: 0 }, { label: "Apr", v: 1 }],
      recentCases: [{ ref: "MTG-1440", product: "Fix 2yr", amount: "£75k", status: "Declined" }, { ref: "MTG-1428", product: "Tracker", amount: "£75k", status: "Declined" }, { ref: "MTG-1447", product: "Fix 2yr", amount: "£100k", status: "Declined" }, { ref: "MTG-1454", product: "SVR", amount: "£100k", status: "Declined" }] },
  ],
};

const DETAIL_MONTHLY = [
  { label: "Nov", v: 4 }, { label: "Dec", v: 3 }, { label: "Jan", v: 5 },
  { label: "Feb", v: 6 }, { label: "Mar", v: 7 }, { label: "Apr", v: 4 },
];

const DETAIL_PRODUCT_MIX = [
  { label: "Fix 2yr", v: 14 }, { label: "Fix 5yr", v: 10 }, { label: "Tracker", v: 8 }, { label: "SVR", v: 6 },
];

const DECLINE_REASONS = [
  { reason: "Affordability", count: 4 },
  { reason: "Credit history", count: 3 },
  { reason: "Incomplete documentation", count: 2 },
  { reason: "Valuation shortfall", count: 1 },
];

const SLA_COMPLIANCE = [
  { stage: "DIP Response (<4h)", pct: 98 },
  { stage: "Full App Acknowledgement (<24h)", pct: 95 },
  { stage: "Offer Issuance (<5d)", pct: 88 },
  { stage: "Completion (<30d)", pct: 82 },
];

const qualityColor = (score) => score >= 85 ? T.success : score >= 70 ? T.warning : T.danger;
const qualityBg = (score) => score >= 85 ? T.successBg : score >= 70 ? T.warningBg : T.dangerBg;
const trendArrow = (t) => t === "up" ? "↑" : t === "down" ? "↓" : "→";
const trendColor = (t) => t === "up" ? T.success : t === "down" ? T.danger : T.textMuted;
const fmtVol = (v) => v >= 1000000 ? `£${(v / 1000000).toFixed(1)}M` : `£${(v / 1000).toFixed(0)}k`;

const statusColor = (s) => s === "Completed" ? T.success : s === "Declined" ? T.danger : T.warning;
const statusBg = (s) => s === "Completed" ? T.successBg : s === "Declined" ? T.dangerBg : T.warningBg;

const thStyle = { textAlign: "left", fontSize: 11, fontWeight: 600, color: T.textMuted, padding: "8px 12px", borderBottom: `2px solid ${T.border}`, textTransform: "uppercase", letterSpacing: 0.5 };
const tdStyle = { fontSize: 13, padding: "10px 12px", borderBottom: `1px solid ${T.borderLight}`, color: T.text };

function BrokerScorecardScreen() {
  const [selected, setSelected] = useState(null);
  const [selectedIndividual, setSelectedIndividual] = useState(null);
  const [flagged, setFlagged] = useState({});

  const broker = selected !== null ? BROKERS[selected] : null;
  const individuals = broker ? (BROKER_INDIVIDUALS[broker.rank] || []) : [];
  const individual = selectedIndividual !== null ? individuals[selectedIndividual] : null;

  const handleSelectFirm = (i) => {
    setSelected(i);
    setSelectedIndividual(null);
  };

  return (
    <div style={{ fontFamily: T.font }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.text }}>Broker Scorecard</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textSecondary }}>Performance analytics and quality monitoring across the broker panel</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
        <KPICard label="Active Brokers" value="142" sub="registered panel" color={T.primary} />
        <KPICard label="Avg Conversion" value="34%" sub="DIP to completion" color={T.accent} />
        <KPICard label="Top Broker Volume" value="£4.2M" sub="Pinnacle Mortgages" color="#8B5CF6" />
        <KPICard label="Quality Score Avg" value="82%" sub="across all brokers" color={T.warning} />
      </div>

      {/* League Table */}
      <Card noPad style={{ marginBottom: 16 }}>
        <div style={{ padding: "20px 24px 0" }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: T.text }}>Broker League Table</div>
          <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Click a row for detailed breakdown</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Firm</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Volume</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Cases</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Conv %</th>
                <th style={{ ...thStyle, textAlign: "center" }}>KYC Pass %</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Doc Quality</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Quality Score</th>
                <th style={{ ...thStyle, textAlign: "center" }}>Trend</th>
              </tr>
            </thead>
            <tbody>
              {BROKERS.map((b, i) => (
                <tr key={i} onClick={() => handleSelectFirm(i)}
                  style={{ cursor: "pointer", background: selected === i ? T.primaryLight : flagged[i] ? T.dangerBg : "transparent", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (selected !== i) e.currentTarget.style.background = T.primaryLight; }}
                  onMouseLeave={e => { if (selected !== i) e.currentTarget.style.background = flagged[i] ? T.dangerBg : "transparent"; }}>
                  <td style={{ ...tdStyle, fontWeight: 600, width: 40 }}>{b.rank}</td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    {b.firm}
                    {flagged[i] && <span style={{ marginLeft: 8, fontSize: 10, background: T.dangerBg, color: T.danger, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>FLAGGED</span>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{fmtVol(b.volume)}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{b.cases}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{b.conversion}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{b.kycPass}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{b.docQuality}%</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: qualityBg(b.quality), color: qualityColor(b.quality) }}>
                      {b.quality}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, textAlign: "center", fontSize: 16, fontWeight: 700, color: trendColor(b.trend) }}>{trendArrow(b.trend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Firm Detail Panel */}
      {broker && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{broker.firm}</div>
              <div style={{ fontSize: 12, color: T.textMuted }}>Rank #{broker.rank} — Quality Score: {broker.quality}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {broker.quality < 70 && !flagged[selected] && (
                <Btn small danger onClick={() => setFlagged(p => ({ ...p, [selected]: true }))}>
                  {Ico.alert(14)} Flag for Review
                </Btn>
              )}
              <Btn small ghost onClick={() => { setSelected(null); setSelectedIndividual(null); }}>Close</Btn>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>Monthly Submissions</div>
              <BarChart data={DETAIL_MONTHLY} color={T.primary} height={90} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>Product Mix</div>
              <BarChart data={DETAIL_PRODUCT_MIX} color={T.accent} height={90} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>Decline Reasons</div>
              {DECLINE_REASONS.map((d, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
                  <span style={{ color: T.textSecondary }}>{d.reason}</span>
                  <span style={{ fontWeight: 600, color: T.text }}>{d.count}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>SLA Compliance</div>
              {SLA_COMPLIANCE.map((s, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: T.textSecondary }}>{s.stage}</span>
                    <span style={{ fontWeight: 700, color: s.pct >= 95 ? T.success : s.pct >= 85 ? T.warning : T.danger }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 5, background: T.borderLight, borderRadius: 3 }}>
                    <div style={{ height: 5, borderRadius: 3, background: s.pct >= 95 ? T.success : s.pct >= 85 ? T.warning : T.danger, width: `${s.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Individuals Table */}
          {individuals.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: T.text }}>Individuals</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 12 }}>Click an adviser to see their individual performance</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Firm</th>
                        <th style={thStyle}>Role</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Cases</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Conv %</th>
                        <th style={{ ...thStyle, textAlign: "right" }}>Volume</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Doc Quality</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {individuals.map((ind, i) => (
                        <tr key={i} onClick={() => setSelectedIndividual(selectedIndividual === i ? null : i)}
                          style={{ cursor: "pointer", background: selectedIndividual === i ? T.primaryLight : "transparent", transition: "background 0.15s" }}
                          onMouseEnter={e => { if (selectedIndividual !== i) e.currentTarget.style.background = T.primaryLight; }}
                          onMouseLeave={e => { if (selectedIndividual !== i) e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ ...tdStyle, fontWeight: 600 }}>{ind.name}</td>
                          <td style={{ ...tdStyle, color: T.textSecondary, fontSize: 12 }}>{ind.firm}</td>
                          <td style={{ ...tdStyle, color: T.textSecondary }}>{ind.role}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{ind.cases}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>{ind.conversion}%</td>
                          <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{fmtVol(ind.volume)}</td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700, background: qualityBg(ind.docQuality), color: qualityColor(ind.docQuality) }}>
                              {ind.docQuality}%
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: "center", fontSize: 16, fontWeight: 700, color: trendColor(ind.trend) }}>{trendArrow(ind.trend)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Individual Detail Panel */}
      {individual && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{individual.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{individual.role}</span>
                <span style={{ fontSize: 11, color: T.textMuted }}>·</span>
                <span style={{ fontSize: 12, color: T.textSecondary, fontWeight: 500 }}>{individual.firm}</span>
                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: T.primaryLight, color: T.primary, fontWeight: 600 }}>
                  vs firm avg: {individual.conversion}% conv · {broker.conversion}% avg
                </span>
              </div>
            </div>
            <Btn small ghost onClick={() => setSelectedIndividual(null)}>Close</Btn>
          </div>

          {/* Individual KPIs */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 120, padding: "12px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Cases</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{individual.cases}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>of {broker.cases} firm total</div>
            </div>
            <div style={{ flex: 1, minWidth: 120, padding: "12px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Conversion</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: individual.conversion >= broker.conversion ? T.success : T.danger }}>{individual.conversion}%</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>firm avg {broker.conversion}%</div>
            </div>
            <div style={{ flex: 1, minWidth: 120, padding: "12px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Volume</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{fmtVol(individual.volume)}</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>of {fmtVol(broker.volume)} firm total</div>
            </div>
            <div style={{ flex: 1, minWidth: 120, padding: "12px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface }}>
              <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>Doc Quality</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: qualityColor(individual.docQuality) }}>{individual.docQuality}%</div>
              <div style={{ fontSize: 11, color: T.textMuted }}>firm avg {broker.docQuality}%</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {/* Monthly Submissions */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: T.text }}>Monthly Submissions</div>
              <BarChart data={individual.monthly} color={T.primary} height={90} />
            </div>

            {/* Recent Cases */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: T.text }}>Recent Cases</div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, padding: "6px 8px" }}>Ref</th>
                    <th style={{ ...thStyle, padding: "6px 8px" }}>Product</th>
                    <th style={{ ...thStyle, padding: "6px 8px", textAlign: "right" }}>Amount</th>
                    <th style={{ ...thStyle, padding: "6px 8px", textAlign: "center" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {individual.recentCases.map((c, i) => (
                    <tr key={i}>
                      <td style={{ ...tdStyle, padding: "8px 8px", fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>{c.ref}</td>
                      <td style={{ ...tdStyle, padding: "8px 8px", fontSize: 12, color: T.textSecondary }}>{c.product}</td>
                      <td style={{ ...tdStyle, padding: "8px 8px", fontSize: 12, textAlign: "right", fontWeight: 600 }}>{c.amount}</td>
                      <td style={{ ...tdStyle, padding: "8px 8px", textAlign: "center" }}>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, background: statusBg(c.status), color: statusColor(c.status) }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default BrokerScorecardScreen;
