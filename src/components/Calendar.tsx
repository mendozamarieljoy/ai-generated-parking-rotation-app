"use client";

import { useParkingStore } from "@/lib/store";
import { DaySchedule, Slot } from "@/lib/types";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useState } from "react";
import Modal from "./Modal";

export default function Calendar() {
  const { schedule, skipPrimary } = useParkingStore();

  const [toSkipSlot, setToSkipSlot] = useState<{
    date: string;
    slot: Slot;
  } | null>(null);

  const daysInWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  // Get April 2026 calendar
  const year = 2026;
  const month = 3; // April
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  const calendarDays: (Date | null)[] = [];
  const current = new Date(startDate);
  while (current <= lastDay || calendarDays.length % 7 !== 0) {
    if (current.getMonth() === month) {
      calendarDays.push(new Date(current));
    } else {
      calendarDays.push(null);
    }
    current.setDate(current.getDate() + 1);
  }

  const weekdayCalendarDays = [] as (Date | null)[];
  for (let i = 0; i < calendarDays.length; i += 7) {
    const week = calendarDays.slice(i, i + 7);
    week.forEach((date, idx) => {
      // keep only Mon-Fri
      if (idx >= 1 && idx <= 5) {
        weekdayCalendarDays.push(date);
      }
    });
  }

  const getScheduleForDate = (date: Date): DaySchedule | undefined => {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const dateStr = dayjs(date).tz("Asia/Manila").format("YYYY-MM-DD");
    return schedule.find((s) => s.date === dateStr);
  };

  const getSlotColor = (slot: Slot, isUnavailable: boolean) => {
    if (isUnavailable) return "bg-gray-300 border-gray-400";
    switch (slot) {
      case "27":
        return "bg-blue-100 border-blue-300";
      case "28":
        return "bg-blue-200 border-blue-400";
      case "332":
        return "bg-blue-300 border-blue-500";
    }
  };

  const renderSlot = (
    slot: Slot,
    assignment: { primary: string | null; backup: string | null },
    date: string,
    unavailableSlots: Slot[],
  ) => {
    const isUnavailable = unavailableSlots.includes(slot);
    return (
      <div
        key={slot}
        className="flex flex-col shadow-md rounded-md p-4 border border-gray-200"
      >
        <div className="flex justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`${getSlotColor(slot, isUnavailable)} p-2 text-xs rounded-lg max-w-12 text-center font-bold`}
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
  };

  return (
    <div>
      <h2 className="text-lg lg:text-2xl font-bold mb-4">
        April 2026 Parking Schedule
      </h2>
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <div className="grid grid-cols-5 gap-4 min-w-400 max-w-full">
          {daysInWeek.map((day) => (
            <div key={day} className="text-center font-semibold p-2">
              {day}
            </div>
          ))}
          {weekdayCalendarDays.map((date, index) => (
            <div
              key={index}
              className={`min-h-32 p-2 ${date && "border border-gray-200 rounded-md"}`}
            >
              {date && (
                <>
                  <div className="text-sm font-semibold mb-1">
                    {date.getDate()}
                  </div>
                  {(() => {
                    const daySchedule = getScheduleForDate(date);
                    return daySchedule ? (
                      <div className="space-y-4">
                        {Object.entries(daySchedule.slots).map(
                          ([slot, assignment]) =>
                            renderSlot(
                              slot as Slot,
                              assignment,
                              daySchedule.date,
                              daySchedule.unavailableSlots,
                            ),
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No schedule</div>
                    );
                  })()}
                </>
              )}
            </div>
          ))}
        </div>
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
