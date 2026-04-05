"use client";

import { Fragment, useMemo, useState } from "react";
import { useParkingStore } from "@/lib/store";
import { Slot } from "@/lib/types";
import dayjs from "dayjs";
import Modal from "@/components/Modal";
import ParkingSlot from "@/components/ParkingSlot";
import Header from "@/components/Header";

export default function TodaySchedulePage() {
  const { schedule, skipPrimary } = useParkingStore();
  const [selectedDate, setSelectedDate] = useState(() => {
    const currentDate = dayjs().format("YYYY-MM-DD");
    if (schedule.length > 0) {
      if (schedule[0].date === currentDate) {
        return schedule[0].date;
      } else {
        const found = schedule.find((s) => s.date === currentDate);
        return found ? found.date : schedule[0].date;
      }
    }
    return currentDate;
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
    <>
      <Header
        title="Parking Rotation System"
        actionMenu={{
          label: "View calendar",
          href: "/parking",
        }}
      />
      <div className="flex flex-col max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Schedule Today</h1>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <label
            className="block font-mono font-medium text-gray-700 uppercase text-xs"
            htmlFor="date"
          >
            Select a day
          </label>
          <select
            id="date"
            // className="w-full border border-gray-300 rounded px-3 py-2"
            className="w-full outline-none py-2 border-b bg-transparent cursor-pointer"
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
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4 h-full">
            <h2 className="text-2xl font-semibold">
              Schedule for {dayjs(selectedDate).format("MMMM D, YYYY (dddd)")}
            </h2>
            <div className="flex gap-4 h-32 md:h-42">
              {Object.entries(scheduleForDate.slots).map(
                ([slot, assignment]) => (
                  <Fragment key={slot}>
                    <ParkingSlot slot={slot as Slot} assignment={assignment} />
                  </Fragment>
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
    </>
  );
}
