import React, { useEffect } from "react";
import { FaChevronRight, FaShieldAlt } from "react-icons/fa";
import { trackGA } from "@/utils/ga";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    trackGA("settings_visited", {
      current_plan: user?.subscriptionData?.plan,
    });
  }, []);

  const isGuest = !user;
  const isFreePlan = user?.subscriptionData?.plan === "free";

  return (
    <div className="flex flex-col w-full min-w-xs p-4 bg-gray-900 rounded-xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-1">Settings</h2>
      </div>

      <div className="space-y-4">
        {/* 🔐 Show login prompt if not logged in */}
        {isGuest && (
          <div className="flex items-center justify-between bg-green-800 rounded-lg px-4 py-4 hover:bg-green-700 transition">
            <div className="flex flex-col">
              <span className="font-semibold text-white">Login</span>
              <span className="text-sm text-white/80">
                Log in to unlock unlimited scans & features.
              </span>
            </div>
            <button
              onClick={async () => {
                localStorage.removeItem("freePlan");
                setTimeout(() => {
                  navigate("/login");
                }, 2000);
              }}
              className="text-sm bg-white text-green-700 font-semibold px-3 py-1 rounded hover:bg-gray-100"
            >
              LogIn
            </button>
          </div>
        )}

        <div className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-4">
          <span className="font-semibold text-white">Version</span>
          <span className="text-white">V0.0.1</span>
        </div>

        <a
          href="https://scambuzzer.com/terms-of-use"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-4 cursor-pointer hover:bg-gray-700 transition"
        >
          <span className="font-semibold text-white">Terms of Service</span>
          <FaChevronRight className="text-white" />
        </a>

        <a
          href="https://scambuzzer.com/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-4 cursor-pointer hover:bg-gray-700 transition"
        >
          <span className="font-semibold text-white">Privacy Policy</span>
          <FaChevronRight className="text-white" />
        </a>
      </div>
    </div>
  );
};
