import { useState } from "react";
import {
  toDateString,
  TODAY,
  YESTERDAY,
  ALL_365_DAYS,
  formatFrequency,
  isHabitDueOn,
  getLogForDate,
  isCompletedOn,
} from "./components/dateFunctions";

import {
  calculateMomentum,
  calculateConsistency,
} from "./components/statFunctions";


//css
const GLOBAL_CSS = `
  
  @import url('https://fonts.googleapis.com/css2?family=Iceberg&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Oswald:wght@200..700&display=swap');
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background:  #111111;
    color:       #e0e0e0;
    font-family: "Iceberg", sans-serif;
    font-weight: 400;
    font-style: normal;
    min-height:  100vh;
  }

  button {
    cursor:      pointer;
    font-family: inherit;
    color:       inherit;
    border:      none;
    background:  none;
  }

  input, select {
    font-family: inherit;
    color:       inherit;
  }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #1a1a1a; }
  ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
`;

//every habit gets a solid pure colour. maybe will add more than 8 later.

const HABIT_COLOR_PALETTE = [
  "#22c55e", // green
  "#2273f6", // blue
  "#f97316", // orange
  "#823cc4", // purple
  "#eb3590", // pink
  "#13b4a1", // teal
  "#eab308", // yellow
  "#ef4444", // red
];

function getHabitColor(habitIndex) {
  return HABIT_COLOR_PALETTE[habitIndex % HABIT_COLOR_PALETTE.length];
}

// Convert #rrggbb to "r, g, b" so it can be used inside rgba(...)
function hexToRgbString(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// fullfilment opacity decider
function fulfillmentToOpacity(fulfillment) {
  if (fulfillment === 1) return 0.3;
  if (fulfillment === 2) return 0.6;
  if (fulfillment === 3) return 1.0;
  return 0;
}

//leetcode consistency grid
function Calendar365({ habit, habitColor }) {
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

//stats bars

function StatBar({ label, value, maxValue, displayValue, color }) {
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

//logging panel

function LogPanel({ habitColor, onConfirm, onCancel }) {
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

//Habit rows

function HabitRow({ habit, habitIndex, onLog }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const color = getHabitColor(habitIndex);

  const loggedToday = isCompletedOn(habit, TODAY);
  const dueToday = isHabitDueOn(habit, TODAY);
  const dueYesterday = isHabitDueOn(habit, YESTERDAY);
  const loggedYesterday = isCompletedOn(habit, YESTERDAY);

  // Decide what date to log. Allow today (primary) or yesterday (1-day backdating)
  const dateToLog =
    dueToday && !loggedToday
      ? TODAY
      : dueYesterday && !loggedYesterday
        ? YESTERDAY
        : null;

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
            {dateToLog === YESTERDAY && "  ·  logging yesterday"}
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

function AddHabitModal({ onSave, onClose }) {
  const [name, setName] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [customDays, setCustomDays] = useState(2);
  const [type, setType] = useState("positive");

  function handleSave() {
    if (!name.trim()) return;

    const frequencyValue =
      frequency === "custom"
        ? { type: "custom", every: Math.max(2, customDays) }
        : frequency;

    onSave({ name: name.trim(), frequency: frequencyValue, type });
    onClose();
  }

  // Shared styles used multiple times
  const fieldLabelStyle = {
    display: "block",
    fontSize: 10,
    color: "#484848",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontFamily: "'Iceberg', sans-serif",
    marginBottom: 8,
  };

  const textInputStyle = {
    width: "100%",
    padding: "10px 12px",
    background: "#1a1a1a",
    border: "1px solid #2e2e2e",
    borderRadius: 4,
    fontSize: 16,
    color: "#e0e0e0",
    outline: "none",
  };

  function SegmentButton({ value, currentValue, onSelect, children }) {
    const isActive = currentValue === value;
    return (
      <button
        onClick={() => onSelect(value)}
        style={{
          flex: 1,
          padding: "9px 0",
          border: isActive ? "1px solid #555" : "1px solid #252525",
          borderRadius: 4,
          background: isActive ? "#252525" : "#141414",
          color: isActive ? "#ddd" : "#444",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: "0.04em",
          transition: "all 0.15s",
        }}
      >
        {children}
      </button>
    );
  }

  return (
    // Clicking the backdrop closes the modal
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      {/* Clicking inside the modal does not close it */}
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          background: "#161616",
          border: "1px solid #2a2a2a",
          borderRadius: 8,
          padding: "36px",
          width: 440,
          maxWidth: "92vw",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 400, marginBottom: 28 }}>
          New Habit
        </div>

        {/* Name */}
        <div style={{ marginBottom: 20 }}>
          <label style={fieldLabelStyle}>Name</label>
          <input
            autoFocus
            style={textInputStyle}
            placeholder="e.g. Morning Run"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSave()}
          />
        </div>

        {/* Frequency */}
        <div style={{ marginBottom: 20 }}>
          <label style={fieldLabelStyle}>Frequency</label>
          <div style={{ display: "flex", gap: 6 }}>
            <SegmentButton
              value="daily"
              currentValue={frequency}
              onSelect={setFrequency}
            >
              Daily
            </SegmentButton>
            <SegmentButton
              value="weekly"
              currentValue={frequency}
              onSelect={setFrequency}
            >
              Weekly
            </SegmentButton>
            <SegmentButton
              value="custom"
              currentValue={frequency}
              onSelect={setFrequency}
            >
              Custom
            </SegmentButton>
          </div>

          {frequency === "custom" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 12,
              }}
            >
              <span style={{ fontSize: 13, color: "#555" }}>Every</span>
              <input
                type="number"
                min={2}
                max={30}
                value={customDays}
                onChange={(event) => setCustomDays(Number(event.target.value))}
                style={{ ...textInputStyle, width: 72 }}
              />
              <span style={{ fontSize: 13, color: "#555" }}>days</span>
            </div>
          )}
        </div>

        {/* Type */}
        <div style={{ marginBottom: 30 }}>
          <label style={fieldLabelStyle}>Type</label>
          <div style={{ display: "flex", gap: 6 }}>
            <SegmentButton
              value="positive"
              currentValue={type}
              onSelect={setType}
            >
              Build (positive)
            </SegmentButton>
            <SegmentButton
              value="negative"
              currentValue={type}
              onSelect={setType}
            >
              Break (negative)
            </SegmentButton>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              border: "1px solid #2a2a2a",
              borderRadius: 4,
              fontSize: 13,
              color: "#555",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            style={{
              padding: "9px 24px",
              backgroundColor: name.trim() ? "#22c55e" : "#1a1a1a",
              color: name.trim() ? "#000" : "#333",
              border: "none",
              borderRadius: 4,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              transition: "all 0.15s",
            }}
          >
            Add Habit
          </button>
        </div>
      </div>
    </div>
  );
}

