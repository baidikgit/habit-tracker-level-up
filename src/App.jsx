import { useState } from "react";
import {
  toDateString,
  TODAY,
  ALL_365_DAYS,
  formatFrequency,
} from "./components/dateFunctions";

import {
  isHabitDueOn,
  getLogForDate,
  isCompletedOn,
  calculateMomentum,
  calculateConsistency,
} from "./components/statFunctions";

import { GLOBAL_CSS } from "./components/styling";

import {
  HABIT_COLOR_PALETTE,
  hexToRgbString,
  getHabitColor,
  fulfillmentToOpacity,
} from "./components/colourFunctions";

import { Calendar365 } from "./components/Calender.jsx";

import { StatBar } from "./components/StatBar.jsx";

import { LogPanel } from "./components/LoggingPanel.jsx";

import { HabitRow } from "./components/HabitRow.jsx";

import { AddHabitModal } from "./components/AddHabit.jsx";

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

  function handleDeleteHabit(habitId){
    setHabits(prev => prev.filter(habit => habit.id != habitId))
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
                onDelete={handleDeleteHabit}
              />
            ))
          )}
        </div>
      </div>

      {showAddModal && (
        <AddHabitModal
          onSave={handleAddHabit}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </>
  );
}
