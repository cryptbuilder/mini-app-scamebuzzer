import axios from "axios";
import { extractDomain, extractRedirectUrl } from "./constant";
import { checkPhishingSite } from "./phishingdbcheck";

export async function analyzeTwitterLinks() {
  if (!/x\.com/.test(window.location.hostname)) return;
  const anchorTags = Array.from(
    document.querySelectorAll("a")
  ) as HTMLAnchorElement[];

  for (const anchor of anchorTags) {
    const url = anchor.href;

    if (!url || url.includes("x.com") || anchor.dataset.scamChecked) continue;

    anchor.dataset.scamChecked = "true";
    const res = await axios.get(url, { maxRedirects: 1 });

    const redirectUrl = extractRedirectUrl(res.data);

    if (!redirectUrl) return;
    try {
      const response: any = await checkPhishingSite(redirectUrl);

      if (response && response.length > 0) {
        const domain = extractDomain(redirectUrl);
        let allWarnings: any;

        const result = response
          .filter((item: any) => item.isPhishing || item.warnings !== undefined)
          .map((item: any) => item.details);

        if (result.length > 0) {
          allWarnings = [...result];
        }

        const warnings = await performSecurityChecks(redirectUrl, domain);

        if (warnings.length > 0) {
          allWarnings = [...result, ...warnings];
        }

        showPhishingWarningInline(anchor, allWarnings);
      } else {
        console.log("⚠️ No phishing result found yet.");
      }
    } catch (err) {
      console.warn("Twitter URL check failed for", redirectUrl, err);
    }
  }
}

function showPhishingWarningInline(
  anchor: HTMLAnchorElement,
  warnings: string[]
) {
  if (anchor.nextElementSibling?.classList.contains("scam-warning-box")) return;

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

  anchor.parentNode?.insertBefore(warningBox, anchor.nextSibling);
}
