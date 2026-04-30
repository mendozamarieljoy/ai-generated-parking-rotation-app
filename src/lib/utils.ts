import { usersList } from "./constants";
import { User, Slot, DaySchedule, SlotAssignment, UserStats } from "./types";
import dayjs from "dayjs";
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
}): number {
  return stats.primary * 2 + stats.backup * 1;
}

export function calculateBenefitScore(primary: number, backup: number): number {
  return primary * 1 + backup * 0.5;
}

export function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1; // 1-based
  const day = date.getDate();
  // Philippine holidays in April 2026 - only Araw ng Kagitingan
  const holidays = [
    { month: 4, day: 9 }, // Araw ng Kagitingan (Regular Holiday)
		{ month: 5, day: 1 }, // Labor day
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

export function validateMatch(assignedUsers: string[], date: Date) {
  // const [user, match] = assignedUsers;
  const cannotMatch: string[] = [];
  const day = date.getDay(); // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  // let cannotMatchUser: Record<User, User[]> = {};
  const early = ["Erwin", "Lady", "Reubs", "Marvs"].filter((name) => {
    if (day === 1) return !assignedUsers.includes(name) || name !== "Erwin";
    else if (day !== 5)
      return !assignedUsers.includes(name) || name !== "Marvs";
    return !assignedUsers.includes(name);
  });
  const late = ["Nes", "Raph", "Marvs", "Erwin"].filter((name) => {
    if (day === 5) return !assignedUsers.includes(name) || name !== "Marvs";
    else if (day !== 1)
      return !assignedUsers.includes(name) || name !== "Erwin";
    return !assignedUsers.includes(name);
  });

  let isInvalid = false;

  usersList.forEach((user) => {
    const userIsEarly = early.includes(user);
    const userIsMid = !early.includes(user) && !late.includes(user);
    const userIsLate = late.includes(user);
    const matchedUser: string | undefined = assignedUsers.find(
      (name) => name !== user,
    );

    if (userIsEarly && assignedUsers.includes(user)) {
      if (matchedUser) isInvalid = early.includes(matchedUser);
    } else if (userIsLate && assignedUsers.includes(user)) {
      if (matchedUser) isInvalid = late.includes(matchedUser);
    } else if (userIsMid) {
      if (user === "Mariel") {
        isInvalid = matchedUser === "Reubs";
      }
    }
  });

  return isInvalid;

  // switch (user || match) {
  //   case "Raph":
  //   case "Nes":
  //     cannotMatch = late;
  //     // return late.some((name) => assignedUsers.includes(name));
  //     break;
  //   case "Reubs":
  //   case "Lady":
  //     cannotMatch = early;
  //     break;
  //   // return early.some((name) => assignedUsers.includes(name));

  //   case "Mariel":
  //     cannotMatch.push("Reubs");
  //     break;
  //   // return match === "Reubs";

  //   case "Erwin":
  //     // if (day === 1) return late.some((name) => assignedUsers.includes(name));
  //     // else return early.some((name) => assignedUsers.includes(name));

  //     if (day === 1) cannotMatch = late;
  //     else cannotMatch = early;
  //     break;

  //   case "Marvs":
  //     // if (day !== 5) return late.some((name) => assignedUsers.includes(name));
  //     // else return early.some((name) => assignedUsers.includes(name));

  //     if (day === 5) cannotMatch = late;
  //     else cannotMatch = early;
  //     break;

  //   default:
  //     break;
  // }

  return assignedUsers.some((name) => cannotMatch.includes(name));
}

// utils/validation.js
