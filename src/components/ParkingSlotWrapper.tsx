import { useParkingStore } from "@/lib/store";
import { DaySchedule, Slot } from "@/lib/types";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Fragment } from "react/jsx-runtime";
import ParkingSlot from "./ParkingSlot";
import { getHolidayName, isHoliday } from "@/lib/utils";

export default function ParkingSlotWrapper({
  date,
  innerClassName,
}: {
  date: Date;
  innerClassName?: string;
}) {
  const { schedule } = useParkingStore();
  const getScheduleForDate = (date: Date): DaySchedule | undefined => {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const dateStr = dayjs(date).tz("Asia/Manila").format("YYYY-MM-DD");
    return schedule.find((s) => s.date === dateStr);
  };

  if (isHoliday(date)) {
    const holidayName = getHolidayName(date);
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span>🎉</span>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-700">
              {holidayName}
            </p>

            <p className="text-xs text-zinc-500">Rest well today</p>
          </div>
        </div>
      </div>
    );
  }
  const daySchedule = getScheduleForDate(date);
  return daySchedule && daySchedule?.date ? (
    <div className="flex gap-2 h-36 lg:h-32">
      {Object.entries(daySchedule.slots).map(([slot, assignment]) => (
        <Fragment key={slot}>
          <ParkingSlot
            slot={slot as Slot}
            assignment={assignment}
            className={innerClassName}
          />
        </Fragment>
      ))}
    </div>
  ) : (
    <div className="text-sm text-gray-500">No schedule</div>
  );
}
