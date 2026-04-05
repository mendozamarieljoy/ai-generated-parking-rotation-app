import { User, users, Slot, DaySchedule, SlotAssignment } from "./types";
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

dayjs.extend(utc);
dayjs.extend(timezone);

const slots: Slot[] = ["332", "27", "28"];

/**
 * OWNER BLOCKED SCHEDULE (precomputed once)
 */
const ownerBlocked: Record<string, Set<Slot>> = {
  "04-06-2026": new Set(["332"]),
  "04-07-2026": new Set(["332"]),
  "04-08-2026": new Set(["332"]),
  "04-10-2026": new Set(["332"]),
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
  const used = new Array(arr.length).fill(false);
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
  const used = new Array(arr.length).fill(false);
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

/**
 * FAIRNESS SCORING
 */
function evaluateFairnessScore(
  stats: Record<User, { primary: number; backup: number; slot332: number }>,
): number {
  const values = users.map(
    (u) => stats[u].primary * 2 + stats[u].backup - stats[u].slot332 * 1.5,
  );

  const range = Math.max(...values) - Math.min(...values);

  const rangePrimary =
    Math.max(...users.map((u) => stats[u].primary)) -
    Math.min(...users.map((u) => stats[u].primary));

  const rangeBackup =
    Math.max(...users.map((u) => stats[u].backup)) -
    Math.min(...users.map((u) => stats[u].backup));

  const range332 =
    Math.max(...users.map((u) => stats[u].slot332)) -
    Math.min(...users.map((u) => stats[u].slot332));

  return range * 1000 + rangePrimary * 100 + rangeBackup * 10 + range332;
}

/**
 * MAIN SCHEDULER
 */
export function generateSchedule(year: number, month: number): DaySchedule[] {
  const days = getDaysInMonth(year, month)
    .filter((d) => !isWeekend(d) && !isHoliday(d))
    .filter((d) => d.getDate() > 5);

  const schedule: DaySchedule[] = [];

  const userStats: Record<
    User,
    { primary: number; backup: number; slot332: number }
  > = Object.fromEntries(
    users.map((u) => [u, { primary: 0, backup: 0, slot332: 0 }]),
  ) as any;

  for (const date of days) {
    const mmdd = dayjs(date).format("MM-DD-YYYY");
    const phtDate = dayjs(date).tz("Asia/Manila").format("YYYY-MM-DD");

    const unavailableSlots = ownerBlocked[mmdd]
      ? Array.from(ownerBlocked[mmdd])
      : [];

    const availableUsers = users.filter((u) => isAvailable(u, date));

    if (availableUsers.length < 6) continue;

    let best: {
      slots: Partial<Record<Slot, SlotAssignment | null>>;
      score: number;
    } | null = null;

    const projectedBase = structuredClone(userStats);

    const candidateGroups = getCombinations(availableUsers, 6);

    for (const group of candidateGroups) {
      const primaryOptions = getPartialPermutations(group, 3);

      for (const primarySet of primaryOptions) {
        const remaining = group.filter((u) => !primarySet.includes(u));
        const backupOptions = getPermutations(remaining);

        for (const backupSet of backupOptions) {
          let invalid = false;

          const daySlots: Partial<Record<Slot, SlotAssignment | null>> = {};

          slots.forEach((slot, i) => {
            if (unavailableSlots.includes(slot)) {
              daySlots[slot] = null;
              return;
            }

            const primary = primarySet[i];
            const backup = backupSet[i];

            if (!primary || !backup || primary === backup) {
              invalid = true;
              return;
            }

            if (primary === "Erwin" && backup === "Lady") {
              invalid = true;
              return;
            }

            daySlots[slot] = { primary, backup };
          });

          if (invalid) continue;

          const projected = structuredClone(projectedBase);

          slots.forEach((slot, i) => {
            if (unavailableSlots.includes(slot)) return;

            const assignment = daySlots[slot];
            if (!assignment) return;

            projected[assignment.primary].primary += 1;
            projected[assignment.backup].backup += 1;

            if (slot === "332") {
              projected[assignment.primary].slot332 += 1;
            }
          });

          const score = evaluateFairnessScore(projected);

          if (!best || score < best.score) {
            best = { slots: daySlots, score };
          }
        }
      }
    }

    if (!best) continue;

    const assignments: Record<Slot, SlotAssignment | null> = {
      332: null,
      27: null,
      28: null,
    };

    for (const slot of slots) {
      const value = best.slots[slot];
      assignments[slot] = value ?? null;

      if (!value) continue;

      userStats[value.primary].primary += 1;
      userStats[value.backup].backup += 1;

      if (slot === "332") {
        userStats[value.primary].slot332 += 1;
      }
    }

    schedule.push({
      date: phtDate,
      day: getDayName(date),
      slots: assignments,
      unavailableSlots,
    });
  }

  return schedule;
}
