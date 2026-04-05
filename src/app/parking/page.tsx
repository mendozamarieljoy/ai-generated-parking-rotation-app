"use client";

import Calendar from "@/components/Calendar";
import FairnessDashboard from "@/components/FairnessDashboard";
import CostSimulationPanel from "@/components/CostSimulationPanel";
import SchedulerControls from "@/components/SchedulerControls";
import Header from "@/components/Header";

export default function ParkingPage() {
  return (
    <>
      <Header
        title="Parking Rotation System"
        actionMenu={{
          label: "Schedule Today",
          href: "/parking/today",
        }}
      />

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
    </>
  );
}
