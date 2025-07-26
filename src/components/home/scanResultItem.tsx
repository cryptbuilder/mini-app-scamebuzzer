import { StatusIndicator } from "./statusIndicator";

interface ScanResultItemProps {
  url: string;
  status: "safe" | "malicious" | "suspicious" | "scanning";
}

export const ScanResultItem = ({ url, status }: ScanResultItemProps) => {
  return (
    <div className="flex items-center justify-between py-3 px-4 text-white transition-colors">
      <span className="text-white-800 font-medium">{url}</span>
      <StatusIndicator status={status} />
    </div>
  );
};
