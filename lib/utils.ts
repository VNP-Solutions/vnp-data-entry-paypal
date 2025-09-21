import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCheckInOutDate(dateString: string | number) {
  // Handle date string in ISO format (e.g., "2024-09-29")
  const date = new Date(dateString);

  // Validate the date
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Format the date (e.g., "29 Sep, 2024")
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  return date.toLocaleDateString("en-GB", options);
}

export function formatLongString(str: string | undefined, length: number) {
  if (!str) {
    return "N/A";
  }
  if (str.length > length) {
    return str.slice(0, length) + "...";
  }
  return str;
}
