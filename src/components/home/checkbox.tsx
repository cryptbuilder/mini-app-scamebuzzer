import React, { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { isFeatureAllowed } from "@/lib/features";
import { trackGA } from "@/utils/ga";

type FeatureKey = "performSecurityChecks" | "performHTMLChecks" | "checkPhishingSite" | "twitterFeedScan" | "emailScan";

interface Feature {
  name: string;
  description: string;
  key: string;
  enabled: boolean;
  icon: string;
  feature: FeatureKey;
}

export const Checkbox: React.FC = () => {
  const [features, setFeatures] = useState<Feature[]>([
    {
      name: "HTML Analysis",
      description:
        "Analyzes the HTML content of websites to detect suspicious patterns and potential phishing indicators.",
      key: "webSafe",
      enabled: false,
      icon: "🔍",
      feature: "performHTMLChecks",
    },
    {
      name: "Typosquatting Checks",
      description:
        "Warn you if a site is mimicking a popular domain with subtle spelling variations.",
      key: "webSafe",
      enabled: false,
      icon: "✏️",
      feature: "performSecurityChecks",
    },
    {
      name: "Auto Warning on Scam Sites",
      description:
        "Real-time alerts when you land on known or suspicious phishing websites.",
      key: "webSafe",
      enabled: false,
      icon: "🚨",
      feature: "performSecurityChecks",
    },
    {
      name: "Phishing Site Check",
      description:
        "We check the site you're visiting against the most recently reported scam databases to help keep you safe.",
      key: "webSafe",
      enabled: false,
      icon: "🧪",
      feature: "checkPhishingSite",
    },
    {
      name: "Twitter Scan",
      description:
        "Extracts all external links from your Twitter feed and runs each one through phishing checks",
      key: "webSafe",
      enabled: false,
      icon: "💬",
      feature: "twitterFeedScan",
    },
    {
      name: "Email Scan",
      description:
        "Extracts all external links from visible email and runs each one through phishing checks",
      key: "webSafe",
      enabled: false,
      icon: "📧",
      feature: "emailScan",
    },
  ]);

  const { user } = useAuth();
  const plan = user?.subscriptionData?.plan ?? 0;

  useEffect(() => {
    const flags = JSON.parse(localStorage.getItem("flags") || "{}");
    setFeatures((prev) =>
      prev.map((f) => ({
        ...f,
        enabled: flags[f.key] ?? false,
      }))
    );
    trackGA("plan_visited", {
      user: user?.id ?? "anonymous",
    });
  }, []);

  return (
    <div className="w-full h-full p-2 bg-gray-900">
      <div className="space-y-4 max-h-[calc(100vh-80px)] overflow-y-auto py-2">
        <div className="text-white font-medium">
          Stay protected from 7+ ways a scammer executes a phishing scam
        </div>
        {features.map((feature, index) => (
          <div
            key={`${feature.key}-${index}`}
            className="flex items-start justify-between bg-gray-800 hover:bg-gray-700 transition rounded-lg p-3"
          >
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <h3 className="text-white font-medium">{feature.name}</h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {feature.description}
                </p>
              </div>
            </div>
            <button
              aria-label={`Toggle ${feature.name}`}
              className={`w-12 h-6 flex items-center p-1 rounded-full transition-colors duration-200 justify-center`}
            >
              {isFeatureAllowed(plan, feature.feature) ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
