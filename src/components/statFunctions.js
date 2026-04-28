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

  return false;
}

export function getLogForDate(habit, dateStr) {
  return habit.logs.find((log) => log.date === dateStr) ?? null;
}

export function isCompletedOn(habit, dateStr) {
  return getLogForDate(habit, dateStr)?.completed === true;
}


export function calculateMomentum(habit) {
  let momentum = 0;

  for (const day of ALL_365_DAYS) {
    if (!isHabitDueOn(habit, day)) continue;
    if (day === TODAY) continue; // don't penalise today until the day is over

    if (isCompletedOn(habit, day)) {
      momentum = momentum + 1; // can be modified based on completed how well?
    } else {
      momentum = Math.max(0, momentum - 2);
    }
  }

  // If already logged today, count it
  if (isHabitDueOn(habit, TODAY) && isCompletedOn(habit, TODAY)) {
    momentum = momentum + 1;
  }

  return momentum;
}

export function calculateConsistency(habit) {
  const pastDueDays = ALL_365_DAYS.filter(
    (day) => day < TODAY && isHabitDueOn(habit, day),
  );

  if (pastDueDays.length === 0) return 0;

  const completedDays = pastDueDays.filter((day) => isCompletedOn(habit, day));
  return Math.round((completedDays.length / pastDueDays.length) * 100);
}
