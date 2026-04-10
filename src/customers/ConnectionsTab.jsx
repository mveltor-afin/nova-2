// ─────────────────────────────────────────────────────────────
// CONNECTIONS TAB — graph view of a customer's relationships
//
// Lives inside CustomerHub as the "Connections" tab. Renders the
// customer at the centre with three rings around them:
//   - Products (mortgages, savings, etc)
//   - Connected parties (joint applicants, brokers, solicitors,
//     employers, beneficiaries, advocates, accountants, etc)
//   - Integrations (Open Banking, Credit Bureau, Land Registry, etc)
//
// Click any node → right-side context panel shows that node's details.
// ─────────────────────────────────────────────────────────────
import { useMemo, useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card } from "../shared/primitives";
import {
  PRODUCTS, AI_ACTIONS, PRODUCT_TYPES,
  PARTIES_BY_CUSTOMER, PARTY_TYPES,
} from "../data/customers";

const INTEGRATIONS_BY_TYPE = {
  "Mortgage":           ["Open Banking","Credit Bureau","Land Registry","HMRC","E-Sign"],
  "Shared Ownership":   ["Open Banking","Credit Bureau","Land Registry","HMRC","E-Sign"],
  "Fixed Term Deposit": ["Open Banking","KYC","HMRC"],
  "Notice Account":     ["Open Banking","KYC","HMRC"],
  "Current Account":    ["Open Banking","KYC","HMRC"],
  "Insurance":          ["KYC","E-Sign"],
};
const INTEGRATION_META = {
  "Open Banking":  { color:"#3B82F6", icon:"dollar" },
  "Credit Bureau": { color:"#8B5CF6", icon:"shield" },
  "Land Registry": { color:"#0D9488", icon:"file" },
  "HMRC":          { color:"#DC2626", icon:"check" },
  "E-Sign":        { color:"#F59E0B", icon:"send" },
  "KYC":           { color:"#10B981", icon:"shield" },
};
const STATUS_COLORS = {
  active:   T.success,
  pending:  T.warning,
  inactive: T.textMuted,
  concern:  T.danger,
};

