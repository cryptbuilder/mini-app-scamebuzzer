import React, { useState, useEffect } from "react";
import ScamWarning from "@/components/ScamWarning";
import { createRoot } from "react-dom/client";
import "./style.css";

const App = () => {
  const [warnings, setWarnings] = useState([]);
  const [hostname, setHostname] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    // Get hostname from URL
    const params = new URLSearchParams(window.location.search);
    const hostname = params.get("hostname");
    const href = params.get("href");
    setHostname(hostname as string);

    // For web app, we can get warnings from localStorage or URL parameters
    // You might want to store warnings in localStorage when a threat is detected
    const storedWarnings = JSON.parse(localStorage.getItem("phishing_warning") || "[]");
    if (storedWarnings.length > 0) {
      setWarnings(storedWarnings);
      setUrl(href || window.location.href);
    }

    // Cleanup function to remove warnings when component unmounts
    return () => {
      localStorage.removeItem("phishing_warning");
    };
  }, []);

  return (
    <div className="min-h-screen bg-black/100 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-start pt-4">
        <div className="container px-4">
          <ScamWarning url={url as string} warnings={warnings as string[]} />
        </div>
      </div>
    </div>
  );
};

const root = document.getElementById("root")!;
createRoot(root).render(<App />);
