import { cleanupOldAcceptances } from "@/utils/storage";
import { performHTMLChecks } from "../utils/htmlChecks";
import { performSecurityChecks } from "../utils/securityChecks";
import { checkWhitelist } from "../utils/checkWhitelist";
import { showCustomAlert } from "@/utils/AlertNotification";
import { initEmailPhishingScanner } from "../utils/emailScanner";
import { analyzeTwitterLinks } from "../utils/twitterScanner";
import {
  handleResponse,
  handleError,
  checkFreeUniqueScanLimit,
  MAX_FREE_UNIQUE_SCANS,
} from "../utils/constant";
import { checkPhishingSite } from "../utils/phishingdbcheck";
import { isFeatureAllowed } from "@/lib/features";

interface ScanResult {
  url: string;
  status: "safe" | "malicious" | "scanning";
  timestamp: number;
}

interface StoredData {
  currentSite: {
    url: string;
    status: "safe" | "malicious" | "scanning";
  };
  recentScans: ScanResult[];
  suspiciousSites: string[];
}

async function updateStorage(data: Partial<StoredData>) {
  const scanData = JSON.parse(localStorage.getItem("scanData") || "{}");
  const updatedData = { ...scanData, ...data };
  localStorage.setItem("scanData", JSON.stringify(updatedData));

  // Dispatch custom event for real-time updates
  try {
    window.dispatchEvent(new CustomEvent("scanUpdate", { detail: updatedData }));
  } catch (error) {
    console.log("Failed to dispatch scan update event:", error);
  }
}

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, "");
}

// Utility functions

const handleGithubIo = (url: string) => {
  const urlObj = new URL(url);
  const hashParams = new URLSearchParams(urlObj.hash.slice(1)); // remove leading '#'
  let href = hashParams.get("href");
  href = href!.replace(/[#0-9]/g, "");
  return href;
};

function reportScam(domain: string, data: string[]) {
  // For web app, we can make a direct API call instead of using chrome.runtime
  return fetch("https://api.scambuzzer.com/api/report-scam", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: domain, data }),
  }).then(handleResponse, handleError);
}

