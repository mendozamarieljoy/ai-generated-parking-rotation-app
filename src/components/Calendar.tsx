"use client";

import { useParkingStore } from "@/lib/store";
import { DaySchedule, Slot } from "@/lib/types";

export default function Calendar() {
  const { schedule } = useParkingStore();

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
    const dateStr = date.toISOString().split("T")[0];
    return schedule.find((s) => s.date === dateStr);
  };

  const renderSlot = (
    slot: Slot,
    assignment: { primary: string; backup: string },
  ) => (
    <div
      key={slot}
      className={`p-2 rounded ${slot === "332" ? "bg-yellow-100 border-yellow-300" : "bg-blue-100 border-blue-300"} border`}
    >
      <div className="text-xs font-semibold">{slot}</div>
      <div className="text-xs">P: {assignment.primary}</div>
      <div className="text-xs">B: {assignment.backup}</div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">April 2026 Parking Schedule</h2>
      <div className="grid grid-cols-5 gap-2">
        {daysInWeek.map((day) => (
          <div key={day} className="text-center font-semibold p-2">
            {day}
          </div>
        ))}
        {weekdayCalendarDays.map((date, index) => (
          <div key={index} className="min-h-32 border p-2">
            {date && (
              <>
                <div className="text-sm font-semibold mb-1">
                  {date.getDate()}
                </div>
                {(() => {
                  const daySchedule = getScheduleForDate(date);
                  return daySchedule ? (
                    <div className="space-y-1">
                      {Object.entries(daySchedule.slots).map(
                        ([slot, assignment]) =>
                          renderSlot(slot as Slot, assignment),
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">No schedule</div>
                  );
                })()}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
