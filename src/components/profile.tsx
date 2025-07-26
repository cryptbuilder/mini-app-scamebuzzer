import React, { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { trackGA } from "@/utils/ga";

const Profile: React.FC = () => {
  const { user, handleLogout, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[500px] flex-col w-full min-w-xs rounded-lg overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-gray-800 rounded-lg p-4 space-y-6 flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400"></div>
          </div>
        </div>
      </div>
    );
  }

  const planLabels: Record<string, string> = {
    "1": "Monthly",
    "2": "Lifetime",
  };

  const planKey = user?.subscriptionData?.plan ?? "0";
  const planName = planLabels[planKey] ?? "Free";

  const initials = (user?.name ?? user?.email ?? "")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    trackGA("profile_visited", {
      user: user.id,
    });
  }, []);

  return (
    <div className="flex h-[500px] flex-col w-full min-w-xs rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-gray-800 rounded-lg p-4 space-y-6">
          <div className="flex justify-center">
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-400 text-black font-bold">
              {planName}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center overflow-hidden">
              <span className="text-2xl font-bold text-black">{initials}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 text-gray-400">
            <div className="flex justify-between">
              <span>Subscription</span>
              <span className="text-green-400 font-medium">{planName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Protection Status</span>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                <span className="text-white">
                  {user?.subscriptionData?.status}
                </span>
              </div>
            </div>
          </div>

          {planName === "Free" && (
            <button
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg"
              onClick={() => {
                window.open("https://scambuzzer.com/#pricing", "_blank");
                trackGA("plan_upgrade_clicked", {
                  current_plan: user?.subscriptionData?.plan,
                });
              }}
            >
              Upgrade to Premium
            </button>
          )}

          <button
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg cursor-pointer"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
