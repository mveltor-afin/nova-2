import { useState } from "react";
import { T, Ico } from "../shared/tokens";
import { Btn, Card, KPICard } from "../shared/primitives";

const EVENTS = [
  { date: 10, month: 3, year: 2026, name: "PRA110 submission", type: "Regulatory", color: "#3B82F6", owner: "Sarah Chen", status: "Due" },
  { date: 15, month: 3, year: 2026, name: "MLAR quarterly return", type: "Regulatory", color: "#3B82F6", owner: "James Thornton", status: "Due" },
  { date: 18, month: 3, year: 2026, name: "Board risk committee", type: "Governance", color: "#8B5CF6", owner: "Claire Morgan", status: "In Progress" },
  { date: 22, month: 3, year: 2026, name: "Consumer Duty review", type: "Audit", color: "#31B897", owner: "Amir Khan", status: "Due" },
  { date: 25, month: 3, year: 2026, name: "Internal audit — KYC processes", type: "Audit", color: "#FFBF00", owner: "Rebecca Lewis", status: "In Progress" },
  { date: 28, month: 3, year: 2026, name: "FCA complaints return", type: "Regulatory", color: "#3B82F6", owner: "Sarah Chen", status: "Due" },
  { date: 30, month: 3, year: 2026, name: "Annual policy review deadline", type: "Policy", color: "#FF6B61", owner: "Claire Morgan", status: "Overdue" },
  // May events for upcoming deadlines
  { date: 5, month: 4, year: 2026, name: "AML transaction monitoring review", type: "Regulatory", color: "#3B82F6", owner: "Amir Khan", status: "Due" },
  { date: 12, month: 4, year: 2026, name: "Operational resilience self-assessment", type: "Governance", color: "#8B5CF6", owner: "James Thornton", status: "Due" },
];

const TYPE_COLORS = {
  Regulatory: { bg: "#DBEAFE", text: "#1E40AF" },
  Governance: { bg: "#EDE9FE", text: "#5B21B6" },
  Audit: { bg: "#D1FAE5", text: "#065F46" },
  Policy: { bg: "#FEE2E2", text: "#991B1B" },
};

const STATUS_STYLES = {
  Due: { bg: "#DBEAFE", text: "#1E40AF" },
  "In Progress": { bg: "#FEF3C7", text: "#92400E" },
  Completed: { bg: "#D1FAE5", text: "#065F46" },
  Overdue: { bg: "#FEE2E2", text: "#991B1B" },
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(month, year) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month, year) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

