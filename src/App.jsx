import { useState, useEffect } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";

import {
  toDateString,
  TODAY,
  ALL_365_DAYS,
  formatFrequency,
} from "./components/dateFunctions";

import { HabitRow } from "./components/HabitRow.jsx";

import { AddHabitModal } from "./components/AddHabit.jsx";

export default function App() {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("levelup-habits");
    const loaded = saved ? JSON.parse(saved) : DEMO_HABITS;

    DEMO_HABITS = {};

    return loaded.map((habit) => {
      if (habit.type !== "negative") return habit;
      const streakStart = habit.currentStreakStart || habit.createdAt;
      const newLogs = [...habit.logs];

      for (const day of ALL_365_DAYS) {
        if (day >= TODAY) continue;
        if (day < streakStart) continue;

        const daysSince = Math.floor(
          (new Date(day + "T12:00:00") - new Date(streakStart + "T12:00:00")) /
            86400000,
        );

        const isDue =
          daysSince < 7
            ? true
            : daysSince < 21
              ? (daysSince - 7) % 3 === 0
              : (daysSince - 21) % 7 === 0;

        if (isDue && !habit.logs.find((l) => l.date === day)) {
          newLogs.push({
            date: day,
            completed: true,
            status: "clean",
            fulfillment: 3,
          });
        }
      }

      return { ...habit, logs: newLogs };
    });
  });

  useEffect(() => {
    localStorage.setItem("levelup-habits", JSON.stringify(habits));
  }, [habits]);

  const [showAddModal, setShowAddModal] = useState(false);

  function handleAddHabit(habitData) {
    const newHabit = {
      id: Date.now().toString(),
      name: habitData.name,
      frequency: habitData.frequency,
      type: habitData.type,
      createdAt: TODAY,
      currentStreakStart: TODAY,
      logs: [],
    };
    setHabits((prev) => [...prev, newHabit]);
  }

  function handleEditHabit(habitId, updatedData) {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId ? { ...habit, ...updatedData } : habit,
      ),
    );
  }

  function handleDeleteHabit(habitId) {
    setHabits((prev) => prev.filter((habit) => habit.id != habitId));
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

  function handleBreakHabitLog(habitId) {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id !== habitId) return habit;
        return {
          ...habit,
          currentStreakStart: TODAY,
          logs: [...habit.logs, { date: TODAY, status: "broken" }],
        };
      }),
    );
  }

  return (
    <>
      <div style={{ position: "absolute", top: 30, right: 50, zIndex: 50 }}>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="hover:brightness-125 hover:border-gray-500"
              style={{
                padding: "8px 16px",

                border: "1px solid #10b981",
                borderRadius: 4,
                background: "#161616",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                color: "#10b981",
                cursor: "pointer",
                textTransform: "uppercase",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.1)",
                transition: "all 0.15s",
              }}
            >
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        {/* If logged in, show the Clerk user avatar */}
        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: {
                  width: 40,
                  height: 40,
                  border: "1px solid #2a2a2a",
                },
              },
            }}
          />
        </SignedIn>
      </div>

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
                fontSize: 20,
                color: "#10b981",
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                textShadow: "0 0 8px rgba(16, 185, 129, 0.4)",
                marginBottom: 8,
              }}
            >
              Level-UP
            </div>

            <div
              style={{
                fontSize: 35,
                letterSpacing: "-0.01em",
              }}
            >
              Habits
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="hover:brightness-125 shadow-[inset_1px_0px_1px_1px_#050505,inset_-1px_-1px_1px_1px_#1a1a1a]"
            style={{
              padding: "10px 20px",
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
                onEdit={handleEditHabit}
                onBreakLog={handleBreakHabitLog}
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
