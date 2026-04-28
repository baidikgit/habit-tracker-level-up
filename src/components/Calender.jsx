import { useState } from "react";
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

import { GLOBAL_CSS } from "./styling";

export function Calendar365({ habit, habitColor }) {
  const rgbColor = hexToRgbString(habitColor);

  const firstDayOfWeek = new Date(ALL_365_DAYS[0] + "T12:00:00").getDay(); // 0=Sun
  const paddedDays = [...Array(firstDayOfWeek).fill(null), ...ALL_365_DAYS];

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
      return "#1a1a1a"; // not a due day — near-invisible background
    }
    if (log?.completed) {
      const opacity = fulfillmentToOpacity(log.fulfillment);
      return `rgba(${rgbColor}, ${opacity})`; // habit color shaded by fulfillment
    }
    if (day < TODAY) {
      return "#2a2a2a"; // due but missed
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
        {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
          <div
            key={index}
            style={{
              height: 13,
              width: 10,
              fontSize: 9,
              color: "#444",
              fontFamily: "'Iceberg', sans-serif",
              lineHeight: "13px",
              textAlign: "right",
            }}
          >
            {label}
          </div>
        ))}
      </div>
      {/*horizontal scrolling*/}
      <div style={{ overflowX: "auto", paddingBottom: 4 }}>
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
                    width: 13,
                    height: 13,
                    borderRadius: 2,
                    backgroundColor: getCellColor(day),
                    outline: day === TODAY ? "1px solid #666" : "none",
                    outlineOffset: 1,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
