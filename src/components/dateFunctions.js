//date functions
export function toDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export const TODAY = toDateString(new Date());

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
