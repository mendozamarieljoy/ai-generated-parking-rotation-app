"use client";

import { useParkingStore } from "@/lib/store";
import { DaySchedule, Slot } from "@/lib/types";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Fragment, useEffect, useState } from "react";
import Modal from "./Modal";
import { getNext12Months } from "@/lib/utils";
import ParkingSlot from "./ParkingSlot";
import ParkingSlotWrapper from "./ParkingSlotWrapper";
import SchedulerControls from "./SchedulerControls";
import FilterByUser from "./FilterByUser";

export default function CompactMode() {
  const availableMonths = getNext12Months();

  const {
    schedule,
    filteredSchedule,
    filteredUsers,
    skipPrimary,
    setDate,
    selectedMonth,
    selectedYear,
    regenerateSchedule,
  } = useParkingStore();

  const displaySchedule =
    filteredUsers.length > 0 ? filteredSchedule : schedule;

  const [toSkipSlot, setToSkipSlot] = useState<{
    date: string;
    slot: Slot;
  } | null>(null);

  // Get April 2026 calendar
  const year = selectedYear;
  const month = selectedMonth; // Month is 0-indexed
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

  const [showAllDates, setShowAllDates] = useState(false);

  const [showedSchedules, setShowedSchedules] = useState(() => {
    const filledDatesOnly = weekdayCalendarDays.filter((date, index) => {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      return displaySchedule.find(
        (sched) =>
          (dayjs().isBefore(date) || dayjs().isSame(date)) &&
          sched.date === formattedDate &&
          Object.values(sched.slots).some((v) => v !== null),
      );
    });

    return filledDatesOnly;
  });

  const onToggleShowedDates = () => {
    setShowAllDates(!showAllDates);
    const filteredDates = weekdayCalendarDays.filter((date, index) => {
      const formattedDate = dayjs(date).format("YYYY-MM-DD");
      const hasSchedule = displaySchedule.find((sched) => {
        if (showAllDates) {
          return (
            (dayjs().isBefore(date) || dayjs().isSame(date)) &&
            sched.date === formattedDate &&
            Object.values(sched.slots).some((v) => v !== null)
          );
        }
        return (
          sched.date === formattedDate &&
          Object.values(sched.slots).some((v) => v !== null)
        );
      });

      return hasSchedule;
    });

    setShowedSchedules(filteredDates);
  };

  return (
    <>
      <div
        id="parking-schedule-calendar"
        className="bg-white p-6 rounded-lg shadow-md md:hidden"
      >
        <div className="flex flex-col text-2xl font-sans md:border-b border-gray-100 text-slate-800 font-bold text-center uppercase md:pb-4 mb-4">
          <div className="w-full flex justify-between">
            <h2>
              {dayjs(`${selectedYear}-${selectedMonth + 1}-01`).format("MMMM")}
            </h2>
            <h2>{selectedYear}</h2>
          </div>
          <FilterByUser />
            <button className="mt-4 text-xs" onClick={onToggleShowedDates}>
              Show {showAllDates ? "future dates only" : "all dates"}
            </button>
        </div>
        <div className="flex flex-col gap-4">
          {showedSchedules.map((date, index) =>
            date ? (
              <div
                key={index}
                className={`min-h-32 ${date && "bg-white-100 p-4 border border-slate-200 shadow rounded-lg"}`}
              >
                {date && (
                  <>
                    <div className="flex items-center justify-between text-sm font-semibold font-sans mb-1">
                      <p>
                        {dayjs(
                          `${date.getMonth()}-${date.getDate()}-${date.getFullYear()}`,
                        ).format("MM-DD-YYYY")}
                      </p>
                      <p className="text-gray-500 uppercase text-xs">
                        {dayjs(date).format("dddd")}
                      </p>
                    </div>
                    <ParkingSlotWrapper
                      date={date}
                      innerClassName="max-w-1/3"
                    />
                  </>
                )}
              </div>
            ) : (
              <></>
            ),
          )}
        </div>
      </div>
    </>
  );
}
