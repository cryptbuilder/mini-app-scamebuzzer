export function debounce<F extends (...args: any[]) => any>(fn: F, wait = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

export function extractDomain(url: string): string {
  try {
    let domain = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
    domain = domain.split("/")[0];
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

export function extractRedirectUrl(htmlContent: string) {
  const metaRefreshRegex =
    /<meta[^>]+http-equiv=["']refresh["'][^>]+content=["']\d+;URL=([^"']+)["']/i;
  const metaRefreshMatch = htmlContent.match(metaRefreshRegex);
  if (metaRefreshMatch && metaRefreshMatch[1]) {
    return metaRefreshMatch[1];
  }

  const jsRedirectRegex = /location\.replace\(["']([^"']+)["']\)/i;
  const jsRedirectMatch = htmlContent.match(jsRedirectRegex);
  if (jsRedirectMatch && jsRedirectMatch[1]) {
    return jsRedirectMatch[1];
  }

  return null;
}

export function handleResponse(message: any) {
  if (!message || typeof message !== "object") {
    console.warn("Invalid message received:", message);
    return null;
  }
  return message.response;
}

export function handleError(error: any) {
  console.error("Error occurred:", error);
  return null;
}

export const MAX_FREE_UNIQUE_SCANS = 200;

export async function checkFreeUniqueScanLimit(url: string): Promise<boolean> {
  const scannedUrls = JSON.parse(localStorage.getItem("scannedUrls") || "[]");
  const lastReset = localStorage.getItem("lastReset") || "0";

  const now = new Date();
  const resetDate = new Date(lastReset);

  // Reset for new month
  if (
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()
  ) {
    localStorage.setItem("scannedUrls", JSON.stringify([url]));
    localStorage.setItem("lastReset", now.toISOString());
    return true;
  }

  // Already scanned this URL
  if (scannedUrls.includes(url)) {
    return true;
  }

  // Check if unique limit exceeded
  if (scannedUrls.length >= MAX_FREE_UNIQUE_SCANS) {
    return false;
  }

  // Add new URL
  scannedUrls.push(url);
  localStorage.setItem("scannedUrls", JSON.stringify(scannedUrls));

  return true;
}