function showSafeToast() {
  const toast = document.createElement("div");
  toast.innerText = "✅ No threat found. This site looks safe!";
  toast.style.cssText = `
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #d1fae5;
  color: #065f46;
  border: 1px solid #10b981;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: system-ui;
  font-size: 14px;
  z-index: 99999;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function extractDomain(url: string): string {
  try {
    // Remove protocol and www
    let domain = url.replace(/^https?:\/\//, "").replace(/^www\./, "");

    // Remove everything after the first slash
    domain = domain.split("/")[0];

    // Remove common subdomains
    domain = domain.replace(
      /^(?:api\.|docs\.|app\.|admin\.|test\.|staging\.|dev\.|manage\.|blog\.|support\.|mail\.|shop\.|static\.|cdn\.|analytics\.|search\.|demo\.|mvp\.)/,
      ""
    );

    return domain.toLowerCase();
  } catch (error) {
    console.error("Error extracting domain:", error);
    return url;
  }
}

const scanWeb3Safe = async (url: string) => {
  const domain = extractDomain(url);

  // Send initial scanning status
  await updateStorage({
    currentSite: {
      url: domain,
      status: "scanning" as any,
    },
  });

  const userPlan = JSON.parse(localStorage.getItem("userPlan") || "0");
  const plan = { userPlan };

  if (plan.userPlan === 0) {
    const isAllowed = await checkFreeUniqueScanLimit(url);
    if (!isAllowed) {
      showCustomAlert(
        `You've reached your free limit of ${MAX_FREE_UNIQUE_SCANS} scans per month. Please upgrade to the lifetime plan to continue scanning.`,
        () => {
          window.open("https://scambuzzer.com#pricing", "_blank");
        },
        () => {
          console.log("Scan limit alert dismissed.");
        }
      );
      return;
    }
  }

  try {
    let warnings: string[] = [];
    let htmlChecks: any = [];
    let apiWarnings: string[] = [];

    try {
      if (isFeatureAllowed(plan.userPlan, "performSecurityChecks")) {
        warnings = await performSecurityChecks(url, domain);

        // Update status after security checks
        await updateStorage({
          currentSite: {
            url: domain,
            status: "scanning" as any,
          },
        });
      }
    } catch (err) {
      console.error("Security checks failed:", err);
    }

    try {
      if (isFeatureAllowed(plan.userPlan, "performHTMLChecks")) {
        htmlChecks = await performHTMLChecks(url);

        // Update status after HTML checks
        await updateStorage({
          currentSite: {
            url: domain,
            status: "scanning" as any,
          },
        });
      }
    } catch (err) {
      console.error("HTML checks failed:", err);
    }

    try {
      const currentDomain = normalizeDomain(
        new URL(window.location.href).hostname
      );
      const isWhitelisted = await checkWhitelist(currentDomain);

      if (isWhitelisted) {
        await updateStorage({
          currentSite: {
            url: domain,
            status: "safe",
          },
        });
        return;
      }
    } catch (err) {
      console.error("Whitelist check failed:", err);
    }

    const safe_urls = JSON.parse(localStorage.getItem("safe_urls") || "{}");

    if (safe_urls[url]) {
      console.log("✅ Cached safe URL, skipping scan.");
      await updateStorage({
        currentSite: {
          url: domain,
          status: "safe",
        },
      });
      showSafeToast();
      return; // Skip everything else
    }

    try {
      const currentUrl = window.location.href;

      // Update status before API check
      await updateStorage({
        currentSite: {
          url: domain,
          status: "scanning" as any,
        },
      });

      if (isFeatureAllowed(plan.userPlan, "checkPhishingSite")) {
        const apiResults: any = await checkPhishingSite(currentUrl);

        apiWarnings = apiResults
          .filter(
            (result: any) => result.isPhishing || result.warnings !== undefined
          )
          .map((result: any) => `⚠️ ${result.source}:  ${result.details}`);
      }
    } catch (err) {
      console.error("API check failed:", err);
    }

    const allWarnings = [...warnings, ...htmlChecks, ...apiWarnings];

    const isSafe = allWarnings.length === 0;

    // Update current site status
    await updateStorage({
      currentSite: {
        url: domain,
        status: isSafe ? "safe" : "malicious",
      },
    });

    // Get existing data
    const scanData = JSON.parse(localStorage.getItem("scanData") || "{}");
    const recentScans = scanData.recentScans || [];
    const suspiciousSites = scanData.suspiciousSites || [];

    // Update recent scans - prevent duplicates
    const newScan: ScanResult = {
      url: domain,
      status: isSafe ? "safe" : "malicious",
      timestamp: Date.now(),
    };

    // Remove any existing entry for this domain
    const filteredRecentScans = recentScans.filter(
      (scan: any) => scan.url !== domain
    );

    // Add new scan at the beginning
    const updatedRecentScans = [newScan, ...filteredRecentScans].slice(0, 5);

    // Update suspicious sites if malicious - prevent duplicates
    let updatedSuspiciousSites = suspiciousSites;
    if (!isSafe) {
      // Remove if exists and add to beginning
      updatedSuspiciousSites = [
        domain,
        ...suspiciousSites.filter((site: string) => site !== domain),
      ].slice(0, 5);
    }

    // Save all updates
    await updateStorage({
      currentSite: newScan,
      recentScans: updatedRecentScans,
      suspiciousSites: updatedSuspiciousSites,
    });

    if (!isSafe) {
      await cleanupOldAcceptances();
      const acceptedRisks = JSON.parse(localStorage.getItem("accepted_risks") || "{}");

      if (acceptedRisks[url]) {
        return;
      }

      if (allWarnings.length > 0) {
        await cleanupOldAcceptances();

        const acceptedRisks = JSON.parse(localStorage.getItem("accepted_risks") || "{}");

        if (acceptedRisks[url]) {
          // User has already accepted this URL, don't redirect
          return;
        }

        const hostname = window.location.hostname;

        // For web app, we can show a modal or redirect to a warning page
        // Instead of chrome.runtime.sendMessage, we'll dispatch a custom event
        window.dispatchEvent(new CustomEvent("phishing_warning", {
          detail: {
            data: allWarnings,
            url: url.includes("github.io") ? handleGithubIo(url) : window.location.href,
          }
        }));

        await updateStorage({
          currentSite: {
            url: hostname,
            status: allWarnings.length > 0 ? "malicious" : "safe",
          },
          recentScans: updatedRecentScans,
          suspiciousSites: updatedSuspiciousSites,
        });

        // For web app, redirect to a warning page or show modal
        const warningUrl = `/warning?hostname=${hostname}&href=${encodeURIComponent(window.location.href)}`;
        window.location.href = warningUrl;

        await reportScam(url, allWarnings);
      } else {
        // Cache the clean result to skip next time
        const safe_urls = JSON.parse(localStorage.getItem("safe_urls") || "{}");
        safe_urls[url] = {
          timestamp: Date.now(),
        };

        localStorage.setItem("safe_urls", JSON.stringify(safe_urls));

        showSafeToast();
      }
    } else {
      showSafeToast();
    }

    // if not found scam detecting , make entry in cache memory
  } catch (error) {
    console.error("Error checking domain:", error);
    // Update storage with error status
    await updateStorage({
      currentSite: {
        url: domain,
        status: "malicious",
      },
    });
  }
};

// Add immediate logging
console.log("Content script file loaded");

export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  async main() {
    console.log("Content script main function started");

    try {
      // Basic DOM check
      console.log("Document ready state:", document.readyState);

      let settings;
      // Test storage access
      try {
        settings = JSON.parse(localStorage.getItem("webSafe") || "{}");
        console.log("Storage access successful:", settings);
      } catch (storageError) {
        console.error("Storage access failed:", storageError);
      }

      try {
        const currentUrl = window.location.href;

        // For web app, we don't need to check for chrome-extension URLs
        const userPlan = JSON.parse(localStorage.getItem("userPlan") || "0");
        const plan = { userPlan };

        if (isFeatureAllowed(plan.userPlan, "emailScan"))
          initEmailPhishingScanner();
        if (isFeatureAllowed(plan.userPlan, "twitterFeedScan"))
          analyzeTwitterLinks();

        console.log("🚀 Auto-scanning:", currentUrl);
        await scanWeb3Safe(currentUrl);
      } catch (err) {
        console.error("🚨 Error in auto-scan:", err);
      }

      // Listen for custom events instead of chrome.runtime messages
      window.addEventListener("getScanData", async () => {
        console.log("🔁 ScamBuzzer content script initialized...");

        const scanData = JSON.parse(localStorage.getItem("scanData") || "{}") || {
          currentSite: { url: "", status: "safe" },
          recentScans: [],
          suspiciousSites: [],
        };

        // Dispatch scan update event
        window.dispatchEvent(new CustomEvent("scanUpdate", { detail: scanData }));

        // If no current site data, trigger a new scan
        if (!scanData.currentSite.url || scanData.currentSite.url === "") {
          const currentUrl = window.location.href;
          scanWeb3Safe(currentUrl);
        }
      });
    } catch (error) {
      console.error("Error in content script:", error);
    }
  },
});