export default function ComplianceCalendar() {
  const [currentMonth, setCurrentMonth] = useState(3); // April (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState(null);

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const eventsForMonth = EVENTS.filter(e => e.month === currentMonth && e.year === currentYear);
  const eventsForDate = selectedDate
    ? EVENTS.filter(e => e.date === selectedDate && e.month === currentMonth && e.year === currentYear)
    : [];

  const today = new Date();
  const upcomingDeadlines = EVENTS.filter(e => {
    const eventDate = new Date(e.year, e.month, e.date);
    const thirtyDaysFromNow = new Date(currentYear, currentMonth, 1);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 60);
    return eventDate >= new Date(currentYear, currentMonth, 1) && eventDate <= thirtyDaysFromNow;
  }).sort((a, b) => {
    const da = new Date(a.year, a.month, a.date);
    const db = new Date(b.year, b.month, b.date);
    return da - db;
  });

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  return (
    <div style={{ fontFamily: T.font, color: T.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: T.navy }}>Compliance Calendar</h1>
        </div>
        <Btn primary icon="plus">Add Event</Btn>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        <KPICard label="Due This Month" value="4" color={T.primary} sub="Regulatory submissions" />
        <KPICard label="Overdue" value="1" color={T.danger} sub="Annual policy review" />
        <KPICard label="Completed YTD" value="18" color={T.success} sub="On-time rate: 94%" />
        <KPICard label="Next Deadline" value="15 Apr" color={T.warning} sub="MLAR quarterly return" />
      </div>

      {/* Calendar */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <Btn ghost onClick={prevMonth}>{Ico.arrowLeft(16)} Previous</Btn>
          <span style={{ fontSize: 18, fontWeight: 700 }}>{MONTHS[currentMonth]} {currentYear}</span>
          <Btn ghost onClick={nextMonth}>Next {Ico.arrow(16)}</Btn>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 4 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: T.textMuted, padding: "8px 0", textTransform: "uppercase", letterSpacing: 0.5 }}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1 }}>
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - firstDay + 1;
            const isValid = dayNum >= 1 && dayNum <= daysInMonth;
            const dayEvents = isValid ? eventsForMonth.filter(e => e.date === dayNum) : [];
            const isSelected = selectedDate === dayNum && isValid;
            const isToday = isValid && dayNum === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

            return (
              <div
                key={i}
                onClick={() => isValid && dayEvents.length > 0 && setSelectedDate(dayNum)}
                style={{
                  minHeight: 70, padding: 6, borderRadius: 8,
                  background: isSelected ? T.primaryLight : isToday ? "#F0FDF4" : isValid ? "#FAFAF8" : "transparent",
                  border: isSelected ? `2px solid ${T.primary}` : isToday ? "2px solid #31B897" : "1px solid transparent",
                  cursor: isValid && dayEvents.length > 0 ? "pointer" : "default",
                  opacity: isValid ? 1 : 0.3,
                }}
              >
                {isValid && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 500, color: isToday ? T.primary : T.text, marginBottom: 4 }}>{dayNum}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {dayEvents.map((ev, ei) => (
                        <div key={ei} style={{ width: "100%", padding: "2px 4px", borderRadius: 3, background: ev.color + "22", borderLeft: `3px solid ${ev.color}`, fontSize: 9, fontWeight: 600, color: ev.color, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ev.name}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Event detail panel */}
      {eventsForDate.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{selectedDate} {MONTHS[currentMonth]} {currentYear}</h3>
            <Btn ghost small onClick={() => setSelectedDate(null)}>{Ico.x(14)} Close</Btn>
          </div>
          {eventsForDate.map((ev, i) => {
            const typeStyle = TYPE_COLORS[ev.type] || { bg: "#E5E7EB", text: "#374151" };
            const statusStyle = STATUS_STYLES[ev.status] || { bg: "#E5E7EB", text: "#374151" };
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: 14, borderRadius: 10, background: "#FAFAF8", border: `1px solid ${T.borderLight}`, marginBottom: i < eventsForDate.length - 1 ? 8 : 0 }}>
                <div style={{ width: 4, height: 40, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{ev.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: typeStyle.bg, color: typeStyle.text }}>{ev.type}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: statusStyle.bg, color: statusStyle.text }}>{ev.status}</span>
                    <span style={{ fontSize: 11, color: T.textMuted }}>Owner: {ev.owner}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Upcoming deadlines */}
      <Card>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>{Ico.clock(18)} Upcoming Deadlines (next 30 days)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {upcomingDeadlines.map((ev, i) => {
            const typeStyle = TYPE_COLORS[ev.type] || { bg: "#E5E7EB", text: "#374151" };
            const statusStyle = STATUS_STYLES[ev.status] || { bg: "#E5E7EB", text: "#374151" };
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 10, background: "#FAFAF8", border: `1px solid ${T.borderLight}` }}>
                <div style={{ minWidth: 48, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.primary }}>{ev.date}</div>
                  <div style={{ fontSize: 10, color: T.textMuted, fontWeight: 600 }}>{MONTHS[ev.month].slice(0, 3)}</div>
                </div>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ev.name}</div>
                  <div style={{ fontSize: 11, color: T.textMuted }}>Owner: {ev.owner}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: typeStyle.bg, color: typeStyle.text }}>{ev.type}</span>
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: statusStyle.bg, color: statusStyle.text }}>{ev.status}</span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
