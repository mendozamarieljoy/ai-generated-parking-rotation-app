"use client";

import Calendar from "@/components/Calendar";
import FairnessDashboard from "@/components/FairnessDashboard";
import CostSimulationPanel from "@/components/CostSimulationPanel";
import SchedulerControls from "@/components/SchedulerControls";

export default function ParkingPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4 flex justify-between items-center gap-x-4 bg-slate-800 text-white">
        <h1 className="uppercase text-white font-bold font-mono">
          Parking Rotation System
        </h1>
        <a
          href="/parking/today"
          className="px-4 py-2 text-xs uppercase font-bold bg-white text-slate-950 rounded hover:bg-gray-200"
        >
          Schedule Today
        </a>
      </div>

      <div className="space-y-4 p-6">
        <Calendar />
        <div>
          <div className="flex flex-wrap lg:grid grid-cols-2 gap-4 mb-4">
            <FairnessDashboard />
            <CostSimulationPanel />
          </div>
          <SchedulerControls />
        </div>
      </div>
    </div>
  );
}
