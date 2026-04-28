//every habit gets a solid pure colour. maybe will add more than 8 later.

export const HABIT_COLOR_PALETTE = [
  "#22c55e", // green
  "#2273f6", // blue
  "#f97316", // orange
  "#823cc4", // purple
  "#eb3590", // pink
  "#13b4a1", // teal
  "#eab308", // yellow
  "#ef4444", // red
];

export function getHabitColor(habitIndex) {
  return HABIT_COLOR_PALETTE[habitIndex % HABIT_COLOR_PALETTE.length];
}

// Convert #rrggbb to "r, g, b" so it can be used inside rgba(...)
export function hexToRgbString(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// fullfilment opacity decider
export function fulfillmentToOpacity(fulfillment) {
  if (fulfillment === 1) return 0.4;
  if (fulfillment === 2) return 0.6;
  if (fulfillment === 3) return 1.0;
  return 0;
}