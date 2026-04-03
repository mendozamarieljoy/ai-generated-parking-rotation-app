'use client';

import { useParkingStore } from '@/lib/store';

export default function SchedulerControls() {
  const { regenerateSchedule } = useParkingStore();

  const exportSchedule = () => {
    const { schedule } = useParkingStore.getState();
    const dataStr = JSON.stringify(schedule, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'parking-schedule.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Scheduler Controls</h2>
      <div className="space-x-4">
        <button 
          onClick={regenerateSchedule}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Regenerate Schedule
        </button>
        <button 
          onClick={exportSchedule}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}