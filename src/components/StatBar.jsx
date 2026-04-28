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

export function StatBar({ label, value, maxValue, displayValue, color }) {
  const fillPercent = Math.min((value / maxValue) * 100, 100);

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 6,
          fontSize: 10,
          color: "#484848",
          fontFamily: "'Iceberg', sans-serif",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#888" }}>{displayValue}</span>
      </div>

      <div style={{ height: 2, background: "#1e1e1e", borderRadius: 2 }}>
        <div
          style={{
            height: "100%",
            width: `${fillPercent}%`,
            backgroundColor: color,
            borderRadius: 2,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
}