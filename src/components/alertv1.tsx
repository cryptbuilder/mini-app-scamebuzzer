import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface ScamWarningProps {
  url: string;
  warnings: string[];
}

const ScamWarning = ({ url, warnings }: ScamWarningProps) => {
  const [activeTab, setActiveTab] = useState<"action" | "why">("action");

  return (
    <div className="bg-black/90 rounded-lg border-6 border-green-700 p-6 shadow-lg max-w-3xl mx-auto">
      {/* Header Section with Logo and Warning Triangle */}
      <div className="flex justify-between items-center w-full mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-scambuzzer-text rounded-full flex items-center justify-center">
            <img
              src="/ScamBuzzer.png"
              alt="ScamBuzzer Logo"
              className="object-contain w-50"
            />
          </div>
          <span className="text-scambuzzer-text text-2xl font-bold">
            ScamBuzzer
          </span>
        </div>
      </div>

      {/* Warning Title */}
      <div className="w-full text-center mb-8">
        <div className="flex justify-center items-center">
          <img src="/ScamBuzzerAlert.gif" alt="ScamBuzzer Logo" />
        </div>
        <h2 className="text-red-500 text-2xl font-bold mb-1">
          ScamBuzzer Alert: Potential scam site
        </h2>
        <p className="text-red-400 text-lg mb-4">Website: {url}</p>
      </div>

      {/* Buttons instead of Tabs */}
      <div className="grid w-full grid-cols-2 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("action")}
          className={`py-3 text-lg font-medium rounded-md ${
            activeTab === "action"
              ? "bg-green-500 text-black hover:bg-green-600 border-2 border-white"
              : "bg-green-500 text-black hover:bg-green-600"
          }`}
        >
          Action
        </button>
        <button
          onClick={() => setActiveTab("why")}
          className={`py-3 text-lg font-medium rounded-md ${
            activeTab === "why"
              ? "bg-red-500 text-white hover:bg-red-600 border-2 border-white"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          Why?
        </button>
      </div>

      {/* Content based on active button */}
      {activeTab === "action" ? (
        <div className="bg-green-500 text-black p-6 rounded-md">
          <p className="font-medium text-lg">
            <span className="font-bold">Action:</span> Don't rush. Check the URL
            for typos or wrong domain endings (.com vs .net). Confirm the site
            from official social channels or a trusted person before proceeding.
          </p>
        </div>
      ) : (
        <div className="bg-red-500 text-white p-6 rounded-md">
          <div className="font-medium text-lg">
            <span className="font-bold block mb-2">Warning Signs:</span>
            <ul className="list-disc pl-6 space-y-2">
              {warnings.length > 0 &&
                warnings.map((warning) => {
                  return (
                    <li>
                      <span className="font-semibold">{warning}</span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScamWarning;
