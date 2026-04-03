"use client";

import { useParkingStore } from "@/lib/store";
import { users } from "@/lib/types";

export default function CostSimulationPanel() {
  const { costStats } = useParkingStore();

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">
        Cost Simulation (₱50/slot/day)
      </h2>
      <div className="grid lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const stats = costStats[user];
          return (
            <div key={user} className="p-4 rounded-lg border border-gray-300">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{user}</h3>
                <span className="text-sm text-gray-600">
                  Benefit: {stats.benefitScore.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-sm">
                <div>Estimated cost: ₱{stats.estimatedCost.toFixed(2)}</div>
                <div>Savings vs outside: ₱{stats.savings.toFixed(2)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
