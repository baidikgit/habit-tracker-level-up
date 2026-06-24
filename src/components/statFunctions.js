import {
  toDateString,
  TODAY,
  ALL_365_DAYS,
  formatFrequency,
} from "./dateFunctions";

//habits logic (VERY IMPORTNT LOGIC DONT TOUCH)
export function isHabitDueOn(habit, dateStr) {
  if (dateStr < habit.createdAt) return false;
  if (dateStr > TODAY) return false;

  if (habit.frequency === "daily") {
    return true;
  }

  if (habit.frequency === "weekly") {
    const createdDate = new Date(habit.createdAt + "T12:00:00");
    const targetDate = new Date(dateStr + "T12:00:00");
    return targetDate.getDay() === createdDate.getDay();
  }

  if (habit.frequency?.type === "custom") {
    const createdDate = new Date(habit.createdAt + "T12:00:00");
    const targetDate = new Date(dateStr + "T12:00:00");
    const daysDiff = Math.round((targetDate - createdDate) / 86400000); //magic number
    return daysDiff >= 0 && daysDiff % habit.frequency.every === 0;
  }

  if (
    habit.frequency?.type === "weekly_count" ||
    habit.frequency?.type === "monthly_count"
  ) {
    return true;
  }

  return false;
}

export function getLogForDate(habit, dateStr) {
  return habit.logs.find((log) => log.date === dateStr) ?? null;
}

export function isCompletedOn(habit, dateStr) {
  return getLogForDate(habit, dateStr)?.completed === true;
}

function getWeekStart(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  const day = date.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day; // adjust to Monday
  date.setDate(date.getDate() + diff);
  return toDateString(date);
}

export function countLogsInWeek(habit, dateStr) {
  const weekStartDate = getWeekStart(dateStr);

  return habit.logs.filter((log) => {
    const logDate = new Date(log.date + "T12:00:00");
    const start = new Date(weekStartDate + "T12:00:00");
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return log.completed && logDate >= start && logDate < end;
  }).length;
}

export function countLogsInMonth(habit, year, month) {
  return habit.logs.filter((log) => {
    const d = new Date(log.date + "T12:00:00");
    return log.completed && d.getFullYear() === year && d.getMonth() === month;
  }).length;
}

export function getDaysSinceStreakStart(habit) {
  const streakStart = habit.currentStreakStart || habit.createdAt;
  const start = new Date(streakStart + "T12:00:00");
  const today = new Date(TODAY + "T12:00:00");
  return Math.floor((today - start) / 86400000);
}

export function isBreakHabitDueToday(habit) {
  if (habit.logs.find((l) => l.date === TODAY)) return false;

  const daysSince = getDaysSinceStreakStart(habit);

  if (daysSince < 7) return true; // daily
  if (daysSince < 21) return (daysSince - 7) % 3 === 0; // every 3 days
  return (daysSince - 21) % 7 === 0; // every 7 days
}

export function calculateMomentum(habit) {
  let momentum = 0;

  if (habit.frequency == "daily" || habit.frequency?.type == "custom") {
    for (const day of ALL_365_DAYS) {
      if (!isHabitDueOn(habit, day)) continue;
      if (day === TODAY) continue; // don't penalise today until the day is over

      if (isCompletedOn(habit, day)) {
        momentum = momentum + 1; // can be modified based on completed how well?
      } else {
        momentum = Math.max(0, momentum - 2);
      }
    }
    if (isHabitDueOn(habit, TODAY) && isCompletedOn(habit, TODAY)) {
      momentum = momentum + 1;
    }
  } else if (habit.frequency?.type === "weekly_count") {
    const uniqueWeekStarts = [...new Set(ALL_365_DAYS.map(getWeekStart))];

    for (const weekStart of uniqueWeekStarts) {
      if (weekStart > TODAY) continue;
      if (weekStart < getWeekStart(habit.createdAt)) continue;

      const count = countLogsInWeek(habit, weekStart);
      if (count >= habit.frequency.times) {
        momentum = momentum + 1;
      } else if (getWeekStart(TODAY) !== weekStart) {
        // don't penalise the current incomplete week
        momentum = Math.max(0, momentum - 2);
      }
    }
  } else if (habit.frequency?.type === "monthly_count") {
    const uniqueMonths = [
      ...new Set(
        ALL_365_DAYS.map((dateStr) => {
          const d = new Date(dateStr + "T12:00:00");
          return `${d.getFullYear()}-${d.getMonth()}`;
        }),
      ),
    ];

    const createdDate = new Date(habit.createdAt + "T12:00:00");
    const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;

    for (const key of uniqueMonths) {
      const [year, month] = key.split("-").map(Number);
      if (
        new Date(year, month) <
        new Date(createdDate.getFullYear(), createdDate.getMonth())
      )
        continue;

      const count = countLogsInMonth(habit, year, month);
      if (count >= habit.frequency.times) {
        momentum = momentum + 1;
      } else if (key !== currentMonthKey) {
        // don't penalise the current incomplete month
        momentum = Math.max(0, momentum - 2);
      }
    }
  }
  // If already logged today, count it
  return momentum;
}

export function calculateConsistency(habit) {
  if (habit.frequency == "daily" || habit.frequency?.type == "custom") {
    const pastDueDays = ALL_365_DAYS.filter((day) => {
      if (!isHabitDueOn(habit, day)) return false;
      if (day < TODAY) return true;
      if (day === TODAY) return isCompletedOn(habit, day);
      return false;
    });

    if (pastDueDays.length === 0) return 0;

    const completedDays = pastDueDays.filter((day) =>
      isCompletedOn(habit, day),
    );
    return Math.round((completedDays.length / pastDueDays.length) * 100);
  } else if (habit.frequency?.type == "weekly_count") {
    const uniqueWeekStarts = [...new Set(ALL_365_DAYS.map(getWeekStart))];
    let count = 0;
    let totalWeekCount = 0;
    for (const weekStart of uniqueWeekStarts) {
      if (weekStart > TODAY) continue;
      if (weekStart < getWeekStart(habit.createdAt)) continue;

      //const isCurrentWeek = weekStart === getWeekStart(TODAY);
      const metTarget =
        countLogsInWeek(habit, weekStart) >= habit.frequency.times;

      //if (isCurrentWeek && !metTarget) continue;

      totalWeekCount = totalWeekCount + 1;
      if (metTarget) {
        count = count + 1;
      }
    }
    return Math.round((count / totalWeekCount) * 100);
  } else if (habit.frequency?.type == "monthly_count") {
    const uniqueMonths = [
      ...new Set(
        ALL_365_DAYS.map((dateStr) => {
          const d = new Date(dateStr + "T12:00:00");
          return `${d.getFullYear()}-${d.getMonth()}`;
        }),
      ),
    ];

    let count = 0;
    let totalMonthCount = 0;

    const createdDate = new Date(habit.createdAt + "T12:00:00");
    const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;

    for (const key of uniqueMonths) {
      const [year, month] = key.split("-").map(Number);
      const metTarget =
        countLogsInMonth(habit, year, month) >= habit.frequency.times;
      if (
        new Date(year, month) <
        new Date(createdDate.getFullYear(), createdDate.getMonth())
      )
        continue;

      totalMonthCount = totalMonthCount + 1;
      if (metTarget) {
        count = count + 1;
      }
    }
    return Math.round((count / totalMonthCount) * 100);
  }
  return 0;
}