// ─────────────────────────────────────────────────────────────
// GRAPH MODEL
// ─────────────────────────────────────────────────────────────
function useGraphModel(customer) {
  return useMemo(() => {
    const products = PRODUCTS.filter(p =>
      [...customer.products, ...customer.pendingProducts].includes(p.id)
    );
    const parties = PARTIES_BY_CUSTOMER[customer.id] || [];
    const integrationSet = new Set();
    products.forEach(p => (INTEGRATIONS_BY_TYPE[p.type] || []).forEach(i => integrationSet.add(i)));
    const integrations = [...integrationSet];

    const cx = 360, cy = 270;
    const ringR = { product: 105, party: 195, integration: 275 };

    const placeRing = (items, type, startAngle = -Math.PI / 2) =>
      items.map((item, i) => {
        const angle = startAngle + (2 * Math.PI * i) / items.length;
        const r = ringR[type];
        return { ...item, nodeKind: type, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      });

    const productNodes = placeRing(
      products.map(p => ({
        id: p.id, label: p.product, kind: "product", type: p.type, status: p.status,
        statusKey: customer.pendingProducts.includes(p.id) ? "pending"
                  : p.status?.toLowerCase().includes("arrears") || p.status === "Locked" ? "concern"
                  : "active",
        color: PRODUCT_TYPES[p.type]?.color || T.primary,
        icon: PRODUCT_TYPES[p.type]?.icon || "products",
        ref: p,
      })), "product"
    );

    const partyNodes = placeRing(
      parties.map(p => ({
        id: p.id, label: p.name, kind: "party", type: p.type, statusKey: p.status,
        color: PARTY_TYPES[p.type]?.color || T.textMuted,
        icon: PARTY_TYPES[p.type]?.icon || "users",
        ref: p,
      })), "party"
    );

    const integrationNodes = placeRing(
      integrations.map(name => ({
        id: `INT-${name}`, label: name, kind: "integration", type: name,
        statusKey: customer.kyc === "Verified" ? "active" : customer.kyc === "Expired" ? "concern" : "pending",
        color: INTEGRATION_META[name]?.color || T.textMuted,
        icon: INTEGRATION_META[name]?.icon || "zap",
        ref: { name },
      })), "integration"
    );

    const customerNode = {
      id: customer.id, label: customer.name, kind: "customer",
      x: cx, y: cy, color: T.primary, icon: "customers",
      statusKey: customer.kyc === "Expired" ? "concern" : "active",
    };

    const edges = [];
    productNodes.forEach(p => edges.push({ from: customerNode, to: p, kind: "product" }));
    partyNodes.forEach(pa => {
      const linked = pa.ref.linkedProducts || [];
      linked.forEach(pid => {
        const target = productNodes.find(n => n.id === pid);
        if (target) edges.push({ from: target, to: pa, kind: "party" });
      });
      if (linked.length === 0) edges.push({ from: customerNode, to: pa, kind: "party" });
    });
    integrationNodes.forEach(intg => {
      productNodes.forEach(p => {
        if ((INTEGRATIONS_BY_TYPE[p.ref.type] || []).includes(intg.label)) {
          edges.push({ from: p, to: intg, kind: "integration" });
        }
      });
    });

    return { customerNode, productNodes, partyNodes, integrationNodes, edges };
  }, [customer]);
}

// ─────────────────────────────────────────────────────────────
// SVG GRAPH
// ─────────────────────────────────────────────────────────────
function CustomerGraph({ model, selectedId, onSelect }) {
  const { customerNode, productNodes, partyNodes, integrationNodes, edges } = model;
  const allNodes = [customerNode, ...productNodes, ...partyNodes, ...integrationNodes];

  const relatedIds = useMemo(() => {
    if (!selectedId) return new Set(allNodes.map(n => n.id));
    const set = new Set([selectedId]);
    edges.forEach(e => {
      if (e.from.id === selectedId) set.add(e.to.id);
      if (e.to.id === selectedId) set.add(e.from.id);
    });
    set.add(customerNode.id);
    return set;
  }, [selectedId, edges, customerNode.id]);

  const nodeRadius = (n) => n.kind === "customer" ? 36 : n.kind === "product" ? 26 : n.kind === "party" ? 22 : 18;

  return (
    <svg viewBox="0 0 720 560" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id="customerCenterGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={T.primary} />
          <stop offset="100%" stopColor={T.primaryDark || "#0F2A30"} />
        </radialGradient>
        <filter id="nodeGraphShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Ring guides */}
      {[105, 195, 275].map((r, i) => (
        <circle key={i} cx={360} cy={270} r={r} fill="none" stroke={T.borderLight} strokeWidth="0.7" strokeDasharray="2 4" />
      ))}

      {/* Edges */}
      {edges.map((e, i) => {
        const isRelated = !selectedId || (relatedIds.has(e.from.id) && relatedIds.has(e.to.id));
        const isHighlighted = selectedId && (e.from.id === selectedId || e.to.id === selectedId);
        return (
          <line key={i}
            x1={e.from.x} y1={e.from.y} x2={e.to.x} y2={e.to.y}
            stroke={isHighlighted ? T.primary : e.kind === "product" ? T.primary : e.kind === "party" ? "#7C3AED" : "#6B7280"}
            strokeWidth={isHighlighted ? 2 : 1}
            strokeDasharray={e.kind === "integration" ? "3 4" : ""}
            opacity={isRelated ? (isHighlighted ? 0.85 : 0.35) : 0.06}
          />
        );
      })}

      {/* Nodes */}
      {allNodes.map(n => {
        const isSelected = n.id === selectedId;
        const isRelated = relatedIds.has(n.id);
        const r = nodeRadius(n);
        return (
          <g key={n.id} transform={`translate(${n.x}, ${n.y})`} style={{ cursor: "pointer", transition: "opacity 0.2s" }}
             opacity={isRelated ? 1 : 0.18}
             onClick={() => onSelect(n)}>
            {n.statusKey && n.statusKey !== "active" && (
              <circle r={r + 4} fill="none" stroke={STATUS_COLORS[n.statusKey] || T.warning} strokeWidth="2" strokeDasharray={n.statusKey === "pending" ? "3 3" : ""} />
            )}
            {isSelected && <circle r={r + 7} fill="none" stroke={T.primary} strokeWidth="2.5" />}
            <circle r={r}
              fill={n.kind === "customer" ? "url(#customerCenterGrad)" : "#fff"}
              stroke={n.color}
              strokeWidth={n.kind === "customer" ? 0 : 2.5}
              filter="url(#nodeGraphShadow)" />
            {n.kind === "customer" && (
              <text textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize="14" fontWeight="800" fontFamily={T.font}>
                {n.label.split(/[\s&]+/).filter(Boolean).map(w => w[0]).join("").slice(0,2).toUpperCase()}
              </text>
            )}
            {n.kind !== "customer" && <circle r={r * 0.45} fill={n.color} opacity="0.9" />}
            <text textAnchor="middle" y={r + 14} fontSize={n.kind === "customer" ? "11" : "10"} fontWeight={isSelected ? 800 : 600} fill={T.text} fontFamily={T.font}>
              {n.label.length > 18 ? n.label.slice(0, 17) + "…" : n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CONTEXT PANEL — switches lens based on selected node kind
// ─────────────────────────────────────────────────────────────
const SectionTitle = ({ children, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 800, color: T.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 18, marginBottom: 8 }}>
    {icon && <span style={{ color: T.primary }}>{icon}</span>}
    {children}
  </div>
);

const Row = ({ label, value, accent }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${T.borderLight}`, fontSize: 13 }}>
    <span style={{ color: T.textMuted }}>{label}</span>
    <span style={{ fontWeight: 700, color: accent || T.text, textAlign: "right", maxWidth: "60%" }}>{value}</span>
  </div>
);

function CustomerLens({ customer }) {
  const actions = AI_ACTIONS[customer.id] || [];
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.primary, textTransform: "uppercase", letterSpacing: 0.5 }}>Customer</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginTop: 4 }}>{customer.name}</div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>{customer.id} · Since {customer.since}</div>

      <SectionTitle icon={Ico.shield(13)}>Identity</SectionTitle>
      <Row label="DOB" value={customer.dob} />
      <Row label="Email" value={customer.email} />
      <Row label="Phone" value={customer.phone} />
      <Row label="KYC" value={customer.kyc} accent={customer.kyc === "Verified" ? T.success : customer.kyc === "Expired" ? T.danger : T.warning} />

      <SectionTitle icon={Ico.chart(13)}>Risk & Value</SectionTitle>
      <Row label="Segment" value={customer.segment} />
      <Row label="Risk" value={`${customer.risk} (${customer.riskScore}/100)`} accent={customer.risk === "High" ? T.danger : customer.risk === "Medium" ? T.warning : T.success} />
      <Row label="Relationship Value" value={customer.ltv} accent={T.primary} />
      <Row label="Vulnerability" value={customer.vuln ? "Flagged" : "None"} accent={customer.vuln ? T.danger : T.success} />

      {actions.length > 0 && (
        <>
          <SectionTitle icon={Ico.sparkle(13)}>AI Actions ({actions.length})</SectionTitle>
          {actions.map((a, i) => (
            <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: T.bg, marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: a.priority === "Critical" ? T.danger : a.priority === "High" ? T.warning : T.primary, textTransform: "uppercase", marginBottom: 4 }}>{a.priority}</div>
              <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{a.action}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function ProductLens({ product }) {
  const isMortgage = product.type === "Mortgage";
  const isFTD = product.type === "Fixed Term Deposit";
  const isNotice = product.type === "Notice Account";
  const isInsurance = product.type === "Insurance";
  const isSO = product.type === "Shared Ownership";
  const isCA = product.type === "Current Account";
  const inArrears = !!product.arrears;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: PRODUCT_TYPES[product.type]?.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{product.type}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginTop: 4 }}>{product.product}</div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>{product.id} · {product.status}</div>

      {inArrears && (
        <div style={{ padding: "10px 12px", background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: T.danger }}>{Ico.alert(14)}</span>
          <div style={{ fontSize: 12, color: T.danger, fontWeight: 700 }}>In arrears: {product.arrears}</div>
        </div>
      )}

      <SectionTitle icon={Ico.dollar(13)}>Key Figures</SectionTitle>
      {(isMortgage || isFTD || isNotice || isCA) && <Row label="Balance" value={product.balance} accent={T.primary} />}
      {(isMortgage || isFTD || isNotice) && <Row label="Rate" value={product.rate} />}
      {isMortgage && <>
        <Row label="LTV" value={product.ltv} />
        <Row label="Monthly Payment" value={product.payment} />
        <Row label="Next Payment" value={product.nextPayment} accent={product.nextPayment === "OVERDUE" ? T.danger : T.text} />
        <Row label="Rate End" value={product.rateEnd} />
        <Row label="Term" value={product.term} />
      </>}
      {isFTD && <>
        <Row label="Principal" value={product.principal} />
        <Row label="Maturity" value={product.maturity} />
        <Row label="Interest Earned" value={product.interestEarned} accent={T.success} />
      </>}
      {isNotice && <Row label="Notice Period" value={product.noticePeriod} />}
      {isCA && <>
        <Row label="Sort Code" value={product.sortCode} />
        <Row label="Account No" value={product.accountNo} />
      </>}
      {isInsurance && <>
        <Row label="Cover" value={product.cover} />
        <Row label="Premium" value={product.premium} />
        <Row label="Provider" value={product.provider} />
      </>}
      {isSO && <>
        <Row label="Share" value={product.share} />
        <Row label="Owned Value" value={product.ownedValue} accent={T.primary} />
        <Row label="Rent" value={product.rent} />
        <Row label="Housing Assoc" value={product.housingAssoc} />
      </>}
    </div>
  );
}

function PartyLens({ party }) {
  const meta = PARTY_TYPES[party.type] || {};
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: "uppercase", letterSpacing: 0.5 }}>{meta.label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginTop: 4 }}>{party.name}</div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>{party.role}</div>

      <SectionTitle icon={Ico.users(13)}>Details</SectionTitle>
      <Row label="Status" value={party.status} accent={STATUS_COLORS[party.status] || T.text} />
      <Row label="Contact" value={party.contact} />
      <Row label="Linked Since" value={party.since} />
      <Row label="Linked Products" value={party.linkedProducts?.length ? party.linkedProducts.join(", ") : "—"} />

      <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        <Btn small primary icon="send">Email</Btn>
        <Btn small ghost icon="messages">Log Contact</Btn>
        {party.type === "advocate" && <Btn small ghost icon="alert">Vulnerability Notes</Btn>}
      </div>
    </div>
  );
}

function IntegrationLens({ integration, customer }) {
  const meta = INTEGRATION_META[integration.name] || {};
  const verified = customer.kyc === "Verified";
  const expired = customer.kyc === "Expired";
  const status = verified ? "Connected" : expired ? "Expired" : "Pending";
  const statusColor = verified ? T.success : expired ? T.danger : T.warning;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: meta.color, textTransform: "uppercase", letterSpacing: 0.5 }}>Integration</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginTop: 4 }}>{integration.name}</div>
      <div style={{ fontSize: 12, color: T.textMuted, marginBottom: 14 }}>External system link</div>

      <SectionTitle icon={Ico.zap(13)}>Status</SectionTitle>
      <Row label="State" value={status} accent={statusColor} />
      <Row label="Last Sync" value={verified ? "2h ago" : expired ? "Expired" : "—"} />
      <Row label="Coverage" value="All applicable products" />

      <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
        <Btn small primary icon="zap">Refresh</Btn>
        <Btn small ghost icon="file">View Audit</Btn>
        {expired && <Btn small icon="alert">Re-verify</Btn>}
      </div>
    </div>
  );
}

function ContextPanel({ selected, customer }) {
  if (!selected || selected.kind === "customer") return <CustomerLens customer={customer} />;
  if (selected.kind === "product") return <ProductLens product={selected.ref} />;
  if (selected.kind === "party") return <PartyLens party={selected.ref} />;
  if (selected.kind === "integration") return <IntegrationLens integration={selected.ref} customer={customer} />;
  return null;
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function ConnectionsTab({ customer }) {
  const model = useGraphModel(customer);
  const [selected, setSelected] = useState(model.customerNode);

  const counts = {
    products: model.productNodes.length,
    parties: model.partyNodes.length,
    integrations: model.integrationNodes.length,
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Relationship Network</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>
            {counts.products} products · {counts.parties} connected parties · {counts.integrations} integrations
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11, color: T.textMuted, alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 5, background: T.primary }} /> Customer</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 5, background: PRODUCT_TYPES.Mortgage.color }} /> Products</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 5, background: "#7C3AED" }} /> Parties</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 9, height: 9, borderRadius: 5, background: "#6B7280" }} /> Integrations</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.primary, cursor: "pointer", marginLeft: 8 }} onClick={() => setSelected(model.customerNode)}>Reset ↺</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
        {/* Graph */}
        <Card noPad style={{ flex: 1.4, minWidth: 0, height: 600, overflow: "hidden", padding: 0 }}>
          <CustomerGraph model={model} selectedId={selected?.id} onSelect={setSelected} />
        </Card>

        {/* Context panel */}
        <Card style={{ flex: 1, maxWidth: 420, height: 600, overflowY: "auto", padding: "20px 22px" }}>
          <ContextPanel selected={selected} customer={customer} />
        </Card>
      </div>
    </div>
  );
}
