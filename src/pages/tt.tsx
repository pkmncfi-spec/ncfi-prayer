import { useState } from "react";

export default function TabExample() {
  const [activeTab, setActiveTab] = useState("regional");

  return (
    <div className="w-full">
      {/* Tab Header */}
      <div className="flex gap-6 border-b justify-center">
        {["regional", "international"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative pb-2 text-lg font-semibold transition-all ${
              activeTab === tab ? "text-black" : "text-gray-500"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {activeTab === tab && (
              <span className="absolute left-0 -bottom-[2px] h-[3px] w-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === "regional" ? (
          <p>Konten Regional...</p>
        ) : (
          <p>Konten International...</p>
        )}
      </div>
    </div>
  );
}
