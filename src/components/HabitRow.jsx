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

import { Calendar365 } from "./Calender";

import { StatBar } from "./StatBar";

import { LogPanel } from "./LoggingPanel";

export function HabitRow({ habit, habitIndex, onLog, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const color = getHabitColor(habitIndex);

  const loggedToday = isCompletedOn(habit, TODAY);
  const dueToday = isHabitDueOn(habit, TODAY);

  // Decide what date to log.
  const dateToLog = dueToday && !loggedToday ? TODAY : null;

  const canLog = dateToLog !== null;

  function handleConfirmLog(effort, fulfillment) {
    onLog(habit.id, dateToLog, effort, fulfillment);
    setIsLogging(false);
  }

  const momentum = calculateMomentum(habit);
  const consistency = calculateConsistency(habit);

  return (
    <div style={{ borderBottom: "1px solid #1a1a1a" }}>
      {/* main habit row*/}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 24px",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 3,
            height: 38,
            backgroundColor: color,
            borderRadius: 2,
            flexShrink: 0,
          }}
        />

        {/* habit expands to stats */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          style={{ flex: 1, cursor: "pointer" }}
        >
          <div style={{ fontSize: 18, fontWeight: 400, marginBottom: 3 }}>
            {habit.name}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#484848",
              fontFamily: "'Iceberg', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            {formatFrequency(habit.frequency)} ·{" "}
            {habit.type === "positive" ? "Build" : "Break"}
          </div>
        </div>

        {/* logging indicator*/}
        {loggedToday ? (
          <span
            style={{
              fontFamily: "'Iceberg', sans-serif",
              fontSize: 10,
              color: color,
              letterSpacing: "0.15em",
            }}
          >
            Accomplished
          </span>
        ) : canLog ? (
          <button
            title="Log for today"
            onClick={() => setIsLogging((prev) => !prev)}
            style={{
              padding: "8px 20px",
              border: `1px solid ${isLogging ? "#444" : "#2a2a2a"}`,
              borderRadius: 4,
              backgroundColor: "#1a1a1a",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.15em",
              color: isLogging ? "#555" : "#999",
              transition: "all 0.15s",
            }}
          >
            {isLogging ? "CANCEL" : "LOG"}
          </button>
        ) : (
          <span
            style={{
              fontFamily: "'Iceberg', sans-serif",
              fontSize: 10,
              color: "#2a2a2a",
              letterSpacing: "0.12em",
            }}
          >
            NOT DUE
          </span>
        )}
        <button
          title = "Delete this habit"
          onClick = {() => onDelete(habit.id)}
          style={{
            padding: "8px 20px",
            border: `1px solid ${isLogging ? "#444" : "#2a2a2a"}`,
            borderRadius: 4,
            backgroundColor: "#1a1a1a",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.15em",
            color: isLogging ? "#555" : "#999",
            transition: "all 0.15s",
          }}
        >
          ✕
        </button>
        {/* expand the menu */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          style={{
            color: "#333",
            fontSize: 12,
            cursor: "pointer",
            userSelect: "none",
            transform: isExpanded ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        >
          ▾
        </div>
      </div>

      {/* logging panel */}
      {isLogging && (
        <LogPanel
          habitColor={color}
          onConfirm={handleConfirmLog}
          onCancel={() => setIsLogging(false)}
        />
      )}

      {/* expanded stats bars */}
      {isExpanded && (
        <div
          style={{
            padding: "22px 24px 28px",
            borderTop: "1px solid #1a1a1a",
            background: "#0d0d0d",
          }}
        >
          <Calendar365 habit={habit} habitColor={color} />

          <div style={{ marginTop: 26 }}>
            <StatBar
              label="Momentum"
              value={momentum}
              maxValue={Math.max(momentum, 30)}
              displayValue={momentum}
              color={color}
            />
            <StatBar
              label="All-time consistency"
              value={consistency}
              maxValue={100}
              displayValue={`${consistency}%`}
              color={color}
            />
          </div>
        </div>
      )}
    </div>
  );
}
