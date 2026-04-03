"use client";

import { useMemo, useState } from "react";
import { useParkingStore } from "@/lib/store";
import { Slot } from "@/lib/types";
import dayjs from "dayjs";
import Modal from "@/components/Modal";

function formatSlot(
  slot: Slot,
  assignment: { primary: string | null; backup: string | null },
  date: string,
  setToSkipSlot: (value: { date: string; slot: Slot } | null) => void,
) {
  return (
    <div
      key={slot}
      className="flex flex-col shadow-md rounded-md p-4 border border-gray-200"
    >
      <div className="flex justify-between items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-2 text-xs rounded-lg max-w-12 text-center font-bold`}
            >
              #{slot}
            </span>
            <div>
              <div>
                <p className="text-xs">Primary user</p>
                <p className="font-bold">{assignment.primary}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  Backup user: {assignment.backup}
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setToSkipSlot({ date, slot })}
          className="text-xs bg-red-500 text-white font-bold uppercase px-4 py-2 rounded hover:bg-red-600"
        >
          Skip
        </button>
      </div>
      <div className="flex justify-between items-center gap-4 text-sm w-full"></div>
    </div>
  );

  return (
    <div key={slot} className="p-3 rounded-lg border bg-white shadow-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="font-semibold">#{slot}</span>
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
  const { schedule, skipPrimary } = useParkingStore();
  const [selectedDate, setSelectedDate] = useState(() => {
    if (schedule.length > 0) {
      return schedule[0].date;
    }
    return new Date().toISOString().split("T")[0];
  });

  const [toSkipSlot, setToSkipSlot] = useState<{
    date: string;
    slot: Slot;
  } | null>(null);

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
          <h1 className="text-2xl lg:text-4xl font-bold uppercase">
            Daily Parking Schedule
          </h1>
          {/* <Link
            href="/parking"
            className="mt-4 lg:mt-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View dashboard
          </Link> */}
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
                {dayjs(date).format("MMMM D, YYYY (dddd)")}
              </option>
            ))}
          </select>
        </div>

        {scheduleForDate ? (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-2xl font-semibold">
              Schedule for {dayjs(selectedDate).format("MMMM D, YYYY (dddd)")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(scheduleForDate.slots).map(([slot, assignment]) =>
                formatSlot(
                  slot as Slot,
                  assignment,
                  scheduleForDate.date,
                  setToSkipSlot,
                ),
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
            No schedule found for {selectedDate}. Please pick another date.
          </div>
        )}
      </div>

      <Modal
        isOpen={!!toSkipSlot}
        title={`Skip parking for ${dayjs(toSkipSlot?.date).format("MMMM D, YYYY")}
              slot ${toSkipSlot?.slot}?`}
        body="If you don't need this slot, we'll swap your assignment to find you a better time later."
        confirmLabel="Skip"
        cancelLabel="Cancel"
        onConfirm={() => {
          if (toSkipSlot) {
            skipPrimary(toSkipSlot.date, toSkipSlot.slot);
            setToSkipSlot(null);
          }
        }}
        onCancel={() => setToSkipSlot(null)}
      />
    </div>
  );
}
