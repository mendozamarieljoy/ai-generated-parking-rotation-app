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

const slots = ["27", "28"] as const;

type UnavailableSlotsByDate = Record<string, Slot[]>;

const unavailableSlotsByDate: UnavailableSlotsByDate = {};

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
  stats: Record<User, { primary: number; backup: number }>,
): number {
  const userValues = users.map(
    (user) => stats[user].primary * 2 + stats[user].backup,
  );

  const maxValue = Math.max(...userValues);
  const minValue = Math.min(...userValues);

  const primaryCounts = users.map((user) => stats[user].primary);
  const backupCounts = users.map((user) => stats[user].backup);

  const rangePrimary = Math.max(...primaryCounts) - Math.min(...primaryCounts);
  const rangeBackup = Math.max(...backupCounts) - Math.min(...backupCounts);

  // Weight by how close the composite score is across users first, then by distribution stability.
  return (maxValue - minValue) * 1000 + rangePrimary * 100 + rangeBackup * 10;
}

export function generateSchedule(year: number, month: number): DaySchedule[] {
  const days = getDaysInMonth(year, month).filter(
    (date) => !isWeekend(date) && !isHoliday(date),
  );
  const schedule: DaySchedule[] = [];

  // Track usage for fairness
  const userStats = {} as Record<User, { primary: number; backup: number }>;
  users.forEach((user) => {
    userStats[user] = { primary: 0, backup: 0 };
  });

  for (const date of days) {
    const availableUsers = users.filter((user) => isAvailable(user, date));

    dayjs.extend(utc);
    dayjs.extend(timezone);
    const phtDate = dayjs(date).tz("Asia/Manila").format("YYYY-MM-DD");

    const unavailableSlots = unavailableSlotsByDate[phtDate] ?? [];

    const assignments: Record<Slot, SlotAssignment> = {} as Record<
      Slot,
      SlotAssignment
    >;

    let bestAssignment: {
      slots: Record<Slot, SlotAssignment>;
      score: number;
    } | null = null;

    // Try to find a perfect assignment with 6 users
    if (availableUsers.length >= 6) {
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
            const day = date.getDay();

            const daySlots: Record<Slot, SlotAssignment> | null = {
              27: { primary: primarySet[1], backup: backupSet[1] },
              28: { primary: primarySet[2], backup: backupSet[2] },
            };

            // THEN validate per slot safely
            for (const slot of slots) {
              const primary = daySlots[slot] ? daySlots[slot].primary : "";
              const backup = daySlots[slot] ? daySlots[slot].backup : "";

              const assignedUsers = [primary, backup];
              const has = (name: User) => assignedUsers.includes(name);

              if (primary === backup) {
                invalid = true;
                break;
              }

              // AFTERNOON CONSTRAINTS
              if (has("Nes") && has("Raph")) {
                invalid = true;
                break;
              }

              // AFTERNOON CONSTRAINTS except Fridays
              if (has("Nes") && has("Marvs") && day <= 4) {
                invalid = true;
                break;
              }
              if (has("Raph") && has("Marvs") && day <= 4) {
                invalid = true;
                break;
              }

              // MORNING CONSTRAINTS
              if (has("Lady") && has("Reubs")) {
                invalid = true;
                break;
              }

              // MORNING + MARVS EVERY FRIDAY CONSTRAINTS
              if ((has("Lady") || has("Reubs")) && has("Marvs") && day === 5) {
                invalid = true;
                break;
              }

              if (has("Mariel") && has("Reubs")) {
                invalid = true;
                break;
              }

              if (has("Mariel") && has("Lady")) {
                invalid = true;
                break;
              }
            }

            if (invalid) {
              continue;
            }

            const projectedStats = users.reduce(
              (acc, user) => {
                acc[user] = { ...userStats[user] };
                return acc;
              },
              {} as Record<User, { primary: number; backup: number }>,
            );

            slots.forEach((slot, i) => {
              const primary = primarySet[i];
              const backup = backupSet[i];

              projectedStats[primary].primary += 1;
              projectedStats[backup].backup += 1;

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
    }

    // If no perfect assignment found, create a fallback with available users
    if (!bestAssignment && availableUsers.length > 0) {
      const daySlots: Record<Slot, SlotAssignment> = {
        27: null,
        28: null,
      };

      // Assign primaries first
      const sortedUsers = availableUsers.slice().sort((a, b) => {
        const aScore = userStats[a].primary * 2 + userStats[a].backup;
        const bScore = userStats[b].primary * 2 + userStats[b].backup;
        return aScore - bScore; // Lower scores first (fairness)
      });

      const slotList = slots.filter((slot) => !unavailableSlots.includes(slot));
      for (let i = 0; i < Math.min(slotList.length, sortedUsers.length); i++) {
        if (!unavailableSlots.includes(slotList[i])) {
          daySlots[slotList[i]] = { primary: sortedUsers[i], backup: null };
        }
      }

      // Assign backups if there are more users available
      const backupUsers = sortedUsers.slice(
        Math.min(slotList.length, sortedUsers.length),
      );
      let backupIndex = 0;
      for (let i = 0; i < slotList.length; i++) {
        const slotAssignment = daySlots[slotList[i]];
        if (slotAssignment && backupIndex < backupUsers.length) {
          const backup = backupUsers[backupIndex];
          if (slotAssignment.primary !== backup) {
            slotAssignment.backup = backup;
            backupIndex++;
          }
        }
      }

      bestAssignment = { slots: daySlots, score: 0 };
    }

    if (!bestAssignment) {
      continue;
    }

    Object.entries(bestAssignment.slots).forEach(([slotKey, slotValue]) => {
      const slot = slotKey as Slot;
      assignments[slot] = slotValue;
      if (slotValue) {
        userStats[slotValue.primary!].primary += 1;
        if (slotValue.backup) {
          userStats[slotValue.backup].backup += 1;
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
