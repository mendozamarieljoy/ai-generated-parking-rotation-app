import { create } from 'zustand';
import { DaySchedule, UserStats, CostStats } from './types';
import { generateSchedule } from './scheduler';
import { calculateFairnessScore, calculateBenefitScore } from './utils';
import { users } from './types';

interface ParkingState {
  schedule: DaySchedule[];
  userStats: Record<string, UserStats>;
  costStats: Record<string, CostStats>;
  regenerateSchedule: () => void;
}

const COST_PER_SLOT = 50;
const OUTSIDE_PARKING_COST = 100; // assume

function calculateUserStats(schedule: DaySchedule[]): Record<string, UserStats> {
  const stats: Record<string, { primary: number; backup: number; slot332: number }> = {};
  users.forEach(user => {
    stats[user] = { primary: 0, backup: 0, slot332: 0 };
  });

  schedule.forEach(day => {
    Object.entries(day.slots).forEach(([slotKey, slot]) => {
      stats[slot.primary].primary++;
      stats[slot.backup].backup++;
      if (slotKey === '332') {
        stats[slot.primary].slot332++;
      }
    });
  });

  const userStats: Record<string, UserStats> = {};
  users.forEach(user => {
    const s = stats[user];
    userStats[user] = {
      primaryCount: s.primary,
      backupCount: s.backup,
      slot332Count: s.slot332,
      fairnessScore: calculateFairnessScore(s)
    };
  });

  return userStats;
}

function calculateCostStats(schedule: DaySchedule[], userStats: Record<string, UserStats>): Record<string, CostStats> {
  const totalSlots = schedule.length * 3;
  const costPerUser = (totalSlots * COST_PER_SLOT) / users.length;

  const costStats: Record<string, CostStats> = {};
  users.forEach(user => {
    const stats = userStats[user];
    const benefit = calculateBenefitScore(stats.primaryCount, stats.backupCount, stats.slot332Count);
    const estimatedCost = costPerUser;
    const savings = OUTSIDE_PARKING_COST * (stats.primaryCount + stats.backupCount * 0.5) - estimatedCost;
    costStats[user] = {
      estimatedCost,
      savings,
      benefitScore: benefit
    };
  });

  return costStats;
}

// Initialize stats
const initialSchedule = generateSchedule(2026, 3);
const initialUserStats = calculateUserStats(initialSchedule);
const initialCostStats = calculateCostStats(initialSchedule, initialUserStats);

export const useParkingStore = create<ParkingState>((set, get) => ({
  schedule: initialSchedule,
  userStats: initialUserStats,
  costStats: initialCostStats,
  regenerateSchedule: () => {
    const newSchedule = generateSchedule(2026, 3);
    const newUserStats = calculateUserStats(newSchedule);
    const newCostStats = calculateCostStats(newSchedule, newUserStats);
    set({ schedule: newSchedule, userStats: newUserStats, costStats: newCostStats });
  }
}));