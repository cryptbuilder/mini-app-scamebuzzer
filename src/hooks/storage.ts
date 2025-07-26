import { useState, useEffect, useCallback } from "react";

export function useStorage() {
  const [currentDomain, setCurrentDomain] = useState("");
  const [isSafe, setIsSafe] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For web app, we can use window.location directly
    try {
      const hostname = window.location.hostname;
      setCurrentDomain(hostname);
    } catch {
      setCurrentDomain("");
    }
  }, []);

  return { currentDomain, loading, error, isSafe, setIsSafe };
}
