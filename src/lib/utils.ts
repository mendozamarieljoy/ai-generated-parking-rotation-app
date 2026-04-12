import { User, Slot, DaySchedule, SlotAssignment, UserStats } from "./types";

export function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function isAvailable(user: User, date: Date): boolean {
  const day = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  switch (user) {
    case "Reubs":
      return day !== 2; // no Tuesday
    case "Mariel":
      return day !== 5; // no Friday
    case "Nes":
      return day !== 3; // no Wednesday
    default:
      return true;
  }
}

export function calculateFairnessScore(stats: {
  primary: number;
  backup: number;
  slot332: number;
}): number {
  return stats.primary * 2 + stats.backup * 1 - stats.slot332 * 1.5;
}

export function calculateBenefitScore(
  primary: number,
  backup: number,
  slot332: number,
): number {
  return primary * 1 + backup * 0.5 + slot332 * 0.25;
}

export function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1; // 1-based
  const day = date.getDate();
  // Philippine holidays in April 2026 - only Araw ng Kagitingan
  const holidays = [
    { month: 4, day: 9 }, // Araw ng Kagitingan (Regular Holiday)
  ];
  return holidays.some((h) => h.month === month && h.day === day);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export type MonthOption = {
  year: number;
  month: number; // 1-12
  label: string;
  value: string; // "2026-4"
};

export function getNext12Months(fromDate = new Date()): MonthOption[] {
  const result: MonthOption[] = [];

  const year = fromDate.getFullYear();
  const month = fromDate.getMonth(); // 0-based

  for (let i = 0; i < 12; i++) {
    const date = new Date(year, month + i, 1);

    const y = date.getFullYear();
    const m = date.getMonth();

    result.push({
      year: y,
      month: m,
      label: date.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
      }),
      value: `${y}-${m}`,
    });
  }

  return result;
}

export function validateMatch(user: User, match: User, date: Date) {
  const day = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // let cannotMatchUser: Record<User, User[]> = {};
  let cannotMatchUser: string[] = [];
  const early = ["Erwin", "Lady", "Reubs", "Marvs"].filter((name) => {
    if (day === 1) return name !== user && name !== "Erwin";
    else if (day !== 5) return name !== user && name !== "Marvs";
    return name !== user;
  });
  const late = ["Nes", "Raph", "Marvs", "Erwin"].filter((name) => {
    if (day === 5) return name !== user && name !== "Marvs";
    else if (day !== 1) return name !== user && name !== "Erwin";
    return name !== user;
  });

  switch (user) {
    case "Erwin":
      if (day === 1) cannotMatchUser = late;
      else cannotMatchUser = early;
      break;

    case "Marvs":
      if (day !== 5) cannotMatchUser = late;
      else cannotMatchUser = early;
      break;

    case "Raph":
    case "Nes":
      cannotMatchUser = late;
      break;

    case "Reubs":
    case "Lady":
      cannotMatchUser = early;
      break;

    case "Mariel":
      cannotMatchUser = ["Reubs"];
      break;

    default:
      break;
  }

  const isInvalid = cannotMatchUser.includes(match);

  return isInvalid;
}
