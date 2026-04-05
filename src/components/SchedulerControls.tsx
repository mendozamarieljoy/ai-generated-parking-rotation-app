"use client";

import { useParkingStore } from "@/lib/store";
import { domToPng } from "modern-screenshot";
import dayjs from "dayjs";
import { useState } from "react";

const DownloadIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const JsonIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
  </svg>
);

const ImageIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-4 h-4"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export default function SchedulerControls() {
  const { regenerateSchedule } = useParkingStore();

  const exportSchedule = () => {
    const { schedule } = useParkingStore.getState();
    const dataStr = JSON.stringify(schedule, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "parking-schedule.json";
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const exportCalendar = async () => {
    const el = document.getElementById("parking-schedule-calendar");

    // TypeScript now knows 'el' is either HTMLElement or null
    if (el) {
      const width = el.scrollWidth;
      const height = el.scrollHeight;

      const dataUrl = await domToPng(el, {
        width: width, // Forces the output to the full content width
        height: height, // Forces the output to the full content height
        style: {
          overflow: "visible", // Ensures the CSS doesn't try to clip it
        },
        filter: (node) => {
          const exclusionAttribute = "data-hide-export";
          if (
            node instanceof HTMLElement &&
            node.hasAttribute(exclusionAttribute)
          ) {
            return false;
          }
          return true;
        },
      });
      // Inside this block, 'el' is guaranteed to be a Node/HTMLElement
      // const dataUrl = await domToPng(el);

      const link = document.createElement("a");
      link.download = `export-parking-rotation-${dayjs().format("YYYYMMDDhhmmss")}.png`;
      link.href = dataUrl;
      link.click();
    } else {
      console.error(
        "Target element 'parking-schedule-calendar' not found in the DOM.",
      );
    }
  };
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md transition-all border border-slate-600"
      >
        <DownloadIcon />
        <span className="hidden md:block font-mono font-medium text-xs uppercase tracking-widest">
          Export
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
          <div className="py-1">
            <button
              onClick={() => {
                exportSchedule();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-xs font-inter font-bold text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
            >
              <JsonIcon />
              <span className="uppercase tracking-tight">Save as JSON</span>
            </button>

            <button
              onClick={() => {
                exportCalendar();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 w-full px-4 py-3 text-xs font-inter font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ImageIcon />
              <span className="uppercase tracking-tight">Save as Image</span>
            </button>
          </div>
        </div>
      )}

      {/* <button
          onClick={regenerateSchedule}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Regenerate Schedule
        </button> */}
    </div>
  );
}
