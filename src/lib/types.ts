export const users = [
  "Reubs",
  "Nes",
  "Mariel",
  "Raph",
  "Lady",
  "Marvs",
  "Erwin",
] as const;

export type User = (typeof users)[number];

export type Slot = "332" | "27" | "28";

export type SlotAssignment = {
  primary: User | null;
  backup: User | null;
};

export type DaySchedule = {
  date: string; // YYYY-MM-DD
  day: string; // e.g., "Monday"
  slots: Record<Slot, SlotAssignment>;
  unavailableSlots: Slot[];
};

export type UserStats = {
  primaryCount: number;
  backupCount: number;
  slot332Count: number;
  fairnessScore: number;
};

export type CostStats = {
  estimatedCost: number;
  savings: number;
  benefitScore: number;
};
