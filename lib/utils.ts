import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function formatCheckInOutDate(excelSerialDate: string | number) {
  // Convert to number if it's a string (e.g., "45725" → 45725)
  const serialNumber =
    typeof excelSerialDate === "string"
      ? parseFloat(excelSerialDate)
      : excelSerialDate;

  // Validate input
  if (isNaN(serialNumber)) {
    return "Invalid Date";
  }

  // Excel's epoch is January 1, 1900 (adjusting for the leap year bug)
  const excelEpoch = new Date(1900, 0, 1); // Month is 0-indexed (0 = January)

  // Create a new date and add the days
  const date = new Date(excelEpoch);
  date.setDate(date.getDate() + serialNumber - 1); // Subtract 1 for 1-based counting

  // Format the date (e.g., "December 31, 2025")
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
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