import { checkPhishingSite } from "./phishingdbcheck";

/** CSS selector for the Gmail message container and body region */
const MESSAGE_CONTAINER = "div[role='main'] .ii.gt";

/** Debounce helper to collapse rapid DOM events into one call */
function debounce<F extends (...args: any[]) => any>(fn: F, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
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

export function initEmailPhishingScanner() {
  let lastScannedEmail = "";
  // Only run on Gmail
  if (!/mail\.google\.com/.test(window.location.hostname)) return;

  let lastMessageId: string | null = null;

  /** Pull out the message-id (data-message-id) plus full body text */
  function extractMessageData() {
    const container = document.querySelector<HTMLElement>(MESSAGE_CONTAINER);

    if (!container) return;

    const emailBodies = document.querySelectorAll(".ii.gt");
    let combinedContent = "";
    emailBodies.forEach((el: any) => {
      combinedContent += el.innerText + "\n\n";
    });

    combinedContent = combinedContent.trim();

    if (combinedContent && combinedContent !== lastScannedEmail) {
      lastScannedEmail = combinedContent;
      analyzeEmail(combinedContent);
    }
  }

  /** Send content to background, handle response */
  async function analyzeEmail(content: string) {
    // Extract links from content
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = (content.match(urlRegex) || []).map((u) =>
      u.replace(/[\.,;]$/, "")
    );

    if (urls.length === 0) return;

    const maliciousLinks: string[] = [];

    for (const url of urls) {
      try {
        const response: any = await checkPhishingSite(url);

        if (response && response.length > 0) {
          const domain = extractDomain(url);
          let allWarnings: any;

          const result = response
            .filter(
              (item: any) => item.isPhishing || item.warnings !== undefined
            )
            .map((item: any) => item.details);

          if (result.length > 0) {
            maliciousLinks.push(url);
            allWarnings = [...result];
          }

          const warnings = await performSecurityChecks(url, domain);

          if (warnings.length > 0) {
            maliciousLinks.push(url);
            allWarnings = [...result, ...warnings];
          }

          showPhishingWarningsBelowLinks(allWarnings, maliciousLinks);
        } else {
          console.log("⚠️ No phishing result found yet.");
        }
      } catch (err) {
        console.warn("URL check failed for", url, err);
      }
    }
  }

  function showPhishingWarningsBelowLinks(warnings: string[], links: string[]) {
    links.forEach((maliciousUrl) => {
      const anchorTags = Array.from(
        document.querySelectorAll("a")
      ) as HTMLAnchorElement[];

      anchorTags.forEach((anchor) => {
        if (anchor.href.includes(maliciousUrl)) {
          // Prevent duplicate warning for the same link
          if (anchor.nextElementSibling?.classList.contains("scam-warning-box"))
            return;

          const warningBox = document.createElement("div");
          warningBox.className = "scam-warning-box";
          warningBox.style.cssText = `
          margin-top: 10px;
          padding: 14px 16px;
          background: #fff5f5;
          border-left: 4px solid #e02424;
          border-radius: 8px;
          color: #4b1c1c;
          font-family: system-ui, sans-serif;
          font-size: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          max-width: 520px;
        `;
          warningBox.innerHTML = `
        <div style="font-size: 18px; line-height: 1;">🚫</div>
       <div>
         <strong>This link may be unsafe.</strong><br/>
         <em>${warnings
           .map((w) => `<div style="margin-top: 2px;">⚠️ <em>${w}</em></div>`)
           .join("")}</em>
       </div>
     
          `;

          // Insert just after the <a> tag
          anchor.parentNode?.insertBefore(warningBox, anchor.nextSibling);
        }
      });
    });
  }

  // watch for new message loads, debounce to avoid thrash
  const observer = new MutationObserver(debounce(extractMessageData, 1000));
  observer.observe(document.body, { childList: true, subtree: true });
}
