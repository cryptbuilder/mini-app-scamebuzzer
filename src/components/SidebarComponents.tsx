import React from "react";
import { User, Home, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaCog, FaBook, FaShieldAlt } from "react-icons/fa";

export const SidebarComponents = ({ user }: { user: any }) => {
  const location = useLocation();
  const activeTab = location.pathname.split("/").pop();

  return (
    <div className="w-16 bg-gray-900 shadow-lg flex flex-col justify-between py-6 border-r border-gray-800">
      <div className="flex flex-col items-center space-y-6">
        <Link
          to="/"
          className={`text-gray-500 text-2xl  cursor-pointer ${
            activeTab === "" || activeTab === "/" ? "text-green-500" : ""
          }`}
        >
          <FaHome
            className={`hover:text-green-400 ${
              activeTab === "" ? "text-green-500" : "text-gray-500"
            }`}
          />
        </Link>
        <>
          <Link
            to="/plan"
            className={`text-gray-500 text-2xl  cursor-pointer ${
              activeTab === "plan" ? "text-green-500" : ""
            }`}
          >
            <FaBook
              className={`hover:text-green-400 ${
                activeTab === "plan" ? "text-green-500" : "text-gray-500"
              }`}
            />
          </Link>
        </>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {user !== null && (
          <Link
            to="/profile"
            className={`hover:opacity-80 transition-opacity ${
              activeTab === "settings" ? "text-green-500" : "text-gray-500"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r flex items-center justify-center overflow-hidden border-2 border-gray-700 hover:border-green-400 transition-colors">
              <User size={20} className="text-white" />
            </div>
          </Link>
        )}

        <Link
          to="/settings"
          className={`text-gray-500 text-2xl  cursor-pointer ${
            activeTab === "settings" ? "text-green-500" : ""
          }`}
        >
          <FaCog
            className={`hover:text-green-400 ${
              activeTab === "settings" ? "text-green-500" : "text-gray-500"
            }`}
          />
        </Link>
      </div>
    </div>
  );
};

export default SidebarComponents;
