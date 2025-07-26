export async function performHTMLChecks(url: string): Promise<string[]> {
  const warnings: string[] = [];
  let isPhishing = false;

  try {
    // Fetch the page content
    const response = await fetch(url);
    const html = await response.text();

    // Check 1: IFrame Redirection
    // if (isPageOrHiddenIframeSuspicious()) {
    //   warnings.push(
    //     "⚠️ Hidden frames may redirect you to scam or malicious sites."
    //   );
    //   isPhishing = true;
    // }

    // Check 2: Status Bar Customization
    if (checkStatusBarCustomization(html)) {
      warnings.push(
        "⚠️ These tricks are often used in phishing sites to steal funds or personal data."
      );
      isPhishing = true;
    }

    // Check 4: Website Forwarding
    if (await checkWebsiteForwarding(url)) {
      warnings.push("⚠️ This may redirect you to scam or malicious sites.");
      isPhishing = true;
    }

    // if (checkMisleadingAnchorText(html)) {
    //   warnings.push(
    //     "⚠️ This page contains links with misleading text that may lead to malicious sites."
    //   );
    //   isPhishing = true;
    // }

    if (checkFakeForms(html)) {
      warnings.push(
        "⚠️ This page contains forms that may be collecting data for malicious purposes."
      );
      isPhishing = true;
    }
  } catch (error) {
    console.error("Error performing HTML checks:", error);
  }

  return warnings;
}

// 1) Define an explicit allow-list of subdomains you trust
const EXPLICIT_ALLOWLIST = [
  "goldengate.grammarly.com",
  "gnar.grammarly.com",
  "mail.google.com",
  ".google.com",
  "accounts.google.com",
];

/**
 * Returns true if either:
 *  (A) The page is itself loaded inside an <iframe> (same‐origin or cross‐origin), OR
 *  (B) There exists a hidden/zero‐size <iframe> whose src either:
 *        • Is missing or blank/“about:blank” (and *not* in our allow‐list), OR
 *        • Points to an off‐domain URL not in our allow‐list.
 */
function isPageOrHiddenIframeSuspicious(): boolean {
  // (A) Is the page itself running in a frame?
  try {
    if (window.self !== window.top) {
      // Page is inside an iframe → suspicious
      return true;
    }
  } catch (e) {
    // Accessing window.top threw a cross‐origin error → page is framed
    return true;
  }

  // (B) Now scan *each* <iframe> inside the page for “hidden + off‐domain” patterns
  const frames = Array.from(document.getElementsByTagName("iframe"));
  for (const frame of frames) {
    // 1) Check if this iframe is effectively invisible
    const style = window.getComputedStyle(frame);
    const hiddenByStyle =
      style.display === "none" ||
      style.visibility === "hidden" ||
      style.opacity === "0";
    const rect = frame.getBoundingClientRect();
    const zeroSize = rect.width === 0 || rect.height === 0;

    // If it is NOT hidden and NOT zero‐size, we skip it
    if (!hiddenByStyle && !zeroSize) continue;

    // 2) Get its src (could be empty, “about:blank”, relative URL, etc.)
    const rawSrc = frame.getAttribute("src") || "";
    const src = rawSrc.trim();

    // If src is empty string or “about:blank”, treat as benign (common sandbox iframe)
    if (!src || src === "about:blank") {
      continue;
    }

    // 3) Try to parse the hostname of its src
    let frameHost = "";
    try {
      const urlObj = new URL(src, window.location.href);
      frameHost = urlObj.hostname; // e.g. "client.grammarly.com" or "evil.example.net"
    } catch {
      // Malformed URL in src (e.g. “javascript:” or super‐obscure) → suspicious
      console.log("iframe has malformed src, marking suspicious:", src);
      return true;
    }

    // 4) If the frame’s host is exactly one of our allow‐list entries, skip it
    if (EXPLICIT_ALLOWLIST.includes(frameHost)) {
      console.log("iframe host is in allow‐list, skipping:", frameHost);
      continue;
    }

    // 5) If we reach here, we have a hidden/zero‐size iframe whose src is:
    //      • non‐blank (“about:blank”),
    //      • parseable but not in our allow‐list,
    //    therefore we mark it suspicious.
    console.log("Found hidden iframe with off‐domain src:", frameHost);
    return true;
  }

  // If no suspicious conditions were met, everything is benign
  return false;
}
function checkStatusBarCustomization(html: string): boolean {
  // Check for status bar manipulation attempts
  const statusBarPatterns = [
    /onmouseover\s*=\s*["'][^"']*window\.status/i,
    /onmouseover\s*=\s*["'][^"']*status\s*=/i,
    /window\.status\s*=/i,
  ];

  return statusBarPatterns.some((pattern) => pattern.test(html));
}

function checkRightClickDisabled(html: string): boolean {
  // Check for right-click blocking patterns
  const rightClickPatterns = [
    /event\.button\s*==\s*2/i,
    /oncontextmenu\s*=\s*["']return\s+false/i,
    /addEventListener\(['""]contextmenu['"]/i,
    /onmousedown\s*=\s*["'][^"']*return\s+false/i,
  ];

  return rightClickPatterns.some((pattern) => pattern.test(html));
}

async function checkWebsiteForwarding(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { redirect: "follow" });
    const redirectCount = response.redirected
      ? response.url.split("/").filter((p) => p.includes("://")).length
      : 0;

    return redirectCount > 2; // Suspicious if more than 2 redirects
  } catch (error) {
    console.error("Error checking forwarding:", error);
    return false;
  }
}

function checkMisleadingAnchorText(html: string): boolean {
  const anchorPattern = /<a[^>]*href=["']([^"']*)["'][^>]*>([^<]*)<\/a>/gi;
  let match;
  let isMisleading = false;

  while ((match = anchorPattern.exec(html)) !== null) {
    const [, href, text] = match;
    const hrefDomain = new URL(href).hostname;
    const textDomain = text.trim().toLowerCase();

    const domainLikePattern = /\b([\w-]+\.)+[\w-]{2,}\b/;

    const textLooksLikeDomain = domainLikePattern.test(textDomain);

    if (textLooksLikeDomain && !hrefDomain.includes(textDomain)) {
      isMisleading = true;
      break;
    }
  }

  return isMisleading;
}

function checkFakeForms(html: string): boolean {
  const formPattern = /<form[^>]*action=["']([^"']*)["'][^>]*>/gi;
  let match;
  let isFake = false;

  const currentOrigin = new URL(window.location.href).origin;
  const currentHostname = window.location.hostname;

  // Skip check on trusted email environments
  const trustedEmailPlatforms = [
    "mail.google.com",
    "outlook.live.com",
    "mail.yahoo.com",
  ];
  if (trustedEmailPlatforms.includes(currentHostname)) {
    return false;
  }

  while ((match = formPattern.exec(html)) !== null) {
    const [, action] = match;

    try {
      const actionUrl = new URL(action, currentOrigin);

      if (actionUrl.origin !== currentOrigin) {
        const hasSensitiveInputs =
          /<input[^>]*((type=["']?(password|email|text|tel)["']?)|(name=["']?(password|username|email|phone|card|ssn)["']?))/i.test(
            html
          );
        const hasSubmit =
          /<input[^>]*type=["']?submit["']?|<button[^>]*type=["']?submit["']?/i.test(
            html
          );

        if (hasSensitiveInputs && hasSubmit) {
          isFake = true;
          break;
        }
      }
    } catch (err) {
      isFake = true;
      break;
    }
  }

  return isFake;
}
