import { cleanupSafeUrlCache } from "@/utils/cacheCleanup";

// For web app, we don't need a background script in the same way
// This file can be used for any web app specific background tasks
export default defineBackground({
  main() {
    console.log("✨ Web app background tasks initialized");

    // Cache for API results
    const urlCheckCache = new Map<
      string,
      {
        results: any;
        timestamp: number;
      }
    >();

    const scamReportCache = new Map<
      string,
      {
        results: any;
        timestamp: number;
      }
    >();

    const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

    // Clean up cache periodically
    setInterval(() => {
      cleanupSafeUrlCache();
    }, 6 * 60 * 60 * 1000); // Every 6 hours

    // For web app, we can use localStorage for client ID
    const getClientId = (): string => {
      let clientId = localStorage.getItem("client_id");
      if (!clientId) {
        clientId = crypto.randomUUID();
        localStorage.setItem("client_id", clientId);
      }
      return clientId;
    };

    // Track events for web app
    const trackEvent = async (name: string, params: Record<string, any> = {}) => {
      const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
      const API_SECRET = import.meta.env.VITE_GA_API_SECRET;
      
      if (!MEASUREMENT_ID || !API_SECRET) {
        console.warn("Missing GA4 config");
        return;
      }
      
      const cid = getClientId();

      const url = new URL("https://www.google-analytics.com/mp/collect");
      url.searchParams.set("measurement_id", MEASUREMENT_ID);
      url.searchParams.set("api_secret", API_SECRET);

      const payload = { client_id: cid, events: [{ name, params }] };

      try {
        const resp = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          console.error("GA4 MP error:", resp.status, await resp.text());
        }
      } catch (e) {
        console.error("Failed to send GA4 event:", e);
      }
    };

    // Listen for custom events from the web app
    window.addEventListener("track_event", ((event: CustomEvent) => {
      trackEvent(event.detail.eventName, event.detail.eventParams);
    }) as EventListener);

    // Listen for scan updates
    window.addEventListener("scanUpdate", ((event: CustomEvent) => {
      console.log("Scan update received:", event.detail);
    }) as EventListener);

    // Listen for phishing warnings
    window.addEventListener("phishing_warning", ((event: CustomEvent) => {
      console.log("Phishing warning received:", event.detail);
      // Store warning in localStorage for the warning page
      localStorage.setItem("phishing_warning", JSON.stringify(event.detail.data));
    }) as EventListener);

    console.log("Web app background tasks ready");
  },
});
