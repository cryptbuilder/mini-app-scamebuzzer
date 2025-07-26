import { Check, X, AlertTriangle, Loader2 } from "lucide-react";

interface StatusIndicatorProps {
  status: "safe" | "malicious" | "suspicious" | "scanning";
  className?: string;
}

export const StatusIndicator = ({
  status,
  className = "",
}: StatusIndicatorProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "safe":
        return {
          icon: Check,
          color: "text-green-600",
          bg: "bg-green-100",
          text: "Safe",
        };
      case "malicious":
        return {
          icon: X,
          color: "text-red-600",
          bg: "bg-red-100",
          text: "Malicious",
        };
      case "suspicious":
        return {
          icon: AlertTriangle,
          color: "text-yellow-600",
          bg: "bg-yellow-100",
          text: "Suspicious",
        };
      case "scanning":
        return {
          icon: Loader2,
          color: "text-blue-600",
          bg: "bg-blue-100",
          text: "Scanning",
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} ${className}`}
    >
      <Icon className={`w-4 h-4 ${config.color} ${status === "scanning" ? "animate-spin" : ""}`} />
      <span className={`text-sm font-medium ${config.color}`}>
        {config.text}
      </span>
    </div>
  );
};
