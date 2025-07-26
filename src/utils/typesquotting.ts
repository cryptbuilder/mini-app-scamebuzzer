import { distance } from "fastest-levenshtein";
import whitelist from "../whitelist.json";

function normalizeDomain(domain: string): string {
  return domain.toLowerCase().replace(/^www\./, "");
}

export function isTyposquatting(domain: string): string | null {
  const threshold = 2;
  const normalizedDomain = normalizeDomain(domain);
  for (const trusted of whitelist) {
    const dist = distance(normalizedDomain, trusted);
    if (dist > 0 && dist <= threshold) {
      return trusted;
    }
  }
  return null;
}
