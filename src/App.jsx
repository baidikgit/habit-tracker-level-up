import { useState, useEffect, useMemo, useRef } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useSession,
  useUser,
} from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "./supabaseClient";
import {
  toDateString,
  TODAY,
  ALL_365_DAYS,
  formatFrequency,
} from "./components/dateFunctions";

import { HabitRow } from "./components/HabitRow.jsx";

import { AddHabitModal } from "./components/AddHabit.jsx";

export default function App() {
  const { session } = useSession();
  const { user } = useUser();
  const supabase = useMemo(() => {
    if (!session) return null;
    return createClerkSupabaseClient(session);
  }, [session]);

  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("levelup_habits");
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(true);
  const migratedRef = useRef(false);

  useEffect(() => {
    if (!user || !supabase) return;

    async function loadAndMigrate() {
      setLoading(true);

      const localSaved = localStorage.getItem("levelup_habits");
      const localHabits = localSaved ? JSON.parse(localSaved) : [];

      if (localHabits.length > 0 && !migratedRef.current) {
        migratedRef.current = true;
        for (const habit of localHabits) {
          await supabase.from("habits").upsert({ ...habit, user_id: user.id });
        }
        localStorage.removeItem("levelup_habits");
      }

      const { data } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id);

      const processed = (data ?? []).map((habit) => {
        if (habit.type !== "negative") return habit;
        const streakStart = habit.currentStreakStart || habit.createdAt;
        const newLogs = [...habit.logs];

        for (const day of ALL_365_DAYS) {
          if (day >= TODAY) continue;
          if (day < streakStart) continue;
          if (habit.logs.find((l) => l.date === day)) continue;

          newLogs.push({
            date: day,
            completed: true,
            status: "clean",
            fulfillment: 3,
          });
        }

        return { ...habit, logs: newLogs };
      });

      setHabits(processed);
      setLoading(false);
      localStorage.setItem("levelup_habits", JSON.stringify(processed));
    }

    loadAndMigrate();
  }, [user, supabase]);

  useEffect(() => {
    if (user) return;
    localStorage.setItem("levelup_habits", JSON.stringify(habits));
  }, [habits, user]);

  useEffect(() => {
    if (!user || !supabase || loading) return;
    habits.forEach(async (habit) => {
      await supabase.from("habits").upsert({ ...habit, user_id: user.id });
    });
  }, [habits, user, supabase]);

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

  async function handleDeleteHabit(habitId) {
    setHabits((prev) => prev.filter((habit) => habit.id !== habitId)); // update UI immediately
    if (!supabase) return; // no backend yet — skip persistence
    const { error } = await supabase.from("habits").delete().eq("id", habitId);
    if (error) console.error("Delete failed:", error);
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
      <div style={{ position: "absolute", top: 50, right: 50, zIndex: 50 }}>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="hover:brightness-125 hover:border-gray-500"
              style={{
                padding: "6px 14px",

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
                  width: 28,
                  height: 28,
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
