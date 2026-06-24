import { useRef, useEffect, useState } from "react";
import {
  toDateString,
  TODAY,
  ALL_365_DAYS,
  formatFrequency,
} from "./dateFunctions";

import {
  isHabitDueOn,
  getLogForDate,
  isCompletedOn,
  calculateMomentum,
  calculateConsistency,
} from "./statFunctions";

import {
  HABIT_COLOR_PALETTE,
  hexToRgbString,
  getHabitColor,
  fulfillmentToOpacity,
} from "./colourFunctions";

//import { GLOBAL_CSS } from "./styling";

export function Calendar365({ habit, habitColor }) {
  const scrollRef = useRef(null);
  const rgbColor = hexToRgbString(habitColor);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, []);

  const firstDayOfWeek = new Date(ALL_365_DAYS[0] + "T12:00:00").getDay(); // 0=Sun
  const mondayBasedPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const paddedDays = [...Array(mondayBasedPadding).fill(null), ...ALL_365_DAYS];

  // Split into week columns
  const weeks = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  function getCellColor(day) {
    if (day === null) return "transparent";

    const isDue = isHabitDueOn(habit, day);
    const log = getLogForDate(habit, day);

    if (!isDue) {
      return "#1a1a1ab0"; // not a due day — near-invisible background
    }
    if (log?.completed) {
      const opacity = fulfillmentToOpacity(log.fulfillment);
      return `rgba(${rgbColor}, ${opacity})`; // habit color shaded by fulfillment
    }
    if (day < TODAY) {
      return "#363636"; // due but missed
    }
    return "#1e1e1e"; // due today, not yet logged
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          flexShrink: 0,
        }}
      >
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
          (label, index) => (
            <div
              key={index}
              style={{
                paddingTop: 10,
                height: 15,
                width: 10,
                fontSize: 8,
                color: "#a0a0a0",
                fontFamily: "'Iceberg', sans-serif",
                lineHeight: "13px",
                textAlign: "right",
              }}
            >
              {label}
            </div>
          ),
        )}
      </div>
      {/*horizontal scrolling*/}
      <div
        ref={scrollRef}
        style={{ overflowX: "auto", paddingBottom: 4, paddingTop: 8 }}
      >
        <div style={{ display: "flex", gap: 3 }}>
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              style={{ display: "flex", flexDirection: "column", gap: 3 }}
            >
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  title={day ?? ""}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 1,
                    backgroundColor: getCellColor(day),
                    outline: day === TODAY ? "1px solid #666" : "none",
                    outlineOffset: 1,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
          <div style={{ width: 5, flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
