"use client";

import { useParkingStore } from "@/lib/store";
import { DaySchedule, Slot } from "@/lib/types";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useState } from "react";
import Modal from "./Modal";
import { domToPng } from "modern-screenshot";
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

  const renderSlot = (
    slot: Slot,
    assignment: { primary: string | null; backup: string | null },
    date: string,
  ) => {
    return (
      <div
        key={slot}
        className="flex flex-col shadow-md rounded-md p-4 bg-white text-black border border-gray-200"
      >
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xl text-center font-bold w-12 h-12 border rounded-lg flex items-center justify-center">
              {slot}
            </span>
            <div>
              <p className="font-bold">{assignment.primary}</p>
              <p className="text-xs text-gray-500">
                Backup user: {assignment.backup}
              </p>
            </div>
          </div>
          <button
            data-hide-export
            onClick={() => setToSkipSlot({ date, slot })}
            className="text-xs bg-slate-500 hover:bg-slate-600 text-white font-bold uppercase px-4 py-2 rounded"
          >
            Skip
          </button>
        </div>
        <div className="flex justify-between items-center gap-4 text-sm w-full"></div>
      </div>
    );
  };

  const exportCalendar = async () => {
    const el = document.getElementById("parking-schedule-calendar");

    // TypeScript now knows 'el' is either HTMLElement or null
    if (el) {
      const width = el.scrollWidth;
      const height = el.scrollHeight;

      const dataUrl = await domToPng(el, {
        width: width, // Forces the output to the full content width
        height: height, // Forces the output to the full content height
        style: {
          overflow: "visible", // Ensures the CSS doesn't try to clip it
        },
        filter: (node) => {
          const exclusionAttribute = "data-hide-export";
          if (
            node instanceof HTMLElement &&
            node.hasAttribute(exclusionAttribute)
          ) {
            return false;
          }
          return true;
        },
      });
      // Inside this block, 'el' is guaranteed to be a Node/HTMLElement
      // const dataUrl = await domToPng(el);

      const link = document.createElement("a");
      link.download = "calendar.png";
      link.href = dataUrl;
      link.click();
    } else {
      console.error(
        "Target element 'parking-schedule-calendar' not found in the DOM.",
      );
    }
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h2 className="text-lg lg:text-2xl font-bold">April 2026</h2>
        <button
          onClick={exportCalendar}
          className="bg-slate-500 text-white px-4 py-2 rounded hover:bg-slate-600 text-xs"
        >
          Save as image
        </button>
      </div>
      <div
        id="parking-schedule-calendar"
        className="bg-white p-6 rounded-lg shadow-md overflow-x-auto"
      >
        <div className="grid grid-cols-5 gap-4 min-w-400 max-w-full">
          {daysInWeek.map((day) => (
            <div key={day} className="text-center font-semibold p-2">
              {day}
            </div>
          ))}
          {weekdayCalendarDays.map((date, index) => (
            <div
              key={index}
              className={`min-h-32 p-2 ${date && "bg-gray-100 rounded-lg"}`}
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
    </>
  );
}
