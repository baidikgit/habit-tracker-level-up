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

import { GLOBAL_CSS } from "./styling";

import {
  HABIT_COLOR_PALETTE,
  hexToRgbString,
  getHabitColor,
  fulfillmentToOpacity,
} from "./colourFunctions";

export function LogPanel({ habitColor, onConfirm, onCancel }) {
  const [effort, setEffort] = useState(null);
  const [fulfillment, setFulfillment] = useState(null);

  const rgbColor = hexToRgbString(habitColor);
  const canConfirm = effort !== null && fulfillment !== null;

  const EFFORT_LABELS = ["Brutal", "Hard", "Moderate", "Easy", "Effortless"];
  const FULFILLMENT_OPTIONS = [
    { value: 1, label: "Subpar" },
    { value: 2, label: "Average" },
    { value: 3, label: "Splendid" },
  ];

  function activeButtonStyle(isActive) {
    return {
      border: isActive ? `1px solid ${habitColor}` : "1px solid #2e2e2e",
      borderRadius: 4,
      backgroundColor: isActive ? `rgba(${rgbColor}, 0.15)` : "#1a1a1a",
      color: isActive ? habitColor : "#555",
      transition: "all 0.1s",
      cursor: "pointer",
    };
  }

  return (
    <div
      style={{
        padding: "20px 24px 24px",
        borderTop: "1px solid #1a1a1a",
        background: "#0f0f0f",
      }}
    >
      {/* effort markers*/}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontFamily: "'Iceberg', sans-serif",
            marginBottom: 10,
          }}
        >
          How hard was it?
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              onClick={() => setEffort(number)}
              title={EFFORT_LABELS[number - 1]}
              style={{
                ...activeButtonStyle(effort === number),
                width: 40,
                height: 40,
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              {number}
            </button>
          ))}
          <span
            style={{
              fontSize: 10,
              color: "#333",
              marginLeft: 4,
              fontFamily: "'Iceberg', sans-serif",
            }}
          >
            Brutal → Effortless
          </span>
        </div>
      </div>

      {/* fulfillments */}
      <div style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            fontFamily: "'Iceberg', sans-serif",
            marginBottom: 10,
          }}
        >
          How well do you think you did that?
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {FULFILLMENT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFulfillment(value)}
              style={{
                ...activeButtonStyle(fulfillment === value),
                padding: "8px 18px",
                fontSize: 13,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => canConfirm && onConfirm(effort, fulfillment)}
          disabled={!canConfirm}
          style={{
            padding: "9px 26px",
            backgroundColor: canConfirm ? habitColor : "#1a1a1a",
            color: canConfirm ? "#000" : "#333",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.04em",
            transition: "all 0.15s",
          }}
        >
          Log
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "9px 18px",
            border: "1px solid #2a2a2a",
            borderRadius: 4,
            fontSize: 13,
            color: "#555",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