//actual app

export default function App() {
  const [habits, setHabits] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  function handleAddHabit(habitData) {
    const newHabit = {
      id: Date.now().toString(),
      name: habitData.name,
      frequency: habitData.frequency,
      type: habitData.type,
      createdAt: TODAY,
      logs: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  }

  function deleteHabit(habit) {
    console.log(habit.name);
  }

  function handleLog(habitId, date, effort, fulfillment) {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;

        // Remove any existing log for this date, then add the new one
        const otherLogs = habit.logs.filter((log) => log.date !== date);
        const newLog = { date, completed: true, effort, fulfillment };

        return { ...habit, logs: [...otherLogs, newLog] };
      }),
    );
  }

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 80 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            padding: "48px 24px 22px",
            borderBottom: "1px solid #1a1a1a",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Iceberg', sans-serif",
                fontSize: 10,
                color: "#333",
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              LevelUP
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 300,
                letterSpacing: "-0.01em",
              }}
            >
              Habits
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            style={{
              padding: "10px 20px",
              border: "1px solid #2a2a2a",
              borderRadius: 4,
              background: "#161616",
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.08em",
              color: "#888",
              transition: "all 0.15s",
            }}
          >
            + Add Habit
          </button>
        </div>

        <div>
          {habits.length === 0 ? (
            <div
              style={{
                padding: "60px 24px",
                fontFamily: "'Iceberg', sans-serif",
                fontSize: 12,
                color: "#2e2e2e",
                letterSpacing: "0.1em",
              }}
            >
              No habits yet. Add one to begin.
            </div>
          ) : (
            habits.map((habit, index) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                habitIndex={index}
                onLog={handleLog}
              />
            ))
          )}
        </div>
      </div>

      {/* add habit button */}
      {showAddModal && (
        <AddHabitModal
          onSave={handleAddHabit}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}
