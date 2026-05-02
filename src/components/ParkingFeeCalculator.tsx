import { useMemo, useState } from "react";

export default function ParkingFeeCalculator() {
  const [hours, setHours] = useState<number>(3);

  const result = useMemo(() => {
    if (!hours || hours <= 0) return 0;

    const baseFee = 50;
    const extraHours = Math.max(0, hours - 3);
    const extraFee = extraHours * 20;

    return baseFee + extraFee;
  }, [hours]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span>💰</span>
        <p className=" font-semibold text-zinc-800">
          Pay Parking Fee Calculator
        </p>
      </div>

      {/* Inputs */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={3}
            step={1}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="rounded-lg border border-zinc-200 px-3 py-1"
            style={{ width: "60px" }}
          />
          <span className=" text-zinc-600">hours intended stay</span>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-1 text-zinc-600 mt-4">
        <p>
          Base (first 3 hours): <span className="font-bold">₱50</span>
        </p>

        <p>
          Extra hours:{" "}
          <span className="font-bold">{Math.max(0, hours - 3)} hr × ₱20</span>
        </p>
      </div>

      {/* Result */}
      <div className="border-t border-zinc-100 mt-2">
        <p className=" font-semibold text-zinc-800 mt-2">
          Total Fee: ₱{result}
        </p>
      </div>
    </div>
  );
}
