import { isTyposquatting } from "./typesquotting";

const freeHostingProviders = [
  "github.io",
  "netlify.app",
  "vercel.app",
  "herokuapp.com",
  "pages.cloudflare.com",
  "firebaseapp.com",
  "surge.sh",
  "glitch.com",
  "replit.com",
  "render.com",
  "railway.com",
  "neocities.org",
  "awardspace.com",
  "byet.host",
  "infinityfree.com",
  "koyeb.com",
  "wix.com",
];

// Check if domain is using free hosting
export const checkIsFreeHosting = (url: string): boolean => {
  return freeHostingProviders.some((provider) => url.includes(provider));
};

// Check if hostname is an IP address
export const checkIsIpAddress = (hostname: string): boolean => {
  const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Pattern.test(hostname) || ipv6Pattern.test(hostname);
};

// Check for suspicious symbols in URL
export const checkSuspiciousSymbols = (url: string): boolean => {
  const hasSuspiciousAtSymbol = /(?<!\/)@/.test(url); // @ not preceded by /
  const hasMultipleHyphens = /[-]{2,}/.test(url); // Check for -- or more
  return hasSuspiciousAtSymbol || hasMultipleHyphens;
};

// Check if domain contains http/https
export const checkHttpInDomain = (url: string): boolean => {
  const domain = new URL(url).hostname;
  return domain.includes("http") || domain.includes("https");
};

// Check for homoglyphs in domain
export const checkIsHomoglyph = (url: string): boolean => {
  const parsed = new URL(url);
  const hostname = parsed.hostname;
  const decoded = hostname;
  const hasNonAscii = /[^\x00-\x7F]/.test(decoded);
  const isPunycode = hostname.startsWith("xn--");
  return hasNonAscii || isPunycode;
};

// Check for URL encoding issues
export const hasDoubleEncoding = (url: string): boolean => {
  try {
    const onceDecoded = decodeURIComponent(url);
    const twiceDecoded = decodeURIComponent(onceDecoded);
    return onceDecoded !== twiceDecoded;
  } catch {
    return false;
  }
};

// Check for encoded directory traversal
export const containsEncodedTraversal = (url: string): boolean => {
  const decoded = decodeURIComponent(url).toLowerCase();
  return decoded.includes("../") || decoded.includes("..\\");
};

// Check for encoded characters in domain
export const encodedDomainCharacters = (url: string): boolean => {
  const domain = new URL(url).hostname;
  return /%[0-9a-f]{2}/i.test(domain);
};

// Check for suspicious URL encoding
export const isUrlEncodedSuspicious = (url: string): boolean => {
  return (
    hasDoubleEncoding(url) ||
    containsEncodedTraversal(url) ||
    encodedDomainCharacters(url)
  );
};

// Check for clipboard hijacking
export const isClipboardHijacking = (url: string): boolean => {
  const suspiciousPatterns = [
    "clipboardData.setData",
    'addEventListener("copy"',
    "addEventListener('copy'",
    'addEventListener("paste"',
    "addEventListener('paste'",
  ];

  const scripts = Array.from(document.scripts)
    .map((script) => script.innerText)
    .join(" ")
    .toLowerCase();

  return suspiciousPatterns.some((pattern) => {
    return scripts.includes(pattern.toLowerCase());
  });
};

const parseDate = (dateString: string | undefined): Date | null => {
  if (!dateString) return null;
  let cleanDate = dateString.trim().replace(/\s+/, "T");

  const match = cleanDate.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})/);
  if (match) {
    const day = match[1].padStart(2, "0");
    const month = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    }[match[2]];
    return new Date(`${match[3]}-${month}-${day}T00:00:00Z`);
  }

  if (cleanDate.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)) {
    cleanDate = cleanDate.replace(" ", "T") + "Z";
  }

  const date = new Date(cleanDate);
  return isNaN(date.getTime()) ? null : date;
};

