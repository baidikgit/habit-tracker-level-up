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
      color: isActive ? habitColor : "#aaaaaa",
      transition: "all 0.1s",
      cursor: "pointer",
    };
  }

  return (
    <div className="pt-[20px] px-[24px] pb-[24px] border-t border-[#1a1a1a] bg-[#0f0f0f] shadow-[inset_1px_1px_1px_1px_#050505,inset_-1px_-1px_1px_1px_#1a1a1a]">
      {/* effort markers*/}
      <div className="mb-[20px]">
        <div className="text-[10px] text-[#C9C9C9] tracking-[0.18em] uppercase font-iceberg mb-[10px]">
          How easy was it?
        </div>

        <div className="flex gap-[8px] items-center ">
          {[1, 2, 3, 4, 5].map((number) => (
            <button
              key={number}
              onClick={() => setEffort(number)}
              title={EFFORT_LABELS[number - 1]}
              style={{
                ...activeButtonStyle(effort === number),
              }}
              className={`w-10 h-10 text-[15px] font-medium rounded transition-all ${effort === number ? "border" : "border border-[#2e2e2e] bg-[#1a1a1a] text-[#555]"} hover:brightness-125 hover:border-gray-500`}
            >
              {number}
            </button>
          ))}
          <span className="text-[10px] text-[#888888] ml-[4px] font-iceberg">
            Brutal → Effortless
          </span>
        </div>
      </div>

      {/* fulfillments */}
      <div className="mb-[22px]">
        <div className="text-[10px] text-[#C9C9C9] tracking-[0.18em] uppercase font-iceberg mb-[10px]">
          How well do you think you did?
        </div>

        <div className="flex gap-[8px]">
          {FULFILLMENT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFulfillment(value)}
              className="py-[8px] px-[18px] text-[13px] hover:brightness-125 hover:border-gray-500"
              style={{
                ...activeButtonStyle(fulfillment === value),
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-[10px]">
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
          className="py-[9px] px-[18px] border border-[#2a2a2a] rounded-[4px] text-[13px] text-[#555]"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
