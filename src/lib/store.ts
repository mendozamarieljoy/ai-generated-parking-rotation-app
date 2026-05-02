import { create } from "zustand";
import {
  DaySchedule,
  UserStats,
  CostStats,
  Slot,
  User,
  DaySlots,
} from "./types";
import { generateSchedule } from "./scheduler";
import { calculateFairnessScore, calculateBenefitScore } from "./utils";
import { users } from "./types";
import { usersList } from "./constants";

interface ParkingState {
  schedule: DaySchedule[];
  filteredSchedule: DaySchedule[];
  userStats: Record<string, UserStats>;
  costStats: Record<string, CostStats>;
  selectedYear: number;
  selectedMonth: number;
  filteredUsers: Array<string>;
  setDate: (year: number, month: number) => void;
  regenerateSchedule: () => void;
  toggleUnavailableSlot: (date: string, slot: Slot) => void;
  skipPrimary: (date: string, slot: Slot) => void;
  filterByUsers: (users: string[]) => void;
}

const COST_PER_SLOT = 50;
const OUTSIDE_PARKING_COST = 100; // assume

function calculateUserStats(
  schedule: DaySchedule[],
): Record<string, UserStats> {
  const stats: Record<string, { primary: number; backup: number }> = {};
  users.forEach((user) => {
    stats[user] = { primary: 0, backup: 0 };
  });

  schedule.forEach((day) => {
    Object.entries(day.slots).forEach(([slotKey, slot]) => {
      if (day.unavailableSlots.includes(slotKey as Slot)) {
        return;
      }
      if (slot?.primary) {
        stats[slot.primary].primary++;
      }
      if (slot?.backup) {
        stats[slot.backup].backup++;
      }
    });
  });

  const userStats: Record<string, UserStats> = {};
  users.forEach((user) => {
    const s = stats[user];
    userStats[user] = {
      primaryCount: s.primary,
      backupCount: s.backup,
      fairnessScore: calculateFairnessScore(s),
    };
  });

  return userStats;
}

function calculateCostStats(
  schedule: DaySchedule[],
  userStats: Record<string, UserStats>,
): Record<string, CostStats> {
  const totalSlots = schedule.length * 3;
  const costPerUser = (totalSlots * COST_PER_SLOT) / users.length;

  const costStats: Record<string, CostStats> = {};
  users.forEach((user) => {
    const stats = userStats[user];
    const benefit = calculateBenefitScore(
      stats.primaryCount,
      stats.backupCount,
    );
    const estimatedCost = costPerUser;
    const savings =
      OUTSIDE_PARKING_COST * (stats.primaryCount + stats.backupCount * 0.5) -
      estimatedCost;
    costStats[user] = {
      estimatedCost,
      savings,
      benefitScore: benefit,
    };
  });

  return costStats;
}

const DEFAULT_YEAR = 2026;
const DEFAULT_MONTH = 4;

// Initialize stats
const initialSchedule = generateSchedule(DEFAULT_YEAR, DEFAULT_MONTH);
const initialUserStats = calculateUserStats(initialSchedule);
const initialCostStats = calculateCostStats(initialSchedule, initialUserStats);
const initialUsers: string[] = [];

