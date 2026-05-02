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
        <p className=" font-semibold text-zinc-800">Pay Parking Fee by hour</p>
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

      <div className="space-y-1 text-zinc-600 mt-4">
        <div className="flex justify-between items-center">
          <p>Base (first 3 hours)</p>
          <p>₱50</p>
        </div>
        <div className="flex justify-between items-center">
          <p>Extra hours({Math.max(0, hours - 3)} hr × ₱20)</p>
          <p>₱{Math.max(0, hours - 3) * 20}</p>
        </div>
        <div className="flex justify-between items-center font-bold border-t border-zinc-800 pt-2 mt-2">
          <p>Total Fee</p>
          <p>₱{result}</p>
        </div>
      </div>
    </div>
  );
}
