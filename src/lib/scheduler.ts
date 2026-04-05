import {
  User,
  users,
  Slot,
  DaySchedule,
  SlotAssignment,
  UserStats,
} from "./types";
import {
  getDaysInMonth,
  isAvailable,
  getDayName,
  isWeekend,
  isHoliday,
} from "./utils";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

const slots: Slot[] = ["332", "27", "28"];

type UnavailableSlotsByDate = Record<string, Slot[]>;

const unavailableSlotsByDate: UnavailableSlotsByDate = {
  "2026-04-06": ["332"],
  "2026-04-07": ["332"],
  "2026-04-08": ["332"],
  "2026-04-09": ["332"],
  "2026-04-10": ["332"],
};

function getCombinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = [];
  const current: T[] = [];
  function backtrack(start: number) {
    if (current.length === k) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      backtrack(i + 1);
      current.pop();
    }
  }
  backtrack(0);
  return result;
}

function getPermutations<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  const used = new Array<boolean>(arr.length).fill(false);
  const current: T[] = [];

  function backtrack() {
    if (current.length === arr.length) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(arr[i]);
      backtrack();
      current.pop();
      used[i] = false;
    }
  }

  backtrack();
  return result;
}

function getPartialPermutations<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  const used = new Array<boolean>(arr.length).fill(false);
  const current: T[] = [];

  function backtrack() {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      current.push(arr[i]);
      backtrack();
      current.pop();
      used[i] = false;
    }
  }

  backtrack();
  return result;
}

function evaluateFairnessScore(
  stats: Record<User, { primary: number; backup: number; slot332: number }>,
): number {
  const userValues = users.map(
    (user) =>
      stats[user].primary * 2 + stats[user].backup - stats[user].slot332 * 1.5,
  );

  const maxValue = Math.max(...userValues);
  const minValue = Math.min(...userValues);

  const primaryCounts = users.map((user) => stats[user].primary);
  const backupCounts = users.map((user) => stats[user].backup);
  const slot332Counts = users.map((user) => stats[user].slot332);

  const rangePrimary = Math.max(...primaryCounts) - Math.min(...primaryCounts);
  const rangeBackup = Math.max(...backupCounts) - Math.min(...backupCounts);
  const range332 = Math.max(...slot332Counts) - Math.min(...slot332Counts);

  // Weight by how close the composite score is across users first, then by distribution stability.
  return (
    (maxValue - minValue) * 1000 +
    rangePrimary * 100 +
    rangeBackup * 10 +
    range332
  );
}

console.log({ unavailableSlotsByDate });

export function generateSchedule(year: number, month: number): DaySchedule[] {
  const days = getDaysInMonth(year, month)
    .filter((date) => !isWeekend(date) && !isHoliday(date))
    .filter((date) => {
      const day = date.getDate();
      return day > 5; // exclude April 1-5
    });
  const schedule: DaySchedule[] = [];

  // Track usage for fairness
  const userStats = {} as Record<
    User,
    { primary: number; backup: number; slot332: number }
  >;
  users.forEach((user) => {
    userStats[user] = { primary: 0, backup: 0, slot332: 0 };
  });

  for (const date of days) {
    const availableUsers = users.filter((user) => isAvailable(user, date));
    if (availableUsers.length < 6) {
      continue;
    }

    dayjs.extend(utc);
    dayjs.extend(timezone);
    const phtDate = dayjs(date).tz("Asia/Manila").format("YYYY-MM-DD");

    const unavailableSlots = unavailableSlotsByDate[phtDate] ?? [];

    console.log({ phtDate, unavailableSlots });

    const assignments: Record<Slot, SlotAssignment> = {} as Record<
      Slot,
      SlotAssignment
    >;

    let bestAssignment: {
      slots: Record<Slot, SlotAssignment>;
      score: number;
    } | null = null;

    const candidateGroups = getCombinations(availableUsers, 6);

    for (const group of candidateGroups) {
      const primaryOptions = getPartialPermutations(group, 3);

      for (const primarySet of primaryOptions) {
        const remainingForBackup = group.filter(
          (user) => !primarySet.includes(user),
        );
        const backupOptions = getPermutations(remainingForBackup);

        for (const backupSet of backupOptions) {
          let invalid = false;
          const daySlots: Record<Slot, SlotAssignment> = {
            332: { primary: primarySet[0], backup: backupSet[0] },
            27: { primary: primarySet[1], backup: backupSet[1] },
            28: { primary: primarySet[2], backup: backupSet[2] },
          };

          slots.forEach((slot, i) => {
            const primary = primarySet[i];
            const backup = backupSet[i];

            if (primary === backup) {
              invalid = true;
            }
            if (primary === "Erwin" && backup === "Lady") {
              invalid = true;
            }
            if (unavailableSlots.includes(slot)) {
              daySlots[slot] = null;
              return;
            }
          });

          if (invalid) {
            continue;
          }

          const projectedStats = users.reduce(
            (acc, user) => {
              acc[user] = { ...userStats[user] };
              return acc;
            },
            {} as Record<
              User,
              { primary: number; backup: number; slot332: number }
            >,
          );

          slots.forEach((slot, i) => {
            const primary = primarySet[i];
            const backup = backupSet[i];

            projectedStats[primary].primary += 1;
            projectedStats[backup].backup += 1;

            if (slot === "332") {
              projectedStats[primary].slot332 += 1;
            }
            if (unavailableSlots.includes(slot)) {
              daySlots[slot] = null;
              return;
            }
          });

          const score = evaluateFairnessScore(projectedStats);

          if (!bestAssignment || score < bestAssignment.score) {
            bestAssignment = { slots: daySlots, score };
          }
        }
      }
    }

    if (!bestAssignment) {
      continue;
    }

    Object.entries(bestAssignment.slots).forEach(([slotKey, slotValue]) => {
      const slot = slotKey as Slot;
      assignments[slot] = slotValue;
      if (slotValue) {
        userStats[slotValue.primary!].primary += 1;
        userStats[slotValue.backup!].backup += 1;
        if (slot === "332") {
          userStats[slotValue.primary!].slot332 += 1;
        }
      }
    });

    schedule.push({
      date: phtDate,
      day: getDayName(date),
      slots: assignments,
      unavailableSlots: [],
    });
  }

  return schedule;
}