export const useParkingStore = create<ParkingState>((set, get) => ({
  selectedYear: DEFAULT_YEAR,
  selectedMonth: DEFAULT_MONTH,
  schedule: initialSchedule,
  filteredSchedule: initialSchedule,
  userStats: initialUserStats,
  costStats: initialCostStats,
  filteredUsers: initialUsers,
  setDate: (year, month) => {
    const newSchedule = generateSchedule(year, month);
    const newUserStats = calculateUserStats(newSchedule);
    const newCostStats = calculateCostStats(newSchedule, newUserStats);

    set({
      selectedYear: year,
      selectedMonth: month,
      schedule: newSchedule,
      userStats: newUserStats,
      costStats: newCostStats,
    });
  },
  regenerateSchedule: () => {
    const { selectedYear, selectedMonth } = get();

    const newSchedule = generateSchedule(selectedYear, selectedMonth);
    const newUserStats = calculateUserStats(newSchedule);
    const newCostStats = calculateCostStats(newSchedule, newUserStats);

    set({
      schedule: newSchedule,
      userStats: newUserStats,
      costStats: newCostStats,
    });
  },
  toggleUnavailableSlot: (date: string, slot: Slot) => {
    const { schedule } = get();

    // Find the current assignment and next day
    const currentDayIndex = schedule.findIndex((d) => d.date === date);
    const currentDay = schedule[currentDayIndex];
    const currentAssignment = currentDay?.slots[slot];
    const displacedPrimary = currentAssignment?.primary;
    const displacedBackup = currentAssignment?.backup;

    const modifiedSchedule = schedule.map((day) => {
      if (day.date === date) {
        const isUnavailable = day.unavailableSlots.includes(slot);
        const newUnavailableSlots = isUnavailable
          ? day.unavailableSlots.filter((s) => s !== slot)
          : [...day.unavailableSlots, slot];
        return { ...day, unavailableSlots: newUnavailableSlots };
      }
      return day;
    });

    // If making unavailable and we have displaced users, try to assign them to the next day
    if (
      displacedPrimary &&
      displacedBackup &&
      currentDayIndex >= 0 &&
      currentDayIndex < schedule.length - 1
    ) {
      const nextDayIndex = currentDayIndex + 1;
      const nextDay = modifiedSchedule[nextDayIndex];

      // Try to assign displacedPrimary as primary on next day if possible
      const nextDaySlots = Object.entries(nextDay.slots) as Array<
        [Slot, { primary: string | null; backup: string | null }]
      >;
      let assignedPrimary = false;
      let assignedBackup = false;

      for (const [nextSlot, nextAssignment] of nextDaySlots) {
        if (
          !assignedPrimary &&
          nextAssignment.primary &&
          nextAssignment.backup
        ) {
          // Swap: make displacedPrimary the primary, move current primary to backup
          modifiedSchedule[nextDayIndex].slots[nextSlot] = {
            primary: displacedPrimary,
            backup: nextAssignment.primary as User,
          };
          assignedPrimary = true;
        }
        if (!assignedBackup && nextAssignment.backup && assignedPrimary) {
          // If we still need to assign backup, try to swap with another backup slot
          if (
            nextAssignment.backup !== displacedPrimary &&
            modifiedSchedule[nextDayIndex].slots[nextSlot]
          ) {
            modifiedSchedule[nextDayIndex].slots[nextSlot] = {
              ...modifiedSchedule[nextDayIndex].slots[nextSlot],
              backup: displacedBackup,
            };
            assignedBackup = true;
            break;
          }
        }
      }
    }

    // Now regenerate to rebalance assignments using latest unavailable flags
    let regenerated = generateSchedule(2026, 3).map((day) => {
      const existing = modifiedSchedule.find((d) => d.date === day.date);
      if (existing) {
        return {
          ...day,
          unavailableSlots: existing.unavailableSlots,
        };
      }
      return day;
    });

    // For unavailable slots, clear the assignment to null values
    regenerated = regenerated.map((day) => {
      if (day.unavailableSlots.length === 0) return day;
      const updatedSlots = { ...day.slots };
      day.unavailableSlots.forEach((s) => {
        updatedSlots[s] = { primary: null, backup: null };
      });
      return { ...day, slots: updatedSlots };
    });

    const newUserStats = calculateUserStats(regenerated);
    const newCostStats = calculateCostStats(regenerated, newUserStats);
    set({
      schedule: regenerated,
      userStats: newUserStats,
      costStats: newCostStats,
    });
  },
  skipPrimary: (date: string, slot: Slot) => {
    const { schedule } = get();

    // First, find the primary user for this slot
    const dayIndex = schedule.findIndex((d) => d.date === date);
    if (dayIndex === -1) return;

    const primaryUser =
      dayIndex >= 0 ? schedule[dayIndex].slots[slot]?.primary : null;
    const backupUser =
      dayIndex >= 0 ? schedule[dayIndex].slots[slot]?.backup : null;

    const newSchedule = JSON.parse(JSON.stringify(schedule));

    // Step 1: Swap primary and backup on the current day/slot
    newSchedule[dayIndex].slots[slot] = {
      primary: backupUser,
      backup: primaryUser,
    };

    // Step 2: Find another day where primaryUser is backup and make them primary
    let found = false;
    for (let i = 0; i < newSchedule.length; i++) {
      if (i === dayIndex) continue;
      const dayEntries = Object.entries(newSchedule[i].slots) as Array<
        [Slot, { primary: string | null; backup: string | null }]
      >;
      for (const [s, assignment] of dayEntries) {
        if (assignment.backup === primaryUser && !found) {
          // Swap: make primaryUser the primary here
          const currentPrimary = assignment.primary;
          if (!currentPrimary) continue;
          newSchedule[i].slots[s as Slot] = {
            primary: primaryUser,
            backup: currentPrimary,
          };
          // Update the original day's backup to currentPrimary
          newSchedule[dayIndex].slots[slot].backup = currentPrimary;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    const newUserStats = calculateUserStats(newSchedule);
    const newCostStats = calculateCostStats(newSchedule, newUserStats);
    set({
      schedule: newSchedule,
      userStats: newUserStats,
      costStats: newCostStats,
    });
  },
  filterByUsers: (users: Array<string>) => {
    const { schedule } = get();
    const filteredSchedule = [...schedule].map((daySchedule) => {
      const updatedSlots: DaySlots = {
        27: null,
        28: null,
      };
      const userInRotation = Object.entries(daySchedule.slots).find(
        ([slot, assignment]) => {
          if (
            assignment &&
            users.some(
              (u) => u === assignment.primary || u === assignment.backup,
            )
          ) {
            return {
              [slot]: assignment,
            };
          }
        },
      );

      if (userInRotation) {
        const [slotKey, assignment] = userInRotation;
        updatedSlots[slotKey as keyof DaySlots] = assignment;
      }

      return {
        ...daySchedule,
        slots: updatedSlots,
      };
    });

    set({
      schedule,
      filteredSchedule,
      filteredUsers: users,
    });
  },
}));
