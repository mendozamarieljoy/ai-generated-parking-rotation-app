"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParkingStore } from "@/lib/store";
import { Slot } from "@/lib/types";

function formatSlot(
  slot: Slot,
  assignment: { primary: string; backup: string },
) {
  return (
    <div key={slot} className="p-3 rounded-lg border bg-white shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold">Slot {slot}</span>
      </div>
      <div className="text-sm">
        <p>
          Primary: <strong>{assignment.primary}</strong>
        </p>
        <p>
          Backup: <strong>{assignment.backup}</strong>
        </p>
      </div>
    </div>
  );
}

export default function TodaySchedulePage() {
  const { schedule } = useParkingStore();
  const [selectedDate, setSelectedDate] = useState(() => {
    if (schedule.length > 0) {
      return schedule[0].date;
    }
    return new Date().toISOString().split("T")[0];
  });

  const scheduleForDate = useMemo(
    () => schedule.find((day) => day.date === selectedDate),
    [schedule, selectedDate],
  );

  const availableDates = useMemo(
    () => schedule.map((day) => day.date),
    [schedule],
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Daily Parking Schedule</h1>
          <Link href="/parking" className="text-blue-600 hover:underline">
            View dashboard
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label
            className="block font-medium text-gray-700 mb-2"
            htmlFor="date"
          >
            Select a day
          </label>
          <select
            id="date"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          >
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        {scheduleForDate ? (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-2xl font-semibold">
              Schedule for {scheduleForDate.date} ({scheduleForDate.day})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(scheduleForDate.slots).map(([slot, assignment]) =>
                formatSlot(slot as Slot, assignment),
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
            No schedule found for {selectedDate}. Please pick another date.
          </div>
        )}
      </div>
    </div>
  );
}
