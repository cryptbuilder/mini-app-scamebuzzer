import whitelist from "../whitelist.json";
import { handleResponse, handleError } from "./constant";

function checkDomainAgainstWhitelist(domain: string) {
  // For web app, we can make direct API calls to check whitelist
  return fetch(`https://api.scambuzzer.com/api/whitelist/check?domain=${domain}`)
    .then(response => response.json())
    .then(handleResponse, handleError);
}

export async function checkWhitelist(domain: string): Promise<boolean> {
  if (whitelist.includes(domain.toLowerCase())) {
    return true;
  }

  try {
    const isSafe = await checkDomainAgainstWhitelist(domain);
    return isSafe;
  } catch (error) {
    console.error("Whitelist check failed:", error);
    return false;
  }
}
