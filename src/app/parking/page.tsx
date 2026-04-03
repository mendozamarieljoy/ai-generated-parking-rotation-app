"use client";

import Calendar from "@/components/Calendar";
import FairnessDashboard from "@/components/FairnessDashboard";
import CostSimulationPanel from "@/components/CostSimulationPanel";
import SchedulerControls from "@/components/SchedulerControls";

export default function ParkingPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Parking Rotation System</h1>
        <a
          href="/parking/today"
          className="text-blue-600 font-medium hover:underline"
        >
          View Today Schedule
        </a>
      </div>

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar />
        </div>
        <div className="space-y-6">
          <FairnessDashboard />
          <CostSimulationPanel />
          <SchedulerControls />
        </div>
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Calendar />
        </div>
        <div className="grid grid-cols-2 gap-6 space-y-6">
          <FairnessDashboard />
          <CostSimulationPanel />
          <div className="col-span-2">
            <SchedulerControls />
          </div>
        </div>
      </div>
    </div>
  );
}
