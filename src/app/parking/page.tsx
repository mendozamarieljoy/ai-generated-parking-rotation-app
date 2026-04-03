"use client";

import Calendar from "@/components/Calendar";
import FairnessDashboard from "@/components/FairnessDashboard";
import CostSimulationPanel from "@/components/CostSimulationPanel";
import SchedulerControls from "@/components/SchedulerControls";

export default function ParkingPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex flex-wrap items-center justify-between mb-8">
        <h1 className="text-2xl lg:text-4xl font-bold uppercase">
          Parking Rotation System
        </h1>
        {/* <a
          href="/parking/today"
          className="mt-4 lg:mt-0 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          View Today Schedule
        </a> */}
      </div>

      <div className="space-y-4">
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
