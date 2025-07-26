export type UserPlan = 0 | 1 | 2; // 0 = Free, 1 = monthly,  2 = Plus

export type FeatureKey =
  | "domainCheck"
  | "performHTMLChecks"
  | "performSecurityChecks"
  | "checkPhishingSite"
  | "twitterFeedScan"
  | "emailScan"
  | "scanHistory"
  | "twitterProfileScan"
  | "trustScoreUI";

const featureAccessMap = {
  domainCheck: [0, 2],
  performSecurityChecks: [0, 2], // security checks of urls etc.
  performHTMLChecks: [0, 2], // html checks.
  checkPhishingSite: [2], // phishingdb check (list of phishing sites reported by users or public db data).
  scanHistory: [0, 2], // history of scans.
  twitterFeedScan: [2], // scan twitter feed links.
  emailScan: [2], // scan email links.
  twitterProfileScan: [2], // scan twitter profile impersonation.
  trustScoreUI: [2], // trust score UI
};

export function isFeatureAllowed(
  plan: UserPlan,
  feature: keyof typeof featureAccessMap
): boolean {
  return featureAccessMap[feature].includes(plan);
}
