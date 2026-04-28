//date functions
export function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const TODAY = toDateString(new Date());

export const YESTERDAY = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateString(d);
})();

// 365 days from one year ago to today, oldest first
export const ALL_365_DAYS = Array.from({ length: 365 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (364 - index));
  return toDateString(date);
});

export function formatFrequency(frequency) {
  if (frequency === "daily") return "Daily";
  if (frequency === "weekly") return "Weekly";
  if (frequency?.type === "custom") return `Every ${frequency.every} days`;
  return "—";
}

//habits (VERY IMPORTNT LOGIC DONT TOUCH)
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