const checkDomainAge = (
  creationDate: string
): { age: string; color: string } => {
  const creationDateObj = parseDate(creationDate);
  if (!creationDateObj) {
    return { age: "Invalid date", color: "#FF4444" };
  }

  const now = new Date();
  const timeDiff = now.getTime() - creationDateObj.getTime();
  const ageInDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const ageInMonths =
    (now.getFullYear() - creationDateObj.getFullYear()) * 12 +
    (now.getMonth() - creationDateObj.getMonth());

  let ageString =
    ageInDays <= 1
      ? "Registered today"
      : ageInMonths < 1
      ? "Less than 1 month"
      : ageInMonths === 1
      ? "1 month"
      : ageInMonths < 12
      ? `${ageInMonths} months`
      : `${Math.floor(ageInMonths / 12)} year${
          Math.floor(ageInMonths / 12) > 1 ? "s" : ""
        }${
          ageInMonths % 12 > 0
            ? ` and ${ageInMonths % 12} month${ageInMonths % 12 > 1 ? "s" : ""}`
            : ""
        }`;
  const color = ageInDays <= 1 || ageInMonths <= 1 ? "#FF4444" : "#00FF00";
  return { age: ageString, color };
};

function repotApiFail(domain: string, err: any): Promise<boolean> {
  return new Promise((resolve) => {
    // For web app, we can log the API failure or send to a backend
    console.error("API Failed:", {
      domain: domain,
      error: err,
      note: "Domain Age check failed!!",
    });
    resolve(true);
  });
}

// Main security check function
export const performSecurityChecks = async (
  url: string,
  domain: string
): Promise<string[]> => {
  const warnings: string[] = [];
  let domainAge: any = null;
  try {
    if (domain.includes("localhost:")) {
      console.log("Skipping WHOIS check for local domain:", domain);
      return [];
    }

    // For web app, we can make direct API calls to WHOIS services
    // Example: Direct API call to WHOIS service
    const response = await fetch(`https://api.scambuzzer.com/api/whois?domain=${domain}`);
    const data = await response.json();

    const creationDate = data.WhoisRecord?.createdDate;

    domainAge = checkDomainAge(creationDate);
  } catch (err: any) {
    await repotApiFail(domain, {
      message: err.message ? err.message : "Domain age check failed!",
    });

    console.error("Domain age check failed:", err);
  }

  if (domainAge) {
    if (domainAge.color === "#FF4444" || domainAge.color === "#FFCC00") {
      if (domainAge.age !== "Invalid date") {
        if (domainAge.age === "Registered today") {
          warnings.push(
            "High Alert: This site has no trust history and might steal your info or funds."
          );
        } else {
          warnings.push(
            `High Alert: This site has no trust history and might steal your info or funds.`
          );
        }
      }
    }
  }

  if (checkIsFreeHosting(url)) {
    warnings.push(
      "This site is hosted on a free hosting platform. Be Cautious!"
    );
  }

  if (checkIsIpAddress(url)) {
    warnings.push(
      "This site is using a raw IP without a domain — a common red flag in phishing scams."
    );
  }

  if (checkIsHomoglyph(url)) {
    warnings.push("This domain is trying to impersonating a trusted website.");
  }

  if (checkSuspiciousSymbols(url)) {
    warnings.push(
      "These tricks are often used in phishing sites to steal funds or personal data."
    );
  }

  if (checkHttpInDomain(url)) {
    warnings.push(
      "Domain name itself contains http or https to confuse users. Be Cautious!"
    );
  }

  if (isUrlEncodedSuspicious(url)) {
    warnings.push(
      "⚠️ This URL uses suspicious encoding techniques that may hide malicious intent."
    );
  }

  if (isClipboardHijacking(url)) {
    warnings.push(
      "⚠️ This site is trying to access your clipboard — a common technique used in scams to replace copied crypto wallet addresses or payment details."
    );
  }

  if (isTyposquatting(url)) {
    warnings.push(
      "⚠️ This site is using a domain that is similar to a trusted website. Be Cautious!"
    );
  }

  return warnings;
};
