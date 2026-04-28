import {
  toDateString,
  TODAY,
  YESTERDAY,
  ALL_365_DAYS,
  formatFrequency,
  isHabitDueOn,
  getLogForDate,
  isCompletedOn,
} from "./dateFunctions";

//momentum calculation
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

//consistency calculation
export function calculateConsistency(habit) {
  const pastDueDays = ALL_365_DAYS.filter(
    (day) => day < TODAY && isHabitDueOn(habit, day),
  );

  if (pastDueDays.length === 0) return 0;

  const completedDays = pastDueDays.filter((day) => isCompletedOn(habit, day));
  return Math.round((completedDays.length / pastDueDays.length) * 100);
}
