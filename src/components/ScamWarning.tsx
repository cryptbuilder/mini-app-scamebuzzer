import React, { useState } from "react";
import axios from "axios";

interface ScamWarningProps {
  url: string;
  warnings: string[];
}

const ScamWarning = ({ url, warnings }: ScamWarningProps) => {
  const [isProceeding, setIsProceeding] = useState(false);

  const handleBackToSafety = () => {
    window.location.href = "https://www.google.com";
  };

  const handleProceedAtRisk = async () => {
    if (
      window.confirm(
        "Thank you for your report! We appreciate you taking the time to help us improve ScamBuzzer's protection system. Our team will review your submission to ensure that legitimate websites are not mistakenly flagged. If this site is verified as authentic, it will be removed from our warning list. Stay safe online!"
      )
    ) {
      setIsProceeding(true);

      const acceptedRisks = JSON.parse(localStorage.getItem("accepted_risks") || "{}");

      acceptedRisks[url] = {
        timestamp: Date.now(),
      };

      localStorage.setItem("accepted_risks", JSON.stringify(acceptedRisks));

      const params = new URLSearchParams(window.location.search);
      const originalUrl = params.get("href");
      if (originalUrl) window.location.href = decodeURIComponent(originalUrl);
    }
  };

  const handleReportAsAuthentic = async () => {
    let res = await axios.post("https://api.scambuzzer.com/api/authenticate", {
      url: url,
    });
    alert(res.data.message);
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      {/* Top Logo */}
      <div className="bg-scambuzzer-text rounded-full">
        <img
          src="/ScamBuzzer.png"
          alt="ScamBuzzer Logo"
          className="object-contain w-50"
        />
      </div>

      {/* Centered Warning Box */}
      <div className="bg-white text-black max-w-2xl mx-auto p-6 rounded-md border-4 border-green-500 shadow-lg flex flex-col gap-4 justify-center items-center">
        <div className="flex items-center gap-1">
          <div className="flex justify-center items-center">
            <img src="/ScamBuzzerAlert.gif" alt="ScamBuzzer Logo" />
          </div>
          <span className="text-red-600 font-bold text-xl">Alert:</span>
          <span className="text-black font-bold text-xl">
            Potential scam site
          </span>
        </div>

        <div className="bg-red-500 text-white p-2 rounded text-center font-semibold">
          Website: {url}
        </div>

        {/* Action Box */}
        <div className="bg-green-200 p-4 rounded text-sm">
          <strong className="text-green-800">Action:</strong>
          <ul className="list-disc pl-5 mt-2">
            <li key={1}>
              Avoid interacting with this site and verify the source where you
              found the link. Confirm authenticity through official channels or
              a trusted person before proceeding
            </li>
          </ul>
        </div>

        {/* Note Box */}
        <div className="bg-red-300 p-4 rounded text-sm">
          <strong className="text-green-800">Why:</strong>
          <ul className="list-disc pl-5 mt-2">
            {warnings.length > 0 &&
              warnings.map((warning, index) => {
                return <li key={index}>{warning}</li>;
              })}
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <button
            onClick={handleBackToSafety}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Back to Safety
          </button>
          <button
            onClick={handleProceedAtRisk}
            disabled={isProceeding}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {isProceeding ? "Proceeding..." : "Proceed at Risk"}
          </button>
          <button
            onClick={handleReportAsAuthentic}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Report as Authentic
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600 mt-4">
          <p>
            Powered by{" "}
            <a
              href="https://scambuzzer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              ScamBuzzer
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScamWarning;
