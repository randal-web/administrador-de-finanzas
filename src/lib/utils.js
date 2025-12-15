import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getDaysRemaining(dueDay) {
  const today = new Date();
  const currentDay = today.getDate();
  
  if (dueDay >= currentDay) {
    return dueDay - currentDay;
  } else {
    // Get days in current month to calculate days until next month's due date
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return (daysInMonth - currentDay) + dueDay;
  }
}
