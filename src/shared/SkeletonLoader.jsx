import React from "react";
import { T } from "./tokens";

const shimmerStyle = {
  background: `linear-gradient(90deg, ${T.borderLight} 0px, ${T.bg} 40px, ${T.borderLight} 80px)`,
  backgroundSize: "200px 100%",
  backgroundRepeat: "no-repeat",
  animation: "novaShimmer 1.4s infinite linear",
  borderRadius: 6,
};

const Bar = ({ w = "100%", h = 12, style = {} }) => (
  <div style={{ ...shimmerStyle, width: w, height: h, ...style }} />
);

const CardSkeleton = () => (
  <div
    style={{
      background: T.card,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 14,
      padding: 20,
      minHeight: 180,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
      <div style={{ ...shimmerStyle, width: 40, height: 40, borderRadius: "50%" }} />
      <div style={{ flex: 1 }}>
        <Bar w="60%" h={12} style={{ marginBottom: 8 }} />
        <Bar w="40%" h={10} />
      </div>
    </div>
    <Bar w="100%" h={10} style={{ marginBottom: 8 }} />
    <Bar w="92%" h={10} style={{ marginBottom: 8 }} />
    <Bar w="70%" h={10} style={{ marginBottom: 20 }} />
    <div style={{ display: "flex", gap: 10, borderTop: `1px solid ${T.borderLight}`, paddingTop: 14 }}>
      <Bar w={70} h={24} style={{ borderRadius: 8 }} />
      <Bar w={70} h={24} style={{ borderRadius: 8 }} />
    </div>
  </div>
);

const RowSkeleton = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "2fr 1.5fr 1fr",
      gap: 20,
      alignItems: "center",
      padding: "14px 18px",
      background: T.card,
      borderBottom: `1px solid ${T.borderLight}`,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ ...shimmerStyle, width: 32, height: 32, borderRadius: "50%" }} />
      <Bar w="70%" h={11} />
    </div>
    <Bar w="80%" h={11} />
    <Bar w="60%" h={11} />
  </div>
);

const KpiSkeleton = () => (
  <div
    style={{
      background: T.card,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 12,
      padding: "18px 20px",
      flex: 1,
      minWidth: 160,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        ...shimmerStyle,
        borderRadius: 0,
      }}
    />
    <Bar w="50%" h={9} style={{ marginBottom: 12, marginTop: 4 }} />
    <Bar w="70%" h={24} style={{ marginBottom: 8 }} />
    <Bar w="40%" h={10} />
  </div>
);

const ListSkeleton = () => (
  <div
    style={{
      background: T.card,
      border: `1px solid ${T.borderLight}`,
      borderRadius: 12,
      padding: 16,
    }}
  >
    {[0, 1, 2, 3, 4].map((i) => (
      <div
        key={i}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 0",
          borderBottom: i < 4 ? `1px solid ${T.borderLight}` : "none",
        }}
      >
        <div style={{ ...shimmerStyle, width: 28, height: 28, borderRadius: "50%" }} />
        <Bar w={`${50 + ((i * 13) % 40)}%`} h={11} />
      </div>
    ))}
  </div>
);

const TextSkeleton = ({ count = 3 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <Bar
        key={i}
        w={i === count - 1 ? "65%" : "100%"}
        h={11}
        style={{ marginBottom: 10 }}
      />
    ))}
  </div>
);

function SkeletonLoader({ type = "card", count = 1 }) {
  const renderOne = (i) => {
    switch (type) {
      case "row":
        return <RowSkeleton key={i} />;
      case "kpi":
        return <KpiSkeleton key={i} />;
      case "list":
        return <ListSkeleton key={i} />;
      case "text":
        return <TextSkeleton key={i} count={count} />;
      case "card":
      default:
        return <CardSkeleton key={i} />;
    }
  };

  const items =
    type === "text"
      ? [renderOne(0)]
      : Array.from({ length: count || 1 }).map((_, i) => renderOne(i));

  return (
    <>
      <style>{`
        @keyframes novaShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>
      <div style={{ fontFamily: T.font }}>{items}</div>
    </>
  );
}

export default SkeletonLoader;
