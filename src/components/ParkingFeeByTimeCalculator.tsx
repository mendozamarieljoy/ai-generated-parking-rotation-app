import { useMemo, useState } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export default function ParkingFeeTimeCalculator() {
  const [timeIn, setTimeIn] = useState("08:00");
  const [timeOut, setTimeOut] = useState("11:30");

  const result = useMemo(() => {
    if (!timeIn || !timeOut) return null;

    const start = dayjs(`2026-01-01 ${timeIn}`);
    let end = dayjs(`2026-01-01 ${timeOut}`);

    // handle overnight parking
    if (end.isBefore(start)) {
      end = end.add(1, "day");
    }

    const hours = end.diff(start, "minute") / 60;

    const baseHours = Math.min(3, hours);
    const extraHours = Math.max(0, hours - 3);

    const baseFee = 50;
    const extraFee = Math.ceil(extraHours) * 20;

    const total = baseFee + extraFee;

    return {
      hours,
      baseHours,
      extraHours,
      total,
      start,
      end,
    };
  }, [timeIn, timeOut]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span>💰</span>
        <p className=" font-semibold text-zinc-800">Parking Fee Calculator</p>
      </div>

      {/* Inputs */}
      <div className="flex gap-3 py-2">
        <div className="space-y-1">
          <p className="text-sm text-zinc-500">Time In</p>
          <input
            type="time"
            value={timeIn}
            onChange={(e) => setTimeIn(e.target.value)}
            className="rounded-lg border border-zinc-200 px-2 py-1"
          />
        </div>

        <div className="space-y-1">
          <p className="text-sm text-zinc-500">Time Out</p>
          <input
            type="time"
            value={timeOut}
            onChange={(e) => setTimeOut(e.target.value)}
            className="rounded-lg border border-zinc-200 px-2 py-1"
          />
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-2 border-zinc-100 py-2  text-zinc-600">
          <p>
            ⏱ Duration:{" "}
            <span className="font-bold text-zinc-800">
              {result.hours.toFixed(2)} hrs
            </span>
          </p>

          <p>
            Base (first 3 hrs): <span className="font-bold">₱50</span>
          </p>

          <p>
            Extra hours:{" "}
            <span className="font-bold">
              {Math.max(0, result.extraHours).toFixed(2)} hrs × ₱20
            </span>
          </p>

          <div className="pt-2  font-semibold text-zinc-800">
            Total Fee: ₱{result.total}
          </div>
        </div>
      )}
    </div>
  );
}
