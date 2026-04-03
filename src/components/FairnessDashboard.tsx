"use client";

import { useParkingStore } from "@/lib/store";
import { users } from "@/lib/types";

export default function FairnessDashboard() {
  const { userStats } = useParkingStore();

  const sortedUsers = [...users].sort(
    (a, b) => userStats[b].fairnessScore - userStats[a].fairnessScore,
  );
  const mostFavored = sortedUsers[0];
  const mostUnderused = sortedUsers[sortedUsers.length - 1];

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Fairness Dashboard</h2>
      <div className="grid lg:grid-cols-3 gap-4">
        {users.map((user) => {
          const stats = userStats[user];
          return (
            <div
              key={user}
              className={`p-4 rounded-lg border ${user === mostFavored ? "border-green-500 bg-green-50" : user === mostUnderused ? "border-red-500 bg-red-50" : "border-gray-300"}`}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">{user}</h3>
                <span className="text-sm text-gray-600">
                  Score: {stats.fairnessScore.toFixed(1)}
                </span>
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Primary: {stats.primaryCount}</span>
                  <span>Backup: {stats.backupCount}</span>
                  <span>332: {stats.slot332Count}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Most favored:</strong> {mostFavored}
        </p>
        <p>
          <strong>Most underused:</strong> {mostUnderused}
        </p>
      </div>
    </div>
  );
}
