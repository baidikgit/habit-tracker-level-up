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
  countLogsInMonth,
  countLogsInWeek,
  isBreakHabitDueToday,
  getDaysSinceStreakStart,
} from "./statFunctions";

import {
  HABIT_COLOR_PALETTE,
  hexToRgbString,
  getHabitColor,
  fulfillmentToOpacity,
} from "./colourFunctions";

import { Calendar365 } from "./Calender";

import { StatBar } from "./StatBar";

import { LogPanel } from "./LoggingPanel";

import { EditHabitModal } from "./EditHabit.jsx";

export function HabitRow({
  habit,
  habitIndex,
  onLog,
  onDelete,
  onEdit,
  onBreakLog,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const color = getHabitColor(habitIndex);

  const loggedToday = isCompletedOn(habit, TODAY);
  const dueToday = isHabitDueOn(habit, TODAY);

  // Decide what date to log.
  const dateToLog = dueToday && !loggedToday ? TODAY : null;

  const canLog = dateToLog !== null;

  const quotaComplete =
    (habit.frequency?.type === "weekly_count" &&
      countLogsInWeek(habit, TODAY) >= habit.frequency.times) ||
    (habit.frequency?.type === "monthly_count" &&
      countLogsInMonth(
        habit,
        new Date().getFullYear(),
        new Date().getMonth(),
      ) >= habit.frequency.times);

  function handleConfirmLog(effort, fulfillment) {
    onLog(habit.id, dateToLog, effort, fulfillment);
    setIsLogging(false);
  }

  const momentum = calculateMomentum(habit);
  const streak = getDaysSinceStreakStart(habit);
  const consistency = calculateConsistency(habit);

  if (habit.type === "negative" && !isBreakHabitDueToday(habit)) return null;
  return (
    <div className="border-b border-theme-dark-grey shadow-[inset_1px_0px_1px_1px_#050505,inset_-1px_-1px_1px_1px_#1a1a1a]">
      {/* main habit row*/}
      <div className="flex items-center px-6 py-4 gap-4">
        <div
          className="w-[3px] h-[38px] rounded-[2px] shrink-0"
          style={{ backgroundColor: color }}
        />

        {/* habit expands to stats */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex-1 cursor-pointer"
        >
          <div className="font-size-[18px] font-normal mb-[3px]">
            {habit.name}
          </div>
          <div className="text-[11px] text-[#888888] font-iceberg tracking-wider">
            {habit.type === "negative"
              ? `Break`
              : `${formatFrequency(habit.frequency)} · Build`}
          </div>
        </div>

        {/* logging indicator*/}
        {habit.type === "negative" ? (
          <button
            onClick={() => onBreakLog(habit.id)}
            className="px-5 py-2 bg-[#1a1a1a] border border-red-900 text-red-500 rounded text-xs tracking-widest hover:bg-red-900/20 transition-all"
          >
            RELAPSED
          </button>
        ) : loggedToday || quotaComplete ? (
          <span
            style={{
              color: color,
            }}
            className="font-iceberg text-[10px] tracking-[0.15em]"
          >
            Accomplished
          </span>
        ) : canLog ? (
          <button
            title="Log for today"
            onClick={() => setIsLogging((prev) => !prev)}
            className={`
                        px-5 py-2 rounded-[4px] bg-[#1a1a1a] text-[11px] font-semibold tracking-[0.15em] transition-all duration-150
                        hover:brightness-125
                        ${isLogging ? "border-[#2a2a2a] text-[#555]" : "border-[#2a2a2a] text-[#999]"}
                        border
                      `}
          >
            {isLogging ? "CANCEL" : "LOG"}
          </button>
        ) : (
          <span className="font-iceberg text-[14px] text-[#4a4a4a] tracking-[0.12em]">
            NOT DUE
          </span>
        )}

        <button
          className={`
                    px-5 py-2 rounded-[4px] bg-[#1a1a1a] text-[11px] font-semibold tracking-[0.15em] transition-all duration-150
                    hover:brightness-125
                    ${isLogging ? "border-[#2a2a2a] text-[#555]" : "border-[#2a2a2a] text-[#999]"}
                    border
                  `}
          title="Edit this habit"
          onClick={() => setIsEditing(true)}
        >
          ✎
        </button>

        <button
          title="Delete this habit"
          onClick={() => setHabitToDelete(habitToDelete ? null : habit.id)}
          className={`
                    px-5 py-2 rounded-[4px] bg-[#1a1a1a] text-[11px] font-semibold tracking-[0.15em] transition-all duration-150
                    hover:brightness-125
                    ${isLogging ? "border-[#2a2a2a] text-[#555]" : "border-[#2a2a2a] text-[#999]"}
                    border
                  `}
        >
          ✕
        </button>

        {isEditing && (
          <EditHabitModal
            habit={habit}
            onSave={(updatedData) => {
              onEdit(habit.id, updatedData);
              setIsEditing(false);
            }}
            onClose={() => setIsEditing(false)}
          />
        )}

        {/*delete prompt*/}
        <div
          className={`flex-shrink-0 transition-all duration-200 ease-in-out overflow-hidden ${habitToDelete ? "max-w-xs opacity-100" : "max-w-0 opacity-0"}`}
        >
          <div className="pl-4 flex items-center gap-4 whitespace-nowrap">
            <p className="text-m text-[#888]">Delete this habit?</p>
            <button
              onClick={() => {
                onDelete(habitToDelete);
                setHabitToDelete(null);
              }}
              className="text-red-500 text-sm hover:brightness-150"
            >
              Yes
            </button>
            <button
              onClick={() => setHabitToDelete(null)}
              className="text-[#555] text-sm hover:brightness-150"
            >
              Cancel
            </button>
          </div>
        </div>
        {/* expand the menu */}
        <div
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`
                    text-[#333] 
                    text-[12px] 
                    cursor-pointer 
                    select-none 
                    transition-transform 
                    duration-200 
                    ${isExpanded ? "rotate-180" : "rotate-0"}
                  `}
        >
          ▾
        </div>
      </div>

      {/* logging panel */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${isLogging ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          {
            <LogPanel
              habitColor={color}
              onConfirm={handleConfirmLog}
              onCancel={() => setIsLogging(false)}
            />
          }
        </div>
      </div>

      {/* expanded stats bars */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="pt-[22px] px-[24px] pb-[28px] border-t border-[#1a1a1a] bg-[#0d0d0d] shadow-[inset_1px_1px_1px_1px_#050505,inset_-1px_-1px_1px_1px_#1a1a1a]">
            <Calendar365 habit={habit} habitColor={color} />

            <div className="mt-[26px]">
              <StatBar
                label="Momentum"
                value={momentum}
                maxValue={Math.max(momentum, 30)}
                displayValue={momentum}
                color={color}
              />
              {habit.type === "negative" && (
                <StatBar
                  label="Streak"
                  value={streak}
                  maxValue={Math.max(streak, 66)}
                  displayValue={streak}
                  color={color}
                />
              )}
              {habit.type === "positive" && (
                <StatBar
                  label="Consistency"
                  value={consistency}
                  maxValue={100}
                  displayValue={`${consistency}%`}
                  color={color}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
