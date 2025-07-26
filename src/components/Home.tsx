import React, { useState, useEffect } from "react";
import { StatusIndicator } from "../components/home/statusIndicator";
import { ScanResultItem } from "../components/home/scanResultItem";
import { Home, Lock, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "react-router-dom";
import { trackGA } from "@/utils/ga";

export const HomeComponent: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [scanData, setScanData] = useState({
    currentSite: { url: "", status: "safe" as const },
    recentScans: [] as Array<{ url: string; status: "safe" | "malicious" }>,
    suspiciousSites: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    trackGA("home_visited", {
      user: user?.id ?? "anonymous",
    });
  }, [user]);

  useEffect(() => {
    // Request initial data
    const requestInitialData = () => {
      // For web app, we can trigger a scan directly or get data from localStorage
      const currentScanData = JSON.parse(localStorage.getItem("scanData") || "{}");
      if (currentScanData.currentSite?.url) {
        setScanData(currentScanData);
        setIsLoading(false);
      } else {
        // Trigger a new scan if no data exists
        window.dispatchEvent(new CustomEvent("getScanData"));
      }
    };

    // Listen for real-time updates from content script
    const handleScanUpdate = (event: CustomEvent) => {
      console.log("Received real-time scan update:", event.detail);
      setScanData({
        currentSite: event.detail.currentSite || { url: "", status: "safe" },
        recentScans: event.detail.recentScans || [],
        suspiciousSites: event.detail.suspiciousSites || [],
      });
      setIsLoading(false);
    };

    // Listen for storage changes as fallback
    const onStorageChange = () => {
      const currentScanData = JSON.parse(localStorage.getItem("scanData") || "{}");
      if (currentScanData.currentSite?.url) {
        setScanData(currentScanData);
        setIsLoading(false);
      }
    };

    // Set up listeners
    window.addEventListener("scanUpdate", handleScanUpdate as EventListener);
    window.addEventListener("storage", onStorageChange);

    // Request initial data
    requestInitialData();

    // Also get data from storage as backup
    const currentScanData = JSON.parse(localStorage.getItem("scanData") || "{}");
    if (currentScanData.currentSite?.url) {
      setScanData(currentScanData);
    }
    setIsLoading(false);

    // Set up periodic refresh every 1 second for more responsive updates
    const refreshInterval = setInterval(() => {
      const currentScanData = JSON.parse(localStorage.getItem("scanData") || "{}");
      if (currentScanData.currentSite?.url) {
        setScanData((prevData) => {
          // Only update if the data has actually changed
          if (JSON.stringify(prevData) !== JSON.stringify(currentScanData)) {
            console.log("Periodic refresh detected data change");
            return currentScanData;
          }
          return prevData;
        });
      }
    }, 1000);

    // Cleanup listeners and intervals
    return () => {
      window.removeEventListener("scanUpdate", handleScanUpdate as EventListener);
      window.removeEventListener("storage", onStorageChange);
      clearInterval(refreshInterval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[500px] flex-col w-full min-w-xs">
        <div className="h-full overflow-y-auto space-y-4 p-4">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-400"></div>
            <span className="ml-3 text-gray-300">Loading scan data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[500px] flex-col w-full min-w-xs ">
      <div className="h-full overflow-y-auto space-y-4 p-4">
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Home className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-base font-semibold text-white">Current site</p>
              <p className="text-sm text-gray-300">
                {scanData.currentSite.url}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIndicator status={scanData.currentSite.status} />
            <button
              onClick={() => {
                setIsRefreshing(true);
                // For web app, trigger a new scan
                window.dispatchEvent(new CustomEvent("getScanData"));
                // Reset refreshing state after a short delay
                setTimeout(() => setIsRefreshing(false), 2000);
              }}
              className={`p-2 text-gray-400 hover:text-white transition-colors ${
                isRefreshing ? "animate-spin" : ""
              }`}
              title="Refresh scan data"
              disabled={isRefreshing}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Lock className="w-5 h-5 text-gray-400" />
            <p className="text-base font-semibold text-white">Recent Scans</p>
          </div>
          <div className="divide-y divide-gray-700">
            {scanData?.recentScans?.map((scan, index) => (
              <ScanResultItem key={index} url={scan.url} status={scan.status} />
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Settings className="w-5 h-5 text-gray-400" />
            <p className="text-base font-semibold text-white">
              Suspicious Detections
            </p>
          </div>
          <div className="space-y-2">
            {scanData &&
              scanData?.suspiciousSites?.map((domain, idx) => (
                <div
                  key={idx}
                  className="bg-gray-700 rounded-lg px-3 py-2 border border-gray-700"
                >
                  <p className="text-gray-300 text-sm">{domain}</p>
                </div>
              ))}
          </div>
        </div>

        {/* <div className="bg-gray-800 rounded-lg p-4">
          <p className="text-base font-semibold text-white mb-3">Tips / News</p>
          <div className="space-y-2">
            {newsItems.map((item, idx) => (
              <NewsItem key={idx} title={item} />
            ))}
          </div>
        </div> */}
      </div>
    </div>
  );
};
